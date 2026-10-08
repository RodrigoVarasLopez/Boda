'use server';

import crypto from 'crypto';
import {
  GroupRSVPSubmitSchema,
  GuestGroupCreateSchema,
  CSVGuestRowSchema,
  MediaUploadValidationSchema,
  GuestbookSubmitSchema,
  MediaModerateActionSchema,
  BulkMediaModerateSchema,
  BudgetCategoryCreateSchema,
  BudgetCategoryUpdateSchema,
  BudgetSupplierCreateSchema,
  BudgetSupplierUpdateSchema,
  BudgetSupplierSelectSchema,
  BudgetPaymentCreateSchema,
  BudgetPaymentUpdateSchema,
  BudgetMenuConfigUpdateSchema,
  GuestTypeUpdateSchema,
} from '@/lib/schemas';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { INITIAL_GROUPS, INITIAL_WEDDING, INITIAL_EVENTS, INITIAL_RSVPS, INITIAL_CMS_BLOCKS } from '@/lib/mock-data';
import {
  GuestGroup,
  GroupRSVPSubmission,
  GuestRSVPResponse,
  Event,
  MediaPhoto,
  GuestBookEntry,
  MediaPhotoStatus,
  GuestBookEntryStatus,
} from '@/lib/types';
import { validateMediaFile, buildStoragePath, sanitizeFileName, MEDIA_STORAGE_BUCKET } from '@/lib/media/urls';
import { getStoredPhotos, setStoredPhotos, getStoredGuestbook, setStoredGuestbook } from '@/lib/media-data';
import {
  getStoredBudgetCategories,
  setStoredBudgetCategories,
  getStoredBudgetSuppliers,
  setStoredBudgetSuppliers,
  getStoredBudgetPayments,
  setStoredBudgetPayments,
  getStoredBudgetMenuConfig,
  setStoredBudgetMenuConfig,
  WEDDING_UUID,
  INITIAL_BUDGET_CATEGORIES,
  normalizeCategoryId,
} from '@/lib/budget-data';
import { revalidatePath } from 'next/cache';

// Helper to hash raw token with SHA-256
export async function hashToken(rawToken: string): Promise<string> {
  const clean = rawToken.trim().toLowerCase();
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * RESOLVE INVITATION BY TOKEN (Server Action)
 * 1. Hashes raw token with SHA-256
 * 2. Queries Supabase RPC or mock store
 * 3. Returns sanitized DTO (never leaks raw database internals)
 */
export async function getInvitationByTokenAction(rawToken: string) {
  if (!rawToken) {
    return { valid: false, reason: 'Token no proporcionado' };
  }

  const tokenHash = await hashToken(rawToken);

  try {
    const supabase = await createServerSupabase();
    // Try calling RPC if Supabase configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const { data, error } = await supabase.rpc('resolve_invitation_by_hash', {
        p_token_hash: tokenHash,
      });

      if (!error && data && data.valid) {
        return data;
      }
    }
  } catch {
    // Fallback to local dataset resolution
  }

  // Graceful fallback for mock store when DB is unconfigured
  const group = INITIAL_GROUPS.find((g) => g.token === rawToken || g.token === `token-${rawToken}`);
  if (!group || group.invitation_status === 'revoked') {
    return { valid: false, reason: 'Esta invitación ya no está disponible' };
  }

  // Mark as opened
  if (group.invitation_status === 'sent') {
    group.invitation_status = 'opened';
    group.opened_at = new Date().toISOString();
  }

  const existingRSVP = INITIAL_RSVPS.find((r) => r.token === group.token)?.responses || [];
  const allowedEvents = INITIAL_EVENTS.filter((e) =>
    e.visibility === 'everyone' || group.allowed_event_ids.includes(e.id)
  );

  return {
    valid: true,
    invitation_id: `inv-${group.id}`,
    wedding: INITIAL_WEDDING,
    group: group,
    guests: group.guests,
    events: allowedEvents,
    existing_rsvps: existingRSVP,
    blocks: INITIAL_CMS_BLOCKS,
  };
}

/**
 * SUBMIT RSVP (Server Action)
 * Validates payload with Zod and persists to database or store
 */
export async function submitRSVPAction(rawPayload: unknown) {
  const parsed = GroupRSVPSubmitSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { success: false, error: 'Datos de confirmación inválidos', details: parsed.error.format() };
  }

  const { token, responses } = parsed.data;
  const tokenHash = await hashToken(token);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      // Find invitation by token hash
      const { data: inv } = await adminClient
        .from('invitations')
        .select('id, group_id, status')
        .eq('token_hash', tokenHash)
        .single();

      if (inv && inv.status === 'active') {
        for (const res of responses) {
          await adminClient.from('rsvp_responses').upsert({
            invitation_id: inv.id,
            guest_id: res.guest_id,
            status: res.status,
            menu_choice: res.dietary_choice,
            allergies: res.allergies,
            plus_one_attending: res.plus_one_attending,
            plus_one_name: res.plus_one_name,
            message: res.message,
            submitted_at: new Date().toISOString(),
          }, { onConflict: 'invitation_id,guest_id' });
        }

        await adminClient.from('invitations').update({
          responded_at: new Date().toISOString(),
        }).eq('id', inv.id);
      }
    }
  } catch {
    // Fallback store
  }

  // Update local store
  const group = INITIAL_GROUPS.find((g) => g.token === token);
  if (group) {
    group.invitation_status = 'responded';
    group.responded_at = new Date().toISOString();
  }

  const mappedResponses: GuestRSVPResponse[] = responses.map((r) => {
    const guestObj = group?.guests.find((g) => g.id === r.guest_id);
    const guestName = guestObj ? `${guestObj.first_name} ${guestObj.last_name}`.trim() : 'Invitado';
    return {
      guest_id: r.guest_id,
      guest_name: guestName,
      status: r.status,
      attending_event_ids: r.status === 'attending' ? (group?.allowed_event_ids || []) : [],
      dietary_choice: r.dietary_choice,
      allergies: r.allergies || undefined,
      plus_one_attending: r.plus_one_attending,
      plus_one_name: r.plus_one_name || undefined,
      plus_one_dietary: r.plus_one_dietary,
      message: r.message || undefined,
    };
  });

  const existingRsvpIndex = INITIAL_RSVPS.findIndex((r) => r.token === token);
  if (existingRsvpIndex >= 0) {
    INITIAL_RSVPS[existingRsvpIndex].responses = mappedResponses;
    INITIAL_RSVPS[existingRsvpIndex].submitted_at = new Date().toISOString();
  } else if (group) {
    INITIAL_RSVPS.push({
      group_id: group.id,
      token: token,
      responses: mappedResponses,
      submitted_at: new Date().toISOString(),
    });
  }

  revalidatePath(`/i/${token}`);
  revalidatePath('/admin/guests');
  revalidatePath('/admin/rsvp');
  revalidatePath('/admin');

  return { success: true, message: 'Confirmación registrada correctamente' };
}

