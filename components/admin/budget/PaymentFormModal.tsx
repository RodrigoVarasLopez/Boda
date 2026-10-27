'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetSupplier, BudgetPayment, PaymentStatus } from '@/lib/types';
import {
  formatCurrency,
  isPaymentSettled,
  formatDateES,
  calculateDaysUntil,
  getSupplierFinalPaymentInfo,
} from '@/lib/budget-data';
import {
  X,
  CreditCard,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Trash2,
  Edit2,
  Bell,
  Check,
  Plus,
} from 'lucide-react';

interface PaymentFormModalProps {
  isOpen: boolean;
  supplier: BudgetSupplier | null;
  supplierPayments?: BudgetPayment[];
  paymentToEdit?: BudgetPayment | null;
  contractedTotal: number;
  alreadyPaidAmount: number;
  onClose: () => void;
  onSelectPaymentToEdit?: (payment: BudgetPayment | null) => void;
  onDeletePayment?: (paymentId: string) => Promise<void>;
  onMarkPaymentPaid?: (paymentId: string) => Promise<void>;
  onSetFinalPaymentDate?: (supplierId: string, dueDate: string | null, contractedTotal: number) => Promise<void>;
  onSubmit: (data: {
    id?: string;
    supplier_id: string;
    amount: number;
    due_date?: string | null;
    paid_at?: string | null;
    status: PaymentStatus;
    notes?: string | null;
    final_payment_date?: string | null;
  }) => Promise<void>;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  supplier,
  supplierPayments = [],
  paymentToEdit,
  contractedTotal,
  alreadyPaidAmount,
  onClose,
  onSelectPaymentToEdit,
  onDeletePayment,
  onMarkPaymentPaid,
  onSetFinalPaymentDate,
  onSubmit,
}) => {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [finalPaymentDate, setFinalPaymentDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Multi-date installment scheduler state (allows adding multiple payment dates per supplier)
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleAmount, setScheduleAmount] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [addingSchedule, setAddingSchedule] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const finalInfo = supplier
    ? getSupplierFinalPaymentInfo(supplier.id, supplierPayments)
    : { scheduledPayment: null, scheduledPayments: [], dueDate: null, daysUntilDue: null };

  const scheduledPaymentsList = supplierPayments
    .filter((p) => !isPaymentSettled(p))
    .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999'));

  const totalScheduledAmount = scheduledPaymentsList.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const unscheduledRemaining = Math.max(
    0,
    contractedTotal - alreadyPaidAmount - totalScheduledAmount
  );

  useEffect(() => {
    if (!isOpen || !supplier) return;
    const today = new Date().toISOString().split('T')[0];

    if (paymentToEdit) {
      setAmount(String(paymentToEdit.amount));
      setDueDate(paymentToEdit.due_date ? paymentToEdit.due_date.split('T')[0] : '');
      setPaidAt(paymentToEdit.paid_at ? paymentToEdit.paid_at.split('T')[0] : '');
      setStatus(paymentToEdit.status);
      setNotes(paymentToEdit.notes || '');
    } else {
      setAmount('');
      setDueDate('');
      setPaidAt(today);
      setStatus('paid');
      setNotes('');
    }

    setFinalPaymentDate('');
  }, [paymentToEdit, isOpen, supplier]);

  if (!isOpen || !mounted || !supplier) return null;

  // Calculate pending remaining on supplier
  const editingAmount =
    paymentToEdit && isPaymentSettled(paymentToEdit) ? Number(paymentToEdit.amount) : 0;
  const currentPaid = Math.max(0, alreadyPaidAmount - editingAmount);
  const remainingTotal = Math.max(0, contractedTotal - currentPaid);
  const percentPaid =
    contractedTotal > 0 ? Math.min(100, Math.round((alreadyPaidAmount / contractedTotal) * 100)) : 0;

  const parsedInputAmount = parseFloat(amount) || 0;
  const isSettledSelection = status === 'paid' || status === 'partial';
  const remainingAfterThisPayment = isSettledSelection
    ? Math.max(0, remainingTotal - parsedInputAmount)
    : remainingTotal;

  const handleQuickPercent = (pct: number) => {
    const val = (contractedTotal * pct) / 100;
    setAmount(val.toFixed(2));
    if (status !== 'pending') {
      setStatus('partial');
      if (!paidAt) setPaidAt(new Date().toISOString().split('T')[0]);
      if (!notes) setNotes(`Señal / Pago parcial (${pct}%)`);
    } else {
      if (!notes) setNotes(`Plazo programado (${pct}%)`);
    }
  };

  const handleQuickRemaining = () => {
    setAmount(remainingTotal.toFixed(2));
    if (status !== 'pending') {
      setStatus('paid');
      if (!paidAt) setPaidAt(new Date().toISOString().split('T')[0]);
      if (!notes) setNotes(currentPaid > 0 ? 'Liquidación / Pago final' : 'Pago completo');
    } else {
      if (!notes) setNotes('Liquidación / Pago final');
    }
  };

  // Add a new scheduled payment date (plazo) and KEEP modal open so user can add multiple dates!
  const handleAddScheduledInstallment = async () => {
    if (!scheduleDate) return;
    const parsedSchedAmount =
      parseFloat(scheduleAmount) > 0
        ? parseFloat(scheduleAmount)
        : unscheduledRemaining > 0
        ? unscheduledRemaining
        : remainingTotal > 0
        ? remainingTotal
        : 1;

    setAddingSchedule(true);
    try {
      const nextIndex = scheduledPaymentsList.length + 1;
      await onSubmit({
        supplier_id: supplier.id,
        amount: parsedSchedAmount,
        due_date: scheduleDate,
        paid_at: null,
        status: 'pending',
        notes:
          scheduleNotes.trim() ||
          `${nextIndex}º Plazo programado (${formatDateES(scheduleDate)})`,
        final_payment_date: null,
      });
      setScheduleDate('');
      setScheduleAmount('');
      setScheduleNotes('');
    } finally {
      setAddingSchedule(false);
    }
  };

  const submitForm = async (closeAfterSave: boolean) => {
    const parsedAmount = parseFloat(amount);

    // If user didn't enter an amount in bottom form, but filled the top scheduleDate, add the scheduled date!
    if ((isNaN(parsedAmount) || parsedAmount <= 0) && scheduleDate) {
      await handleAddScheduledInstallment();
      if (closeAfterSave) onClose();
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await onSubmit({
        id: paymentToEdit?.id,
        supplier_id: supplier.id,
        amount: parsedAmount,
        due_date: status === 'pending' ? dueDate || finalPaymentDate || null : dueDate || null,
        paid_at:
          status === 'paid' || status === 'partial'
            ? paidAt || today
            : null,
        status,
        notes:
          notes.trim() ||
          (status === 'partial'
            ? 'Señal / Pago parcial'
            : status === 'pending'
            ? `Plazo de pago${dueDate ? ` (${formatDateES(dueDate)})` : ''}`
            : 'Pago registrado'),
        final_payment_date: null,
      });

      if (closeAfterSave) {
        onClose();
      } else {
        if (onSelectPaymentToEdit) onSelectPaymentToEdit(null);
        setAmount('');
        setDueDate('');
        setNotes('');
        setFinalPaymentDate('');
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(true);
  };

  const daysUntilFinal = calculateDaysUntil(finalInfo.dueDate);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-subtle bg-bg-canvas/40 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold flex items-center gap-1">
                <Building className="w-3 h-3" />
                {supplier.name}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-text-primary font-medium tracking-tight">
              {paymentToEdit ? 'Editar Pago / Hito' : 'Gestión de Pagos y Vencimientos'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Registra señales abonadas, pagos realizados y la fecha límite del pago final
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* 1. Contract Info Banner + Progress Bar */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                  Contratado
                </p>
                <p className="text-sm sm:text-base font-bold font-mono text-text-primary mt-0.5">
                  {formatCurrency(contractedTotal)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                  Ya Pagado
                </p>
                <p className="text-sm sm:text-base font-bold font-mono text-emerald-700 mt-0.5">
                  {formatCurrency(alreadyPaidAmount)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                  Pendiente
                </p>
                <p className="text-sm sm:text-base font-bold font-mono text-amber-700 mt-0.5">
                  {formatCurrency(Math.max(0, contractedTotal - alreadyPaidAmount))}
                </p>
              </div>
            </div>

            {contractedTotal > 0 && (
              <div className="space-y-1">
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-text-muted font-medium">
                  <span>{percentPaid}% abonado</span>
                  <span>{100 - percentPaid}% pendiente</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Multi-Date Payment Schedule (Plan de Pagos por Plazos / Varias Fechas) */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>
                  Calendario de Fechas de Pago / Plazos ({scheduledPaymentsList.length}{' '}
                  {scheduledPaymentsList.length === 1 ? 'fecha programada' : 'fechas programadas'})
                </span>
              </div>
              {daysUntilFinal !== null && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    daysUntilFinal < 0
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : daysUntilFinal <= 30
                      ? 'bg-amber-200/80 text-amber-900 border-amber-400'
                      : 'bg-white text-amber-800 border-amber-200'
                  }`}
                >
                  {daysUntilFinal < 0
                    ? `Próximo vencido hace ${Math.abs(daysUntilFinal)} días`
                    : daysUntilFinal === 0
                    ? '¡Próximo pago vence hoy!'
                    : `Próximo pago en ${daysUntilFinal} días`}
                </span>
              )}
            </div>

            <p className="text-[11px] text-amber-900/85 leading-relaxed">
              Puedes añadir <strong>todas las fechas de pago</strong> que tenga este proveedor (ej. 1ª señal, 2º pago del 50%, liquidación final). El panel te avisará automáticamente de cada fecha.
            </p>

            {/* List of Scheduled Payment Dates (Plazos Pendientes) */}
            {scheduledPaymentsList.length > 0 && (
              <div className="space-y-1.5">
                {scheduledPaymentsList.map((sched, idx) => {
                  const dUntil = calculateDaysUntil(sched.due_date);
                  return (
                    <div
                      key={sched.id}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                            {idx + 1}º Vencimiento
                          </span>
                          <span className="font-bold text-text-primary truncate">
                            {sched.notes || `Plazo #${idx + 1}`}
                          </span>
                          <span className="font-mono font-bold text-amber-900">
                            {formatCurrency(Number(sched.amount))}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium flex items-center gap-2">
                          <span>
                            📅 Fecha: <strong>{formatDateES(sched.due_date)}</strong>
                          </span>
                          {dUntil !== null && (
                            <span className="text-[10px] text-text-muted">
                              ({dUntil < 0 ? `Vencido hace ${Math.abs(dUntil)}d` : dUntil === 0 ? '¡Hoy!' : `en ${dUntil} días`})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onMarkPaymentPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkPaymentPaid(sched.id)}
                            title="Marcar este plazo como pagado hoy"
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Pagado</span>
                          </button>
                        )}
                        {onSelectPaymentToEdit && (
                          <button
                            type="button"
                            onClick={() => onSelectPaymentToEdit(sched)}
                            title="Editar fecha o importe de este plazo"
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-amber-50 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeletePayment && (
                          <button
                            type="button"
                            onClick={() => onDeletePayment(sched.id)}
                            title="Eliminar esta fecha de pago"
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Fast Inline Builder: Add Another Payment Date / Installment */}
            <div className="p-3 rounded-xl bg-white/90 border border-amber-300/80 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Añadir nueva fecha de pago / plazo al calendario:</span>
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: '25%', pct: 25, text: 'Plazo 25%' },
                    { label: '30%', pct: 30, text: 'Plazo 30%' },
                    { label: '50%', pct: 50, text: '2º Pago (50%)' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (contractedTotal > 0) {
                          setScheduleAmount(((contractedTotal * preset.pct) / 100).toFixed(2));
                        }
                        if (!scheduleNotes) setScheduleNotes(preset.text);
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                  {unscheduledRemaining > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleAmount(unscheduledRemaining.toFixed(2));
                        if (!scheduleNotes) setScheduleNotes('Pago final / Liquidación');
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-semibold cursor-pointer"
                    >
                      Resto ({formatCurrency(unscheduledRemaining)})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                <div className="sm:col-span-4 space-y-1">
                  <label className="text-[10px] font-semibold text-text-secondary block">
                    Fecha de pago *
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white text-text-primary focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-semibold text-text-secondary block">
                    Importe (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={
                      unscheduledRemaining > 0 ? unscheduledRemaining.toFixed(0) : 'Importe'
                    }
                    value={scheduleAmount}
                    onChange={(e) => setScheduleAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-amber-300 bg-white text-text-primary focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-[10px] font-semibold text-text-secondary block">
                    Concepto (ej. 2º Pago, Pago final...)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2º Pago Banquete (50%)"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-300 bg-white text-text-primary focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-text-muted">
                  Puedes añadir tantas fechas como necesites sin cerrar la ventana.
                </span>
                <button
                  type="button"
                  onClick={handleAddScheduledInstallment}
                  disabled={!scheduleDate || addingSchedule}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {addingSchedule ? 'Añadiendo fecha...' : '+ Añadir Fecha de Pago'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Existing Payments List for this Supplier */}
          {supplierPayments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Pagos e hitos registrados ({supplierPayments.length})
                </span>
                {paymentToEdit && onSelectPaymentToEdit && (
                  <button
                    type="button"
                    onClick={() => onSelectPaymentToEdit(null)}
                    className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Nuevo pago</span>
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {supplierPayments.map((pay) => {
                  const settled = isPaymentSettled(pay);
                  const isBeingEdited = paymentToEdit?.id === pay.id;
                  return (
                    <div
                      key={pay.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                        isBeingEdited
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/30'
                          : settled
                          ? 'bg-emerald-50/40 border-emerald-200/80'
                          : 'bg-amber-50/40 border-amber-200/80'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-text-primary">
                            {formatCurrency(Number(pay.amount))}
                          </span>
                          {settled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              {pay.status === 'partial' ? 'Señal / Parcial abonado' : 'Pagado'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              <Clock className="w-2.5 h-2.5" />
                              Pendiente de pago
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-muted flex items-center gap-2 flex-wrap">
                          {pay.notes && <span className="font-medium text-text-secondary">{pay.notes}</span>}
                          {settled && pay.paid_at && (
                            <span>· Abonado el {formatDateES(pay.paid_at)}</span>
                          )}
                          {!settled && pay.due_date && (
                            <span className="text-amber-800 font-medium">
                              · Fecha límite: {formatDateES(pay.due_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!settled && onMarkPaymentPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkPaymentPaid(pay.id)}
                            title="Marcar como pagado hoy"
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Pagado</span>
                          </button>
                        )}
                        {onSelectPaymentToEdit && (
                          <button
                            type="button"
                            onClick={() => onSelectPaymentToEdit(pay)}
                            title="Editar este pago"
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeletePayment && (
                          <button
                            type="button"
                            onClick={() => onDeletePayment(pay.id)}
                            title="Eliminar este pago"
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Form to Add or Edit a Payment */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {paymentToEdit ? 'Modificar pago seleccionado' : 'Registrar nuevo pago o señal'}
              </h4>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Importe del pago (€) *
                </label>
                {/* Quick suggestions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(30)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-text-secondary transition-colors cursor-pointer"
                    title="30% de señal del total contratado"
                  >
                    30% señal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPercent(50)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-text-secondary transition-colors cursor-pointer"
                    title="50% del total contratado"
                  >
                    50%
                  </button>
                  {remainingTotal > 0 && (
                    <button
                      type="button"
                      onClick={handleQuickRemaining}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors cursor-pointer"
                      title="Resto pendiente completo"
                    >
                      Resto ({formatCurrency(remainingTotal)})
                    </button>
                  )}
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
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-base font-mono font-medium rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Tipo / Estado de este pago
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('paid');
                    if (!paidAt) setPaidAt(new Date().toISOString().split('T')[0]);
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center gap-2 cursor-pointer ${
                    status === 'paid'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-2xs'
                      : 'border-border-subtle bg-bg-card text-text-secondary hover:border-neutral-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="leading-tight">Pagado</div>
                    <div className="text-[10px] text-emerald-700/80 font-normal">Ya abonado</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('partial');
                    if (!paidAt) setPaidAt(new Date().toISOString().split('T')[0]);
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center gap-2 cursor-pointer ${
                    status === 'partial'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold shadow-2xs'
                      : 'border-border-subtle bg-bg-card text-text-secondary hover:border-neutral-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="leading-tight">Señal / Parcial</div>
                    <div className="text-[10px] text-emerald-700/80 font-normal">Adelanto abonado</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('pending');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center gap-2 cursor-pointer ${
                    status === 'pending'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold shadow-2xs'
                      : 'border-border-subtle bg-bg-card text-text-secondary hover:border-neutral-300'
                  }`}
                >
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="leading-tight">Programado</div>
                    <div className="text-[10px] text-amber-700/80 font-normal">Pendiente futuro</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {status !== 'pending' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Fecha en que se hizo el pago
                  </label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Fecha de vencimiento / pago final *
                  </label>
                  <input
                    type="date"
                    value={dueDate || finalPaymentDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setFinalPaymentDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/40 text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              )}

              {/* Concept / Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Concepto / Nota
                </label>
                <input
                  type="text"
                  placeholder="Ej. Señal 50% por transferencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border-subtle flex-wrap">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-border-subtle text-text-secondary hover:bg-neutral-100 text-xs font-medium transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              {!paymentToEdit && (
                <button
                  type="button"
                  onClick={() => submitForm(false)}
                  disabled={loading || (!amount && !scheduleDate)}
                  className="px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar y Añadir Otro</span>
                </button>
              )}
              <button
                type="submit"
                disabled={loading || (!amount && !scheduleDate)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {loading
                    ? 'Guardando...'
                    : paymentToEdit
                    ? 'Actualizar Pago / Fecha'
                    : 'Guardar y Cerrar'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

