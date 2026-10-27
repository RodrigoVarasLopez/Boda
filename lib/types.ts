export type ThemeType = 'editorial' | 'mediterranean' | 'cinematic';
export type WeddingStatus = 'draft' | 'planning' | 'confirmed' | 'archived';

// ==========================================
// SAAS MULTI-TENANT ROLES & ORGANIZATIONS
// ==========================================

export type PlatformUserRole = 'super_admin' | 'wedding_planner' | 'basic_user';

export const USER_ROLE_LABELS: Record<PlatformUserRole, string> = {
  super_admin: 'Administrador Global (Super Admin)',
  wedding_planner: 'Wedding Planner (Agencia B2B)',
  basic_user: 'Usuario Básico / Pareja (B2C)',
};

export interface PlannerOrganization {
  id: string;
  name: string;
  slug: string;
  owner_user_id?: string | null;
  owner_email?: string | null;
  is_platform_default: boolean; // true for the Admin's own B2C portfolio
  plan_tier: 'b2c_default' | 'pro_planner' | 'enterprise';
  max_weddings: number;
  created_at?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  full_name: string;
  role: PlatformUserRole;
  planner_org_id: string;
  planner_org_name?: string;
  assigned_wedding_ids: string[];
  phone?: string;
  is_active: boolean;
  created_at?: string;
}

export interface SaveTheDateImages {
  hero_mobile: string;
  hero_desktop: string;
  story_1_portrait: string;
  story_1_wide: string;
  story_2_detail: string;
  story_2_portrait: string;
  story_3_portrait: string;
  story_3_candid: string;
  date_horizon: string;
  final_portrait: string;
  final_wide: string;
}

export interface SaveTheDateConfig {
  couple_names: string;
  wedding_date: string;
  wedding_date_display: string;
  wedding_location: string;
  whatsapp_message: string;
  audio_url?: string;
  images: SaveTheDateImages;
}

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
  status?: WeddingStatus;
  planner_org_id?: string;
  planner_name?: string;
  owner_user_id?: string | null;
  owner_email?: string | null;
  guest_target_count?: number;
  budget_target?: number;
  real_guest_count?: number;
  real_confirmed_count?: number;
  real_budget_contracted?: number;
  real_budget_paid?: number;
  iban_details?: {
    account_holder: string;
    iban: string;
    bank_name: string;
    bic_swift?: string;
  };
  save_the_date?: SaveTheDateConfig;
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
  email?: string;
  phone?: string;
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
  draft: 'Sin enviar',
  sent: 'Enviada',
  opened: 'Abierta',
  responded: 'Aceptada',
  revoked: 'Revocada',
};

export const RSVP_STATUS_LABELS: Record<RSVPStatus, string> = {
  attending: 'Asiste',
  declined: 'No asiste',
  pending: 'Sin marcar',
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

export type BanquetExpenseType = 'fixed' | 'per_guest' | 'per_adult';

export interface BanquetExpenseItem {
  id: string;
  concept: string;
  type: BanquetExpenseType;
  amount: number;
  quantity?: number;
  notes?: string | null;
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
  extra_expenses?: BanquetExpenseItem[];
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
  pending: 'Programado (Pendiente)',
  partial: 'Señal / Parcial abonado',
  paid: 'Pagado',
};