/**
 * REGENERATE TOKEN ACTION (Server Action)
 */
export async function regenerateInvitationTokenAction(groupId: string) {
  const newRawToken = `token-${Math.random().toString(36).substring(2, 10)}`;
  const tokenHash = await hashToken(newRawToken);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient.from('invitations').update({
        token_hash: tokenHash,
        updated_at: new Date().toISOString(),
      }).eq('group_id', groupId);
    }
  } catch {
    // Fallback store
  }

  const grp = INITIAL_GROUPS.find((g) => g.id === groupId);
  if (grp) {
    grp.token = newRawToken;
  }

  revalidatePath('/admin/guests');
  return { success: true, newToken: newRawToken };
}

/**
 * REVOKE INVITATION ACTION (Server Action)
 */
export async function revokeInvitationAction(groupId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient.from('invitations').update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
      }).eq('group_id', groupId);
    }
  } catch {
    // Fallback store
  }

  const grp = INITIAL_GROUPS.find((g) => g.id === groupId);
  if (grp) {
    grp.invitation_status = 'revoked';
  }

  revalidatePath('/admin/guests');
  return { success: true };
}

/**
 * GET GUESTS DATA ACTION (Server Action)
 * Loads groups, guests, invitations and RSVP responses directly from Supabase
 */
export async function getGuestsDataAction() {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);

      // 1. Fetch guest_groups
      const { data: groupsData, error: grpErr } = await adminClient
        .from('guest_groups')
        .select(`
          id,
          wedding_id,
          name,
          display_name,
          notes,
          allow_plus_one,
          max_plus_ones,
          created_at,
          updated_at
        `)
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: true });

      if (grpErr) {
        console.error('Error fetching guest groups from Supabase:', grpErr);
      }

      if (groupsData && groupsData.length > 0) {
        const groupIds = groupsData.map((g) => g.id);

        // 2. Fetch guests for these groups
        const { data: guestsData, error: gstErr } = await adminClient
          .from('guests')
          .select('*')
          .in('group_id', groupIds);

        if (gstErr) console.error('Error fetching guests from Supabase:', gstErr);

        // 3. Fetch invitations for these groups
        const { data: invitationsData, error: invErr } = await adminClient
          .from('invitations')
          .select('*')
          .in('group_id', groupIds);

        if (invErr) console.error('Error fetching invitations from Supabase:', invErr);

        // 4. Fetch group_events
        const { data: groupEventsData, error: geErr } = await adminClient
          .from('group_events')
          .select('group_id, event_id, is_visible')
          .in('group_id', groupIds)
          .eq('is_visible', true);

        if (geErr) console.error('Error fetching group events from Supabase:', geErr);

        // 5. Fetch rsvp_responses for these invitations
        const invIds = (invitationsData || []).map((i) => i.id);
        let rsvpsData: any[] = [];
        if (invIds.length > 0) {
          const { data: rsvps, error: rsvpErr } = await adminClient
            .from('rsvp_responses')
            .select('*')
            .in('invitation_id', invIds);
          if (rsvpErr) console.error('Error fetching rsvp responses from Supabase:', rsvpErr);
          if (rsvps) rsvpsData = rsvps;
        }

        // Map into GuestGroup[]
        const mappedGroups: GuestGroup[] = groupsData.map((g) => {
          const inv = invitationsData?.find((i) => i.group_id === g.id);
          const grpGuests = (guestsData || []).filter((gst) => gst.group_id === g.id);
          const allowedEvents = (groupEventsData || [])
            .filter((ge) => ge.group_id === g.id)
            .map((ge) => ge.event_id);

          const mappedEventIds = allowedEvents.map((eid) => {
            if (eid === 'b0000000-0000-0000-0000-000000000001') return 'evt-preboda-cata';
            if (eid === 'b0000000-0000-0000-0000-000000000002') return 'evt-ceremonia';
            if (eid === 'b0000000-0000-0000-0000-000000000003') return 'evt-banquete';
            if (eid === 'b0000000-0000-0000-0000-000000000004') return 'evt-fiesta-dj';
            return eid;
          });

          let status: any = 'draft';
          if (inv) {
            if (inv.status === 'revoked') status = 'revoked';
            else if (inv.responded_at || rsvpsData.some((r) => r.invitation_id === inv.id)) status = 'responded';
            else if (inv.opened_at) status = 'opened';
            else status = 'sent';
          }

          return {
            id: g.id,
            wedding_id: g.wedding_id,
            name: g.name,
            token: inv?.token_preview || `token-${g.id.substring(0, 8)}`,
            invitation_status: status,
            opened_at: inv?.opened_at || undefined,
            responded_at: inv?.responded_at || undefined,
            custom_message: g.notes || undefined,
            allowed_event_ids: mappedEventIds.length > 0 ? mappedEventIds : ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
            guests: grpGuests.map((gst) => ({
              id: gst.id,
              wedding_id: g.wedding_id,
              group_id: g.id,
              first_name: gst.first_name,
              last_name: gst.last_name || '',
              email: gst.email || undefined,
              phone: gst.phone || undefined,
              is_child: Boolean(gst.is_child || gst.guest_type === 'child'),
              guest_type: (gst.guest_type as any) || (gst.is_child ? 'child' : 'adult'),
              is_plus_one_allowed: Boolean(gst.allow_plus_one),
              dietary_restrictions: (gst.dietary_restrictions as any) || undefined,
              allergies: gst.allergies || undefined,
              notes: gst.notes || undefined,
            })),
          };
        });

        // Map into GroupRSVPSubmission[]
        const mappedRSVPs: GroupRSVPSubmission[] = (invitationsData || []).map((inv) => {
          const invResponses = rsvpsData.filter((r) => r.invitation_id === inv.id);
          const grp = mappedGroups.find((g) => g.id === inv.group_id);
          return {
            group_id: inv.group_id,
            token: inv.token_preview,
            submitted_at: inv.responded_at || new Date().toISOString(),
            responses: invResponses.map((r) => {
              const gst = grp?.guests.find((g) => g.id === r.guest_id);
              return {
                guest_id: r.guest_id,
                guest_name: gst ? `${gst.first_name} ${gst.last_name}`.trim() : 'Invitado',
                status: r.status,
                attending_event_ids: r.status === 'attending' ? (grp?.allowed_event_ids || []) : [],
                dietary_choice: r.menu_choice || 'standard',
                allergies: r.allergies || undefined,
                plus_one_attending: r.plus_one_attending,
                plus_one_name: r.plus_one_name || undefined,
                message: r.message || undefined,
              };
            }),
          };
        }).filter((r) => r.responses.length > 0);

        return {
          success: true,
          source: 'supabase',
          groups: mappedGroups,
          rsvps: mappedRSVPs,
        };
      }
    } catch (err) {
      console.warn('Error fetching guests from Supabase:', err);
    }
  }

  return {
    success: false,
    source: 'local',
    groups: [],
    rsvps: [],
  };
}

