'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetSupplier, BudgetPayment, PaymentStatus, PAYMENT_STATUS_LABELS } from '@/lib/types';
import { formatCurrency } from '@/lib/budget-data';
import {
  X,
  CreditCard,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
} from 'lucide-react';

interface PaymentFormModalProps {
  isOpen: boolean;
  supplier: BudgetSupplier | null;
  paymentToEdit?: BudgetPayment | null;
  contractedTotal: number;
  alreadyPaidAmount: number;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    supplier_id: string;
    amount: number;
    due_date?: string | null;
    paid_at?: string | null;
    status: PaymentStatus;
    notes?: string | null;
  }) => Promise<void>;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  supplier,
  paymentToEdit,
  contractedTotal,
  alreadyPaidAmount,
  onClose,
  onSubmit,
}) => {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (paymentToEdit) {
      setAmount(String(paymentToEdit.amount));
      setDueDate(paymentToEdit.due_date || '');
      setPaidAt(paymentToEdit.paid_at || '');
      setStatus(paymentToEdit.status);
      setNotes(paymentToEdit.notes || '');
    } else {
      setAmount('');
      setDueDate('');
      setPaidAt('');
      setStatus('pending');
      setNotes('');
    }
  }, [paymentToEdit, isOpen]);

  if (!isOpen || !mounted || !supplier) return null;

  // Calculate pending remaining on supplier
  const editingAmount = paymentToEdit?.status === 'paid' ? paymentToEdit.amount : 0;
  const currentPaid = Math.max(0, alreadyPaidAmount - editingAmount);
  const remainingTotal = Math.max(0, contractedTotal - currentPaid);

  const handleQuickPercent = (pct: number) => {
    const val = (contractedTotal * pct) / 100;
    setAmount(val.toFixed(2));
  };

  const handleQuickRemaining = () => {
    setAmount(remainingTotal.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    try {
      await onSubmit({
        id: paymentToEdit?.id,
        supplier_id: supplier.id,
        amount: parsedAmount,
        due_date: dueDate || null,
        paid_at: status === 'paid' ? (paidAt || new Date().toISOString().split('T')[0]) : (paidAt || null),
        status,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting payment:', err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-bg-canvas/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium flex items-center gap-1">
                <Building className="w-3 h-3" />
                {supplier.name}
              </span>
            </div>
            <h3 className="font-serif text-2xl text-text-primary font-medium tracking-tight">
              {paymentToEdit ? 'Editar Pago / Hito' : 'Registrar Pago / Hito'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Controla las entregas de señal, cuotas y liquidación final
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Info Banner */}
        <div className="p-4 mx-6 mt-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Contratado</p>
            <p className="text-sm font-semibold font-mono text-text-primary mt-0.5">
              {formatCurrency(contractedTotal)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Ya Pagado</p>
            <p className="text-sm font-semibold font-mono text-emerald-700 mt-0.5">
              {formatCurrency(currentPaid)}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">Pendiente</p>
            <p className="text-sm font-semibold font-mono text-amber-700 mt-0.5">
              {formatCurrency(remainingTotal)}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Importe del pago (€) *
              </label>
              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickPercent(30)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-text-secondary transition-colors"
                  title="30% de señal del total contratado"
                >
                  30% señal
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(50)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-text-secondary transition-colors"
                  title="50% del total contratado"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={handleQuickRemaining}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors"
                  title="Resto pendiente completo"
                >
                  Resto ({formatCurrency(remainingTotal)})
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base font-semibold">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 text-base font-mono font-medium rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Estado del pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['pending', 'partial', 'paid'] as PaymentStatus[]).map((st) => {
                const isCurrent = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatus(st);
                      if (st === 'paid' && !paidAt) {
                        setPaidAt(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? st === 'paid'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                          : st === 'partial'
                          ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold shadow-2xs'
                          : 'border-neutral-500 bg-neutral-100 text-neutral-800 font-semibold shadow-2xs'
                        : 'border-border-subtle bg-bg-card text-text-secondary hover:border-neutral-300'
                    }`}
                  >
                    {st === 'paid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {st === 'pending' && <Clock className="w-3.5 h-3.5 text-neutral-500" />}
                    {st === 'partial' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{PAYMENT_STATUS_LABELS[st]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Fecha vencimiento / límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Fecha de pago efectivo
              </label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => {
                  setPaidAt(e.target.value);
                  if (e.target.value && status === 'pending') {
                    setStatus('paid');
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Concepto / Notas internas
            </label>
            <input
              type="text"
              placeholder="Ej. Señal del 30% vía transferencia bancaria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary hover:bg-neutral-100 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-sm font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{paymentToEdit ? 'Actualizar Pago' : 'Guardar Pago'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
