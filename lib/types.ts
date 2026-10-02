export type ThemeType = 'editorial' | 'mediterranean' | 'cinematic';

export interface Wedding {
  id: string;
  slug: string;
  couple_names: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  location_summary: string;
  theme: ThemeType;
  privacy_mode: boolean;
  rsvp_deadline: string;
  hero_message: string;
  welcome_quote: string;
  iban_details?: {
    account_holder: string;
    iban: string;
    bank_name: string;
    bic_swift?: string;
  };
}

export type InvitationStatus = 'draft' | 'sent' | 'opened' | 'responded' | 'revoked';

export interface GuestGroup {
  id: string;
  wedding_id: string;
  name: string;
  token: string;
  invitation_status: InvitationStatus;
  opened_at?: string;
  responded_at?: string;
  custom_message?: string;
  guests: Guest[];
  allowed_event_ids: string[];
}

export interface Guest {
  id: string;
  wedding_id: string;
  group_id: string;
  first_name: string;
  last_name: string;
  is_plus_one_allowed: boolean;
  dietary_restrictions?: string;
  allergies?: string;
  notes?: string;
}

export interface Event {
  id: string;
  wedding_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address: string;
  google_maps_url: string;
  dress_code?: string;
  visibility: 'everyone' | 'selected_groups';
  display_order: number;
}

export type RSVPStatus = 'attending' | 'declined' | 'pending';
export type DietaryOption = 'standard' | 'vegetarian' | 'vegan' | 'celiac' | 'child' | 'other';

export interface GuestRSVPResponse {
  guest_id: string;
  guest_name: string;
  status: RSVPStatus;
  attending_event_ids: string[];
  dietary_choice: DietaryOption;
  allergies?: string;
  plus_one_attending?: boolean;
  plus_one_name?: string;
  plus_one_dietary?: DietaryOption;
  plus_one_allergies?: string;
  message?: string;
}

export interface GroupRSVPSubmission {
  group_id: string;
  token: string;
  responses: GuestRSVPResponse[];
  submitted_at: string;
}

export interface CMSBlock {
  id: string;
  wedding_id: string;
  type: 'hero' | 'intro' | 'story' | 'timeline' | 'venue' | 'travel' | 'faq' | 'registry' | 'contact';
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  display_order: number;
  is_active: boolean;
  visibility: 'everyone' | 'selected_groups';
}

export interface GuestBookEntry {
  id: string;
  wedding_id: string;
  guest_name: string;
  message: string;
  status?: 'pending' | 'approved' | 'hidden';
  created_at: string;
}

export interface MediaPhoto {
  id: string;
  wedding_id: string;
  uploader_name: string;
  photo_url: string;
  caption?: string;
  created_at: string;
}

export const INVITATION_STATUS_LABELS: Record<InvitationStatus | 'all', string> = {
  all: 'Todos',
  draft: 'Borrador',
  sent: 'Enviada',
  opened: 'Abierta',
  responded: 'Respondida',
  revoked: 'Revocada',
};

export const RSVP_STATUS_LABELS: Record<RSVPStatus, string> = {
  attending: 'Asiste',
  declined: 'No asiste',
  pending: 'Pendiente',
};
