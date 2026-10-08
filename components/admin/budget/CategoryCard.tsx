'use client';

import React from 'react';
import {
  BudgetCategory,
  BudgetSupplier,
  BUDGET_TYPE_LABELS,
  SUPPLIER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '@/lib/types';
import { formatCurrency, getEffectiveSupplierPrice } from '@/lib/budget-data';
import {
  Sparkles,
  Flower2,
  Music,
  Headphones,
  Crown,
  Shirt,
  Flame,
  Camera,
  Guitar,
  Mic2,
  Wine,
  UtensilsCrossed,
  Receipt,
  Star,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  MoreVertical,
  Edit2,
  Trash2,
  CreditCard,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Flower2,
  Sparkles,
  Music,
  Headphones,
  Crown,
  Shirt,
  Flame,
  Camera,
  Guitar,
  Mic2,
  Wine,
  UtensilsCrossed,
  Receipt,
};

interface CategoryCardProps {
  category: BudgetCategory;
  suppliers: BudgetSupplier[];
  selectedSupplier: BudgetSupplier | null;
  effectivePrice: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'none' | 'pending' | 'partial' | 'paid';
  onOpenComparator: (category: BudgetCategory) => void;
  onOpenAddSupplier: (category: BudgetCategory) => void;
  onOpenAddPayment: (supplier: BudgetSupplier) => void;
  onEditCategory: (category: BudgetCategory) => void;
  onDeleteCategory: (category: BudgetCategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  suppliers,
  selectedSupplier,
  effectivePrice,
  paidAmount,
  pendingAmount,
  paymentStatus,
  onOpenComparator,
  onOpenAddSupplier,
  onOpenAddPayment,
  onEditCategory,
  onDeleteCategory,
}) => {
  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Sparkles;

  // Star rating renderer
  const renderStars = (rating?: number | null) => {
    if (!rating) return null;
    const fullStars = Math.round(rating / 2);
    return (
      <div className="flex items-center gap-1">
        <div className="flex text-amber-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3 h-3 ${star <= fullStars ? 'fill-amber-500' : 'text-border-subtle'}`}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono font-semibold text-text-primary ml-0.5">
          {rating}/10
        </span>
      </div>
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-strong shadow-card flex flex-col justify-between space-y-4 transition-all duration-200 group">
      {/* Top Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-bg-secondary text-text-accent border border-border-subtle group-hover:scale-105 transition-transform">
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-text-primary group-hover:text-text-accent transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-text-muted px-1.5 py-0.5 rounded-md bg-bg-secondary border border-border-subtle">
                {BUDGET_TYPE_LABELS[category.budget_type]}
              </span>
              <span className="text-[10px] text-text-muted">
                {suppliers.length} {suppliers.length === 1 ? 'proveedor' : 'proveedores'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Menu Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEditCategory(category)}
            title="Editar categoría"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            title="Eliminar categoría"
            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Supplier Body */}
      <div className="p-3.5 rounded-xl bg-bg-secondary/35 border border-border-subtle/80 space-y-2">
        {selectedSupplier ? (
          <div>
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text-primary">
                    {selectedSupplier.name}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                    ✓ Seleccionado
                  </span>
                </div>
                {renderStars(selectedSupplier.rating)}
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-serif font-bold text-text-primary">
                  {formatCurrency(effectivePrice)}
                </span>
                <span className="block text-[9px] text-text-muted font-mono">
                  {selectedSupplier.final_price != null
                    ? 'Precio final'
                    : selectedSupplier.quoted_price != null
                    ? 'Presupuesto'
                    : 'Estimado'}
                </span>
              </div>
            </div>

            {/* Comments / Notes preview */}
            {selectedSupplier.comments && (
              <p className="text-[11px] text-text-muted line-clamp-1 italic mt-1.5">
                &ldquo;{selectedSupplier.comments}&rdquo;
              </p>
            )}

            {/* Payment Status Bar */}
            <div className="pt-2 mt-2 border-t border-border-subtle/50 flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-1.5">
                {paymentStatus === 'paid' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Pagado
                  </span>
                )}
                {paymentStatus === 'partial' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Clock className="w-3 h-3" /> Pagado: {formatCurrency(paidAmount)}
                  </span>
                )}
                {paymentStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Pendiente: {formatCurrency(pendingAmount)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenAddPayment(selectedSupplier)}
                className="text-[11px] text-text-accent hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Pago</span>
              </button>
            </div>
          </div>
        ) : category.name.toLowerCase() === 'menú' ? (
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-semibold text-text-primary">
                Banquete Bodega Concejo
              </span>
              <span className="block text-[11px] text-text-muted">
                Calculado según asistentes
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-serif font-bold text-text-primary">
                {formatCurrency(effectivePrice)}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center space-y-1.5">
            <span className="text-[11px] text-text-muted block">
              Sin proveedor seleccionado aún
            </span>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => onOpenAddSupplier(category)}
                className="px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle hover:border-border-strong text-text-primary text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-text-accent" />
                <span>Añadir proveedor</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-subtle/50 text-xs">
        <button
          onClick={() => onOpenComparator(category)}
          className="px-3 py-1.5 rounded-xl border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-secondary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-text-accent" />
          <span>Comparar ({suppliers.length})</span>
        </button>

        <button
          onClick={() => onOpenAddSupplier(category)}
          className="p-1.5 rounded-xl border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          title="Añadir proveedor a esta categoría"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
