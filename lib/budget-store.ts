'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BudgetMenuConfig,
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
      window.removeEventListener(BUDGET_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadData]);

  // Adults and Children attendees from live RSVP store
  const attendingAdults = stats.attendingAdults || 0;
  const attendingChildren = stats.attendingChildren || 0;

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
    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      wedding_id: WEDDING_ID,
      name: data.name,
      description: data.description || null,
      budget_type: data.budget_type,
      icon: data.icon || 'Sparkles',
      sort_order: data.sort_order ?? categories.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const nextCats = [...categories, newCat];
    setStoredBudgetCategories(nextCats);

    try {
      await createCategoryAction(data);
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
    const nextCats = categories.map((c) =>
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
    const nextCats = categories.filter((c) => c.id !== id);
    const nextSuppliers = suppliers.filter((s) => s.category_id !== id);
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
    const newSupplierId = `sup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const isSelected = Boolean(data.is_selected);

    // If marked selected, unselect others in same category
    let nextSuppliers = suppliers;
    if (isSelected) {
      nextSuppliers = suppliers.map((s) =>
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
      await createSupplierAction(data);
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
    let nextSuppliers = suppliers;
    const current = suppliers.find((s) => s.id === data.id);
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
    const nextSuppliers = suppliers.map((s) => {
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
    const nextSuppliers = suppliers.filter((s) => s.id !== id);
    const nextPayments = payments.filter((p) => p.supplier_id !== id);
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
    const newPayment: BudgetPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      supplier_id: data.supplier_id,
      wedding_id: WEDDING_ID,
      amount: Number(data.amount),
      due_date: data.due_date || null,
      paid_at: data.paid_at || (data.status === 'paid' ? new Date().toISOString() : null),
      status: data.status || 'pending',
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setStoredBudgetPayments([...payments, newPayment]);

    try {
      await createPaymentAction(data);
    } catch (e) {
      console.warn('Backend payment create notice:', e);
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
    const nextPayments = payments.map((p) =>
      p.id === data.id
        ? {
            ...p,
            ...data,
            amount: data.amount != null ? Number(data.amount) : p.amount,
            paid_at:
              data.status === 'paid' && !data.paid_at
                ? p.paid_at || new Date().toISOString()
                : data.paid_at !== undefined
                ? data.paid_at
                : p.paid_at,
            updated_at: new Date().toISOString(),
          }
        : p
    );

    setStoredBudgetPayments(nextPayments);

    try {
      await updatePaymentAction(data);
    } catch (e) {
      console.warn('Backend payment update notice:', e);
    }
  };

  const deletePayment = async (id: string) => {
    const nextPayments = payments.filter((p) => p.id !== id);
    setStoredBudgetPayments(nextPayments);

    try {
      await deletePaymentAction(id);
    } catch (e) {
      console.warn('Backend payment delete notice:', e);
    }
  };

  // 4. Menu Configuration
  const updateMenuConfig = async (data: {
    adult_price: number;
    child_price: number;
    adult_count_override?: number | null;
    child_count_override?: number | null;
    use_manual_counts: boolean;
    supplier_id?: string | null;
    notes?: string | null;
  }) => {
    const nextConfig: BudgetMenuConfig = {
      ...menuConfig,
      ...data,
      adult_price: Number(data.adult_price),
      child_price: Number(data.child_price),
      updated_at: new Date().toISOString(),
    };

    setStoredBudgetMenuConfig(nextConfig);

    try {
      await updateMenuConfigAction(data);
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
    updateMenuConfig,
    updateGuestType,
    refresh: reloadData,
  };
}
