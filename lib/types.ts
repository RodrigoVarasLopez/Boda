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
  guest_type?: 'adult' | 'child';
  is_child?: boolean;
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
  day?: 'friday' | 'saturday';
  day_label?: string;
  image_url?: string;
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

export type GuestBookEntryStatus = 'pending' | 'approved' | 'hidden';

export interface GuestBookEntry {
  id: string;
  wedding_id: string;
  invitation_id?: string | null;
  guest_name: string;
  message: string;
  photo_path?: string | null;
  status: GuestBookEntryStatus;
  created_at: string;
  approved_at?: string | null;
}

export type MediaPhotoStatus = 'pending' | 'approved' | 'hidden';

export interface MediaPhoto {
  id: string;
  wedding_id: string;
  uploaded_by_guest_id?: string | null;
  uploader_name?: string;
  storage_path: string;
  photo_url: string;
  original_filename: string;
  mime_type: string;
  file_size?: number;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  is_visible: boolean;
  is_approved: boolean;
  status: MediaPhotoStatus;
  created_at: string;
  updated_at?: string;
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

// ==========================================
// BUDGET & SUPPLIER MODULE TYPES (PHASE 20)
// ==========================================

export type GuestType = 'adult' | 'child';

export type BudgetType = 'fixed' | 'per_guest' | 'mixed';

export type SupplierStatus =
  | 'pending'
  | 'contacted'
  | 'quoted'
  | 'finalist'
  | 'selected'
  | 'discarded';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface BudgetCategory {
  id: string;
  wedding_id: string;
  name: string;
  description?: string | null;
  budget_type: BudgetType;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSupplier {
  id: string;
  category_id: string;
  wedding_id: string;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  estimated_price?: number | null;
  quoted_price?: number | null;
  final_price?: number | null;
  currency: string;
  rating?: number | null; // 1 to 10
  status: SupplierStatus;
  comments?: string | null;
  notes?: string | null;
  is_selected: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetPayment {
  id: string;
  supplier_id: string;
  wedding_id: string;
  amount: number;
  due_date?: string | null;
  paid_at?: string | null;
  status: PaymentStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetMenuConfig {
  id: string;
  wedding_id: string;
  supplier_id?: string | null;
  adult_price: number;
  child_price: number;
  adult_count_override?: number | null;
  child_count_override?: number | null;
  use_manual_counts: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  quoted: 'Presupuesto recibido',
  finalist: 'Finalista',
  selected: 'Seleccionado',
  discarded: 'Descartado',
};

export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  fixed: 'Fijo',
  per_guest: 'Por invitado',
  mixed: 'Mixto',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Pagado',
};

