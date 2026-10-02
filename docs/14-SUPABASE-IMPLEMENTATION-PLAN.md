# Supabase & Production Data Integration Plan: Boda Web

## 1. Audit of Existing Application State

### 1.1 Current Mock Data Sources (`lib/mock-data.ts`)
- `INITIAL_WEDDING`: Couple details ("Laura & Rodrigo"), slug (`laura-y-rodrigo`), wedding date, theme (`editorial`), location summary, and IBAN gift registry details.
- `INITIAL_EVENTS`: 5 events (Cena de Bienvenida, Ceremonia, Cóctel & Banquete, Fiesta & Barra Libre, Brunch de Recarga) with visibility flags (`everyone` vs `selected_groups`).
- `INITIAL_GROUPS`: 5 guest groups ("Familia García Mateo", "Sofía Martín", "Javier & Alejandro", "Familia Gómez Peláez", "Elena Torres") with opaque tokens (`token-garcia-772`, `token-sofia-409`, etc.) and assigned event IDs.
- `INITIAL_RSVPS`: Pre-filled responses for Sofía Martín and Familia Gómez.
- `INITIAL_CMS_BLOCKS`: 6 modular content blocks (Hero, Story, Venue, Travel, Registry, FAQ).
- `INITIAL_GUESTBOOK`: Initial guestbook wishes.
- `INITIAL_MEDIA`: Photos for gallery.

### 1.2 Existing Domain Types (`lib/types.ts`)
- `Wedding`: Wedding settings, couple names, theme tokens, privacy mode, IBAN.
- `GuestGroup`: Group entity, token, status (`draft`, `sent`, `opened`, `responded`, `revoked`), custom message, list of `Guest`, allowed event IDs.
- `Guest`: Individual guest record, plus-one allowance, dietary restrictions, allergies, notes.
- `Event`: Event details, time boundaries, location, dress code, visibility, display order.
- `GuestRSVPResponse` & `GroupRSVPSubmission`: Detailed RSVP payload per guest and per group.
- `CMSBlock`: Dynamic block config JSON and display state.
- `GuestBookEntry` & `MediaPhoto`: Community interactions and uploads.

### 1.3 Existing Route Structure
- `/`: Landing page / interactive demo selector.
- `/w/[slug]`: Generic public wedding website.
- `/i/[token]`: Personalized guest invitation & concierge (opaque token resolver).
- `/admin`: Admin Overview Dashboard SaaS KPIs.
- `/admin/guests`: Guest CRM table & invitation drawer (`GuestDrawer`).
- `/admin/rsvp`: RSVP breakdown, special diets matrix & CSV export.
- `/admin/events`: Event manager & group access matrix ("Tu boda").
- `/admin/cms`: Block-based CMS editor.
- `/admin/media`: Guestbook moderation & photo gallery.
- `/admin/settings`: Design theme selector & privacy settings.

### 1.4 Current Mutations & In-Memory Logic
- RSVP submission in `ProgressiveRSVP.tsx`: Local state mutation & confetti trigger.
- Guest search, filter, and link generation in `app/admin/guests/page.tsx`.
- Event group toggle in `app/admin/events/page.tsx`.
- CMS block active/reorder toggle in `app/admin/cms/page.tsx`.
- Guestbook post in `MemoriesSection.tsx`.

### 1.5 Environment Variables (`.env.example`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # SERVER-ONLY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1.6 Security Audit & Identified Risks
- **Raw Token Storage**: Currently tokens are stored in plain text (`token-garcia-772`). **Fix**: Database will store `SHA-256(token)` in `token_hash`. Raw token is only present in URL query/param.
- **Anonymous Database Exposure**: Public anonymous users must NOT query `guests`, `invitations`, or `profiles` directly via Supabase client. **Fix**: Use a `SECURITY DEFINER` RPC / Server Action (`resolve_invitation_by_token`) that accepts `token_hash`, validates state, and returns a sanitized DTO.
- **Service Role Protection**: `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to browser bundles (`lib/supabase/admin.ts` enforced server-only).

---

## 2. Explicit Feature Audit: MOCK → DATABASE Mapping

1. **Wedding Metadata & Settings**:
   - `MOCK`: `INITIAL_WEDDING` in `lib/mock-data.ts`
   - `DATABASE`: `weddings` table queried by `slug` or `owner_id`.
2. **Guest Groups & Invitations**:
   - `MOCK`: `INITIAL_GROUPS` in `lib/mock-data.ts`
   - `DATABASE`: `guest_groups` + `invitations` tables joined with `token_hash = sha256(raw_token)`.
3. **Individual Guests**:
   - `MOCK`: `grp.guests` array in `lib/mock-data.ts`
   - `DATABASE`: `guests` table linked via `group_id`.
4. **Events & "Tu Boda" Schedule Matrix**:
   - `MOCK`: `INITIAL_EVENTS` + `grp.allowed_event_ids` in `lib/mock-data.ts`
   - `DATABASE`: `events` + `group_events` visibility junction table.
5. **RSVP Confirmations & Diets**:
   - `MOCK`: `INITIAL_RSVPS` in `lib/mock-data.ts`
   - `DATABASE`: `rsvp_responses` table with unique constraint on `(invitation_id, guest_id)`.
6. **CMS Blocks**:
   - `MOCK`: `INITIAL_CMS_BLOCKS` in `lib/mock-data.ts`
   - `DATABASE`: `content_blocks` table with `block_type`, `position`, `is_visible`, `config_json`.
7. **Guestbook & Media**:
   - `MOCK`: `INITIAL_GUESTBOOK` & `INITIAL_MEDIA` in `lib/mock-data.ts`
   - `DATABASE`: `guestbook_entries` (with moderation status `pending`|`approved`) & `media_photos` + Supabase Storage buckets.
8. **Admin Auth**:
   - `MOCK`: Open `/admin/*` routes
   - `DATABASE`: Supabase Auth (`auth.users` -> `profiles` table) with server-side middleware redirecting to `/admin/login`.

---

## 3. Database Schema Specification & RLS Strategy

```sql
-- 1. Profiles (Maps Auth Users -> Admin/Owner Roles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Weddings
CREATE TABLE weddings (
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
CREATE TABLE guest_groups (
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

-- 4. Guests
CREATE TABLE guests (
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

-- 5. Events
CREATE TABLE events (
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
CREATE TABLE group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES guest_groups(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, event_id)
);

-- 7. Invitations
CREATE TABLE invitations (
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

-- 8. RSVP Responses
CREATE TABLE rsvp_responses (
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
CREATE TABLE content_blocks (
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
CREATE TABLE guestbook_entries (
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
CREATE TABLE media_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Implementation Phasing & Next Steps

1. **Phase 1**: Audit & Plan (Completed in this document).
2. **Phase 2**: Supabase client setup (`lib/supabase/client.ts`, `server.ts`, `admin.ts`), SQL migrations, and Seed data.
3. **Phase 3**: Admin Auth (`/admin/login`, middleware protection, server session check).
4. **Phase 4**: Secure Token Resolution Server Action (`getInvitationByToken(rawToken)`) returning sanitized DTO for Guest Experience.
5. **Phase 5**: Connect Progressive RSVP submission to `rsvp_responses` table with server-side validation.
6. **Phase 6**: Connect Event Visibility matrix (`group_events`).
7. **Phase 7**: Connect Admin CRM (Guests table, Drawer actions, CSV Import).
8. **Phase 8**: Connect CMS content blocks and Media/Guestbook tables.
9. **Phase 9**: Final verification (`typecheck`, `eslint`, `build`, browser end-to-end flows).
