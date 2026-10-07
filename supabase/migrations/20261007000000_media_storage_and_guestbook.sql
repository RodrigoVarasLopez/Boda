-- ==============================================================================
-- Migration: 20261007000000_media_storage_and_guestbook.sql
-- Description: Media storage bucket, expanded media_photos metadata, and RLS policies
-- Wedding: Stephanie & Rodrigo (Bodega Concejo)
-- ==============================================================================

-- 1. Extend media_photos schema
ALTER TABLE IF EXISTS media_photos
  ADD COLUMN IF NOT EXISTS uploaded_by_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT DEFAULT 'photo.jpg',
  ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'image/jpeg',
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure status check constraint on media_photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'media_photos_status_check'
  ) THEN
    ALTER TABLE media_photos ADD CONSTRAINT media_photos_status_check
      CHECK (status IN ('pending', 'approved', 'hidden'));
  END IF;
END $$;

-- 2. Extend guestbook_entries status constraint
DO $$
BEGIN
  ALTER TABLE guestbook_entries DROP CONSTRAINT IF EXISTS guestbook_entries_status_check;
  ALTER TABLE guestbook_entries ADD CONSTRAINT guestbook_entries_status_check
    CHECK (status IN ('pending', 'approved', 'hidden', 'rejected'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 3. Setup Supabase Storage bucket for wedding media (private by default)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-media',
  'wedding-media',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Enable RLS and define Policies
ALTER TABLE media_photos ENABLE ROW LEVEL SECURITY;

-- Admins manage media of owned weddings
DROP POLICY IF EXISTS "Admins manage media of owned weddings" ON media_photos;
CREATE POLICY "Admins manage media of owned weddings" ON media_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = media_photos.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Public can view approved and visible media photos
DROP POLICY IF EXISTS "Public can view approved media photos" ON media_photos;
CREATE POLICY "Public can view approved media photos" ON media_photos
  FOR SELECT USING (
    is_visible = true AND (status = 'approved' OR is_approved = true)
  );

-- Admins manage guestbook entries of owned weddings
DROP POLICY IF EXISTS "Admins manage guestbook of owned weddings" ON guestbook_entries;
CREATE POLICY "Admins manage guestbook of owned weddings" ON guestbook_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = guestbook_entries.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Public can view approved guestbook entries
DROP POLICY IF EXISTS "Public can view approved guestbook entries" ON guestbook_entries;
CREATE POLICY "Public can view approved guestbook entries" ON guestbook_entries
  FOR SELECT USING (
    status = 'approved'
  );

-- 5. Storage policies for wedding-media bucket
DROP POLICY IF EXISTS "Admins manage wedding-media storage" ON storage.objects;
CREATE POLICY "Admins manage wedding-media storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'wedding-media' AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Guests can upload to wedding-media gallery" ON storage.objects;
CREATE POLICY "Guests can upload to wedding-media gallery" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'wedding-media'
  );

DROP POLICY IF EXISTS "Anyone with signed URL can read wedding-media" ON storage.objects;
CREATE POLICY "Anyone with signed URL can read wedding-media" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'wedding-media'
  );
