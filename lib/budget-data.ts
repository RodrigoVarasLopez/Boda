import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BudgetMenuConfig,
  BanquetExpenseItem,
  BudgetType,
  SupplierStatus,
  PaymentStatus,
} from './types';

export const STORAGE_KEY_BUDGET_CATEGORIES = 'boda_budget_categories_v3';
export const STORAGE_KEY_BUDGET_SUPPLIERS = 'boda_budget_suppliers_v3';
export const STORAGE_KEY_BUDGET_PAYMENTS = 'boda_budget_payments_v3';
export const STORAGE_KEY_BUDGET_MENU = 'boda_budget_menu_v3';
export const BUDGET_UPDATE_EVENT = 'boda_budget_updated';

export const WEDDING_UUID = 'a0000000-0000-0000-0000-000000000001';
export const WEDDING_ID = WEDDING_UUID;

export const BANQUET_CATEGORY_ID = 'c0000000-0000-0000-0000-000000000012';
export const BANQUET_SUPPLIER_ID = 'd0000000-0000-0000-0000-000000000015';
export const LEGACY_BANQUET_SUPPLIER_ID = 's0000000-0000-0000-0000-000000000015';

export const DEFAULT_BANQUET_SUPPLIER: BudgetSupplier = {
  id: BANQUET_SUPPLIER_ID,
  category_id: BANQUET_CATEGORY_ID,
  wedding_id: WEDDING_UUID,
  name: 'Bodega Concejo · Banquete',
  contact_name: 'Dirección de Eventos Concejo',
  email: 'eventos@concejobodegas.com',
  phone: '+34 983 38 50 09',
  website: 'https://www.concejobodegas.com',
  instagram: '@concejobodegas',
  estimated_price: null,
  quoted_price: null,
  final_price: null,
  currency: 'EUR',
  rating: 5,
  status: 'selected',
  comments: 'Banquete nupcial y gastos asociados',
  notes: null,
  is_selected: true,
};

// Legacy category ID translation map
export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'cat-flores-iglesia': 'c0000000-0000-0000-0000-000000000001',
  'cat-decoracion-concejo': 'c0000000-0000-0000-0000-000000000002',
  'cat-dj': 'c0000000-0000-0000-0000-000000000003',
  'cat-estacion-dj': 'c0000000-0000-0000-0000-000000000004',
  'cat-vestido-novia': 'c0000000-0000-0000-0000-000000000005',
  'cat-vestido-novio': 'c0000000-0000-0000-0000-000000000006',
  'cat-pirotecnia': 'c0000000-0000-0000-0000-000000000007',
  'cat-fotografo': 'c0000000-0000-0000-0000-000000000008',
  'cat-musica-1': 'c0000000-0000-0000-0000-000000000009',
  'cat-musica-2': 'c0000000-0000-0000-0000-000000000010',
  'cat-preboda': 'c0000000-0000-0000-0000-000000000011',
  'cat-menu': 'c0000000-0000-0000-0000-000000000012',
};

export function normalizeCategoryId(id: string): string {
  if (LEGACY_CATEGORY_MAP[id]) return LEGACY_CATEGORY_MAP[id];
  return id;
}

