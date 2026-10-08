import { z } from 'zod';

export const DietaryOptionEnum = z.enum([
  'standard',
  'vegetarian',
  'vegan',
  'celiac',
  'child',
  'other',
]);

export const RSVPStatusEnum = z.enum(['attending', 'declined']);

export const SingleGuestRSVPSchema = z.object({
  guest_id: z.string().uuid().or(z.string().min(1)),
  status: RSVPStatusEnum,
  dietary_choice: DietaryOptionEnum.default('standard'),
  allergies: z.string().optional().nullable(),
  plus_one_attending: z.boolean().optional().default(false),
  plus_one_name: z.string().optional().nullable(),
  plus_one_dietary: DietaryOptionEnum.optional().default('standard'),
  message: z.string().optional().nullable(),
});

export const GroupRSVPSubmitSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  responses: z.array(SingleGuestRSVPSchema).min(1, 'At least one response is required'),
});

export const GuestCreateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  is_child: z.boolean().default(false),
  is_plus_one_allowed: z.boolean().default(false),
  dietary_restrictions: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export const GuestGroupCreateSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  custom_message: z.string().optional(),
  allowed_event_ids: z.array(z.string()),
  guests: z.array(GuestCreateSchema).min(1, 'At least one guest is required'),
});

export const CSVGuestRowSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  group_name: z.string().min(1),
  is_child: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  allow_plus_one: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
  notes: z.string().optional().default(''),
});

export const MediaUploadValidationSchema = z.object({
  caption: z.string().max(180, 'El pie de foto no puede exceder 180 caracteres').optional().nullable(),
  uploader_name: z.string().max(80).optional().default('Invitado'),
  wedding_id: z.string().default('w-stephanie-rodrigo-2027'),
  is_admin: z.boolean().optional().default(false),
});

export const GuestbookSubmitSchema = z.object({
  wedding_id: z.string().default('w-stephanie-rodrigo-2027'),
  guest_name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  message: z
    .string()
    .trim()
    .min(2, 'El mensaje debe tener al menos 2 caracteres')
    .max(500, 'El mensaje no puede superar los 500 caracteres'),
  invitation_id: z.string().optional().nullable(),
});

export const MediaModerateActionSchema = z.object({
  photo_id: z.string().min(1, 'ID de foto obligatorio'),
  action: z.enum(['approve', 'hide', 'delete']),
});

export const BulkMediaModerateSchema = z.object({
  photo_ids: z.array(z.string().min(1)).min(1, 'Selecciona al menos una foto'),
  action: z.enum(['approve', 'hide', 'delete']),
});

// ==========================================
// BUDGET MODULE SCHEMAS (PHASE 20)
// ==========================================

export const BudgetCategoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'El nombre de la categoría es obligatorio').max(100),
  description: z.string().trim().max(300).optional().nullable(),
  budget_type: z.enum(['fixed', 'per_guest', 'mixed']).default('fixed'),
  icon: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const BudgetCategoryUpdateSchema = z.object({
  id: z.string().min(1, 'ID de categoría obligatorio'),
  name: z.string().trim().min(1, 'El nombre de la categoría es obligatorio').max(100).optional(),
  description: z.string().trim().max(300).optional().nullable(),
  budget_type: z.enum(['fixed', 'per_guest', 'mixed']).optional(),
  icon: z.string().optional().nullable(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export const BudgetSupplierCreateSchema = z.object({
  category_id: z.string().min(1, 'ID de categoría obligatorio'),
  name: z.string().trim().min(1, 'El nombre del proveedor es obligatorio').max(150),
  contact_name: z.string().trim().max(100).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().trim().max(40).optional().nullable(),
  website: z.string().trim().optional().nullable(),
  instagram: z.string().trim().max(100).optional().nullable(),
  estimated_price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional().nullable(),
  quoted_price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional().nullable(),
  final_price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional().nullable(),
  currency: z.string().default('EUR'),
  rating: z.coerce.number().int().min(1, 'El rating mínimo es 1').max(10, 'El rating máximo es 10').optional().nullable(),
  status: z.enum(['pending', 'contacted', 'quoted', 'finalist', 'selected', 'discarded']).default('pending'),
  comments: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  is_selected: z.boolean().default(false),
});

export const BudgetSupplierUpdateSchema = z.object({
  id: z.string().min(1, 'ID de proveedor obligatorio'),
  category_id: z.string().optional(),
  name: z.string().trim().min(1, 'El nombre del proveedor es obligatorio').max(150).optional(),
  contact_name: z.string().trim().max(100).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable().or(z.literal('')),
  phone: z.string().trim().max(40).optional().nullable(),
  website: z.string().trim().optional().nullable(),
  instagram: z.string().trim().max(100).optional().nullable(),
  estimated_price: z.coerce.number().min(0).optional().nullable(),
  quoted_price: z.coerce.number().min(0).optional().nullable(),
  final_price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(10).optional().nullable(),
  status: z.enum(['pending', 'contacted', 'quoted', 'finalist', 'selected', 'discarded']).optional(),
  comments: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  is_selected: z.boolean().optional(),
});

export const BudgetSupplierSelectSchema = z.object({
  supplier_id: z.string().min(1, 'ID de proveedor obligatorio'),
  category_id: z.string().min(1, 'ID de categoría obligatorio'),
});

export const BudgetPaymentCreateSchema = z.object({
  supplier_id: z.string().min(1, 'ID de proveedor obligatorio'),
  amount: z.coerce.number().min(0.01, 'El importe debe ser mayor que 0'),
  due_date: z.string().optional().nullable(),
  paid_at: z.string().optional().nullable(),
  status: z.enum(['pending', 'partial', 'paid']).default('pending'),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const BudgetPaymentUpdateSchema = z.object({
  id: z.string().min(1, 'ID de pago obligatorio'),
  amount: z.coerce.number().min(0.01, 'El importe debe ser mayor que 0').optional(),
  due_date: z.string().optional().nullable(),
  paid_at: z.string().optional().nullable(),
  status: z.enum(['pending', 'partial', 'paid']).optional(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const BudgetMenuConfigUpdateSchema = z.object({
  adult_price: z.coerce.number().min(0, 'El precio de adulto no puede ser negativo'),
  child_price: z.coerce.number().min(0, 'El precio de niño no puede ser negativo'),
  adult_count_override: z.coerce.number().int().min(0).optional().nullable(),
  child_count_override: z.coerce.number().int().min(0).optional().nullable(),
  use_manual_counts: z.boolean().default(false),
  supplier_id: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const GuestTypeUpdateSchema = z.object({
  guest_id: z.string().min(1, 'ID de invitado obligatorio'),
  guest_type: z.enum(['adult', 'child']),
});

