'use client';

import React, { useState, useMemo } from 'react';
import { useBudgetStore } from '@/lib/budget-store';
import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BudgetType,
  BUDGET_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
} from '@/lib/types';
import { getEffectiveSupplierPrice } from '@/lib/budget-data';
import { BudgetDashboard } from '@/components/admin/budget/BudgetDashboard';
import { MenuCostCalculator } from '@/components/admin/budget/MenuCostCalculator';
import { CategoryCard } from '@/components/admin/budget/CategoryCard';
import { CategoryFormModal } from '@/components/admin/budget/CategoryFormModal';
import { SupplierFormModal } from '@/components/admin/budget/SupplierFormModal';
import { SupplierComparatorDrawer } from '@/components/admin/budget/SupplierComparatorDrawer';
import { PaymentFormModal } from '@/components/admin/budget/PaymentFormModal';
import {
  Plus,
  Download,
  Search,
  Sparkles,
  CheckCircle2,
  Building,
} from 'lucide-react';

export default function AdminBudgetPage() {
  const {
    isLoaded,
    categories,
    suppliers,
    payments,
    menuConfig,
    metrics,
    attendingAdults,
    attendingChildren,
    createCategory,
    updateCategory,
    deleteCategory,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    selectSupplier,
    createPayment,
    updatePayment,
    deletePayment,
    updateMenuConfig,
  } = useBudgetStore();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | BudgetType | 'unpaid'>('all');

  // Modals & Drawers state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<BudgetCategory | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierModalCategory, setSupplierModalCategory] = useState<BudgetCategory | null>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<BudgetSupplier | null>(null);

  const [comparatorCategory, setComparatorCategory] = useState<BudgetCategory | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalSupplier, setPaymentModalSupplier] = useState<BudgetSupplier | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<BudgetPayment | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Map of category metrics by category id
  const categoryMetricsMap = useMemo(() => {
    const map: Record<
      string,
      {
        effectivePrice: number;
        paidAmount: number;
        pendingAmount: number;
        paymentStatus: 'none' | 'pending' | 'partial' | 'paid';
        selectedSupplier: BudgetSupplier | null;
      }
    > = {};

    for (const item of metrics.categoryBreakdown) {
      map[item.category.id] = {
        effectivePrice: item.effectivePrice,
        paidAmount: item.paidAmount,
        pendingAmount: item.pendingAmount,
        paymentStatus: item.paymentStatus,
        selectedSupplier: item.selectedSupplier,
      };
    }
    return map;
  }, [metrics.categoryBreakdown]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        // Search filter
        const matchesSearch =
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suppliers.some(
            (s) =>
              s.category_id === cat.id &&
              s.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

        if (!matchesSearch) return false;

        // Type / State filter
        if (typeFilter === 'all') return true;
        if (typeFilter === 'unpaid') {
          const catMetric = categoryMetricsMap[cat.id];
          return catMetric && catMetric.pendingAmount > 0;
        }
        return cat.budget_type === typeFilter;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [categories, suppliers, searchTerm, typeFilter, categoryMetricsMap]);

  // CSV Export handler
  const handleExportCSV = () => {
    try {
      const headers = [
        'Categoría',
        'Tipo Cálculo',
        'Proveedor Seleccionado',
        'Estado Proveedor',
        'Precio Estimado (€)',
        'Precio Presupuestado (€)',
        'Precio Final (€)',
        'Coste Contratado (€)',
        'Total Pagado (€)',
        'Total Pendiente (€)',
        'Estado Pago',
        'Notas / Comentarios',
      ];

      const rows = categories.map((cat) => {
        const catMetric = categoryMetricsMap[cat.id];
        const selectedSup =
          catMetric?.selectedSupplier ??
          suppliers.find((s) => s.category_id === cat.id && s.is_selected);

        // Calculate prices
        const isMenu =
          cat.name.toLowerCase().includes('menú') || cat.name.toLowerCase().includes('menu');
        const estPrice = isMenu
          ? metrics.menuSummary.total
          : selectedSup?.estimated_price ?? '';
        const quoPrice = isMenu
          ? metrics.menuSummary.total
          : selectedSup?.quoted_price ?? '';
        const finPrice = isMenu
          ? metrics.menuSummary.total
          : selectedSup?.final_price ?? '';
        const contractedPrice = catMetric?.effectivePrice ?? 0;
        const paidPrice = catMetric?.paidAmount ?? 0;
        const pendingPrice = catMetric?.pendingAmount ?? 0;

        const paymentStatusLabel =
          catMetric?.paymentStatus === 'paid'
            ? 'Pagado completo'
            : catMetric?.paymentStatus === 'partial'
            ? 'Pago parcial'
            : catMetric?.paymentStatus === 'pending'
            ? 'Pendiente de pago'
            : 'Sin pagos';

        const notes = selectedSup
          ? [selectedSup.comments, selectedSup.notes].filter(Boolean).join(' | ')
          : cat.description || '';

        return [
          `"${cat.name.replace(/"/g, '""')}"`,
          `"${BUDGET_TYPE_LABELS[cat.budget_type]}"`,
          `"${(selectedSup ? selectedSup.name : isMenu ? 'Catering Concejo' : 'Sin seleccionar').replace(/"/g, '""')}"`,
          `"${selectedSup ? SUPPLIER_STATUS_LABELS[selectedSup.status] : '-'}"`,
          estPrice !== '' ? Number(estPrice).toFixed(2) : '',
          quoPrice !== '' ? Number(quoPrice).toFixed(2) : '',
          finPrice !== '' ? Number(finPrice).toFixed(2) : '',
          Number(contractedPrice).toFixed(2),
          Number(paidPrice).toFixed(2),
          Number(pendingPrice).toFixed(2),
          `"${paymentStatusLabel}"`,
          `"${notes.replace(/"/g, '""')}"`,
        ].join(',');
      });

      // Add summary row
      const summaryRow = [
        '"TOTAL PRESUPUESTO"',
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        Number(metrics.totalContracted).toFixed(2),
        Number(metrics.totalPaid).toFixed(2),
        Number(metrics.totalPending).toFixed(2),
        '""',
        `"Generado: ${new Date().toLocaleDateString('es-ES')}"`,
      ].join(',');

      const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `presupuesto_boda_stephanie_rodrigo_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Presupuesto exportado a CSV exitosamente');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showToast('Error al exportar el archivo CSV');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-canvas flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">Cargando presupuesto y proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-fade-in border border-neutral-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            CRM &amp; Finanzas de la Boda
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-medium tracking-tight mt-1">
            Presupuesto &amp; Proveedores
          </h1>
          <p className="text-sm text-text-secondary mt-1 max-w-2xl">
            Control de gastos, comparación de ofertas de proveedores, seguimiento de pagos e impacto automático del menú por comensales.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-neutral-50 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Descargar presupuesto completo en formato CSV / Excel"
          >
            <Download className="w-4 h-4 text-text-muted" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => {
              setSupplierToEdit(null);
              setSupplierModalCategory(categories[0] || null);
              setIsSupplierModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-neutral-50 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Building className="w-4 h-4 text-primary" />
            <span>+ Proveedor</span>
          </button>

          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Añadir Categoría</span>
          </button>
        </div>
      </div>

      {/* 1. Dashboard Financial KPIs & Alerts */}
      <BudgetDashboard
        metrics={metrics}
        onOpenAddCategory={() => {
          setCategoryToEdit(null);
          setIsCategoryModalOpen(true);
        }}
        onOpenAddSupplier={() => {
          setSupplierToEdit(null);
          setSupplierModalCategory(categories[0] || null);
          setIsSupplierModalOpen(true);
        }}
      />

      {/* 2. Menu Cost Dynamic Calculator */}
      <MenuCostCalculator
        menuConfig={menuConfig}
        attendingAdults={attendingAdults}
        attendingChildren={attendingChildren}
        onUpdateMenuConfig={async (data) => {
          await updateMenuConfig(data);
          showToast('Cálculo de menú actualizado');
        }}
      />

      {/* 3. Categories & Suppliers Section */}
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-text-primary font-medium tracking-tight">
              Partidas y Proveedores
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {filteredCategories.length} categorías registradas · Solo computa el proveedor seleccionado por categoría
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar categoría o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border-subtle bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-neutral-100/70 p-1 rounded-xl border border-neutral-200/60 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Todas ({categories.length})
              </button>
              <button
                onClick={() => setTypeFilter('fixed')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === 'fixed'
                    ? 'bg-white text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Fijos
              </button>
              <button
                onClick={() => setTypeFilter('per_guest')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === 'per_guest'
                    ? 'bg-white text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Por comensal
              </button>
              <button
                onClick={() => setTypeFilter('mixed')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === 'mixed'
                    ? 'bg-white text-text-primary shadow-2xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Mixtos
              </button>
              <button
                onClick={() => setTypeFilter('unpaid')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  typeFilter === 'unpaid'
                    ? 'bg-amber-100 text-amber-900 shadow-2xs font-semibold'
                    : 'text-amber-800 hover:text-amber-900'
                }`}
              >
                Con pendiente
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl text-text-primary">No se encontraron categorías</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              {searchTerm
                ? 'Prueba con otros términos de búsqueda o elimina los filtros aplicados.'
                : 'Añade tu primera categoría de gasto para empezar a comparar proveedores y controlar pagos.'}
            </p>
            <button
              onClick={() => {
                setCategoryToEdit(null);
                setIsCategoryModalOpen(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir primera categoría</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category) => {
              const categorySuppliers = suppliers.filter((s) => s.category_id === category.id);
              const selectedSupplier = categorySuppliers.find((s) => s.is_selected) || null;
              const catMetric = categoryMetricsMap[category.id] || {
                effectivePrice: 0,
                paidAmount: 0,
                pendingAmount: 0,
                paymentStatus: 'none' as const,
                selectedSupplier: null,
              };

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  suppliers={categorySuppliers}
                  selectedSupplier={selectedSupplier}
                  effectivePrice={catMetric.effectivePrice}
                  paidAmount={catMetric.paidAmount}
                  pendingAmount={catMetric.pendingAmount}
                  paymentStatus={catMetric.paymentStatus}
                  onOpenComparator={(cat) => {
                    setComparatorCategory(cat);
                  }}
                  onOpenAddSupplier={(cat) => {
                    setSupplierToEdit(null);
                    setSupplierModalCategory(cat);
                    setIsSupplierModalOpen(true);
                  }}
                  onOpenAddPayment={(sup) => {
                    setPaymentModalSupplier(sup);
                    setPaymentToEdit(null);
                    setIsPaymentModalOpen(true);
                  }}
                  onEditCategory={(cat) => {
                    setCategoryToEdit(cat);
                    setIsCategoryModalOpen(true);
                  }}
                  onDeleteCategory={async (cat) => {
                    if (
                      window.confirm(
                        `¿Eliminar la categoría "${cat.name}" y todos sus proveedores asociados?`
                      )
                    ) {
                      await deleteCategory(cat.id);
                      showToast(`Categoría "${cat.name}" eliminada`);
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS & DRAWERS */}

      {/* 1. Category Form Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSubmit={async (data) => {
          if (data.id) {
            await updateCategory({
              id: data.id,
              name: data.name,
              budget_type: data.budget_type,
              icon: data.icon,
              description: data.description,
            });
            showToast('Categoría actualizada con éxito');
          } else {
            await createCategory({
              name: data.name,
              budget_type: data.budget_type,
              icon: data.icon,
              description: data.description,
            });
            showToast('Nueva categoría creada con éxito');
          }
        }}
      />

      {/* 2. Supplier Form Modal */}
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        categories={categories}
        initialCategory={supplierModalCategory}
        supplierToEdit={supplierToEdit}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSupplierToEdit(null);
          setSupplierModalCategory(null);
        }}
        onSubmit={async (data) => {
          if (data.id) {
            await updateSupplier({
              id: data.id,
              category_id: data.category_id,
              name: data.name,
              contact_name: data.contact_name,
              email: data.email,
              phone: data.phone,
              website: data.website,
              instagram: data.instagram,
              estimated_price: data.estimated_price,
              quoted_price: data.quoted_price,
              final_price: data.final_price,
              rating: data.rating,
              status: data.status,
              comments: data.comments,
              notes: data.notes,
              is_selected: data.is_selected,
            });
            showToast(`Proveedor "${data.name}" actualizado`);
          } else {
            await createSupplier({
              category_id: data.category_id,
              name: data.name,
              contact_name: data.contact_name,
              email: data.email,
              phone: data.phone,
              website: data.website,
              instagram: data.instagram,
              estimated_price: data.estimated_price,
              quoted_price: data.quoted_price,
              final_price: data.final_price,
              rating: data.rating,
              status: data.status,
              comments: data.comments,
              notes: data.notes,
              is_selected: data.is_selected,
            });
            showToast(`Proveedor "${data.name}" registrado`);
          }
        }}
      />

      {/* 3. Supplier Comparator Drawer */}
      <SupplierComparatorDrawer
        isOpen={Boolean(comparatorCategory)}
        category={comparatorCategory}
        suppliers={suppliers}
        onClose={() => setComparatorCategory(null)}
        onSelectSupplier={async (supplierId, categoryId) => {
          await selectSupplier(supplierId, categoryId);
          showToast('Proveedor predeterminado seleccionado');
        }}
        onEditSupplier={(sup) => {
          setSupplierToEdit(sup);
          const cat = categories.find((c) => c.id === sup.category_id) || null;
          setSupplierModalCategory(cat);
          setIsSupplierModalOpen(true);
        }}
        onDeleteSupplier={async (supId) => {
          const sup = suppliers.find((s) => s.id === supId);
          if (
            window.confirm(
              `¿Eliminar el proveedor "${sup?.name || ''}" y sus pagos registrados?`
            )
          ) {
            await deleteSupplier(supId);
            showToast('Proveedor eliminado');
          }
        }}
        onAddSupplier={(cat) => {
          setSupplierToEdit(null);
          setSupplierModalCategory(cat);
          setIsSupplierModalOpen(true);
        }}
        onAddPayment={(sup) => {
          setPaymentModalSupplier(sup);
          setPaymentToEdit(null);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* 4. Payment Form Modal */}
      {paymentModalSupplier && (
        <PaymentFormModal
          isOpen={isPaymentModalOpen}
          supplier={paymentModalSupplier}
          paymentToEdit={paymentToEdit}
          contractedTotal={getEffectiveSupplierPrice(paymentModalSupplier)}
          alreadyPaidAmount={payments
            .filter((p) => p.supplier_id === paymentModalSupplier.id && p.status === 'paid')
            .reduce((acc, p) => acc + p.amount, 0)}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentModalSupplier(null);
            setPaymentToEdit(null);
          }}
          onSubmit={async (data) => {
            if (data.id) {
              await updatePayment({
                id: data.id,
                amount: data.amount,
                due_date: data.due_date,
                paid_at: data.paid_at,
                status: data.status,
                notes: data.notes,
              });
              showToast('Pago actualizado con éxito');
            } else {
              await createPayment({
                supplier_id: data.supplier_id,
                amount: data.amount,
                due_date: data.due_date,
                paid_at: data.paid_at,
                status: data.status,
                notes: data.notes,
              });
              showToast('Pago registrado con éxito');
            }
          }}
        />
      )}
    </div>
  );
}