/**
 * CREATE GUEST GROUP ACTION (Server Action)
 * Persists group, guests, allowed events and invitation token to Supabase
 */
export async function createGuestGroupAction(rawInput: unknown) {
  const validated = GuestGroupCreateSchema.parse(rawInput);
  const groupId = crypto.randomUUID();
  const rawToken = `token-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
  const tokenHash = await hashToken(rawToken);

  let weddingId = WEDDING_UUID;

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      weddingId = await resolveWeddingUuid(adminClient);

      // 1. Insert guest_group
      const { error: grpErr } = await adminClient.from('guest_groups').insert({
        id: groupId,
        wedding_id: weddingId,
        name: validated.name,
        notes: validated.custom_message || null,
        allow_plus_one: validated.guests.some((g) => g.is_plus_one_allowed),
        max_plus_ones: validated.guests.filter((g) => g.is_plus_one_allowed).length || 1,
      });

      if (grpErr) {
        console.error('Supabase create guest group error:', grpErr);
        return { success: false, error: grpErr.message };
      }

      // 2. Insert guests
      const guestRows = validated.guests.map((g, idx) => ({
        id: crypto.randomUUID(),
        group_id: groupId,
        first_name: g.first_name,
        last_name: g.last_name || '',
        email: g.email || null,
        phone: g.phone || null,
        is_child: Boolean(g.is_child),
        guest_type: g.is_child ? 'child' : 'adult',
        is_primary_contact: idx === 0,
        allow_plus_one: Boolean(g.is_plus_one_allowed),
        dietary_restrictions: g.dietary_restrictions || null,
        allergies: g.allergies || null,
        notes: g.notes || null,
        status: 'pending',
      }));

      const { error: gstErr } = await adminClient.from('guests').insert(guestRows);
      if (gstErr) console.error('Supabase create guests error:', gstErr);

      // 3. Insert invitation
      const { error: invErr } = await adminClient.from('invitations').insert({
        id: crypto.randomUUID(),
        wedding_id: weddingId,
        group_id: groupId,
        token_hash: tokenHash,
        token_preview: rawToken,
        status: 'active',
      });
      if (invErr) console.error('Supabase create invitation error:', invErr);

      // 4. Insert group_events
      const eventUuidMap: Record<string, string> = {
        'evt-preboda-cata': 'b0000000-0000-0000-0000-000000000001',
        'evt-ceremonia': 'b0000000-0000-0000-0000-000000000002',
        'evt-banquete': 'b0000000-0000-0000-0000-000000000003',
        'evt-fiesta-dj': 'b0000000-0000-0000-0000-000000000004',
      };

      const groupEventRows = validated.allowed_event_ids.map((eid) => ({
        id: crypto.randomUUID(),
        group_id: groupId,
        event_id: eventUuidMap[eid] || eid,
        is_visible: true,
      }));

      if (groupEventRows.length > 0) {
        const { error: geErr } = await adminClient.from('group_events').insert(groupEventRows);
        if (geErr) console.error('Supabase create group_events error:', geErr);
      }
    } catch (err: any) {
      console.warn('DB create guest group exception:', err);
      return { success: false, error: err?.message || 'Error al guardar invitado en Supabase' };
    }
  }

  // Create GuestGroup DTO
  const newGroup: GuestGroup = {
    id: groupId,
    wedding_id: weddingId,
    name: validated.name,
    token: rawToken,
    invitation_status: 'draft',
    custom_message: validated.custom_message,
    allowed_event_ids: validated.allowed_event_ids,
    guests: validated.guests.map((g) => ({
      id: crypto.randomUUID(),
      wedding_id: weddingId,
      group_id: groupId,
      first_name: g.first_name,
      last_name: g.last_name || '',
      email: g.email || undefined,
      phone: g.phone || undefined,
      is_child: Boolean(g.is_child),
      guest_type: g.is_child ? 'child' : 'adult',
      is_plus_one_allowed: Boolean(g.is_plus_one_allowed),
      dietary_restrictions: (g.dietary_restrictions as any) || undefined,
      allergies: g.allergies || undefined,
      notes: g.notes || undefined,
    })),
  };

  INITIAL_GROUPS.push(newGroup);

  revalidatePath('/admin/guests');
  revalidatePath('/admin');
  return { success: true, group: newGroup, token: rawToken };
}

/**
 * DELETE GUEST GROUP ACTION (Server Action)
 */
export async function deleteGuestGroupAction(groupId: string) {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { data: invs } = await adminClient.from('invitations').select('id').eq('group_id', groupId);
      if (invs && invs.length > 0) {
        const invIds = invs.map((i: any) => i.id);
        await adminClient.from('rsvp_responses').delete().in('invitation_id', invIds);
        await adminClient.from('invitations').delete().eq('group_id', groupId);
      }
      await adminClient.from('group_events').delete().eq('group_id', groupId);
      await adminClient.from('guests').delete().eq('group_id', groupId);
      await adminClient.from('guest_groups').delete().eq('id', groupId);
    } catch (err) {
      console.warn('Error deleting guest group from Supabase:', err);
    }
  }

  const idx = INITIAL_GROUPS.findIndex((g) => g.id === groupId);
  if (idx >= 0) INITIAL_GROUPS.splice(idx, 1);

  revalidatePath('/admin/guests');
  revalidatePath('/admin');
  return { success: true };
}

/**
 * SYNC ALL LOCAL GUESTS TO SUPABASE ACTION (Server Action)
 */
export async function syncAllLocalGuestsToSupabaseAction(localGroups: GuestGroup[]) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase no está configurado aún' };
  }

  try {
    const adminClient = createAdminClient();
    const weddingId = await resolveWeddingUuid(adminClient);
    let synced = 0;

    for (const grp of localGroups) {
      const token = grp.token || `token-${Math.random().toString(36).substring(2, 8)}`;
      const tokenHash = await hashToken(token);

      // Check if group already in Supabase
      const { data: existing } = await adminClient
        .from('guest_groups')
        .select('id')
        .eq('name', grp.name)
        .eq('wedding_id', weddingId)
        .maybeSingle();

      if (existing) continue;

      const groupId = crypto.randomUUID();
      await adminClient.from('guest_groups').insert({
        id: groupId,
        wedding_id: weddingId,
        name: grp.name,
        notes: grp.custom_message || null,
        allow_plus_one: grp.guests.some((g) => g.is_plus_one_allowed),
        max_plus_ones: 1,
      });

      const guestRows = grp.guests.map((g, idx) => ({
        id: crypto.randomUUID(),
        group_id: groupId,
        first_name: g.first_name,
        last_name: g.last_name || '',
        email: g.email || null,
        phone: g.phone || null,
        is_child: Boolean(g.is_child || g.guest_type === 'child'),
        guest_type: g.is_child || g.guest_type === 'child' ? 'child' : 'adult',
        is_primary_contact: idx === 0,
        allow_plus_one: Boolean(g.is_plus_one_allowed),
        status: 'pending',
      }));
      await adminClient.from('guests').insert(guestRows);

      await adminClient.from('invitations').insert({
        id: crypto.randomUUID(),
        wedding_id: weddingId,
        group_id: groupId,
        token_hash: tokenHash,
        token_preview: token,
        status: grp.invitation_status === 'revoked' ? 'revoked' : 'active',
      });

      const eventUuidMap: Record<string, string> = {
        'evt-preboda-cata': 'b0000000-0000-0000-0000-000000000001',
        'evt-ceremonia': 'b0000000-0000-0000-0000-000000000002',
        'evt-banquete': 'b0000000-0000-0000-0000-000000000003',
        'evt-fiesta-dj': 'b0000000-0000-0000-0000-000000000004',
      };
      const allowedEvents = grp.allowed_event_ids || ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'];
      const geRows = allowedEvents.map((eid) => ({
        id: crypto.randomUUID(),
        group_id: groupId,
        event_id: eventUuidMap[eid] || eid,
        is_visible: true,
      }));
      if (geRows.length > 0) {
        await adminClient.from('group_events').insert(geRows);
      }

      synced++;
    }

    revalidatePath('/admin/guests');
    revalidatePath('/admin');
    return { success: true, count: synced };
  } catch (err: any) {
    console.error('Error syncing local guests to Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * IMPORT GUESTS CSV ACTION (Server Action)
 * Parses CSV rows, validates with Zod, and creates Groups & Guests
 */
export async function importGuestsCSVAction(rawRows: unknown[]) {
  const validatedRows: any[] = [];
  const errors: string[] = [];

  rawRows.forEach((row, index) => {
    const res = CSVGuestRowSchema.safeParse(row);
    if (res.success) {
      validatedRows.push(res.data);
    } else {
      errors.push(`Fila ${index + 1}: ${res.error.errors.map((e) => e.message).join(', ')}`);
    }
  });

  if (errors.length > 0 && validatedRows.length === 0) {
    return { success: false, errors };
  }

  // Group by group_name
  const groupsMap = new Map<string, any[]>();
  validatedRows.forEach((r) => {
    const list = groupsMap.get(r.group_name) || [];
    list.push(r);
    groupsMap.set(r.group_name, list);
  });

  groupsMap.forEach((guestsList, groupName) => {
    const groupId = `grp-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const token = `token-${Math.random().toString(36).substring(2, 9)}`;

    const newGroup: GuestGroup = {
      id: groupId,
      wedding_id: INITIAL_WEDDING.id,
      name: groupName,
      token: token,
      invitation_status: 'draft',
      allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
      guests: guestsList.map((g, idx) => ({
        id: `gst-imp-${groupId}-${idx}`,
        wedding_id: INITIAL_WEDDING.id,
        group_id: groupId,
        first_name: g.first_name,
        last_name: g.last_name,
        is_plus_one_allowed: g.allow_plus_one,
      })),
    };

    INITIAL_GROUPS.push(newGroup);
  });

  revalidatePath('/admin/guests');
  return { success: true, count: validatedRows.length, errors };
}