// 1. Initial 12 Official Categories for Stephanie & Rodrigo with UUIDs
export const INITIAL_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    wedding_id: WEDDING_UUID,
    name: 'Flores Iglesia',
    description: 'Arreglos florales para el altar, bancos y entrada del templo/jardín',
    budget_type: 'fixed',
    icon: 'Flower2',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    wedding_id: WEDDING_UUID,
    name: 'Decoración Concejo',
    description: 'Iluminación, mobiliario, vajilla especial y rincones temáticos en la bodega',
    budget_type: 'fixed',
    icon: 'Sparkles',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    wedding_id: WEDDING_UUID,
    name: 'DJ',
    description: 'DJ principal para la fiesta, barra libre y sonido durante el cóctel',
    budget_type: 'fixed',
    icon: 'Music',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    wedding_id: WEDDING_UUID,
    name: 'Estación DJ',
    description: 'Cabina, iluminación láser, máquina de humo y altavoces adicionales',
    budget_type: 'fixed',
    icon: 'Headphones',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    wedding_id: WEDDING_UUID,
    name: 'Vestido Novia',
    description: 'Vestido de novia, velo, arreglos de modistería y complementos',
    budget_type: 'fixed',
    icon: 'Crown',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    wedding_id: WEDDING_UUID,
    name: 'Vestido Novio',
    description: 'Traje a medida, chaleco, corbata y gemelos para Rodrigo',
    budget_type: 'fixed',
    icon: 'Shirt',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    wedding_id: WEDDING_UUID,
    name: 'Pirotecnia',
    description: 'Fuegos fríos en el corte de tarta / primer baile y castillo nocturno',
    budget_type: 'fixed',
    icon: 'Flame',
    sort_order: 7,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    wedding_id: WEDDING_UUID,
    name: 'Fotógrafo',
    description: 'Reportaje completo de preparativos, ceremonia, banquete y fiesta',
    budget_type: 'fixed',
    icon: 'Camera',
    sort_order: 8,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    wedding_id: WEDDING_UUID,
    name: 'Grupo de música 1',
    description: 'Música en directo para la ceremonia (cuerda o acústico)',
    budget_type: 'fixed',
    icon: 'Guitar',
    sort_order: 9,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000010',
    wedding_id: WEDDING_UUID,
    name: 'Grupo de música 2',
    description: 'Banda en directo durante el cóctel al atardecer en los viñedos',
    budget_type: 'fixed',
    icon: 'Mic2',
    sort_order: 10,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000011',
    wedding_id: WEDDING_UUID,
    name: 'Preboda',
    description: 'Cata privada de vinos Burro Loco, aperitivos y visitas en la bodega el viernes',
    budget_type: 'mixed',
    icon: 'Wine',
    sort_order: 11,
    is_active: true,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000012',
    wedding_id: WEDDING_UUID,
    name: 'Menú',
    description: 'Banquete nupcial de Bodega Concejo por comensal (adultos y niños)',
    budget_type: 'per_guest',
    icon: 'UtensilsCrossed',
    sort_order: 12,
    is_active: true,
  },
];

// Default Menu Configuration
export const DEFAULT_MENU_CONFIG: BudgetMenuConfig = {
  id: 'f0000000-0000-0000-0000-000000000001',
  wedding_id: WEDDING_UUID,
  adult_price: 145.0,
  child_price: 75.0,
  adult_count_override: null,
  child_count_override: null,
  use_manual_counts: false,
  notes: 'Menú degustación con maridaje de autor en Bodega Concejo.',
  extra_expenses: [],
};

const BANQUET_EXTRAS_MARKER = '<!--BANQUET_EXTRAS:';
const BANQUET_EXTRAS_END = '-->';

/**
 * Serializes human-readable notes and structured extra_expenses into a single string
 * so Supabase `budget_menu_config.notes` persists extra expenses without needing schema changes.
 */
export function serializeMenuNotesWithExtras(
  notes?: string | null,
  extraExpenses?: BanquetExpenseItem[] | null
): string | null {
  const cleanNotes = (notes || '').split(BANQUET_EXTRAS_MARKER)[0].trim();
  const extras = Array.isArray(extraExpenses) ? extraExpenses : [];
  if (extras.length === 0) {
    return cleanNotes || null;
  }
  const encoded = `${BANQUET_EXTRAS_MARKER}${JSON.stringify(extras)}${BANQUET_EXTRAS_END}`;
  return cleanNotes ? `${cleanNotes}\n${encoded}` : encoded;
}

/**
 * Extracts clean notes and extra_expenses from a raw notes string or existing extra_expenses array.
 */
export function parseMenuNotesAndExtras(
  rawNotes?: string | null,
  existingExtras?: BanquetExpenseItem[] | null
): { cleanNotes: string | null; extraExpenses: BanquetExpenseItem[] } {
  const raw = rawNotes || '';
  const markerIdx = raw.indexOf(BANQUET_EXTRAS_MARKER);
  let parsedExtras: BanquetExpenseItem[] = [];

  if (markerIdx !== -1) {
    const startJson = markerIdx + BANQUET_EXTRAS_MARKER.length;
    const endIdx = raw.indexOf(BANQUET_EXTRAS_END, startJson);
    const jsonPart = endIdx !== -1 ? raw.slice(startJson, endIdx) : raw.slice(startJson);
    try {
      const arr = JSON.parse(jsonPart);
      if (Array.isArray(arr)) {
        parsedExtras = arr;
      }
    } catch {
      // Ignore malformed JSON
    }
  }

  const cleanNotes = (markerIdx !== -1 ? raw.slice(0, markerIdx) : raw).trim() || null;
  const finalExtras =
    Array.isArray(existingExtras) && existingExtras.length > 0
      ? existingExtras
      : parsedExtras;

  return { cleanNotes, extraExpenses: finalExtras };
}

/**
 * Calculates the total cost of a single BanquetExpenseItem
 */
