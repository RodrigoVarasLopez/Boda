'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BudgetMenuConfig,
  BanquetExpenseItem,
} from './types';
import {
  getStoredBudgetCategories,
  setStoredBudgetCategories,
  getStoredBudgetSuppliers,
  setStoredBudgetSuppliers,
  getStoredBudgetPayments,
  setStoredBudgetPayments,
  getStoredBudgetMenuConfig,
  setStoredBudgetMenuConfig,
  calculateBudgetMetrics,
  calculateMenuTotal,
  getEffectiveSupplierPrice,
  isPaymentSettled,
  formatCurrency,
  BudgetMetrics,
  BUDGET_UPDATE_EVENT,
  STORAGE_KEY_BUDGET_CATEGORIES,
  STORAGE_KEY_BUDGET_SUPPLIERS,
  STORAGE_KEY_BUDGET_PAYMENTS,
  STORAGE_KEY_BUDGET_MENU,
  WEDDING_ID,
} from './budget-data';
import { useWeddingData } from './guest-store';
import {
  getBudgetDataAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  selectSupplierAction,
  createPaymentAction,
  updatePaymentAction,
  deletePaymentAction,
  updateMenuConfigAction,
} from '@/app/actions';

export function useBudgetStore() {
  const { stats, updateGuestType } = useWeddingData();
  const [categories, setCategories] = useState<BudgetCategory[]>(() => getStoredBudgetCategories());
  const [suppliers, setSuppliers] = useState<BudgetSupplier[]>(() => getStoredBudgetSuppliers());
  const [payments, setPayments] = useState<BudgetPayment[]>(() => getStoredBudgetPayments());
  const [menuConfig, setMenuConfig] = useState<BudgetMenuConfig>(() => getStoredBudgetMenuConfig());
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadData = useCallback(() => {
    setCategories(getStoredBudgetCategories());
    setSuppliers(getStoredBudgetSuppliers());
    setPayments(getStoredBudgetPayments());
    setMenuConfig(getStoredBudgetMenuConfig());
  }, []);

  useEffect(() => {
    reloadData();
    setIsLoaded(true);

    // Hydrate live from Supabase
    let isMounted = true;
    getBudgetDataAction().then((res) => {
      if (res && res.success && isMounted) {
        if (res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          setStoredBudgetCategories(res.categories);
        }
        if (res.suppliers) {
          setSuppliers(res.suppliers);
          setStoredBudgetSuppliers(res.suppliers);
        }
        if (res.payments) {
          setPayments(res.payments);
          setStoredBudgetPayments(res.payments);
        }
        if (res.menuConfig) {
          setMenuConfig(res.menuConfig);
          setStoredBudgetMenuConfig(res.menuConfig);
        }
      }
    }).catch((err) => {
      console.warn('Initial Supabase budget sync notice:', err);
    });

    const handleUpdate = () => reloadData();
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === STORAGE_KEY_BUDGET_CATEGORIES ||
        e.key === STORAGE_KEY_BUDGET_SUPPLIERS ||
        e.key === STORAGE_KEY_BUDGET_PAYMENTS ||
        e.key === STORAGE_KEY_BUDGET_MENU
      ) {
        reloadData();
      }
    };

    window.addEventListener(BUDGET_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(BUDGET_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadData]);

  // Adults and Children for the banquet from the live guest list (all guests minus confirmed 'declined')
  const attendingAdults = stats.banquetAdults ?? stats.totalAdults ?? 0;
  const attendingChildren = stats.banquetChildren ?? stats.totalChildren ?? 0;

  // Real-time calculated financial metrics
  const metrics: BudgetMetrics = useMemo(() => {
    return calculateBudgetMetrics(
      categories,
      suppliers,
      payments,
      menuConfig,
      attendingAdults,
      attendingChildren
    );
  }, [categories, suppliers, payments, menuConfig, attendingAdults, attendingChildren]);

  // MUTATIONS (Optimistic Local + Server Action)

  // 1. Categories
  const createCategory = async (data: {
    name: string;
    description?: string | null;
    budget_type: 'fixed' | 'per_guest' | 'mixed';
    icon?: string | null;
    sort_order?: number;
  }) => {
    const currentCats = getStoredBudgetCategories();
    const newCatId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
    const newCat: BudgetCategory = {
      id: newCatId,
      wedding_id: WEDDING_ID,
      name: data.name,
      description: data.description || null,
      budget_type: data.budget_type,
      icon: data.icon || 'Sparkles',
      sort_order: data.sort_order ?? currentCats.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const nextCats = [...currentCats, newCat];
    setStoredBudgetCategories(nextCats);

    try {
      const res = await createCategoryAction({ ...data, id: newCatId });
      if (res && res.id && res.id !== newCatId) {
        newCat.id = res.id;
        setStoredBudgetCategories(
          getStoredBudgetCategories().map((c) => (c.id === newCatId ? { ...c, id: res.id } : c))
        );
      }
    } catch (e) {
      console.warn('Backend category sync notice:', e);
    }
    return newCat;
  };

  const updateCategory = async (data: {
    id: string;
    name?: string;
    description?: string | null;
    budget_type?: 'fixed' | 'per_guest' | 'mixed';
    icon?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    const currentCats = getStoredBudgetCategories();
    const nextCats = currentCats.map((c) =>
      c.id === data.id
        ? {
            ...c,
            ...data,
            updated_at: new Date().toISOString(),
          }
        : c
    );
    setStoredBudgetCategories(nextCats);

    try {
      await updateCategoryAction(data);
    } catch (e) {
      console.warn('Backend category sync notice:', e);
    }
  };

  const deleteCategory = async (id: string) => {
    const nextCats = getStoredBudgetCategories().filter((c) => c.id !== id);
    const nextSuppliers = getStoredBudgetSuppliers().filter((s) => s.category_id !== id);
    setStoredBudgetCategories(nextCats);
    setStoredBudgetSuppliers(nextSuppliers);

    try {
      await deleteCategoryAction(id);
    } catch (e) {
      console.warn('Backend category delete notice:', e);
    }
  };

  // 2. Suppliers
  const createSupplier = async (data: {
    category_id: string;
    name: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    estimated_price?: number | null;
    quoted_price?: number | null;
    final_price?: number | null;
    currency?: string;
    rating?: number | null;
    status?: 'pending' | 'contacted' | 'quoted' | 'finalist' | 'selected' | 'discarded';
    comments?: string | null;
    notes?: string | null;
    is_selected?: boolean;
  }) => {
    const currentSuppliers = getStoredBudgetSuppliers();
    const newSupplierId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
    const isSelected = Boolean(data.is_selected);

    // If marked selected, unselect others in same category
    let nextSuppliers = currentSuppliers;
    if (isSelected) {
      nextSuppliers = currentSuppliers.map((s) =>
        s.category_id === data.category_id ? { ...s, is_selected: false } : s
      );
    }

    const newSupplier: BudgetSupplier = {
      id: newSupplierId,
      category_id: data.category_id,
      wedding_id: WEDDING_ID,
      name: data.name,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      instagram: data.instagram || null,
      estimated_price: data.estimated_price != null ? Number(data.estimated_price) : null,
      quoted_price: data.quoted_price != null ? Number(data.quoted_price) : null,
      final_price: data.final_price != null ? Number(data.final_price) : null,
      currency: data.currency || 'EUR',
      rating: data.rating != null ? Number(data.rating) : null,
      status: data.status || (isSelected ? 'selected' : 'pending'),
      comments: data.comments || null,
      notes: data.notes || null,
      is_selected: isSelected,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setStoredBudgetSuppliers([...nextSuppliers, newSupplier]);

    try {
      const res = await createSupplierAction({ ...data, id: newSupplierId });
      if (res && res.id && res.id !== newSupplierId) {
        newSupplier.id = res.id;
        setStoredBudgetSuppliers(
          getStoredBudgetSuppliers().map((s) => (s.id === newSupplierId ? { ...s, id: res.id } : s))
        );
      }
    } catch (e) {
      console.warn('Backend supplier sync notice:', e);
    }
    return newSupplier;
  };

  const updateSupplier = async (data: {
    id: string;
    category_id?: string;
    name?: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    estimated_price?: number | null;
    quoted_price?: number | null;
    final_price?: number | null;
    currency?: string;
    rating?: number | null;
    status?: 'pending' | 'contacted' | 'quoted' | 'finalist' | 'selected' | 'discarded';
    comments?: string | null;
    notes?: string | null;
    is_selected?: boolean;
  }) => {
    let nextSuppliers = getStoredBudgetSuppliers();
    const current = nextSuppliers.find((s) => s.id === data.id);
    const targetCatId = data.category_id || current?.category_id;

    if (data.is_selected && targetCatId) {
      nextSuppliers = nextSuppliers.map((s) =>
        s.category_id === targetCatId && s.id !== data.id
          ? { ...s, is_selected: false }
          : s
      );
    }

    nextSuppliers = nextSuppliers.map((s) =>
      s.id === data.id
        ? {
            ...s,
            ...data,
            estimated_price:
              data.estimated_price !== undefined
                ? data.estimated_price != null
                  ? Number(data.estimated_price)
                  : null
                : s.estimated_price,
            quoted_price:
              data.quoted_price !== undefined
                ? data.quoted_price != null
                  ? Number(data.quoted_price)
                  : null
                : s.quoted_price,
            final_price:
              data.final_price !== undefined
                ? data.final_price != null
                  ? Number(data.final_price)
                  : null
                : s.final_price,
            rating:
              data.rating !== undefined
                ? data.rating != null
                  ? Number(data.rating)
                  : null
                : s.rating,
            updated_at: new Date().toISOString(),
          }
        : s
    );

    setStoredBudgetSuppliers(nextSuppliers);

    try {
      await updateSupplierAction(data);
    } catch (e) {
      console.warn('Backend supplier update notice:', e);
    }
  };

  const selectSupplier = async (supplierId: string, categoryId: string) => {
    const currentSuppliers = getStoredBudgetSuppliers();
    const nextSuppliers = currentSuppliers.map((s) => {
      if (s.category_id === categoryId) {
        if (s.id === supplierId) {
          return { ...s, is_selected: true, status: 'selected' as const, updated_at: new Date().toISOString() };
        }
        return { ...s, is_selected: false, status: s.status === 'selected' ? 'quoted' as const : s.status };
      }
      return s;
    });

    setStoredBudgetSuppliers(nextSuppliers);

    try {
      await selectSupplierAction({ supplier_id: supplierId, category_id: categoryId });
    } catch (e) {
      console.warn('Backend select supplier notice:', e);
    }
  };

  const deleteSupplier = async (id: string) => {
    const nextSuppliers = getStoredBudgetSuppliers().filter((s) => s.id !== id);
    const nextPayments = getStoredBudgetPayments().filter((p) => p.supplier_id !== id);
    setStoredBudgetSuppliers(nextSuppliers);
    setStoredBudgetPayments(nextPayments);

    try {
      await deleteSupplierAction(id);
    } catch (e) {
      console.warn('Backend delete supplier notice:', e);
    }
  };

  // 3. Payments
  const createPayment = async (data: {
    supplier_id: string;
    amount: number;
    due_date?: string | null;
    paid_at?: string | null;
    status?: 'pending' | 'partial' | 'paid';
    notes?: string | null;
  }) => {
    const currentPayments = getStoredBudgetPayments();
    const newPaymentId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `p0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
    const paymentStatus = data.status || 'paid';
    const newPayment: BudgetPayment = {
      id: newPaymentId,
      supplier_id: data.supplier_id,
      wedding_id: WEDDING_ID,
      amount: Number(data.amount),
      due_date: data.due_date || null,
      paid_at:
        data.paid_at ||
        (paymentStatus === 'paid' || paymentStatus === 'partial'
          ? new Date().toISOString().split('T')[0]
          : null),
      status: paymentStatus,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const nextPayments = [...currentPayments, newPayment];
    setStoredBudgetPayments(nextPayments);

    try {
      const res = await createPaymentAction({
        ...data,
        id: newPaymentId,
        status: paymentStatus,
        paid_at: newPayment.paid_at,
      });
      if (res && res.id && res.id !== newPaymentId) {
        newPayment.id = res.id;
        setStoredBudgetPayments(
          getStoredBudgetPayments().map((p) => (p.id === newPaymentId ? { ...p, id: res.id } : p))
        );
      }
    } catch (e) {
      console.warn('Backend payment create notice:', e);
    }

    // If this payment was settled ('paid' or 'partial'), auto-adjust any existing scheduled 'Pago final' pending payment
    if (isPaymentSettled(newPayment)) {
      const sup = getStoredBudgetSuppliers().find((s) => s.id === data.supplier_id);
      if (sup) {
        const effPrice = getEffectiveSupplierPrice(sup);
        const allSupPayments = getStoredBudgetPayments().filter((p) => p.supplier_id === data.supplier_id);
        const totalSettled = allSupPayments
          .filter((p) => isPaymentSettled(p))
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const remaining = Math.max(0, effPrice - totalSettled);

        const scheduledFinal = allSupPayments.find(
          (p) => p.status === 'pending' && p.id !== newPayment.id
        );
        if (scheduledFinal) {
          if (remaining <= 0) {
            await deletePayment(scheduledFinal.id);
          } else if (Math.abs(scheduledFinal.amount - remaining) > 0.01) {
            await updatePayment({
              id: scheduledFinal.id,
              amount: remaining,
            });
          }
        }
      }
    }

    return newPayment;
  };

  const updatePayment = async (data: {
    id: string;
    amount?: number;
    due_date?: string | null;
    paid_at?: string | null;
    status?: 'pending' | 'partial' | 'paid';
    notes?: string | null;
  }) => {
    const currentPayments = getStoredBudgetPayments();
    const nextPayments = currentPayments.map((p) =>
      p.id === data.id
        ? {
            ...p,
            ...data,
            amount: data.amount != null ? Number(data.amount) : p.amount,
            paid_at:
              (data.status === 'paid' || data.status === 'partial') && !data.paid_at
                ? p.paid_at || new Date().toISOString().split('T')[0]
                : data.status === 'pending' && data.paid_at === undefined
                ? null
                : data.paid_at !== undefined
                ? data.paid_at
                : p.paid_at,
            updated_at: new Date().toISOString(),
          }
        : p
    );

    setStoredBudgetPayments(nextPayments);

    const updatedTarget = nextPayments.find((p) => p.id === data.id);

    try {
      await updatePaymentAction({
        ...data,
        paid_at: updatedTarget ? updatedTarget.paid_at : data.paid_at,
      });
    } catch (e) {
      console.warn('Backend payment update notice:', e);
    }
  };

  const deletePayment = async (id: string) => {
    const nextPayments = getStoredBudgetPayments().filter((p) => p.id !== id);
    setStoredBudgetPayments(nextPayments);

    try {
      await deletePaymentAction(id);
    } catch (e) {
      console.warn('Backend payment delete notice:', e);
    }
  };

  /**
   * Marks a scheduled ('pending') payment as paid today with 1 click
   */
  const markPaymentAsPaid = async (paymentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    await updatePayment({
      id: paymentId,
      status: 'paid',
      paid_at: today,
    });
  };

  /**
   * Sets or updates the Final Payment Due Date for a supplier.
   * Stores it as a scheduled ('pending') payment in budget_payments so Supabase persists it natively.
   */
  const setSupplierFinalPaymentDate = async (
    supplierId: string,
    dueDate: string | null,
    overrideEffectivePrice?: number
  ) => {
    const currentSuppliers = getStoredBudgetSuppliers();
    const sup = currentSuppliers.find((s) => s.id === supplierId);
    const effPrice =
      overrideEffectivePrice !== undefined
        ? overrideEffectivePrice
        : sup
        ? getEffectiveSupplierPrice(sup)
        : 0;

    const supPayments = getStoredBudgetPayments().filter((p) => p.supplier_id === supplierId);
    const totalSettled = supPayments
      .filter((p) => isPaymentSettled(p))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remainingAmount = Math.max(0, effPrice - totalSettled);

    // Find existing pending payment for this supplier
    const existingPending = supPayments.find((p) => p.status === 'pending');

    if (!dueDate) {
      if (existingPending && existingPending.notes?.toLowerCase().includes('pago final')) {
        await deletePayment(existingPending.id);
      } else if (existingPending) {
        await updatePayment({ id: existingPending.id, due_date: null });
      }
      return;
    }

    const targetAmount = remainingAmount > 0 ? remainingAmount : effPrice > 0 ? effPrice : 1;

    if (existingPending) {
      await updatePayment({
        id: existingPending.id,
        due_date: dueDate,
        amount: remainingAmount > 0 ? remainingAmount : existingPending.amount,
        notes: existingPending.notes || 'Pago final',
      });
    } else if (remainingAmount > 0 || effPrice > 0) {
      await createPayment({
        supplier_id: supplierId,
        amount: targetAmount,
        due_date: dueDate,
        paid_at: null,
        status: 'pending',
        notes: 'Pago final',
      });
    }
  };

  // 4. Menu Configuration
  const updateMenuConfig = async (data: {
    adult_price?: number;
    child_price?: number;
    adult_count_override?: number | null;
    child_count_override?: number | null;
    use_manual_counts?: boolean;
    supplier_id?: string | null;
    notes?: string | null;
    extra_expenses?: BanquetExpenseItem[];
  }) => {
    const currentMenu = getStoredBudgetMenuConfig();
    const nextConfig: BudgetMenuConfig = {
      ...currentMenu,
      ...data,
      adult_price: data.adult_price !== undefined ? Number(data.adult_price) : currentMenu.adult_price,
      child_price: data.child_price !== undefined ? Number(data.child_price) : currentMenu.child_price,
      use_manual_counts:
        data.use_manual_counts !== undefined ? data.use_manual_counts : currentMenu.use_manual_counts,
      extra_expenses:
        data.extra_expenses !== undefined ? data.extra_expenses : currentMenu.extra_expenses || [],
      updated_at: new Date().toISOString(),
    };

    setStoredBudgetMenuConfig(nextConfig);

    try {
      await updateMenuConfigAction({
        adult_price: nextConfig.adult_price,
        child_price: nextConfig.child_price,
        adult_count_override: nextConfig.adult_count_override,
        child_count_override: nextConfig.child_count_override,
        use_manual_counts: nextConfig.use_manual_counts,
        supplier_id: nextConfig.supplier_id,
        notes: nextConfig.notes,
        extra_expenses: nextConfig.extra_expenses,
      });
    } catch (e) {
      console.warn('Backend menu config notice:', e);
    }
  };

  return {
    isLoaded,
    categories,
    suppliers,
    payments,
    menuConfig,
    metrics,
    attendingAdults,
    attendingChildren,
    formatCurrency,
    // Operations
    createCategory,
    updateCategory,
    deleteCategory,
    createSupplier,
    updateSupplier,
    selectSupplier,
    deleteSupplier,
    createPayment,
    updatePayment,
    deletePayment,
    markPaymentAsPaid,
    setSupplierFinalPaymentDate,
    updateMenuConfig,
    updateGuestType,
    refresh: reloadData,
  };
}
