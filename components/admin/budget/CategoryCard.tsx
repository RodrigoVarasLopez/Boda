'use client';

import React from 'react';
import {
  BudgetCategory,
  BudgetSupplier,
  BudgetPayment,
  BUDGET_TYPE_LABELS,
} from '@/lib/types';
import {
  formatCurrency,
  isPaymentSettled,
  formatDateES,
} from '@/lib/budget-data';
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
  Bus,
  Car,
  Gift,
  Heart,
  Scissors,
  Cake,
  Palette,
  Star,
  CheckCircle2,
  Clock,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CreditCard,
  Calendar,
  AlertTriangle,
  Bell,
  Check,
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
  Bus,
  Car,
  Gift,
  Heart,
  Scissors,
  Cake,
  Palette,
};

interface CategoryCardProps {
  category: BudgetCategory;
  suppliers: BudgetSupplier[];
  selectedSupplier: BudgetSupplier | null;
  effectivePrice: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: 'none' | 'pending' | 'partial' | 'paid';
  categoryPayments?: BudgetPayment[];
  finalPaymentDueDate?: string | null;
  daysUntilFinalPayment?: number | null;
  onOpenComparator: (category: BudgetCategory) => void;
  onOpenAddSupplier: (category: BudgetCategory) => void;
  onOpenAddPayment: (supplier: BudgetSupplier, paymentToEdit?: BudgetPayment | null) => void;
  onMarkPaymentPaid?: (paymentId: string) => void;
  onDeletePayment?: (paymentId: string) => void;
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
  categoryPayments = [],
  finalPaymentDueDate = null,
  daysUntilFinalPayment = null,
  onOpenComparator,
  onOpenAddSupplier,
  onOpenAddPayment,
  onMarkPaymentPaid,
  onDeletePayment,
  onEditCategory,
  onDeleteCategory,
}) => {
  const IconComponent = (category.icon && ICON_MAP[category.icon]) || Sparkles;
  const activeSupplier =
    selectedSupplier || (suppliers.length === 1 ? suppliers[0] : null);

  const percentPaid =
    effectivePrice > 0 ? Math.min(100, Math.round((paidAmount / effectivePrice) * 100)) : 0;

  const settledPayments = categoryPayments.filter((p) => isPaymentSettled(p));
  const pendingScheduledPayments = categoryPayments
    .filter((p) => !isPaymentSettled(p))
    .sort((a, b) => (a.due_date || '9999-12-31').localeCompare(b.due_date || '9999-12-31'));

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
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteCategory(category)}
            title="Eliminar categoría"
            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Supplier Body */}
      <div className="p-3.5 rounded-xl bg-bg-secondary/35 border border-border-subtle/80 space-y-3">
        {activeSupplier ? (
          <div className="space-y-2.5">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-text-primary truncate">
                    {activeSupplier.name}
                  </span>
                  {activeSupplier.is_selected ? (
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300">
                      ✓ Seleccionado
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300">
                      Única opción
                    </span>
                  )}
                </div>
                {renderStars(activeSupplier.rating)}
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-serif font-bold text-text-primary">
                  {formatCurrency(effectivePrice)}
                </span>
                <span className="block text-[9px] text-text-muted font-mono">
                  {activeSupplier.final_price != null
                    ? 'Precio final'
                    : activeSupplier.quoted_price != null
                    ? 'Presupuesto'
                    : 'Estimado'}
                </span>
              </div>
            </div>

            {/* Comments / Notes preview */}
            {activeSupplier.comments && (
              <p className="text-[11px] text-text-muted line-clamp-1 italic">
                &ldquo;{activeSupplier.comments}&rdquo;
              </p>
            )}

            {/* Payment Progress & Summary */}
            <div className="pt-2 border-t border-border-subtle/60 space-y-2">
              {/* Progress bar */}
              {effectivePrice > 0 && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-neutral-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        paymentStatus === 'paid' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-emerald-700">
                      Pagado: {formatCurrency(paidAmount)} ({percentPaid}%)
                    </span>
                    {pendingAmount > 0 ? (
                      <span className="font-semibold text-amber-800">
                        Falta: {formatCurrency(pendingAmount)}
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Liquidado
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Final Payment Due Date Alert / Badge */}
              {pendingAmount > 0 && (
                <div>
                  {finalPaymentDueDate ? (
                    <div
                      onClick={() => onOpenAddPayment(activeSupplier)}
                      className={`p-2 rounded-lg border text-[10px] flex items-center justify-between gap-1.5 cursor-pointer transition-colors ${
                        daysUntilFinalPayment !== null && daysUntilFinalPayment <= 0
                          ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100/70'
                          : daysUntilFinalPayment !== null && daysUntilFinalPayment <= 30
                          ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100/70'
                          : 'bg-white/80 border-border-subtle text-text-secondary hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {daysUntilFinalPayment !== null && daysUntilFinalPayment <= 30 ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span className="truncate font-medium">
                          {pendingScheduledPayments.length > 1 ? 'Próximo pago:' : 'Fecha pago:'}{' '}
                          <strong>{formatDateES(finalPaymentDueDate)}</strong>
                          {pendingScheduledPayments.length > 1 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200/70 text-amber-950 text-[9px] font-bold">
                              +{pendingScheduledPayments.length - 1} más
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="font-bold shrink-0">
                        {daysUntilFinalPayment !== null && daysUntilFinalPayment < 0
                          ? `Vencido (${Math.abs(daysUntilFinalPayment)}d)`
                          : daysUntilFinalPayment === 0
                          ? '¡Hoy!'
                          : daysUntilFinalPayment !== null
                          ? `en ${daysUntilFinalPayment} días`
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAddPayment(activeSupplier)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-dashed border-amber-400/80 bg-amber-50/40 hover:bg-amber-50 text-amber-900 text-[10px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bell className="w-3 h-3 text-amber-600" />
                      <span>+ Añadir fechas de pago / plazos</span>
                    </button>
                  )}
                </div>
              )}

              {/* Registered Payments Mini-List */}
              {(settledPayments.length > 0 || pendingScheduledPayments.length > 0) && (
                <div className="space-y-1 pt-1">
                  {settledPayments.map((pay) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between text-[10px] bg-white/70 px-2 py-1 rounded-md border border-border-subtle/60"
                    >
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span className="font-mono font-semibold text-text-primary">
                          {formatCurrency(Number(pay.amount))}
                        </span>
                        <span className="text-text-muted truncate">
                          · {pay.notes || (pay.status === 'partial' ? 'Señal / Parcial' : 'Pagado')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={() => onOpenAddPayment(activeSupplier, pay)}
                          title="Editar pago"
                          className="text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        {onDeletePayment && (
                          <button
                            type="button"
                            onClick={() => onDeletePayment(pay.id)}
                            title="Eliminar pago"
                            className="text-text-muted hover:text-rose-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {pendingScheduledPayments.map((pay) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between text-[10px] bg-amber-50/60 px-2 py-1 rounded-md border border-amber-200/80"
                    >
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="font-mono font-semibold text-amber-900">
                          {formatCurrency(Number(pay.amount))}
                        </span>
                        {pay.due_date && (
                          <span className="font-semibold text-amber-950 shrink-0">
                            ({formatDateES(pay.due_date)})
                          </span>
                        )}
                        <span className="text-amber-800 truncate">
                          · {pay.notes || 'Plazo programado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {onMarkPaymentPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkPaymentPaid(pay.id)}
                            title="Marcar este pago como abonado hoy"
                            className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>Pagado</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAddPayment(activeSupplier, pay)}
                          title="Editar pago programado"
                          className="text-text-muted hover:text-text-primary p-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        {onDeletePayment && (
                          <button
                            type="button"
                            onClick={() => onDeletePayment(pay.id)}
                            title="Eliminar plazo programado"
                            className="text-text-muted hover:text-rose-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Manage Payments Action */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenAddPayment(activeSupplier, null)}
                  className="w-full py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Registrar pago / Gestionar hitos</span>
                </button>
              </div>
            </div>
          </div>
        ) : category.name.toLowerCase() === 'menú' ? (
          <div className="space-y-2.5">
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
            <button
              type="button"
              onClick={() => onOpenAddSupplier(category)}
              className="w-full py-1.5 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Vincular proveedor de Catering para pagos</span>
            </button>
          </div>
        ) : suppliers.length > 1 ? (
          <div className="py-2 text-center space-y-2">
            <span className="text-[11px] text-amber-800 font-medium block">
              Tienes {suppliers.length} presupuestos · Elige 1 proveedor para activar pagos
            </span>
            <button
              onClick={() => onOpenComparator(category)}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>Comparar y elegir proveedor</span>
            </button>
          </div>
        ) : (
          <div className="py-2 text-center space-y-1.5">
            <span className="text-[11px] text-text-muted block">
              Sin proveedor registrado aún
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

