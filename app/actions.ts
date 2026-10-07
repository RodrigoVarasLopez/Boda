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
} from '@/lib/schemas';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { INITIAL_GROUPS, INITIAL_WEDDING, INITIAL_EVENTS, INITIAL_RSVPS, INITIAL_CMS_BLOCKS } from '@/lib/mock-data';
import {
  GuestGroup,
  GuestRSVPResponse,
  Event,
  MediaPhoto,
  GuestBookEntry,
  MediaPhotoStatus,
  GuestBookEntryStatus,
} from '@/lib/types';
import { validateMediaFile, buildStoragePath, sanitizeFileName, MEDIA_STORAGE_BUCKET } from '@/lib/media/urls';
import { getStoredPhotos, setStoredPhotos, getStoredGuestbook, setStoredGuestbook } from '@/lib/media-data';
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