/**
 * RECORD MANUAL RSVP (Server Action)
 * Allows the couple/admin to manually mark attendance for guests who confirmed by phone/WhatsApp
 */
export async function recordManualRSVPAction(payload: {
  groupId: string;
  responses: Array<{
    guestId: string;
    status: 'attending' | 'declined' | 'pending';
    dietaryChoice?: string;
    allergies?: string;
    plusOneAttending?: boolean;
    plusOneName?: string;
    message?: string;
  }>;
}) {
  const { groupId, responses } = payload;
  const now = new Date().toISOString();

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      const { data: inv } = await adminClient
        .from('invitations')
        .select('id')
        .eq('group_id', groupId)
        .single();

      if (inv) {
        for (const res of responses) {
          await adminClient.from('rsvp_responses').upsert({
            invitation_id: inv.id,
            guest_id: res.guestId,
            status: res.status,
            menu_choice: res.dietaryChoice || 'standard',
            allergies: res.allergies || null,
            plus_one_attending: res.plusOneAttending || false,
            plus_one_name: res.plusOneName || null,
            message: res.message || 'Confirmación manual registrada por los novios',
            submitted_at: now,
          }, { onConflict: 'invitation_id,guest_id' });
        }

        await adminClient.from('invitations').update({
          status: 'responded',
          responded_at: now,
        }).eq('id', inv.id);
      }
    }
  } catch (err) {
    console.warn('Database sync skipped (local store active):', err);
  }

  // Update in-memory fallback
  const group = INITIAL_GROUPS.find((g) => g.id === groupId);
  if (group) {
    group.invitation_status = 'responded';
    group.responded_at = now;

    const mappedResponses: GuestRSVPResponse[] = responses.map((r) => {
      const guestObj = group.guests.find((g) => g.id === r.guestId);
      const guestName = guestObj ? `${guestObj.first_name} ${guestObj.last_name}`.trim() : 'Invitado';
      return {
        guest_id: r.guestId,
        guest_name: guestName,
        status: r.status,
        attending_event_ids: r.status === 'attending' ? group.allowed_event_ids : [],
        dietary_choice: (r.dietaryChoice as any) || 'standard',
        allergies: r.allergies || undefined,
        plus_one_attending: r.plusOneAttending,
        plus_one_name: r.plusOneName || undefined,
        message: r.message || 'Confirmación manual',
      };
    });

    const existingRsvpIndex = INITIAL_RSVPS.findIndex((r) => r.group_id === groupId);
    if (existingRsvpIndex >= 0) {
      INITIAL_RSVPS[existingRsvpIndex].responses = mappedResponses;
      INITIAL_RSVPS[existingRsvpIndex].submitted_at = now;
    } else {
      INITIAL_RSVPS.push({
        group_id: groupId,
        token: group.token,
        responses: mappedResponses,
        submitted_at: now,
      });
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/guests');
  revalidatePath('/admin/rsvp');

  return { success: true, message: 'Confirmación manual guardada y recuento actualizado.' };
}

/**
 * ==============================================================================
 * MEDIA STORAGE & MANAGEMENT SERVER ACTIONS
 * ==============================================================================
 */

/**
 * Uploads media photo with validation, Supabase Storage integration,
 * rollback on failure, and local persistence fallback.
 */
export async function uploadMediaAction(formData: FormData): Promise<{
  success: boolean;
  message: string;
  photo?: MediaPhoto;
}> {
  try {
    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return { success: false, message: 'No se ha seleccionado ningún archivo válido.' };
    }

    // 1. Validate file constraints
    const validation = validateMediaFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!validation.valid) {
      return { success: false, message: validation.error || 'Archivo inválido.' };
    }

    // Magic bytes sanity check
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.length >= 12 &&
      buffer.toString('utf8', 0, 4) === 'RIFF' &&
      buffer.toString('utf8', 8, 12) === 'WEBP';

    if (!isJpeg && !isPng && !isWebp) {
      return {
        success: false,
        message: 'El contenido del archivo no corresponde a una imagen válida (JPEG, PNG o WebP).',
      };
    }

    // 2. Parse form fields
    const captionRaw = (formData.get('caption') as string) || '';
    const caption = captionRaw.trim().slice(0, 180) || null;
    const uploaderNameRaw = (formData.get('uploader_name') as string) || '';
    const uploaderName = uploaderNameRaw.trim().slice(0, 80) || 'Invitado';
    const isAdmin = formData.get('is_admin') === 'true';
    const guestId = (formData.get('guest_id') as string) || null;
    const weddingId = (formData.get('wedding_id') as string) || 'w-stephanie-rodrigo-2027';

    // 3. Generate secure identifiers
    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const originalFilename = sanitizeFileName(file.name);
    const storagePath = buildStoragePath(weddingId, photoId, originalFilename);
    const now = new Date().toISOString();

    const status: MediaPhotoStatus = isAdmin ? 'approved' : 'pending';
    const isApproved = isAdmin;
    const isVisible = true;

    // Direct data URL for local display fallback
    const base64Data = buffer.toString('base64');
    const localPhotoUrl = `data:${file.type};base64,${base64Data}`;

    let finalPhotoUrl = localPhotoUrl;

    // 4. Supabase Storage & Database persistence (when available)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      let storageUploaded = false;

      try {
        // Upload binary to wedding-media bucket
        const { error: storageError } = await adminClient.storage
          .from(MEDIA_STORAGE_BUCKET)
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (storageError) {
          throw storageError;
        }
        storageUploaded = true;

        // Insert metadata into media_photos table
        const { error: dbError } = await adminClient.from('media_photos').insert({
          id: photoId,
          wedding_id: weddingId,
          uploaded_by_guest_id: guestId,
          storage_path: storagePath,
          original_filename: originalFilename,
          mime_type: file.type,
          file_size: file.size,
          caption: caption,
          is_visible: isVisible,
          is_approved: isApproved,
          status: status,
          created_at: now,
          updated_at: now,
        });

        if (dbError) {
          // Cleanup orphaned file if DB insertion failed
          if (storageUploaded) {
            await adminClient.storage.from(MEDIA_STORAGE_BUCKET).remove([storagePath]);
          }
          throw dbError;
        }

        // Generate signed URL
        const { data: signedData } = await adminClient.storage
          .from(MEDIA_STORAGE_BUCKET)
          .createSignedUrl(storagePath, 3600);

        if (signedData?.signedUrl) {
          finalPhotoUrl = signedData.signedUrl;
        }
      } catch (cloudErr) {
        console.warn('Supabase storage write fallback:', cloudErr);
      }
    }

    const newPhoto: MediaPhoto = {
      id: photoId,
      wedding_id: weddingId,
      uploaded_by_guest_id: guestId,
      uploader_name: uploaderName,
      storage_path: storagePath,
      photo_url: finalPhotoUrl,
      original_filename: originalFilename,
      mime_type: file.type,
      file_size: file.size,
      width: 1920,
      height: 1080,
      caption: caption,
      is_visible: isVisible,
      is_approved: isApproved,
      status: status,
      created_at: now,
      updated_at: now,
    };

    // Update in-memory fallback store
    const stored = getStoredPhotos();
    setStoredPhotos([newPhoto, ...stored]);

    revalidatePath('/admin/media');
    revalidatePath('/w/stephanie-y-rodrigo');

    return {
      success: true,
      message: isAdmin
        ? 'Fotografía subida y publicada en la galería oficial.'
        : '¡Fotografía recibida! Se mostrará en la galería tras una breve revisión.',
      photo: newPhoto,
    };
  } catch (error: any) {
    console.error('uploadMediaAction error:', error);
    return {
      success: false,
      message: error?.message || 'Error al procesar la subida de la fotografía.',
    };
  }
}

