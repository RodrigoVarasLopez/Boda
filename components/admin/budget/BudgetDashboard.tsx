'use client';

import React from 'react';
import { BudgetMetrics, formatCurrency } from '@/lib/budget-data';
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Percent,
  Info,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

interface BudgetDashboardProps {
  metrics: BudgetMetrics;
  onOpenAddCategory: () => void;
  onOpenAddSupplier: () => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  metrics,
  onOpenAddCategory,
  onOpenAddSupplier,
}) => {
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
              Por abonar a proveedores contratados
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Alerts Banner */}
      {metrics.alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Alertas y avisos de presupuesto ({metrics.alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {metrics.alerts.slice(0, 4).map((alert, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-bg-card border border-border-subtle/80 flex items-start gap-2"
              >
                {alert.type === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-text-accent shrink-0 mt-0.5" />
                )}
                <span className="text-text-secondary leading-relaxed">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