export function calculateBanquetExpenseItemTotal(
  item: BanquetExpenseItem,
  adultCount: number,
  childCount: number
): number {
  const unitAmount = Number(item.amount) || 0;
  if (item.type === 'per_adult') {
    return Math.max(0, adultCount) * unitAmount;
  }
  if (item.type === 'per_guest') {
    return Math.max(0, adultCount + childCount) * unitAmount;
  }
  const qty = item.quantity != null && Number(item.quantity) > 0 ? Number(item.quantity) : 1;
  return unitAmount * qty;
}

// Initial Suppliers: Empty by default to respect "No crear fixtures financieros",
// but allows comparing whenever suppliers are added.
export const INITIAL_SUPPLIERS: BudgetSupplier[] = [];
export const INITIAL_PAYMENTS: BudgetPayment[] = [];

// ==========================================
// CALCULATION & PRICING UTILITIES
// ==========================================

/**
 * P0 Rule: Get effective price of a supplier
 * If final_price exists -> final_price;
 * Else if quoted_price exists -> quoted_price;
 * Else if estimated_price exists -> estimated_price;
 * Else -> 0
 */
export function getEffectiveSupplierPrice(supplier?: {
  final_price?: number | null;
  quoted_price?: number | null;
  estimated_price?: number | null;
} | null): number {
  if (!supplier) return 0;
  if (supplier.final_price != null && !isNaN(Number(supplier.final_price))) {
    return Number(supplier.final_price);
  }
  if (supplier.quoted_price != null && !isNaN(Number(supplier.quoted_price))) {
    return Number(supplier.quoted_price);
  }
  if (supplier.estimated_price != null && !isNaN(Number(supplier.estimated_price))) {
    return Number(supplier.estimated_price);
  }
  return 0;
}

/**
 * Currency formatter according to Intl standard
 */
export function formatCurrency(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

/**
 * Menu Total Calculation (includes base adult/child menus + extra banquet expenses)
 */
export function calculateMenuTotal(
  menuConfig: BudgetMenuConfig,
  attendingAdults: number,
  attendingChildren: number
): {
  adultCount: number;
  childCount: number;
  adultTotal: number;
  childTotal: number;
  extrasTotal: number;
  extraExpenses: BanquetExpenseItem[];
  total: number;
} {
  const adultCount = menuConfig.use_manual_counts
    ? (menuConfig.adult_count_override ?? attendingAdults)
    : attendingAdults;

  const childCount = menuConfig.use_manual_counts
    ? (menuConfig.child_count_override ?? attendingChildren)
    : attendingChildren;

  const adultPrice = Number(menuConfig.adult_price) || 0;
  const childPrice = Number(menuConfig.child_price) || 0;

  const adultTotal = Math.max(0, adultCount) * adultPrice;
  const childTotal = Math.max(0, childCount) * childPrice;

  const { extraExpenses } = parseMenuNotesAndExtras(menuConfig.notes, menuConfig.extra_expenses);
  const extrasTotal = extraExpenses.reduce(
    (sum, item) => sum + calculateBanquetExpenseItemTotal(item, adultCount, childCount),
    0
  );

  const total = adultTotal + childTotal + extrasTotal;

  return {
    adultCount,
    childCount,
    adultTotal,
    childTotal,
    extrasTotal,
    extraExpenses,
    total,
  };
}

/**
 * Determines whether a payment record represents money already paid/settled
 * ('paid' or 'partial' deposit/installment) vs a future scheduled payment ('pending').
 */
export function isPaymentSettled(payment: BudgetPayment): boolean {
  return payment.status === 'paid' || payment.status === 'partial';
}

/**
 * Calculates calendar days from today to a target date string (YYYY-MM-DD or ISO).
 * Negative = overdue, 0 = due today, Positive = days remaining.
 */
export function calculateDaysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const raw = dateStr.split('T')[0];
  const parts = raw.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a YYYY-MM-DD or ISO date string into Spanish readable format (e.g., 15 jul 2027)
 */
export function formatDateES(dateStr?: string | null): string {
  if (!dateStr) return '';
  const raw = dateStr.split('T')[0];
  const parts = raw.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Finds the next upcoming scheduled payment (or all scheduled payments sorted chronologically) for a supplier
 */
export function getSupplierFinalPaymentInfo(
  supplierId: string,
  payments: BudgetPayment[]
): {
  scheduledPayment: BudgetPayment | null;
  scheduledPayments: BudgetPayment[];
  dueDate: string | null;
  daysUntilDue: number | null;
} {
  const supPayments = payments.filter((p) => p.supplier_id === supplierId);
  // Look first for pending payments with a due_date sorted chronologically (earliest upcoming date first!)
  const pendingWithDue = supPayments
    .filter((p) => p.status === 'pending' && p.due_date)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  if (pendingWithDue.length > 0) {
    const nextCandidate = pendingWithDue[0];
    const dueDate = nextCandidate.due_date ? nextCandidate.due_date.split('T')[0] : null;
    return {
      scheduledPayment: nextCandidate,
      scheduledPayments: pendingWithDue,
      dueDate,
      daysUntilDue: calculateDaysUntil(dueDate),
    };
  }

  // Fallback: check if any payment (even partial) recorded a due_date in the future
  const anyWithDue = supPayments
    .filter((p) => p.due_date)
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));

  if (anyWithDue.length > 0) {
    const dueDate = anyWithDue[0].due_date ? anyWithDue[0].due_date.split('T')[0] : null;
    return {
      scheduledPayment: anyWithDue[0].status === 'pending' ? anyWithDue[0] : null,
      scheduledPayments: anyWithDue.filter((p) => p.status === 'pending'),
      dueDate,
      daysUntilDue: calculateDaysUntil(dueDate),
    };
  }

  return {
    scheduledPayment: null,
    scheduledPayments: [],
    dueDate: null,
    daysUntilDue: null,
  };
}

