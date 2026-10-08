-- ==============================================================================
-- BODA DE STEPHANIE & RODRIGO — SCRIPT CONSOLIDADO DE PRODUCCIÓN Y SEED
-- Proyecto Supabase: Boda | minutria pro (oskbafwqreeqxfwnwbzv)
-- Ejecutar en: https://supabase.com/dashboard/project/oskbafwqreeqxfwnwbzv/sql/new
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de perfiles de administradores
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de bodas
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  couple_name_1 TEXT NOT NULL,
  couple_name_2 TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  theme TEXT NOT NULL DEFAULT 'mediterranean',
  rsvp_deadline TIMESTAMPTZ,
  iban_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Grupos de invitados (familias, parejas, personas individuales)
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

-- 5. Invitados individuales
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  is_child BOOLEAN NOT NULL DEFAULT false,
  guest_type TEXT NOT NULL DEFAULT 'adult' CHECK (guest_type IN ('adult', 'child')),
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  allow_plus_one BOOLEAN NOT NULL DEFAULT false,
  dietary_restrictions TEXT,
  allergies TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Eventos de la agenda (Preboda, Ceremonia, Banquete, Fiesta)
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

-- 7. Matriz de visibilidad por grupo (Preboda privada vs Boda general)
CREATE TABLE IF NOT EXISTS group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, event_id)
);

-- 8. Invitaciones y tokens criptográficos SHA-256
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  group_id UUID NOT NULL UNIQUE REFERENCES guest_groups(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  token_preview TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Respuestas de confirmación RSVP
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('attending', 'declined')),
  menu_choice TEXT,
  allergies TEXT,
  dietary_notes TEXT,
  needs_transport BOOLEAN NOT NULL DEFAULT false,
  transport_origin TEXT,
  plus_one_attending BOOLEAN NOT NULL DEFAULT false,
  plus_one_name TEXT,
  plus_one_dietary TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(invitation_id, guest_id)
);

-- 10. Bloques de contenido CMS (Historia, Alojamiento, FAQ, Regalos)
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  config_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Fotografías multimedia (Memorias)
CREATE TABLE IF NOT EXISTS media_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  uploaded_by_guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  storage_path TEXT,
  original_filename TEXT DEFAULT 'photo.jpg',
  mime_type TEXT DEFAULT 'image/jpeg',
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  url TEXT NOT NULL,
  caption TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Dedicatorias del libro de visitas (Firmas)
CREATE TABLE IF NOT EXISTS guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Registro de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_role TEXT NOT NULL DEFAULT 'guest',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- BUCKET DE ALMACENAMIENTO: wedding-media
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-media',
  'wedding-media',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================================
-- POLÍTICAS DE ACCESO (ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura
DROP POLICY IF EXISTS "Public can view published weddings" ON weddings;
CREATE POLICY "Public can view published weddings" ON weddings FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view public events" ON events;
CREATE POLICY "Public can view public events" ON events FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Public can view visible content blocks" ON content_blocks;
CREATE POLICY "Public can view visible content blocks" ON content_blocks FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public can view approved media" ON media_photos;
CREATE POLICY "Public can view approved media" ON media_photos FOR SELECT USING (is_visible = true AND (status = 'approved' OR is_approved = true));

DROP POLICY IF EXISTS "Public can view approved guestbook" ON guestbook_entries;
CREATE POLICY "Public can view approved guestbook" ON guestbook_entries FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Public can submit guestbook" ON guestbook_entries;
CREATE POLICY "Public can submit guestbook" ON guestbook_entries FOR INSERT WITH CHECK (status = 'pending');

-- Políticas para Service Role y Authenticated (Dashboard & Admin)
DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins full access weddings" ON weddings;
CREATE POLICY "Admins full access weddings" ON weddings FOR ALL USING (owner_id = auth.uid() OR auth.role() = 'service_role');

-- Políticas de Storage
DROP POLICY IF EXISTS "Authenticated admins manage wedding-media" ON storage.objects;
CREATE POLICY "Authenticated admins manage wedding-media" ON storage.objects
  FOR ALL USING (bucket_id = 'wedding-media' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));

DROP POLICY IF EXISTS "Guests can upload to wedding-media" ON storage.objects;
CREATE POLICY "Guests can upload to wedding-media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wedding-media');

