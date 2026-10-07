import { MediaPhoto } from '@/lib/types';
import { createClient as createBrowserSupabase } from '@/lib/supabase/client';

export const MEDIA_STORAGE_BUCKET = 'wedding-media';
export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

/**
 * Sanitizes a file name for safe storage path creation.
 * Strips directory traversal, special characters, and preserves safe extensions.
 * Never includes personal identifiers.
 */
export function sanitizeFileName(originalName: string): string {
  if (!originalName) return 'photo.jpg';

  // Extract extension
  const lastDot = originalName.lastIndexOf('.');
  const rawExt = lastDot !== -1 ? originalName.slice(lastDot).toLowerCase() : '.jpg';
  const cleanExt = ALLOWED_MEDIA_EXTENSIONS.includes(rawExt as any) ? rawExt : '.jpg';

  // Base name
  const rawBase = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;
  const cleanBase = rawBase
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9_-]/g, '-') // replace non-alphanumeric with dash
    .replace(/-+/g, '-') // collapse consecutive dashes
    .replace(/^-|-$/g, '') // trim dashes
    .slice(0, 40); // limit length

  return `${cleanBase || 'photo'}${cleanExt}`;
}

/**
 * Builds recommended object path:
 * {wedding_id}/gallery/{photo_id}/{safe-filename}
 */
export function buildStoragePath(weddingId: string, photoId: string, originalName: string): string {
  const safeFilename = sanitizeFileName(originalName);
  return `${weddingId}/gallery/${photoId}/${safeFilename}`;
}

/**
 * Validates file MIME type and extension
 */
export function validateMediaFile(file: { type: string; size: number; name: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'No se ha seleccionado ningún archivo' };
  }

  if (file.size > MAX_MEDIA_FILE_SIZE) {
    return {
      valid: false,
      error: `El archivo supera el límite de 10 MB (tamaño actual: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
    };
  }

  const isMimeAllowed = (ALLOWED_MEDIA_MIME_TYPES as readonly string[]).includes(file.type);
  const ext = ('.' + file.name.split('.').pop()?.toLowerCase()) as any;
  const isExtAllowed = (ALLOWED_MEDIA_EXTENSIONS as readonly string[]).includes(ext);

  if (!isMimeAllowed && !isExtAllowed) {
    return {
      valid: false,
      error: 'Formato no admitido. Por favor, sube imágenes en formato JPG, PNG o WebP.',
    };
  }

  return { valid: true };
}

/**
 * Resolves display URL for a photo with fallback for local fixtures.
 */
export async function getMediaDisplayUrl(photo: Partial<MediaPhoto>, expiresInSeconds = 3600): Promise<string> {
  // 1. Direct local/mock URL or data URI
  if (photo.photo_url && (photo.photo_url.startsWith('/') || photo.photo_url.startsWith('http') || photo.photo_url.startsWith('data:'))) {
    return photo.photo_url;
  }

  // 2. Storage signed URL if storage_path is present and Supabase is configured
  if (photo.storage_path) {
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.storage
        .from(MEDIA_STORAGE_BUCKET)
        .createSignedUrl(photo.storage_path, expiresInSeconds);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch {
      // Fallback
    }
  }

  return photo.photo_url || '/wedding/hero-mediterranean.jpg';
}

/**
 * Synchronous resolver for SSR/Client render
 */
export function getMediaDisplayUrlSync(photo: Partial<MediaPhoto>): string {
  if (photo.photo_url && (photo.photo_url.startsWith('/') || photo.photo_url.startsWith('http') || photo.photo_url.startsWith('data:'))) {
    return photo.photo_url;
  }
  return '/wedding/hero-mediterranean.jpg';
}
