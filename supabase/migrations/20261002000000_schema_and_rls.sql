-- Boda Web Supabase PostgreSQL Migration
-- Enables UUID, pgcrypto and creates schema, indexes, RLS policies, and token resolver RPC

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Weddings Table
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  couple_name_1 TEXT NOT NULL,
  couple_name_2 TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  theme TEXT NOT NULL DEFAULT 'editorial',
  rsvp_deadline TIMESTAMPTZ,
  iban_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Guest Groups
CREATE TABLE IF NOT EXISTS guest_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT,
  notes TEXT,
  allow_plus_one BOOLEAN NOT NULL DEFAULT false,
  max_plus_ones INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  is_child BOOLEAN NOT NULL DEFAULT false,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  allow_plus_one BOOLEAN NOT NULL DEFAULT false,
  dietary_restrictions TEXT,
  allergies TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location_name TEXT NOT NULL,
  location_address TEXT NOT NULL,
  maps_url TEXT,
  dress_code TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Group Events (Visibility Matrix)
CREATE TABLE IF NOT EXISTS group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, event_id)
);

-- 7. Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  token_hash TEXT UNIQUE NOT NULL,
  token_hint TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RSVP Responses Table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'declined')),
  menu_choice TEXT NOT NULL DEFAULT 'standard',
  allergies TEXT,
  plus_one_attending BOOLEAN NOT NULL DEFAULT false,
  plus_one_name TEXT,
  plus_one_menu_choice TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invitation_id, guest_id)
);

-- 9. Content Blocks (CMS)
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  image_path TEXT,
  config_json JSONB,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Guestbook Entries
CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  guest_display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);

-- 11. Media Photos
CREATE TABLE IF NOT EXISTS media_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Access
CREATE POLICY "Admins manage their own profiles" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admins manage their owned weddings" ON weddings
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins manage guest groups of owned weddings" ON guest_groups
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = guest_groups.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Admins manage guests of owned weddings" ON guests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guest_groups
      JOIN weddings ON weddings.id = guest_groups.wedding_id
      WHERE guest_groups.id = guests.group_id AND weddings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage events of owned weddings" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = events.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Admins manage group_events of owned weddings" ON group_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guest_groups
      JOIN weddings ON weddings.id = guest_groups.wedding_id
      WHERE guest_groups.id = group_events.group_id AND weddings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage invitations of owned weddings" ON invitations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = invitations.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Admins manage rsvp_responses of owned weddings" ON rsvp_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invitations
      JOIN weddings ON weddings.id = invitations.wedding_id
      WHERE invitations.id = rsvp_responses.invitation_id AND weddings.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage content_blocks of owned weddings" ON content_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = content_blocks.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Public can view published wedding basic info by slug" ON weddings
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view public events" ON events
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view visible content blocks" ON content_blocks
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view approved guestbook entries" ON guestbook_entries
  FOR SELECT USING (status = 'approved');

-- SECURITY DEFINER RPC to resolve guest invitation anonymously via token hash
CREATE OR REPLACE FUNCTION resolve_invitation_by_hash(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation RECORD;
  v_wedding RECORD;
  v_group RECORD;
  v_guests JSONB;
  v_events JSONB;
  v_rsvps JSONB;
  v_blocks JSONB;
BEGIN
  -- 1. Find active invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token_hash = p_token_hash AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Esta invitación ya no está disponible');
  END IF;

  -- 2. Update opened timestamps
  UPDATE invitations
  SET opened_at = COALESCE(opened_at, NOW()),
      last_opened_at = NOW()
  WHERE id = v_invitation.id;

  -- 3. Fetch wedding
  SELECT id, slug, couple_name_1, couple_name_2, wedding_date, venue_name, venue_address, theme, rsvp_deadline, iban_details
  INTO v_wedding
  FROM weddings
  WHERE id = v_invitation.wedding_id;

  -- 4. Fetch group
  SELECT id, name, display_name, allow_plus_one, max_plus_ones
  INTO v_group
  FROM guest_groups
  WHERE id = v_invitation.group_id;

  -- 5. Fetch guests belonging to this group
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'is_child', is_child,
    'allow_plus_one', allow_plus_one,
    'dietary_restrictions', dietary_restrictions,
    'allergies', allergies
  )), '[]'::jsonb) INTO v_guests
  FROM guests
  WHERE group_id = v_group.id;

  -- 6. Fetch allowed events for this group
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'title', e.title,
    'description', e.description,
    'starts_at', e.starts_at,
    'ends_at', e.ends_at,
    'location_name', e.location_name,
    'location_address', e.location_address,
    'maps_url', e.maps_url,
    'dress_code', e.dress_code
  ) ORDER BY e.sort_order ASC), '[]'::jsonb) INTO v_events
  FROM events e
  JOIN group_events ge ON ge.event_id = e.id
  WHERE ge.group_id = v_group.id AND ge.is_visible = true;

  -- 7. Fetch existing RSVPs for this invitation
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'guest_id', guest_id,
    'status', status,
    'menu_choice', menu_choice,
    'allergies', allergies,
    'plus_one_attending', plus_one_attending,
    'plus_one_name', plus_one_name,
    'message', message
  )), '[]'::jsonb) INTO v_rsvps
  FROM rsvp_responses
  WHERE invitation_id = v_invitation.id;

  -- 8. Fetch public CMS blocks
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'block_type', block_type,
    'title', title,
    'subtitle', subtitle,
    'body', body,
    'config_json', config_json
  ) ORDER BY position ASC), '[]'::jsonb) INTO v_blocks
  FROM content_blocks
  WHERE wedding_id = v_wedding.id AND is_visible = true;

  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', v_invitation.id,
    'wedding', jsonb_build_object(
      'id', v_wedding.id,
      'couple_names', v_wedding.couple_name_1 || ' & ' || v_wedding.couple_name_2,
      'wedding_date', v_wedding.wedding_date,
      'location_summary', v_wedding.venue_name,
      'theme', v_wedding.theme,
      'rsvp_deadline', v_wedding.rsvp_deadline,
      'iban_details', v_wedding.iban_details
    ),
    'group', v_group,
    'guests', v_guests,
    'events', v_events,
    'existing_rsvps', v_rsvps,
    'blocks', v_blocks
  );
END;
$$;