export interface UpcomingFinalPaymentItem {
  category: BudgetCategory;
  supplier: BudgetSupplier;
  effectivePrice: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string | null;
  daysUntilDue: number | null;
  urgency: 'overdue' | 'urgent' | 'upcoming' | 'scheduled' | 'unscheduled';
  scheduledPayment: BudgetPayment | null;
}

export interface BudgetMetrics {
  totalEstimated: number;
  totalContracted: number;
  totalPaid: number;
  totalPending: number;
  percentContracted: number;
  percentPaid: number;
  menuSummary: {
    adultCount: number;
    childCount: number;
    adultTotal: number;
    childTotal: number;
    extrasTotal: number;
    extraExpenses: BanquetExpenseItem[];
    total: number;
  };
  banquetMetric: {
    supplier: BudgetSupplier;
    effectivePrice: number;
    paidAmount: number;
    pendingAmount: number;
    payments: BudgetPayment[];
    finalPaymentDueDate: string | null;
    daysUntilFinalPayment: number | null;
  };
  categoryBreakdown: Array<{
    category: BudgetCategory;
    selectedSupplier: BudgetSupplier | null;
    supplierCount: number;
    effectivePrice: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: 'none' | 'pending' | 'partial' | 'paid';
    categoryPayments: BudgetPayment[];
    finalPaymentDueDate: string | null;
    daysUntilFinalPayment: number | null;
    scheduledFinalPayment: BudgetPayment | null;
  }>;
  upcomingFinalPayments: UpcomingFinalPaymentItem[];
  alerts: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
    categoryId?: string;
    supplierId?: string;
    dueDate?: string | null;
  }>;
}

/**
 * Full Budget & Financial Metrics Calculator
 */
