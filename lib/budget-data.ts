import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BudgetMenuConfig,
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
  id: 'm0000000-0000-0000-0000-000000000001',
  wedding_id: WEDDING_UUID,
  adult_price: 145.0,
  child_price: 75.0,
  adult_count_override: null,
  child_count_override: null,
  use_manual_counts: false,
  notes: 'Menú degustación con maridaje de autor en Bodega Concejo.',
};

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
 * Menu Total Calculation
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
  const total = adultTotal + childTotal;

  return {
    adultCount,
    childCount,
    adultTotal,
    childTotal,
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
 * Finds the scheduled final payment or latest due_date for a supplier
 */
export function getSupplierFinalPaymentInfo(
  supplierId: string,
  payments: BudgetPayment[]
): {
  scheduledPayment: BudgetPayment | null;
  dueDate: string | null;
  daysUntilDue: number | null;
} {
  const supPayments = payments.filter((p) => p.supplier_id === supplierId);
  // Look first for pending payments with a due_date (or notes mentioning Pago final)
  const pendingWithDue = supPayments
    .filter((p) => p.status === 'pending' && p.due_date)
    .sort((a, b) => (b.due_date || '').localeCompare(a.due_date || ''));

  if (pendingWithDue.length > 0) {
    const finalCandidate =
      pendingWithDue.find((p) => p.notes?.toLowerCase().includes('pago final')) ||
      pendingWithDue[0];
    const dueDate = finalCandidate.due_date ? finalCandidate.due_date.split('T')[0] : null;
    return {
      scheduledPayment: finalCandidate,
      dueDate,
      daysUntilDue: calculateDaysUntil(dueDate),
    };
  }

  // Fallback: check if any payment (even partial) recorded a due_date in the future for final payment
  const anyWithDue = supPayments
    .filter((p) => p.due_date)
    .sort((a, b) => (b.due_date || '').localeCompare(a.due_date || ''));

  if (anyWithDue.length > 0) {
    const dueDate = anyWithDue[0].due_date ? anyWithDue[0].due_date.split('T')[0] : null;
    return {
      scheduledPayment: anyWithDue[0].status === 'pending' ? anyWithDue[0] : null,
      dueDate,
      daysUntilDue: calculateDaysUntil(dueDate),
    };
  }

  return {
    scheduledPayment: null,
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
    total: number;
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

  const alerts: BudgetMetrics['alerts'] = [];
  const upcomingFinalPayments: UpcomingFinalPaymentItem[] = [];

  const categoryBreakdown = categories.map((cat) => {
    const catSuppliers = suppliers.filter((s) => s.category_id === cat.id);
    const selectedSupplier =
      catSuppliers.find((s) => s.is_selected) ||
      (catSuppliers.length === 1 ? catSuppliers[0] : null);

    let effectivePrice = 0;

    if (cat.name.toLowerCase() === 'menú' || cat.budget_type === 'per_guest') {
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

    if (selectedSupplier || cat.budget_type === 'per_guest') {
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

    // Check Final Payment Due Date for active supplier
    const finalPaymentInfo = selectedSupplier
      ? getSupplierFinalPaymentInfo(selectedSupplier.id, payments)
      : { scheduledPayment: null, dueDate: null, daysUntilDue: null };

    const finalPaymentDueDate = pendingAmount > 0 ? finalPaymentInfo.dueDate : null;
    const daysUntilFinalPayment = pendingAmount > 0 ? finalPaymentInfo.daysUntilDue : null;

    if (selectedSupplier && pendingAmount > 0) {
      let urgency: UpcomingFinalPaymentItem['urgency'] = 'unscheduled';
      if (daysUntilFinalPayment !== null) {
        if (daysUntilFinalPayment < 0) {
          urgency = 'overdue';
          alerts.unshift({
            type: 'error',
            message: `¡PAGO VENCIDO! El pago final de ${selectedSupplier.name} (${cat.name}) por ${formatCurrency(pendingAmount)} venció el ${formatDateES(finalPaymentDueDate)} (hace ${Math.abs(daysUntilFinalPayment)} días).`,
            categoryId: cat.id,
            supplierId: selectedSupplier.id,
            dueDate: finalPaymentDueDate,
          });
        } else if (daysUntilFinalPayment === 0) {
          urgency = 'overdue';
          alerts.unshift({
            type: 'error',
            message: `¡VENCE HOY! Hoy es la fecha límite del pago final a ${selectedSupplier.name} (${cat.name}): ${formatCurrency(pendingAmount)}.`,
            categoryId: cat.id,
            supplierId: selectedSupplier.id,
            dueDate: finalPaymentDueDate,
          });
        } else if (daysUntilFinalPayment <= 30) {
          urgency = 'urgent';
          alerts.unshift({
            type: 'warning',
            message: `Pago final próximo (en ${daysUntilFinalPayment} días): ${selectedSupplier.name} (${cat.name}) — Pendiente ${formatCurrency(pendingAmount)} (Límite: ${formatDateES(finalPaymentDueDate)}).`,
            categoryId: cat.id,
            supplierId: selectedSupplier.id,
            dueDate: finalPaymentDueDate,
          });
        } else if (daysUntilFinalPayment <= 60) {
          urgency = 'upcoming';
          alerts.push({
            type: 'info',
            message: `Recordatorio de pago final (en ${daysUntilFinalPayment} días): ${selectedSupplier.name} (${cat.name}) — ${formatCurrency(pendingAmount)} el ${formatDateES(finalPaymentDueDate)}.`,
            categoryId: cat.id,
            supplierId: selectedSupplier.id,
            dueDate: finalPaymentDueDate,
          });
        } else {
          urgency = 'scheduled';
        }
      }

      upcomingFinalPayments.push({
        category: cat,
        supplier: selectedSupplier,
        effectivePrice,
        paidAmount,
        pendingAmount,
        dueDate: finalPaymentDueDate,
        daysUntilDue: daysUntilFinalPayment,
        urgency,
        scheduledPayment: finalPaymentInfo.scheduledPayment,
      });
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

export function getStoredBudgetCategories(): BudgetCategory[] {
  if (typeof window === 'undefined') return INITIAL_BUDGET_CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET_CATEGORIES);
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
      localStorage.setItem(STORAGE_KEY_BUDGET_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving stored budget categories:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetSuppliers(): BudgetSupplier[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLIERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET_SUPPLIERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored budget suppliers:', e);
  }
  return INITIAL_SUPPLIERS;
}

export function setStoredBudgetSuppliers(suppliers: BudgetSupplier[]) {
  inMemorySuppliers = suppliers;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET_SUPPLIERS, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Error saving stored budget suppliers:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetPayments(): BudgetPayment[] {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET_PAYMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored budget payments:', e);
  }
  return INITIAL_PAYMENTS;
}

export function setStoredBudgetPayments(payments: BudgetPayment[]) {
  inMemoryPayments = payments;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET_PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.warn('Error saving stored budget payments:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}

export function getStoredBudgetMenuConfig(): BudgetMenuConfig {
  if (typeof window === 'undefined') return DEFAULT_MENU_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUDGET_MENU);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.adult_price === 'number') return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored menu config:', e);
  }
  return DEFAULT_MENU_CONFIG;
}

export function setStoredBudgetMenuConfig(config: BudgetMenuConfig) {
  inMemoryMenuConfig = config;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET_MENU, JSON.stringify(config));
    } catch (e) {
      console.warn('Error saving stored menu config:', e);
    }
    window.dispatchEvent(new CustomEvent(BUDGET_UPDATE_EVENT));
  }
}
