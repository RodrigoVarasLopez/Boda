'use server';

import crypto from 'crypto';
import { GroupRSVPSubmitSchema, GuestGroupCreateSchema, CSVGuestRowSchema } from '@/lib/schemas';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_GROUPS, INITIAL_WEDDING, INITIAL_EVENTS, INITIAL_RSVPS, INITIAL_CMS_BLOCKS } from '@/lib/mock-data';
import { GuestGroup, GuestRSVPResponse, Event } from '@/lib/types';
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
