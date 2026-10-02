# Data Model Contract - Boda Web

## Database Schema (Supabase / PostgreSQL)

### 1. `weddings`
- `id` (UUID, Primary Key)
- `slug` (TEXT, Unique, indexed)
- `couple_names` (TEXT) e.g., "Laura & Rodrigo"
- `wedding_date` (TIMESTAMPTZ)
- `location_summary` (TEXT)
- `theme` (TEXT, default: 'editorial') -- 'editorial' | 'mediterranean' | 'cinematic'
- `privacy_mode` (BOOLEAN, default: false)
- `rsvp_deadline` (TIMESTAMPTZ)
- `hero_message` (TEXT)
- `welcome_quote` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `guest_groups`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `name` (TEXT) -- e.g., "Familia García", "Rodrigo & Laura"
- `token` (TEXT, Unique, indexed) -- opaque random token (e.g. 128-bit nanoid / sha256 hash)
- `invitation_status` (TEXT) -- 'draft' | 'sent' | 'opened' | 'responded' | 'revoked'
- `opened_at` (TIMESTAMPTZ, nullable)
- `responded_at` (TIMESTAMPTZ, nullable)
- `custom_message` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 3. `guests`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `group_id` (UUID, FK -> guest_groups.id)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `is_plus_one_allowed` (BOOLEAN, default: false)
- `dietary_restrictions` (TEXT, nullable)
- `allergies` (TEXT, nullable)
- `notes` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 4. `events`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `title` (TEXT) -- e.g., "Ceremonia", "Cóctel", "Brunch"
- `description` (TEXT)
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ, nullable)
- `location_name` (TEXT)
- `address` (TEXT)
- `google_maps_url` (TEXT)
- `dress_code` (TEXT)
- `visibility` (TEXT) -- 'everyone' | 'selected_groups'
- `display_order` (INTEGER, default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 5. `event_group_access`
- `id` (UUID, Primary Key)
- `event_id` (UUID, FK -> events.id)
- `group_id` (UUID, FK -> guest_groups.id)

### 6. `rsvps`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `group_id` (UUID, FK -> guest_groups.id)
- `guest_id` (UUID, FK -> guests.id)
- `status` (TEXT) -- 'attending' | 'declined' | 'pending'
- `attending_event_ids` (JSONB / UUID[]) -- array of event_ids
- `dietary_choice` (TEXT, nullable) -- 'standard' | 'vegetarian' | 'vegan' | 'celiac' | 'child' | 'other'
- `allergies` (TEXT, nullable)
- `plus_one_attending` (BOOLEAN, nullable)
- `plus_one_name` (TEXT, nullable)
- `plus_one_dietary` (TEXT, nullable)
- `message` (TEXT, nullable)
- `updated_at` (TIMESTAMPTZ)

### 7. `cms_blocks`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `type` (TEXT) -- 'hero' | 'intro' | 'story' | 'timeline' | 'venue' | 'travel' | 'faq' | 'registry' | 'contact'
- `title` (TEXT)
- `subtitle` (TEXT, nullable)
- `content` (JSONB)
- `display_order` (INTEGER)
- `is_active` (BOOLEAN, default: true)
- `visibility` (TEXT, default: 'everyone') -- 'everyone' | 'selected_groups'

### 8. `guest_book_entries`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `guest_name` (TEXT)
- `message` (TEXT)
- `created_at` (TIMESTAMPTZ)

### 9. `media_photos`
- `id` (UUID, Primary Key)
- `wedding_id` (UUID, FK -> weddings.id)
- `uploader_name` (TEXT)
- `photo_url` (TEXT)
- `caption` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