export function calculateBudgetMetrics(
  categories: BudgetCategory[],
  suppliers: BudgetSupplier[],
  payments: BudgetPayment[],
  menuConfig: BudgetMenuConfig,
  attendingAdults: number,
  attendingChildren: number
): BudgetMetrics {
  const menuSummary = calculateMenuTotal(menuConfig, attendingAdults, attendingChildren);

  let totalContracted = 0;
  let totalEstimated = 0;
  let totalPaid = 0;
  let menuIncludedInCategory = false;

  const alerts: BudgetMetrics['alerts'] = [];
  const upcomingFinalPayments: UpcomingFinalPaymentItem[] = [];

  const activeCategories = categories.filter((c) => c.is_active !== false);

  const categoryBreakdown = activeCategories.map((cat) => {
    const catSuppliers = suppliers.filter((s) => s.category_id === cat.id);
    const selectedSupplier =
      catSuppliers.find((s) => s.is_selected) ||
      (catSuppliers.length === 1 ? catSuppliers[0] : null);

    let effectivePrice = 0;
    const isMenuCat =
      cat.name.toLowerCase().includes('menú') ||
      cat.name.toLowerCase().includes('menu') ||
      cat.name.toLowerCase().includes('banquete') ||
      cat.budget_type === 'per_guest';

    if (isMenuCat) {
      menuIncludedInCategory = true;
      // Menu category price comes from calculated menu total (unless a supplier has a higher explicit final price)
      effectivePrice =
        menuSummary.total > 0
          ? menuSummary.total
          : selectedSupplier
          ? getEffectiveSupplierPrice(selectedSupplier)
          : 0;
    } else if (selectedSupplier) {
      effectivePrice = getEffectiveSupplierPrice(selectedSupplier);
    } else {
      // Estimated from average or quotes if no supplier selected yet
      const quotedOrEst = catSuppliers.map(getEffectiveSupplierPrice).filter((p) => p > 0);
      effectivePrice = quotedOrEst.length > 0 ? Math.min(...quotedOrEst) : 0;
    }

    if (selectedSupplier || isMenuCat) {
      totalContracted += effectivePrice;
    }
    totalEstimated += effectivePrice;

    // Payments for this category's active supplier (or all suppliers in category if none selected)
    const supplierIds = selectedSupplier ? [selectedSupplier.id] : catSuppliers.map((s) => s.id);
    const catPayments = payments
      .filter((p) => supplierIds.includes(p.supplier_id))
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));

    // Both 'paid' and 'partial' (señal/adelanto) represent money already paid
    const paidAmount = catPayments
      .filter((p) => isPaymentSettled(p))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingAmount = Math.max(0, effectivePrice - paidAmount);
    totalPaid += paidAmount;

    let paymentStatus: 'none' | 'pending' | 'partial' | 'paid' = 'none';
    if (!selectedSupplier && cat.budget_type !== 'per_guest' && paidAmount === 0) {
      paymentStatus = 'none';
    } else if (effectivePrice > 0 && paidAmount >= effectivePrice) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    } else if (effectivePrice > 0) {
      paymentStatus = 'pending';
    }

    // Check Scheduled Payment Dates for active supplier (supports MULTIPLE payment dates per supplier)
    const finalPaymentInfo = selectedSupplier
      ? getSupplierFinalPaymentInfo(selectedSupplier.id, payments)
      : { scheduledPayment: null, scheduledPayments: [], dueDate: null, daysUntilDue: null };

    const finalPaymentDueDate = pendingAmount > 0 ? finalPaymentInfo.dueDate : null;
    const daysUntilFinalPayment = pendingAmount > 0 ? finalPaymentInfo.daysUntilDue : null;

    if (selectedSupplier && pendingAmount > 0) {
      if (finalPaymentInfo.scheduledPayments.length > 0) {
        // Add an upcoming payment card and alert for EVERY scheduled payment date of this supplier
        for (const schedPay of finalPaymentInfo.scheduledPayments) {
          const schedDate = schedPay.due_date ? schedPay.due_date.split('T')[0] : null;
          const schedDays = calculateDaysUntil(schedDate);
          const schedAmount = Number(schedPay.amount) > 0 ? Number(schedPay.amount) : pendingAmount;
          const label = schedPay.notes || 'Plazo de pago';

          let urgency: UpcomingFinalPaymentItem['urgency'] = 'scheduled';
          if (schedDays !== null) {
            if (schedDays < 0) {
              urgency = 'overdue';
              alerts.unshift({
                type: 'error',
                message: `¡PAGO VENCIDO! "${label}" de ${selectedSupplier.name} (${cat.name}) por ${formatCurrency(schedAmount)} venció el ${formatDateES(schedDate)} (hace ${Math.abs(schedDays)} días).`,
                categoryId: cat.id,
                supplierId: selectedSupplier.id,
                dueDate: schedDate,
              });
            } else if (schedDays === 0) {
              urgency = 'overdue';
              alerts.unshift({
                type: 'error',
                message: `¡VENCE HOY! Hoy vence "${label}" de ${selectedSupplier.name} (${cat.name}): ${formatCurrency(schedAmount)}.`,
                categoryId: cat.id,
                supplierId: selectedSupplier.id,
                dueDate: schedDate,
              });
            } else if (schedDays <= 30) {
              urgency = 'urgent';
              alerts.unshift({
                type: 'warning',
                message: `Próximo vencimiento (en ${schedDays} días): "${label}" de ${selectedSupplier.name} (${cat.name}) — ${formatCurrency(schedAmount)} (${formatDateES(schedDate)}).`,
                categoryId: cat.id,
                supplierId: selectedSupplier.id,
                dueDate: schedDate,
              });
            } else if (schedDays <= 60) {
              urgency = 'upcoming';
              alerts.push({
                type: 'info',
                message: `Recordatorio de pago (en ${schedDays} días): "${label}" de ${selectedSupplier.name} (${cat.name}) — ${formatCurrency(schedAmount)} el ${formatDateES(schedDate)}.`,
                categoryId: cat.id,
                supplierId: selectedSupplier.id,
                dueDate: schedDate,
              });
            }
          }

          upcomingFinalPayments.push({
            category: cat,
            supplier: selectedSupplier,
            effectivePrice,
            paidAmount,
            pendingAmount: schedAmount,
            dueDate: schedDate,
            daysUntilDue: schedDays,
            urgency,
            scheduledPayment: schedPay,
          });
        }
      } else {
        upcomingFinalPayments.push({
          category: cat,
          supplier: selectedSupplier,
          effectivePrice,
          paidAmount,
          pendingAmount,
          dueDate: null,
          daysUntilDue: null,
          urgency: 'unscheduled',
          scheduledPayment: null,
        });
      }
    }

    // Alerts generation for missing suppliers or price overruns
    if (cat.is_active && !selectedSupplier && cat.name.toLowerCase() !== 'menú') {
      if (catSuppliers.length === 0) {
        alerts.push({
          type: 'warning',
          message: `Sin proveedores registrados en "${cat.name}"`,
          categoryId: cat.id,
        });
      } else {
        alerts.push({
          type: 'info',
          message: `Tienes ${catSuppliers.length} proveedores para comparar en "${cat.name}", ninguno seleccionado aún`,
          categoryId: cat.id,
        });
      }
    }

    if (selectedSupplier && selectedSupplier.final_price && selectedSupplier.quoted_price) {
      if (Number(selectedSupplier.final_price) > Number(selectedSupplier.quoted_price)) {
        alerts.push({
          type: 'warning',
          message: `El precio final de ${selectedSupplier.name} (${formatCurrency(Number(selectedSupplier.final_price))}) supera el presupuesto recibido (${formatCurrency(Number(selectedSupplier.quoted_price))})`,
          categoryId: cat.id,
        });
      }
    }

    return {
      category: cat,
      selectedSupplier,
      supplierCount: catSuppliers.length,
      effectivePrice,
      paidAmount,
      pendingAmount,
      paymentStatus,
      categoryPayments: catPayments,
      finalPaymentDueDate,
      daysUntilFinalPayment,
      scheduledFinalPayment: finalPaymentInfo.scheduledPayment,
    };
  });

  // Resolve Banquet Metric (whether or not a 'Menú' category card exists in Partidas y Proveedores)
  const existingMenuBreakdown = categoryBreakdown.find(
    (cb) =>
      cb.category.name.toLowerCase().includes('menú') ||
      cb.category.name.toLowerCase().includes('menu') ||
      cb.category.name.toLowerCase().includes('banquete') ||
      cb.category.budget_type === 'per_guest'
  );

  let banquetMetric: BudgetMetrics['banquetMetric'];

  if (existingMenuBreakdown) {
    const fallbackSup: BudgetSupplier = {
      ...DEFAULT_BANQUET_SUPPLIER,
      category_id: existingMenuBreakdown.category.id,
      estimated_price: menuSummary.total,
      quoted_price: menuSummary.total,
      final_price: menuSummary.total,
    };
    banquetMetric = {
      supplier: existingMenuBreakdown.selectedSupplier || fallbackSup,
      effectivePrice: existingMenuBreakdown.effectivePrice || menuSummary.total,
      paidAmount: existingMenuBreakdown.paidAmount,
      pendingAmount: existingMenuBreakdown.pendingAmount,
      payments: existingMenuBreakdown.categoryPayments,
      finalPaymentDueDate: existingMenuBreakdown.finalPaymentDueDate,
      daysUntilFinalPayment: existingMenuBreakdown.daysUntilFinalPayment,
    };
  } else {
    const matchedBanquetSup =
      suppliers.find(
        (s) =>
          (menuConfig.supplier_id && s.id === menuConfig.supplier_id) ||
          s.id === BANQUET_SUPPLIER_ID ||
          s.category_id === BANQUET_CATEGORY_ID
      ) || {
        ...DEFAULT_BANQUET_SUPPLIER,
        estimated_price: menuSummary.total,
        quoted_price: menuSummary.total,
        final_price: menuSummary.total,
      };

    const banquetSupWithPrice: BudgetSupplier = {
      ...matchedBanquetSup,
      estimated_price: menuSummary.total,
      quoted_price: menuSummary.total,
      final_price: menuSummary.total,
    };

    const banquetPayments = payments
      .filter(
        (p) =>
          p.supplier_id === banquetSupWithPrice.id ||
          p.supplier_id === BANQUET_SUPPLIER_ID ||
          p.supplier_id === LEGACY_BANQUET_SUPPLIER_ID
      )
      .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));

    const banquetPaid = banquetPayments
      .filter((p) => isPaymentSettled(p))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const banquetEffective = menuSummary.total;
    const banquetPending = Math.max(0, banquetEffective - banquetPaid);

    if (banquetEffective > 0) {
      totalContracted += banquetEffective;
      totalEstimated += banquetEffective;
    }
    totalPaid += banquetPaid;

    const finalInfo = getSupplierFinalPaymentInfo(banquetSupWithPrice.id, banquetPayments);
    const finalDueDate = banquetPending > 0 ? finalInfo.dueDate : null;
    const daysUntilDue = banquetPending > 0 ? finalInfo.daysUntilDue : null;

    const banquetCatObj: BudgetCategory = {
      id: BANQUET_CATEGORY_ID,
      wedding_id: WEDDING_UUID,
      name: 'Banquete & Catering',
      description: 'Banquete nupcial y gastos asociados',
      budget_type: 'per_guest',
      icon: 'UtensilsCrossed',
      sort_order: 12,
      is_active: false,
    };

    if (banquetPending > 0) {
      if (finalInfo.scheduledPayments.length > 0) {
        for (const schedPay of finalInfo.scheduledPayments) {
          const schedDate = schedPay.due_date ? schedPay.due_date.split('T')[0] : null;
          const schedDays = calculateDaysUntil(schedDate);
          const schedAmount = Number(schedPay.amount) > 0 ? Number(schedPay.amount) : banquetPending;
          const label = schedPay.notes || 'Plazo de pago Banquete';

          let urgency: UpcomingFinalPaymentItem['urgency'] = 'scheduled';
          if (schedDays !== null) {
            if (schedDays < 0) {
              urgency = 'overdue';
              alerts.unshift({
                type: 'error',
                message: `¡PAGO VENCIDO! "${label}" de ${banquetSupWithPrice.name} (Banquete) por ${formatCurrency(schedAmount)} venció el ${formatDateES(schedDate)} (hace ${Math.abs(schedDays)} días).`,
                categoryId: BANQUET_CATEGORY_ID,
                supplierId: banquetSupWithPrice.id,
                dueDate: schedDate,
              });
            } else if (schedDays === 0) {
              urgency = 'overdue';
              alerts.unshift({
                type: 'error',
                message: `¡VENCE HOY! Hoy vence "${label}" de ${banquetSupWithPrice.name} (Banquete): ${formatCurrency(schedAmount)}.`,
                categoryId: BANQUET_CATEGORY_ID,
                supplierId: banquetSupWithPrice.id,
                dueDate: schedDate,
              });
            } else if (schedDays <= 30) {
              urgency = 'urgent';
              alerts.unshift({
                type: 'warning',
                message: `Próximo vencimiento (en ${schedDays} días): "${label}" de ${banquetSupWithPrice.name} (Banquete) — ${formatCurrency(schedAmount)} (${formatDateES(schedDate)}).`,
                categoryId: BANQUET_CATEGORY_ID,
                supplierId: banquetSupWithPrice.id,
                dueDate: schedDate,
              });
            } else if (schedDays <= 60) {
              urgency = 'upcoming';
              alerts.push({
                type: 'info',
                message: `Recordatorio de pago (en ${schedDays} días): "${label}" de ${banquetSupWithPrice.name} (Banquete) — ${formatCurrency(schedAmount)} el ${formatDateES(schedDate)}.`,
                categoryId: BANQUET_CATEGORY_ID,
                supplierId: banquetSupWithPrice.id,
                dueDate: schedDate,
              });
            }
          }

          upcomingFinalPayments.push({
            category: banquetCatObj,
            supplier: banquetSupWithPrice,
            effectivePrice: banquetEffective,
            paidAmount: banquetPaid,
            pendingAmount: schedAmount,
            dueDate: schedDate,
            daysUntilDue: schedDays,
            urgency,
            scheduledPayment: schedPay,
          });
        }
      } else if (banquetPaid > 0) {
        upcomingFinalPayments.push({
          category: banquetCatObj,
          supplier: banquetSupWithPrice,
          effectivePrice: banquetEffective,
          paidAmount: banquetPaid,
          pendingAmount: banquetPending,
          dueDate: null,
          daysUntilDue: null,
          urgency: 'unscheduled',
          scheduledPayment: null,
        });
      }
    }

    banquetMetric = {
      supplier: banquetSupWithPrice,
      effectivePrice: banquetEffective,
      paidAmount: banquetPaid,
      pendingAmount: banquetPending,
      payments: banquetPayments,
      finalPaymentDueDate: finalDueDate,
      daysUntilFinalPayment: daysUntilDue,
    };
  }

  // Sort upcomingFinalPayments: those with a dueDate sorted chronologically first, then unscheduled ones
  upcomingFinalPayments.sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return b.pendingAmount - a.pendingAmount;
  });

  const totalPending = Math.max(0, totalContracted - totalPaid);
  const percentContracted = totalEstimated > 0 ? Math.min(100, Math.round((totalContracted / totalEstimated) * 100)) : 0;
  const percentPaid = totalContracted > 0 ? Math.min(100, Math.round((totalPaid / totalContracted) * 100)) : 0;

  return {
    totalEstimated,
    totalContracted,
    totalPaid,
    totalPending,
    percentContracted,
    percentPaid,
    menuSummary,
    banquetMetric,
    categoryBreakdown,
    upcomingFinalPayments,
    alerts,
  };
}