-- ==============================================================================
-- FUNCIÓN RPC: RESOLUCIÓN DE INVITACIÓN POR HASH
-- ==============================================================================
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
  -- 1. Buscar invitación activa
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token_hash = p_token_hash AND status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Esta invitación ya no está disponible');
  END IF;

  -- 2. Registrar apertura
  UPDATE invitations
  SET opened_at = COALESCE(opened_at, NOW()),
      last_opened_at = NOW()
  WHERE id = v_invitation.id;

  -- 3. Cargar datos de la boda
  SELECT id, slug, couple_name_1, couple_name_2, wedding_date, venue_name, venue_address, theme, rsvp_deadline, iban_details
  INTO v_wedding
  FROM weddings
  WHERE id = v_invitation.wedding_id;

  -- 4. Cargar grupo
  SELECT id, name, display_name, allow_plus_one, max_plus_ones
  INTO v_group
  FROM guest_groups
  WHERE id = v_invitation.group_id;

  -- 5. Cargar invitados del grupo
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'first_name', first_name,
    'last_name', last_name,
    'is_child', is_child,
    'allow_plus_one', allow_plus_one,
    'dietary_restrictions', dietary_restrictions,
    'allergies', allergies,
    'status', status
  )), '[]'::jsonb) INTO v_guests
  FROM guests
  WHERE group_id = v_group.id;

  -- 6. Cargar eventos asignados al grupo
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

  -- 7. Cargar RSVPs existentes
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

  -- 8. Cargar bloques CMS públicos
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

-- ==============================================================================
-- DATOS SEMILLA OFICIALES (SEED DATA) — STEPHANIE & RODRIGO
-- ==============================================================================

-- 1. Boda Oficial
INSERT INTO weddings (
  id, slug, couple_name_1, couple_name_2, wedding_date, venue_name, venue_address, status, theme, rsvp_deadline, iban_details
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'stephanie-y-rodrigo',
  'Stephanie',
  'Rodrigo',
  '2027-08-28 18:00:00+02',
  'Bodega Concejo',
  'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
  'published',
  'mediterranean',
  '2027-07-20 23:59:59+02',
  '{"account_holder": "Stephanie & Rodrigo", "iban": "ES91 2100 0418 4502 0005 1234", "bank_name": "CaixaBank", "bic_swift": "CAIXESBBXXX"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  venue_name = EXCLUDED.venue_name,
  venue_address = EXCLUDED.venue_address,
  wedding_date = EXCLUDED.wedding_date;

-- 2. Eventos Oficiales
INSERT INTO events (
  id, wedding_id, title, slug, description, starts_at, ends_at, location_name, location_address, maps_url, dress_code, is_public, sort_order
) VALUES 
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Preboda & Cata Privada de Vinos',
  'preboda-cata',
  'Una velada íntima de bienvenida en la bodega de Rodrigo. Paseo entre viñedos, visita guiada a la sala de barricas y cata de vinos con maridaje para nuestros amigos más cercanos.',
  '2027-08-27 19:30:00+02',
  '2027-08-27 23:30:00+02',
  'Bodega de Rodrigo',
  'Ctra. Valoria, 47200 Valoria La Buena (Valladolid)',
  'https://maps.google.com/?q=Valoria+La+Buena+Valladolid',
  'Casual Chic / Elegante desenfadado entre viñedos',
  false,
  1
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Ceremonia',
  'ceremonia',
  'El "sí, quiero" civil al aire libre rodeados de viñedos y arquitectura vinícola tradicional de Bodega Concejo.',
  '2027-08-28 18:00:00+02',
  '2027-08-28 19:00:00+02',
  'Bodega Concejo · Jardín de Viñedos',
  'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
  'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
  'Formal / Traje o chaqueta y vestido midi o largo',
  true,
  2
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'Banquete al Aire Libre con Música',
  'banquete-aire-libre',
  'Cóctel y cena al aire libre en la terraza de la bodega con vistas a los viñedos, música en directo y maridaje con los vinos de autor de la bodega.',
  '2027-08-28 19:30:00+02',
  '2027-08-28 23:30:00+02',
  'Bodega Concejo · Terraza Exterior & Viñedos',
  'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
  'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
  'Formal',
  true,
  3
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'Fiesta, DJ & Barra Libre',
  'fiesta-dj',
  'Sesión con DJ en directo, barra libre de cócteles y vinos de Bodega Concejo, recena y fiesta bajo las estrellas.',
  '2027-08-28 23:30:00+02',
  '2027-08-29 05:00:00+02',
  'Bodega Concejo · Pabellón Acristalado & Terraza',
  'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
  'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
  '¡Prepárate para bailar hasta el amanecer!',
  true,
  4
)
ON CONFLICT (id) DO NOTHING;

