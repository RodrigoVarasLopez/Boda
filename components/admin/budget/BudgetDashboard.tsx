'use client';

import React, { useState } from 'react';
import { BudgetMetrics, formatCurrency, formatDateES } from '@/lib/budget-data';
import { BudgetSupplier } from '@/lib/types';
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Info,
  Calendar,
  Bell,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BudgetDashboardProps {
  metrics: BudgetMetrics;
  onOpenAddCategory: () => void;
  onOpenAddSupplier: () => void;
  onOpenSupplierPayment?: (supplier: BudgetSupplier) => void;
  onMarkPaymentPaid?: (paymentId: string) => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  metrics,
  onOpenSupplierPayment,
  onMarkPaymentPaid,
}) => {
  const [showUnscheduled, setShowUnscheduled] = useState(false);

  const scheduledItems = metrics.upcomingFinalPayments.filter((item) => item.dueDate !== null);
  const unscheduledItems = metrics.upcomingFinalPayments.filter((item) => item.dueDate === null);

  const overdueOrUrgentCount = scheduledItems.filter(
    (i) => i.urgency === 'overdue' || i.urgency === 'urgent'
  ).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Presupuesto Total / Estimado */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">
              PRESUPUESTO TOTAL
            </span>
            <div className="p-2 rounded-xl bg-bg-secondary text-text-accent border border-border-subtle">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(metrics.totalEstimated)}
            </div>
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <span>Incluye catering ({formatCurrency(metrics.menuSummary.total)})</span>
            </p>
          </div>
        </div>

        {/* 2. Contratado */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">
              CONTRATADO
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(metrics.totalContracted)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {metrics.percentContracted}% del total
              </span>
            </div>
          </div>
        </div>

        {/* 3. Pagado */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">
              PAGADO
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(metrics.totalPaid)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.percentPaid)}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-text-muted whitespace-nowrap">
                {metrics.percentPaid}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Pendiente de Pago */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 relative overflow-hidden group hover:border-border-strong transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted">
              PENDIENTE
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(metrics.totalPending)}
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              {scheduledItems.length > 0
                ? `${scheduledItems.length} pago(s) final(es) con fecha de aviso`
                : 'Por abonar a proveedores contratados'}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Final Payments & Deadlines Tracker */}
      {metrics.upcomingFinalPayments.length > 0 && (
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl border ${
                  overdueOrUrgentCount > 0
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-lg font-bold text-text-primary">
                    Avisos y Calendario de Pago Final
                  </h3>
                  {scheduledItems.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {scheduledItems.length} con fecha programada
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  Seguimiento de fechas límite para liquidar el importe restante de cada proveedor
                </p>
              </div>
            </div>

            {unscheduledItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowUnscheduled(!showUnscheduled)}
                className="text-xs text-text-secondary hover:text-text-primary font-medium flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg-secondary/60 border border-border-subtle cursor-pointer self-start sm:self-auto"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {unscheduledItems.length} proveedor(es) sin fecha límite
                </span>
                {showUnscheduled ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Scheduled Final Payments Grid */}
          {scheduledItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scheduledItems.map((item) => {
                const isOverdue = item.urgency === 'overdue';
                const isUrgent = item.urgency === 'urgent';
                return (
                  <div
                    key={item.supplier.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                      isOverdue
                        ? 'bg-rose-50/60 border-rose-300'
                        : isUrgent
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-bg-secondary/30 border-border-subtle'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                            {item.category.name}
                          </span>
                          <h4 className="text-sm font-bold text-text-primary">
                            {item.supplier.name}
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : isUrgent
                              ? 'bg-amber-200/80 text-amber-900 border-amber-400'
                              : 'bg-white text-text-secondary border-border-subtle'
                          }`}
                        >
                          {item.daysUntilDue !== null && item.daysUntilDue < 0
                            ? `Vencido (${Math.abs(item.daysUntilDue)}d)`
                            : item.daysUntilDue === 0
                            ? '¡Vence hoy!'
                            : `En ${item.daysUntilDue} días`}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-text-secondary">
                          Fecha límite:{' '}
                          <strong className="text-text-primary">
                            {formatDateES(item.dueDate)}
                          </strong>
                        </span>
                        <span className="text-sm font-mono font-bold text-amber-900">
                          {formatCurrency(item.pendingAmount)}
                        </span>
                      </div>

                      {item.paidAmount > 0 && (
                        <p className="text-[10px] text-emerald-700 font-medium">
                          ✓ Ya abonado: {formatCurrency(item.paidAmount)} de{' '}
                          {formatCurrency(item.effectivePrice)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle/50">
                      {item.scheduledPayment && onMarkPaymentPaid && (
                        <button
                          type="button"
                          onClick={() => onMarkPaymentPaid(item.scheduledPayment!.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Marcar pagado</span>
                        </button>
                      )}
                      {onOpenSupplierPayment && (
                        <button
                          type="button"
                          onClick={() => onOpenSupplierPayment(item.supplier)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-100 text-text-primary border border-border-subtle text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-3 h-3 text-primary" />
                          <span>Gestionar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Tienes <strong>{unscheduledItems.length} proveedor(es)</strong> con saldo pendiente, pero aún no has indicado la fecha límite del pago final.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUnscheduled(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Asignar fechas de pago final
              </button>
            </div>
          )}

          {/* Unscheduled Suppliers Drawer */}
          {showUnscheduled && unscheduledItems.length > 0 && (
            <div className="pt-2 border-t border-border-subtle space-y-2 animate-fade-in">
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                Proveedores pendientes de fijar fecha de pago final:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {unscheduledItems.map((item) => (
                  <div
                    key={item.supplier.id}
                    className="p-3 rounded-xl bg-bg-secondary/30 border border-border-subtle flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] text-text-muted block truncate">
                        {item.category.name}
                      </span>
                      <span className="font-semibold text-text-primary block truncate">
                        {item.supplier.name}
                      </span>
                      <span className="text-[11px] font-mono text-amber-800 font-medium">
                        Pendiente: {formatCurrency(item.pendingAmount)}
                      </span>
                    </div>
                    {onOpenSupplierPayment && (
                      <button
                        type="button"
                        onClick={() => onOpenSupplierPayment(item.supplier)}
                        className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Fijar fecha</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Alerts Banner */}
      {metrics.alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Alertas y avisos de presupuesto ({metrics.alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {metrics.alerts.slice(0, 6).map((alert, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                  alert.type === 'error'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : alert.type === 'warning'
                    ? 'bg-bg-card border-amber-300/80 text-text-secondary'
                    : 'bg-bg-card border-border-subtle/80 text-text-secondary'
                }`}
              >
                {alert.type === 'error' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                ) : alert.type === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-text-accent shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