/**
 * Approve media photo
 */
export async function approveMediaAction(photoId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient
        .from('media_photos')
        .update({
          status: 'approved',
          is_approved: true,
          is_visible: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', photoId);
    }
  } catch (err) {
    console.warn('DB approve photo fallback:', err);
  }

  const stored = getStoredPhotos();
  const updated = stored.map((p) =>
    p.id === photoId
      ? { ...p, status: 'approved' as MediaPhotoStatus, is_approved: true, is_visible: true, updated_at: new Date().toISOString() }
      : p
  );
  setStoredPhotos(updated);

  revalidatePath('/admin/media');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Hide media photo
 */
export async function hideMediaAction(photoId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient
        .from('media_photos')
        .update({
          status: 'hidden',
          is_approved: false,
          is_visible: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', photoId);
    }
  } catch (err) {
    console.warn('DB hide photo fallback:', err);
  }

  const stored = getStoredPhotos();
  const updated = stored.map((p) =>
    p.id === photoId
      ? { ...p, status: 'hidden' as MediaPhotoStatus, is_approved: false, is_visible: false, updated_at: new Date().toISOString() }
      : p
  );
  setStoredPhotos(updated);

  revalidatePath('/admin/media');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Delete media photo (removes metadata and storage file)
 */
export async function deleteMediaAction(photoId: string) {
  const stored = getStoredPhotos();
  const target = stored.find((p) => p.id === photoId);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient.from('media_photos').delete().eq('id', photoId);
      if (target?.storage_path) {
        await adminClient.storage.from(MEDIA_STORAGE_BUCKET).remove([target.storage_path]);
      }
    }
  } catch (err) {
    console.warn('DB delete photo fallback:', err);
  }

  const updated = stored.filter((p) => p.id !== photoId);
  setStoredPhotos(updated);

  revalidatePath('/admin/media');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Update media photo caption
 */
export async function updateMediaCaptionAction(photoId: string, caption: string) {
  const safeCaption = caption.trim().slice(0, 180);
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient
        .from('media_photos')
        .update({ caption: safeCaption, updated_at: new Date().toISOString() })
        .eq('id', photoId);
    }
  } catch (err) {
    console.warn('DB caption update fallback:', err);
  }

  const stored = getStoredPhotos();
  const updated = stored.map((p) =>
    p.id === photoId ? { ...p, caption: safeCaption, updated_at: new Date().toISOString() } : p
  );
  setStoredPhotos(updated);

  revalidatePath('/admin/media');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Bulk moderate media photos
 */