// ==========================================
// LOCAL STORAGE STORE PERSISTENCE
// ==========================================

let inMemoryCategories: BudgetCategory[] | null = null;
let inMemorySuppliers: BudgetSupplier[] | null = null;
let inMemoryPayments: BudgetPayment[] | null = null;
let inMemoryMenuConfig: BudgetMenuConfig | null = null;

function getCurrentBudgetWeddingId(): string {
  if (typeof window === 'undefined') return WEDDING_UUID;
  try {
    return localStorage.getItem('boda_planner_active_wedding_id_v3') || WEDDING_UUID;
  } catch {
    return WEDDING_UUID;
  }
}

function getScopedBudgetKey(baseKey: string): string {
  const wid = getCurrentBudgetWeddingId();
  return wid === WEDDING_UUID ? baseKey : `${baseKey}__${wid}`;
}

export function getStoredBudgetCategories(): BudgetCategory[] {
  if (typeof window === 'undefined') return INITIAL_BUDGET_CATEGORIES;
  try {
    const raw = localStorage.getItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_CATEGORIES));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored budget categories:', e);
  }
  return INITIAL_BUDGET_CATEGORIES;
}

export function setStoredBudgetCategories(categories: BudgetCategory[]) {
  inMemoryCategories = categories;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_CATEGORIES), JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving stored budget categories:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetSuppliers(): BudgetSupplier[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLIERS;
  const wid = getCurrentBudgetWeddingId();
  try {
    const raw = localStorage.getItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_SUPPLIERS));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored budget suppliers:', e);
  }
  return wid === WEDDING_UUID ? INITIAL_SUPPLIERS : [];
}