-- 3. Grupos de Invitados Iniciales
INSERT INTO guest_groups (id, wedding_id, name, display_name, allow_plus_one, max_plus_ones)
VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Familia García', 'Querida Familia García', false, 0),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Sofía Alarcón', 'Querida Sofi', true, 1),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Carlos Ruiz & Andrea', 'Carlos y Andrea', false, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. Invitados
INSERT INTO guests (id, group_id, first_name, last_name, is_primary_contact, allow_plus_one)
VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Carlos', 'García', true, false),
('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Carmen', 'Gómez', false, false),
('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Sofía', 'Alarcón', true, true),
('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Carlos', 'Ruiz', true, false),
('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Andrea', 'Ramos', false, false)
ON CONFLICT (id) DO NOTHING;

-- 5. Invitaciones con Hash SHA-256
-- token-garcia-772 -> sha256: b96184cabf763468bd88e54b19834ce53ec22bfb7720414339ac246324998114
-- token-sofia-914  -> sha256: 7ef9b6f9e3bffbca4437160c2d777dd858dfa5c08abd92d65d8988ecd9f7f41c
-- token-carlos-115 -> sha256: 91b27a3e08e061aa33912287f75417c1941ac41fbaad685397035711d0af9e9c
INSERT INTO invitations (id, wedding_id, group_id, token_hash, token_preview, status)
VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b96184cabf763468bd88e54b19834ce53ec22bfb7720414339ac246324998114', 'garcia-772', 'active'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', '7ef9b6f9e3bffbca4437160c2d777dd858dfa5c08abd92d65d8988ecd9f7f41c', 'sofia-914', 'active'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '91b27a3e08e061aa33912287f75417c1941ac41fbaad685397035711d0af9e9c', 'carlos-115', 'active')
ON CONFLICT (id) DO NOTHING;

-- 6. Asignación de eventos a grupos
-- Sofía y Carlos & Andrea tienen la Preboda del viernes
INSERT INTO group_events (group_id, event_id, is_visible)
VALUES
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', true),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', true),
-- Todos tienen los eventos del sábado
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', true),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', true),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', true),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', true),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', true),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', true),
('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', true)
ON CONFLICT (group_id, event_id) DO NOTHING;

-- 7. Dedicatorias aprobadas iniciales del Libro de Visitas
INSERT INTO guestbook_entries (wedding_id, author_name, message, status, is_approved)
VALUES
('a0000000-0000-0000-0000-000000000001', 'Familia Pérez', 'Muchísimas felicidades parejaza. Allá estaremos para celebrar vuestro amor con todo el cariño y disfrutar de la cata en Valoria.', 'approved', true),
('a0000000-0000-0000-0000-000000000001', 'Carlos y Carmen', 'Qué ganas de acompañaros en un sitio tan especial. ¡Que este amor siga creciendo cada año como el mejor reserva de la bodega!', 'approved', true),
('a0000000-0000-0000-0000-000000000001', 'Elena Torres', 'Queridos Stephanie y Rodrigo, os deseo toda la felicidad del mundo. Será un honor vivir ese fin de semana junto a vosotros.', 'approved', true),
('a0000000-0000-0000-0000-000000000001', 'Alberto Gómez Peláez', '¡A preparar los zapatos de baile y las copas! No faltaremos por nada del mundo. ¡Vivan los novios!', 'approved', true),
('a0000000-0000-0000-0000-000000000001', 'Lucía Navarro', 'Un abrazo gigantesco a los dos. Se os ve tan felices y enamorados... gracias de corazón por hacernos partícipes.', 'approved', true),
('a0000000-0000-0000-0000-000000000001', 'David y Laura', 'Contando los días para ese 25 de agosto en Valoria la Buena. ¡Va a ser histórico!', 'approved', true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- MÓDULO DE PRESUPUESTO & PROVEEDORES (FASE 20)
-- ==============================================================================

-- 14. Categorías de presupuesto
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget_type TEXT NOT NULL DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'per_guest', 'mixed')),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Proveedores por categoría
CREATE TABLE IF NOT EXISTS budget_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  estimated_price NUMERIC(12,2),
  quoted_price NUMERIC(12,2),
  final_price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'finalist', 'selected', 'discarded')),
  comments TEXT,
  notes TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice único parcial: máximo un proveedor seleccionado por categoría