export async function bulkModerateMediaAction(
  photoIds: string[],
  action: 'approve' | 'hide' | 'delete'
) {
  const parse = BulkMediaModerateSchema.safeParse({ photo_ids: photoIds, action });
  if (!parse.success) {
    return { success: false, message: 'Parámetros no válidos para la moderación masiva.' };
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      if (action === 'delete') {
        await adminClient.from('media_photos').delete().in('id', photoIds);
      } else {
        const isApprove = action === 'approve';
        await adminClient
          .from('media_photos')
          .update({
            status: isApprove ? 'approved' : 'hidden',
            is_approved: isApprove,
            is_visible: isApprove,
            updated_at: new Date().toISOString(),
          })
          .in('id', photoIds);
      }
    }
  } catch (err) {
    console.warn('DB bulk moderate fallback:', err);
  }

  const stored = getStoredPhotos();
  const setIds = new Set(photoIds);
  let updated: MediaPhoto[];

  if (action === 'delete') {
    updated = stored.filter((p) => !setIds.has(p.id));
  } else {
    const isApprove = action === 'approve';
    updated = stored.map((p) => {
      if (setIds.has(p.id)) {
        return {
          ...p,
          status: isApprove ? ('approved' as MediaPhotoStatus) : ('hidden' as MediaPhotoStatus),
          is_approved: isApprove,
          is_visible: isApprove,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });
  }

  setStoredPhotos(updated);
  revalidatePath('/admin/media');
  revalidatePath('/w/stephanie-y-rodrigo');

  return { success: true, count: photoIds.length };
}

/**
 * ==============================================================================
 * GUESTBOOK SERVER ACTIONS
 * ==============================================================================
 */

/**
 * Submits guestbook entry with sanitization, defaulting to pending status
 */
export async function submitGuestbookAction(rawPayload: unknown): Promise<{
  success: boolean;
  message: string;
  entry?: GuestBookEntry;
}> {
  const parse = GuestbookSubmitSchema.safeParse(rawPayload);
  if (!parse.success) {
    return {
      success: false,
      message: parse.error.issues[0]?.message || 'Datos no válidos para el libro de firmas.',
    };
  }

  const { guest_name, message, wedding_id, invitation_id } = parse.data;

  // Sanitize text (strip HTML tags)
  const cleanName = guest_name.replace(/<[^>]*>?/gm, '').trim();
  const cleanMessage = message.replace(/<[^>]*>?/gm, '').trim();

  const entryId = `gb-entry-${Date.now()}`;
  const now = new Date().toISOString();

  const newEntry: GuestBookEntry = {
    id: entryId,
    wedding_id: wedding_id || 'w-stephanie-rodrigo-2027',
    invitation_id: invitation_id || null,
    guest_name: cleanName,
    message: cleanMessage,
    status: 'pending', // Defaults to pending moderation
    created_at: now,
  };

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const supabase = await createServerSupabase();
      await supabase.from('guestbook_entries').insert({
        id: entryId,
        wedding_id: newEntry.wedding_id,
        invitation_id: newEntry.invitation_id,
        guest_display_name: cleanName,
        message: cleanMessage,
        status: 'pending',
        created_at: now,
      });
    }
  } catch (err) {
    console.warn('DB guestbook fallback:', err);
  }

  const stored = getStoredGuestbook();
  setStoredGuestbook([newEntry, ...stored]);

  revalidatePath('/admin/guestbook');
  revalidatePath('/w/stephanie-y-rodrigo');

  return {
    success: true,
    message: '¡Muchas gracias por tus palabras! Tu dedicatoria se publicará en el libro de firmas tras una breve revisión.',
    entry: newEntry,
  };
}

/**
 * Approve guestbook entry
 */
export async function approveGuestbookAction(entryId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient
        .from('guestbook_entries')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', entryId);
    }
  } catch (err) {
    console.warn('DB approve guestbook fallback:', err);
  }

  const stored = getStoredGuestbook();
  const updated = stored.map((e) =>
    e.id === entryId ? { ...e, status: 'approved' as GuestBookEntryStatus, approved_at: new Date().toISOString() } : e
  );
  setStoredGuestbook(updated);

  revalidatePath('/admin/guestbook');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Hide guestbook entry
 */
export async function hideGuestbookAction(entryId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient.from('guestbook_entries').update({ status: 'hidden' }).eq('id', entryId);
    }
  } catch (err) {
    console.warn('DB hide guestbook fallback:', err);
  }

  const stored = getStoredGuestbook();
  const updated = stored.map((e) =>
    e.id === entryId ? { ...e, status: 'hidden' as GuestBookEntryStatus } : e
  );
  setStoredGuestbook(updated);

  revalidatePath('/admin/guestbook');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

/**
 * Delete guestbook entry
 */
export async function deleteGuestbookAction(entryId: string) {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient.from('guestbook_entries').delete().eq('id', entryId);
    }
  } catch (err) {
    console.warn('DB delete guestbook fallback:', err);
  }

  const stored = getStoredGuestbook();
  const updated = stored.filter((e) => e.id !== entryId);
  setStoredGuestbook(updated);

  revalidatePath('/admin/guestbook');
  revalidatePath('/w/stephanie-y-rodrigo');
  return { success: true };
}

// ==========================================
// BUDGET MODULE SERVER ACTIONS (PHASE 20)
// ==========================================

async function resolveWeddingUuid(supabaseClient: any): Promise<string> {
  try {
    const { data } = await supabaseClient
      .from('weddings')
      .select('id')
      .eq('slug', 'stephanie-y-rodrigo')
      .maybeSingle();
    if (data?.id) return data.id;
  } catch {}
  return WEDDING_UUID;
}

/**
 * 0. Get Live Budget Data from Supabase
 */
