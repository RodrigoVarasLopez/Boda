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