CREATE UNIQUE INDEX IF NOT EXISTS unique_selected_supplier_per_category
  ON budget_suppliers (category_id)
  WHERE is_selected = true;

-- 16. Pagos a proveedores
CREATE TABLE IF NOT EXISTS budget_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES budget_suppliers(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Configuración del menú de la boda
CREATE TABLE IF NOT EXISTS budget_menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES budget_suppliers(id) ON DELETE SET NULL,
  adult_price NUMERIC(12,2) NOT NULL DEFAULT 145.00 CHECK (adult_price >= 0),
  child_price NUMERIC(12,2) NOT NULL DEFAULT 75.00 CHECK (child_price >= 0),
  adult_count_override INTEGER CHECK (adult_count_override >= 0),
  child_count_override INTEGER CHECK (child_count_override >= 0),
  use_manual_counts BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS en tablas de presupuesto
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_menu_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage budget_categories" ON budget_categories;
CREATE POLICY "Admins manage budget_categories" ON budget_categories
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_categories.wedding_id AND weddings.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage budget_suppliers" ON budget_suppliers;
CREATE POLICY "Admins manage budget_suppliers" ON budget_suppliers
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_suppliers.wedding_id AND weddings.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage budget_payments" ON budget_payments;
CREATE POLICY "Admins manage budget_payments" ON budget_payments
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_payments.wedding_id AND weddings.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage budget_menu_config" ON budget_menu_config;
CREATE POLICY "Admins manage budget_menu_config" ON budget_menu_config
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_menu_config.wedding_id AND weddings.owner_id = auth.uid()));

-- Categorías iniciales oficiales para Stephanie & Rodrigo
INSERT INTO budget_categories (wedding_id, name, budget_type, icon, sort_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Flores Iglesia', 'fixed', 'Flower2', 1),
  ('a0000000-0000-0000-0000-000000000001', 'Decoración Concejo', 'fixed', 'Sparkles', 2),
  ('a0000000-0000-0000-0000-000000000001', 'DJ', 'fixed', 'Music', 3),
  ('a0000000-0000-0000-0000-000000000001', 'Estación DJ', 'fixed', 'Headphones', 4),
  ('a0000000-0000-0000-0000-000000000001', 'Vestido Novia', 'fixed', 'Crown', 5),
  ('a0000000-0000-0000-0000-000000000001', 'Vestido Novio', 'fixed', 'Shirt', 6),
  ('a0000000-0000-0000-0000-000000000001', 'Pirotecnia', 'fixed', 'Flame', 7),
  ('a0000000-0000-0000-0000-000000000001', 'Fotógrafo', 'fixed', 'Camera', 8),
  ('a0000000-0000-0000-0000-000000000001', 'Grupo de música 1', 'fixed', 'Guitar', 9),
  ('a0000000-0000-0000-0000-000000000001', 'Grupo de música 2', 'fixed', 'Mic2', 10),
  ('a0000000-0000-0000-0000-000000000001', 'Preboda', 'mixed', 'Wine', 11),
  ('a0000000-0000-0000-0000-000000000001', 'Menú', 'per_guest', 'UtensilsCrossed', 12)
ON CONFLICT DO NOTHING;

-- Configuración de menú predeterminada
INSERT INTO budget_menu_config (wedding_id, adult_price, child_price, use_manual_counts)
VALUES ('a0000000-0000-0000-0000-000000000001', 145.00, 75.00, false)
ON CONFLICT (wedding_id) DO NOTHING;