export async function getBudgetDataAction() {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);

      // 1. Categories
      let { data: categories, error: catErr } = await adminClient
        .from('budget_categories')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('sort_order', { ascending: true });

      if (catErr) {
        console.error('Error fetching categories from Supabase:', catErr);
      }

      // If no categories exist yet in Supabase, seed the 12 official ones
      if (!categories || categories.length === 0) {
        const seedPayload = INITIAL_BUDGET_CATEGORIES.map((c) => ({
          id: c.id,
          wedding_id: weddingId,
          name: c.name,
          description: c.description,
          budget_type: c.budget_type,
          icon: c.icon,
          sort_order: c.sort_order,
          is_active: true,
        }));

        const { data: insertedCats, error: seedErr } = await adminClient
          .from('budget_categories')
          .upsert(seedPayload, { onConflict: 'id' })
          .select();

        if (!seedErr && insertedCats && insertedCats.length > 0) {
          categories = insertedCats;
        }
      }

      // 2. Suppliers
      const { data: suppliers, error: supErr } = await adminClient
        .from('budget_suppliers')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: true });

      if (supErr) {
        console.error('Error fetching suppliers from Supabase:', supErr);
      }

      // 3. Payments
      const { data: payments, error: payErr } = await adminClient
        .from('budget_payments')
        .select('*')
        .eq('wedding_id', weddingId)
        .order('created_at', { ascending: true });

      if (payErr) {
        console.error('Error fetching payments from Supabase:', payErr);
      }

      // 4. Menu Config
      let { data: menuConfig, error: menuErr } = await adminClient
        .from('budget_menu_config')
        .select('*')
        .eq('wedding_id', weddingId)
        .maybeSingle();

      if (menuErr) {
        console.error('Error fetching menu config from Supabase:', menuErr);
      }

      if (!menuConfig) {
        const { data: insertedMenu } = await adminClient
          .from('budget_menu_config')
          .upsert(
            {
              wedding_id: weddingId,
              adult_price: 145.0,
              child_price: 75.0,
              use_manual_counts: false,
            },
            { onConflict: 'wedding_id' }
          )
          .select()
          .maybeSingle();
        if (insertedMenu) menuConfig = insertedMenu;
      }

      return {
        success: true,
        source: 'supabase',
        categories: categories || getStoredBudgetCategories(),
        suppliers: suppliers || [],
        payments: payments || [],
        menuConfig: menuConfig || getStoredBudgetMenuConfig(),
      };
    } catch (err) {
      console.warn('Supabase budget fetch error, falling back to local store:', err);
    }
  }

  return {
    success: false,
    source: 'local',
    categories: getStoredBudgetCategories(),
    suppliers: getStoredBudgetSuppliers(),
    payments: getStoredBudgetPayments(),
    menuConfig: getStoredBudgetMenuConfig(),
  };
}

/**
 * 1. Create Budget Category
 */