export function setStoredBudgetSuppliers(suppliers: BudgetSupplier[]) {
  inMemorySuppliers = suppliers;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_SUPPLIERS), JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Error saving stored budget suppliers:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetPayments(): BudgetPayment[] {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  const wid = getCurrentBudgetWeddingId();
  try {
    const raw = localStorage.getItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_PAYMENTS));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored budget payments:', e);
  }
  return wid === WEDDING_UUID ? INITIAL_PAYMENTS : [];
}

export function setStoredBudgetPayments(payments: BudgetPayment[]) {
  inMemoryPayments = payments;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_PAYMENTS), JSON.stringify(payments));
    } catch (e) {
      console.warn('Error saving stored budget payments:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetMenuConfig(): BudgetMenuConfig {
  if (typeof window === 'undefined') return inMemoryMenuConfig || DEFAULT_MENU_CONFIG;
  try {
    const raw = localStorage.getItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_MENU));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.adult_price === 'number') {
        const { cleanNotes, extraExpenses } = parseMenuNotesAndExtras(
          parsed.notes,
          parsed.extra_expenses
        );
        return {
          ...DEFAULT_MENU_CONFIG,
          ...parsed,
          notes: cleanNotes,
          extra_expenses: extraExpenses,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading stored menu config:', e);
  }
  return DEFAULT_MENU_CONFIG;
}

export function setStoredBudgetMenuConfig(config: BudgetMenuConfig) {
  const existing = typeof window !== 'undefined' ? getStoredBudgetMenuConfig() : inMemoryMenuConfig;
  const { cleanNotes, extraExpenses } = parseMenuNotesAndExtras(
    config.notes,
    config.extra_expenses !== undefined ? config.extra_expenses : existing?.extra_expenses
  );
  const normalized: BudgetMenuConfig = {
    ...DEFAULT_MENU_CONFIG,
    ...config,
    notes: cleanNotes,
    extra_expenses: extraExpenses,
  };
  inMemoryMenuConfig = normalized;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getScopedBudgetKey(STORAGE_KEY_BUDGET_MENU), JSON.stringify(normalized));
    } catch (e) {
      console.warn('Error saving stored menu config:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}
