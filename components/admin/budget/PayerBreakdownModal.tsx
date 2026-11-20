'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetPayment, BudgetSupplier } from '@/lib/types';
import {
  PayerBreakdownSummary,
  PayerSummary,
  formatCurrency,
  formatDateES,
} from '@/lib/budget-data';
import {
  X,
  Users,
  Download,
  Edit2,
  CheckCircle2,
  Scale,
  UserCheck,
  UserPlus,
  Clock,
} from 'lucide-react';

interface PayerBreakdownModalProps {
  isOpen: boolean;
  weddingTitle?: string;
  breakdown: PayerBreakdownSummary;
  defaultMembers: string[];
  onClose: () => void;
  onEditPayment?: (supplier: BudgetSupplier, payment: BudgetPayment) => void;
}

function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getRoleLabel(role: PayerSummary['role']): string {
  if (role === 'member') return 'Miembro de la boda';
  if (role === 'third_party') return 'Tercero';
  return 'Sin asignar';
}

export const PayerBreakdownModal: React.FC<PayerBreakdownModalProps> = ({
  isOpen,
  weddingTitle = 'Stephanie & Rodrigo',
  breakdown,
  onClose,
  onEditPayment,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedPayerKey, setSelectedPayerKey] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedPayerKey('all');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const memberPayers = breakdown.payers.filter((p) => p.role === 'member');
  const hasTwoMembers = memberPayers.length === 2;
  const memberA = hasTwoMembers ? memberPayers[0] : null;
  const memberB = hasTwoMembers ? memberPayers[1] : null;
  const memberDiff =
    memberA && memberB ? Math.abs(memberA.totalPaid - memberB.totalPaid) : 0;
  const aheadMember =
    memberA && memberB && memberDiff >= 0.01
      ? memberA.totalPaid > memberB.totalPaid
        ? memberA
        : memberB
      : null;
  const behindMember =
    memberA && memberB && aheadMember
      ? aheadMember.key === memberA.key
        ? memberB
        : memberA
      : null;

  const visiblePayers =
    selectedPayerKey === 'all'
      ? breakdown.payers
      : breakdown.payers.filter((p) => p.key === selectedPayerKey);

  const handleExportBreakdownCSV = () => {
    const headers = [
      'Pagador',
      'Rol',
      'Categoría',
      'Proveedor',
      'Concepto',
      'Fecha de pago',
      'Estado',
      'Importe (€)',
    ];

    const rows: string[] = [];
    for (const payer of breakdown.payers) {
      for (const detail of payer.payments) {
        const statusLabel =
          detail.payment.status === 'partial' ? 'Señal / Parcial' : 'Pagado';
        rows.push(
          [
            `"${payer.name.replace(/"/g, '""')}"`,
            `"${getRoleLabel(payer.role)}"`,
            `"${detail.categoryName.replace(/"/g, '""')}"`,
            `"${detail.supplierName.replace(/"/g, '""')}"`,
            `"${(detail.payment.notes || 'Pago registrado').replace(/"/g, '""')}"`,
            `"${detail.payment.paid_at ? detail.payment.paid_at.split('T')[0] : ''}"`,
            `"${statusLabel}"`,
            Number(detail.payment.amount).toFixed(2),
          ].join(',')
        );
      }
    }

    const summaryRows = breakdown.payers.map((payer) =>
      [
        `"SUBTOTAL ${payer.name.replace(/"/g, '""')}"`,
        `"${getRoleLabel(payer.role)}"`,
        '""',
        `"${payer.paidCount} pago(s)"`,
        `"${payer.percentOfTotalPaid}% del total abonado"`,
        '""',
        '""',
        Number(payer.totalPaid).toFixed(2),
      ].join(',')
    );

    const totalRow = [
      '"TOTAL ABONADO"',
      '""',
      '""',
      `"${breakdown.totalSettledCount} pago(s)"`,
      '""',
      '""',
      '""',
      Number(breakdown.totalPaid).toFixed(2),
    ].join(',');

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows, '', ...summaryRows, totalRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `desglose_pagos_por_persona_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-4xl bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border-subtle bg-bg-canvas/40 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                Reparto Financiero · {weddingTitle}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-text-primary font-medium tracking-tight mt-0.5">
                Desglose de Gastos por Pagador
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Totales abonados por cada miembro de la boda y terceros colaboradores
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar desglose"
            className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* 1. Global Summary + Stacked Proportional Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-semibold">
                  TOTAL ABONADO HASTA LA FECHA
                </span>
                <div className="flex items-baseline gap-2.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary">
                    {formatCurrency(breakdown.totalPaid)}
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    en {breakdown.totalSettledCount}{' '}
                    {breakdown.totalSettledCount === 1 ? 'pago realizado' : 'pagos realizados'}
                  </span>
                </div>
              </div>

              {breakdown.thirdPartiesTotalPaid > 0 && (
                <div className="flex items-center gap-3 text-xs bg-white px-3 py-2 rounded-xl border border-border-subtle">
                  <div>
                    <span className="text-[10px] text-text-muted block">Pareja</span>
                    <span className="font-mono font-bold text-text-primary">
                      {formatCurrency(breakdown.membersTotalPaid)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border-subtle" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Terceros</span>
                    <span className="font-mono font-bold text-teal-700">
                      {formatCurrency(breakdown.thirdPartiesTotalPaid)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-segment Stacked Bar */}
            {breakdown.totalPaid > 0 && (
              <div className="space-y-2">
                <div className="w-full h-3 rounded-full bg-neutral-200 overflow-hidden flex">
                  {breakdown.payers
                    .filter((p) => p.totalPaid > 0)
                    .map((payer) => (
                      <div
                        key={payer.key}
                        style={{ width: `${payer.percentOfTotalPaid}%` }}
                        className={`${payer.style.bar} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                        title={`${payer.name}: ${formatCurrency(payer.totalPaid)} (${payer.percentOfTotalPaid}%)`}
                      />
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
                  {breakdown.payers
                    .filter((p) => p.totalPaid > 0)
                    .map((payer) => (
                      <div key={payer.key} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${payer.style.bar}`} />
                        <span className="font-semibold text-text-primary">{payer.name}</span>
                        <span className="font-mono text-text-muted">
                          {formatCurrency(payer.totalPaid)} ({payer.percentOfTotalPaid}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Couple Balance Comparison Strip */}
            {hasTwoMembers && breakdown.membersTotalPaid > 0 && memberA && memberB && (
              <div className="pt-3 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Scale className="w-4 h-4 text-primary shrink-0" />
                  {aheadMember && behindMember ? (
                    <span>
                      <strong className="text-text-primary">{aheadMember.name}</strong> ha
                      aportado{' '}
                      <strong className="font-mono text-primary">
                        {formatCurrency(memberDiff)}
                      </strong>{' '}
                      más que <strong className="text-text-primary">{behindMember.name}</strong>
                    </span>
                  ) : (
                    <span>
                      Aportación equilibrada al 50% entre{' '}
                      <strong className="text-text-primary">{memberA.name}</strong> y{' '}
                      <strong className="text-text-primary">{memberB.name}</strong>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-text-muted shrink-0">
                  Mitad pareja (50%):{' '}
                  <strong className="font-mono text-text-primary">
                    {formatCurrency(breakdown.membersTotalPaid / 2)}
                  </strong>{' '}
                  / persona
                </span>
              </div>
            )}
          </div>

          {/* 2. Clickable Payer Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {breakdown.payers.map((payer) => {
              const isSelected = selectedPayerKey === payer.key;
              return (
                <button
                  key={payer.key}
                  type="button"
                  onClick={() =>
                    setSelectedPayerKey(isSelected ? 'all' : payer.key)
                  }
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? `bg-bg-card border-primary ring-2 ${payer.style.ring} shadow-soft`
                      : 'bg-bg-card border-border-subtle hover:border-border-strong shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl font-serif font-bold text-sm flex items-center justify-center shrink-0 ${payer.style.avatar}`}
                      >
                        {payer.role === 'unassigned' ? '?' : getInitials(payer.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-text-primary truncate">
                          {payer.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${payer.style.badge}`}
                        >
                          {payer.role === 'member' ? (
                            <UserCheck className="w-2.5 h-2.5" />
                          ) : payer.role === 'third_party' ? (
                            <UserPlus className="w-2.5 h-2.5" />
                          ) : null}
                          {getRoleLabel(payer.role)}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-text-muted shrink-0">
                      {payer.percentOfTotalPaid}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-border-subtle/60">
                    <div>
                      <span className="text-xl font-serif font-bold text-text-primary block">
                        {formatCurrency(payer.totalPaid)}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {payer.paidCount}{' '}
                        {payer.paidCount === 1 ? 'pago abonado' : 'pagos abonados'}
                      </span>
                    </div>

                    {payer.scheduledCount > 0 && (
                      <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        +{formatCurrency(payer.scheduledTotal)} prog.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. Filter Pills + Itemized Breakdown */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-bold text-text-primary">
                Detalle de Pagos Realizados
              </h3>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedPayerKey('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    selectedPayerKey === 'all'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-secondary/50 text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  Todos ({breakdown.totalSettledCount})
                </button>
                {breakdown.payers.map((payer) => (
                  <button
                    key={payer.key}
                    type="button"
                    onClick={() => setSelectedPayerKey(payer.key)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      selectedPayerKey === payer.key
                        ? 'bg-primary text-white border-primary'
                        : 'bg-bg-secondary/50 text-text-secondary border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {payer.name} ({payer.paidCount})
                  </button>
                ))}
              </div>
            </div>

            {breakdown.totalSettledCount === 0 ? (
              <div className="p-8 rounded-2xl bg-bg-secondary/30 border border-border-subtle text-center space-y-1.5">
                <p className="text-sm font-semibold text-text-primary">
                  Aún no hay pagos abonados registrados
                </p>
                <p className="text-xs text-text-muted">
                  Cuando registres pagos en tus proveedores o en el banquete, podrás asignar quién los ha pagado y ver aquí el desglose completo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePayers.map((payer) => {
                  if (
                    selectedPayerKey === 'all' &&
                    payer.payments.length === 0 &&
                    payer.scheduledPayments.length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={payer.key}
                      className="rounded-2xl border border-border-subtle bg-bg-secondary/20 overflow-hidden"
                    >
                      {/* Payer Group Header */}
                      <div className="px-4 py-3 bg-bg-secondary/50 border-b border-border-subtle flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${payer.style.bar}`} />
                          <span className="text-sm font-bold text-text-primary truncate">
                            {payer.name}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${payer.style.badge}`}
                          >
                            {getRoleLabel(payer.role)}
                          </span>
                        </div>
                        <span className="font-serif text-base font-bold text-text-primary shrink-0">
                          {formatCurrency(payer.totalPaid)}
                        </span>
                      </div>

                      {/* Settled Payments List */}
                      {payer.payments.length === 0 ? (
                        <div className="p-4 text-xs text-text-muted text-center">
                          {payer.name} todavía no tiene pagos abonados registrados.
                        </div>
                      ) : (
                        <div className="divide-y divide-border-subtle/70">
                          {payer.payments.map((detail) => (
                            <div
                              key={detail.payment.id}
                              className="px-4 py-3 bg-bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-bg-secondary/15 transition-colors"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-bg-secondary text-text-secondary border border-border-subtle">
                                    {detail.categoryName}
                                  </span>
                                  <span className="text-xs font-bold text-text-primary">
                                    {detail.supplierName}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    {detail.payment.status === 'partial'
                                      ? 'Señal / Parcial'
                                      : 'Pagado'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-text-muted flex items-center gap-2 flex-wrap">
                                  <span>
                                    {detail.payment.notes || 'Pago registrado'}
                                  </span>
                                  {detail.payment.paid_at && (
                                    <span>
                                      · Abonado el {formatDateES(detail.payment.paid_at)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                <span className="font-mono text-sm font-bold text-text-primary">
                                  {formatCurrency(Number(detail.payment.amount))}
                                </span>
                                {onEditPayment && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onEditPayment(detail.supplier, detail.payment)
                                    }
                                    className="px-2.5 py-1 rounded-lg border border-border-subtle hover:border-border-strong bg-white hover:bg-neutral-50 text-[11px] font-medium text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3 text-text-accent" />
                                    <span>Editar</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optional Scheduled Payments assigned to this payer */}
                      {payer.scheduledPayments.length > 0 && (
                        <div className="px-4 py-2.5 bg-amber-50/40 border-t border-amber-200/70 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Plazos programados asignados a {payer.name} (pendientes de abono):
                          </span>
                          <div className="space-y-1">
                            {payer.scheduledPayments.map((detail) => (
                              <div
                                key={detail.payment.id}
                                className="flex items-center justify-between gap-2 text-[11px] text-amber-950"
                              >
                                <span className="truncate">
                                  {detail.categoryName} · {detail.supplierName}
                                  {detail.payment.due_date
                                    ? ` (${formatDateES(detail.payment.due_date)})`
                                    : ''}
                                </span>
                                <span className="font-mono font-semibold shrink-0">
                                  {formatCurrency(Number(detail.payment.amount))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-border-subtle bg-bg-canvas/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleExportBreakdownCSV}
            disabled={breakdown.totalSettledCount === 0}
            className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-card hover:bg-neutral-50 disabled:opacity-50 text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-text-muted" />
            <span>Exportar desglose CSV</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
