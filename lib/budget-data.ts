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
  }>;
  alerts: Array<{
    type: 'warning' | 'info' | 'error';
    message: string;
    categoryId?: string;
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

  const categoryBreakdown = categories.map((cat) => {
    const catSuppliers = suppliers.filter((s) => s.category_id === cat.id);
    const selectedSupplier = catSuppliers.find((s) => s.is_selected) || null;

    let effectivePrice = 0;

    if (cat.name.toLowerCase() === 'menú' || cat.budget_type === 'per_guest') {
      // Menu category price comes from calculated menu total
      effectivePrice = menuSummary.total;
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

    // Payments for this category's suppliers
    const supplierIds = selectedSupplier ? [selectedSupplier.id] : catSuppliers.map((s) => s.id);
    const catPayments = payments.filter((p) => supplierIds.includes(p.supplier_id));

    const paidAmount = catPayments
      .filter((p) => p.status === 'paid' || p.paid_at != null)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingAmount = Math.max(0, effectivePrice - paidAmount);
    totalPaid += paidAmount;

    let paymentStatus: 'none' | 'pending' | 'partial' | 'paid' = 'none';
    if (!selectedSupplier && cat.budget_type !== 'per_guest') {
      paymentStatus = 'none';
    } else if (effectivePrice > 0 && paidAmount >= effectivePrice) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    } else if (effectivePrice > 0) {
      paymentStatus = 'pending';
    }

    // Alerts generation
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
    };
  });

  const totalPending = Math.max(0, totalContracted - totalPaid);
  const percentContracted = totalEstimated > 0 ? Math.min(100, Math.round((totalContracted / totalEstimated) * 100)) : 0;
  const percentPaid = totalContracted > 0 ? Math.min(100, Math.round((totalPaid / totalContracted) * 100)) : 0;

  // Add payments due soon alerts
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  if (pendingPayments.length > 0) {
    alerts.push({
      type: 'info',
      message: `Tienes ${pendingPayments.length} pago(s) pendiente(s) programado(s) por un total de ${formatCurrency(pendingPayments.reduce((s, p) => s + Number(p.amount), 0))}`,
    });
  }

  return {
    totalEstimated,
    totalContracted,
    totalPaid,
    totalPending,
    percentContracted,
    percentPaid,
    menuSummary,
    categoryBreakdown,
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