export async function createCategoryAction(rawInput: unknown) {
  const validated = BudgetCategoryCreateSchema.parse(rawInput);
  const newId = crypto.randomUUID();

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);
      const { error } = await adminClient.from('budget_categories').insert({
        id: newId,
        wedding_id: weddingId,
        name: validated.name,
        description: validated.description,
        budget_type: validated.budget_type,
        icon: validated.icon,
        sort_order: validated.sort_order,
      });

      if (error) {
        console.error('Supabase create category error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB create category exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetCategories();
  const nextCats = [
    ...stored,
    {
      id: newId,
      wedding_id: WEDDING_UUID,
      name: validated.name,
      description: validated.description || null,
      budget_type: validated.budget_type,
      icon: validated.icon || 'Sparkles',
      sort_order: validated.sort_order,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  setStoredBudgetCategories(nextCats);

  revalidatePath('/admin/budget');
  return { success: true, id: newId };
}

/**
 * 2. Update Budget Category
 */
export async function updateCategoryAction(rawInput: unknown) {
  const validated = BudgetCategoryUpdateSchema.parse(rawInput);

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { id, ...updates } = validated;
      const { error } = await adminClient
        .from('budget_categories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase update category error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB update category exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetCategories();
  const nextCats = stored.map((c) =>
    c.id === validated.id
      ? { ...c, ...validated, updated_at: new Date().toISOString() }
      : c
  );
  setStoredBudgetCategories(nextCats);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 3. Delete Budget Category
 */
export async function deleteCategoryAction(categoryId: string) {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient.from('budget_categories').delete().eq('id', categoryId);

      if (error) {
        console.error('Supabase delete category error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB delete category exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const storedCats = getStoredBudgetCategories().filter((c) => c.id !== categoryId);
  const storedSuppliers = getStoredBudgetSuppliers().filter((s) => s.category_id !== categoryId);
  setStoredBudgetCategories(storedCats);
  setStoredBudgetSuppliers(storedSuppliers);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 4. Create Supplier
 */
export async function createSupplierAction(rawInput: unknown) {
  const validated = BudgetSupplierCreateSchema.parse(rawInput);
  const newId = crypto.randomUUID();
  const categoryId = normalizeCategoryId(validated.category_id);

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);

      if (validated.is_selected) {
        await adminClient
          .from('budget_suppliers')
          .update({ is_selected: false, status: 'quoted' })
          .eq('category_id', categoryId);
      }

      const { error } = await adminClient.from('budget_suppliers').insert({
        id: newId,
        wedding_id: weddingId,
        category_id: categoryId,
        name: validated.name,
        contact_name: validated.contact_name,
        email: validated.email,
        phone: validated.phone,
        website: validated.website,
        instagram: validated.instagram,
        estimated_price: validated.estimated_price,
        quoted_price: validated.quoted_price,
        final_price: validated.final_price,
        currency: validated.currency,
        rating: validated.rating,
        status: validated.status,
        comments: validated.comments,
        notes: validated.notes,
        is_selected: validated.is_selected,
      });

      if (error) {
        console.error('Supabase create supplier error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB create supplier exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetSuppliers();
  let nextSuppliers = stored;
  if (validated.is_selected) {
    nextSuppliers = stored.map((s) =>
      s.category_id === categoryId ? { ...s, is_selected: false } : s
    );
  }
  setStoredBudgetSuppliers([
    ...nextSuppliers,
    {
      id: newId,
      wedding_id: WEDDING_UUID,
      category_id: categoryId,
      name: validated.name,
      contact_name: validated.contact_name || null,
      email: validated.email || null,
      phone: validated.phone || null,
      website: validated.website || null,
      instagram: validated.instagram || null,
      estimated_price: validated.estimated_price || null,
      quoted_price: validated.quoted_price || null,
      final_price: validated.final_price || null,
      currency: validated.currency || 'EUR',
      rating: validated.rating || null,
      status: validated.status || 'pending',
      comments: validated.comments || null,
      notes: validated.notes || null,
      is_selected: validated.is_selected,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  revalidatePath('/admin/budget');
  return { success: true, id: newId };
}

/**
 * 5. Update Supplier
 */
export async function updateSupplierAction(rawInput: unknown) {
  const validated = BudgetSupplierUpdateSchema.parse(rawInput);
  const categoryId = validated.category_id ? normalizeCategoryId(validated.category_id) : undefined;

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (validated.is_selected && categoryId) {
        await adminClient
          .from('budget_suppliers')
          .update({ is_selected: false })
          .eq('category_id', categoryId)
          .neq('id', validated.id);
      }
      const { id, ...updates } = validated;
      if (categoryId) updates.category_id = categoryId;
      const { error } = await adminClient
        .from('budget_suppliers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase update supplier error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB update supplier exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetSuppliers();
  let nextSuppliers = stored;
  if (validated.is_selected && categoryId) {
    nextSuppliers = stored.map((s) =>
      s.category_id === categoryId && s.id !== validated.id
        ? { ...s, is_selected: false }
        : s
    );
  }
  nextSuppliers = nextSuppliers.map((s) =>
    s.id === validated.id
      ? { ...s, ...validated, ...(categoryId ? { category_id: categoryId } : {}), updated_at: new Date().toISOString() }
      : s
  );
  setStoredBudgetSuppliers(nextSuppliers);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 6. Select Supplier (Enforces exactly one selected per category)
 */
export async function selectSupplierAction(rawInput: unknown) {
  const validated = BudgetSupplierSelectSchema.parse(rawInput);
  const categoryId = normalizeCategoryId(validated.category_id);

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      // Step 1: unselect all in category
      await adminClient
        .from('budget_suppliers')
        .update({ is_selected: false, status: 'quoted' })
        .eq('category_id', categoryId);
      // Step 2: select target supplier
      const { error } = await adminClient
        .from('budget_suppliers')
        .update({ is_selected: true, status: 'selected', updated_at: new Date().toISOString() })
        .eq('id', validated.supplier_id);

      if (error) {
        console.error('Supabase select supplier error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB select supplier exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetSuppliers();
  const nextSuppliers = stored.map((s) => {
    if (s.category_id !== categoryId) return s;
    if (s.id === validated.supplier_id) {
      return { ...s, is_selected: true, status: 'selected' as const, updated_at: new Date().toISOString() };
    }
    return { ...s, is_selected: false, status: s.status === 'selected' ? ('quoted' as const) : s.status, updated_at: new Date().toISOString() };
  });
  setStoredBudgetSuppliers(nextSuppliers);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 7. Delete Supplier
 */
export async function deleteSupplierAction(supplierId: string) {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient.from('budget_suppliers').delete().eq('id', supplierId);

      if (error) {
        console.error('Supabase delete supplier error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB delete supplier exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetSuppliers().filter((s) => s.id !== supplierId);
  const storedPayments = getStoredBudgetPayments().filter((p) => p.supplier_id !== supplierId);
  setStoredBudgetSuppliers(stored);
  setStoredBudgetPayments(storedPayments);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 8. Create Payment
 */
export async function createPaymentAction(rawInput: unknown) {
  const validated = BudgetPaymentCreateSchema.parse(rawInput);
  const newId = crypto.randomUUID();

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);
      const { error } = await adminClient.from('budget_payments').insert({
        id: newId,
        wedding_id: weddingId,
        supplier_id: validated.supplier_id,
        amount: validated.amount,
        due_date: validated.due_date,
        paid_at: validated.paid_at,
        status: validated.status,
        notes: validated.notes,
      });

      if (error) {
        console.error('Supabase create payment error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB create payment exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetPayments();
  setStoredBudgetPayments([
    ...stored,
    {
      id: newId,
      wedding_id: WEDDING_UUID,
      supplier_id: validated.supplier_id,
      amount: validated.amount,
      due_date: validated.due_date || null,
      paid_at: validated.paid_at || null,
      status: validated.status,
      notes: validated.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  revalidatePath('/admin/budget');
  return { success: true, id: newId };
}

/**
 * 9. Update Payment
 */
export async function updatePaymentAction(rawInput: unknown) {
  const validated = BudgetPaymentUpdateSchema.parse(rawInput);

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { id, ...updates } = validated;
      const { error } = await adminClient
        .from('budget_payments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Supabase update payment error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB update payment exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetPayments();
  const nextPayments = stored.map((p) =>
    p.id === validated.id ? { ...p, ...validated, updated_at: new Date().toISOString() } : p
  );
  setStoredBudgetPayments(nextPayments);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 10. Delete Payment
 */
export async function deletePaymentAction(paymentId: string) {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const { error } = await adminClient.from('budget_payments').delete().eq('id', paymentId);

      if (error) {
        console.error('Supabase delete payment error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB delete payment exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetPayments().filter((p) => p.id !== paymentId);
  setStoredBudgetPayments(stored);

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 11. Update Menu Config
 */
export async function updateMenuConfigAction(rawInput: unknown) {
  const validated = BudgetMenuConfigUpdateSchema.parse(rawInput);

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      const weddingId = await resolveWeddingUuid(adminClient);
      const { error } = await adminClient.from('budget_menu_config').upsert(
        {
          wedding_id: weddingId,
          adult_price: validated.adult_price,
          child_price: validated.child_price,
          adult_count_override: validated.adult_count_override,
          child_count_override: validated.child_count_override,
          use_manual_counts: validated.use_manual_counts,
          supplier_id: validated.supplier_id,
          notes: validated.notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wedding_id' }
      );

      if (error) {
        console.error('Supabase update menu config error:', error);
        return { success: false, error: error.message };
      }
    } catch (err: any) {
      console.warn('DB update menu config exception:', err);
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  }

  const stored = getStoredBudgetMenuConfig();
  setStoredBudgetMenuConfig({
    ...stored,
    ...validated,
    updated_at: new Date().toISOString(),
  });

  revalidatePath('/admin/budget');
  return { success: true };
}

/**
 * 12. Update Guest Type (Adult vs Child)
 */
export async function updateGuestTypeAction(rawInput: unknown) {
  const validated = GuestTypeUpdateSchema.parse(rawInput);

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
      const adminClient = createAdminClient();
      await adminClient
        .from('guests')
        .update({
          guest_type: validated.guest_type,
          is_child: validated.guest_type === 'child',
        })
        .eq('id', validated.guest_id);
    }
  } catch (err) {
    console.warn('DB update guest type fallback:', err);
  }

  revalidatePath('/admin/guests');
  revalidatePath('/admin/budget');
  return { success: true };
}


