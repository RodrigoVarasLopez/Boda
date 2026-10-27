'use client';

import React, { useState, useEffect } from 'react';
import {
  BudgetMenuConfig,
  BudgetSupplier,
  BudgetPayment,
  BanquetExpenseItem,
  BanquetExpenseType,
} from '@/lib/types';
import {
  formatCurrency,
  formatDateES,
  isPaymentSettled,
  calculateMenuTotal,
  calculateBanquetExpenseItemTotal,
} from '@/lib/budget-data';
import {
  UtensilsCrossed,
  Users,
  Baby,
  Calculator,
  Edit2,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Plus,
  Trash2,
  Receipt,
  CreditCard,
  X,
} from 'lucide-react';

interface MenuCostCalculatorProps {
  menuConfig: BudgetMenuConfig;
  attendingAdults: number;
  attendingChildren: number;
  menuSupplier?: BudgetSupplier | null;
  banquetPayments?: BudgetPayment[];
  paidAmount?: number;
  pendingAmount?: number;
  onOpenBanquetPayments?: () => void;
  onEditBanquetPayment?: (payment: BudgetPayment) => void;
  onMarkBanquetPaymentPaid?: (paymentId: string) => Promise<void>;
  onDeleteBanquetPayment?: (paymentId: string) => Promise<void>;
  onUpdateMenuConfig: (data: {
    adult_price?: number;
    child_price?: number;
    adult_count_override?: number | null;
    child_count_override?: number | null;
    use_manual_counts?: boolean;
    notes?: string | null;
    extra_expenses?: BanquetExpenseItem[];
  }) => Promise<void>;
}

const QUICK_BANQUET_PRESETS: Array<{
  label: string;
  concept: string;
  type: BanquetExpenseType;
  defaultAmount: number;
  defaultQty?: number;
}> = [
  {
    label: '🍷 Hora extra Barra Libre',
    concept: 'Hora extra de Barra Libre',
    type: 'fixed',
    defaultAmount: 750,
    defaultQty: 1,
  },
  {
    label: '🥓 Cortador de Jamón',
    concept: 'Cortador de Jamón Ibérico en Cóctel',
    type: 'fixed',
    defaultAmount: 650,
    defaultQty: 1,
  },
  {
    label: '🍔 Recena Medianoche',
    concept: 'Recena / Resopón de Medianoche',
    type: 'per_guest',
    defaultAmount: 12,
  },
  {
    label: '📸 Menú Proveedores',
    concept: 'Menú de Proveedores (Foto, Vídeo, DJ)',
    type: 'fixed',
    defaultAmount: 65,
    defaultQty: 4,
  },
  {
    label: '🏰 Canon / Alquiler Finca',
    concept: 'Canon de Espacio / Exclusividad Finca',
    type: 'fixed',
    defaultAmount: 1500,
    defaultQty: 1,
  },
  {
    label: '🍰 Mesa Dulce / Tarta',
    concept: 'Tarta Nupcial y Candy Bar',
    type: 'fixed',
    defaultAmount: 450,
    defaultQty: 1,
  },
];

export const MenuCostCalculator: React.FC<MenuCostCalculatorProps> = ({
  menuConfig,
  attendingAdults,
  attendingChildren,
  menuSupplier,
  banquetPayments = [],
  paidAmount = 0,
  pendingAmount = 0,
  onOpenBanquetPayments,
  onEditBanquetPayment,
  onMarkBanquetPaymentPaid,
  onDeleteBanquetPayment,
  onUpdateMenuConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adultPriceInput, setAdultPriceInput] = useState(String(menuConfig.adult_price));
  const [childPriceInput, setChildPriceInput] = useState(String(menuConfig.child_price));
  const [useManual, setUseManual] = useState(menuConfig.use_manual_counts);
  const [adultOverrideInput, setAdultOverrideInput] = useState(
    menuConfig.adult_count_override != null
      ? String(menuConfig.adult_count_override)
      : String(attendingAdults)
  );
  const [childOverrideInput, setChildOverrideInput] = useState(
    menuConfig.child_count_override != null
      ? String(menuConfig.child_count_override)
      : String(attendingChildren)
  );
  const [notesInput, setNotesInput] = useState(menuConfig.notes || '');
  const [saving, setSaving] = useState(false);

  // Extra Banquet Expenses state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseType, setExpenseType] = useState<BanquetExpenseType>('fixed');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseQty, setExpenseQty] = useState('1');
  const [expenseNotes, setExpenseNotes] = useState('');

  useEffect(() => {
    if (!isEditing) {
      setAdultPriceInput(String(menuConfig.adult_price));
      setChildPriceInput(String(menuConfig.child_price));
      setUseManual(menuConfig.use_manual_counts);
      setAdultOverrideInput(
        menuConfig.adult_count_override != null
          ? String(menuConfig.adult_count_override)
          : String(attendingAdults)
      );
      setChildOverrideInput(
        menuConfig.child_count_override != null
          ? String(menuConfig.child_count_override)
          : String(attendingChildren)
      );
      setNotesInput(menuConfig.notes || '');
    }
  }, [menuConfig, attendingAdults, attendingChildren, isEditing]);

  const calculation = calculateMenuTotal(
    {
      ...menuConfig,
      adult_price: Number(adultPriceInput) || 0,
      child_price: Number(childPriceInput) || 0,
      use_manual_counts: useManual,
      adult_count_override: useManual ? Number(adultOverrideInput) || 0 : null,
      child_count_override: useManual ? Number(childOverrideInput) || 0 : null,
    },
    attendingAdults,
    attendingChildren
  );

  const extraExpenses = calculation.extraExpenses || [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateMenuConfig({
        adult_price: Number(adultPriceInput) || 0,
        child_price: Number(childPriceInput) || 0,
        adult_count_override: useManual ? Number(adultOverrideInput) || 0 : null,
        child_count_override: useManual ? Number(childOverrideInput) || 0 : null,
        use_manual_counts: useManual,
        notes: notesInput.trim() || null,
        extra_expenses: extraExpenses,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAdultPriceInput(String(menuConfig.adult_price));
    setChildPriceInput(String(menuConfig.child_price));
    setUseManual(menuConfig.use_manual_counts);
    setAdultOverrideInput(
      menuConfig.adult_count_override != null
        ? String(menuConfig.adult_count_override)
        : String(attendingAdults)
    );
    setChildOverrideInput(
      menuConfig.child_count_override != null
        ? String(menuConfig.child_count_override)
        : String(attendingChildren)
    );
    setNotesInput(menuConfig.notes || '');
    setIsEditing(false);
  };

  const resetExpenseForm = () => {
    setEditingExpenseId(null);
    setExpenseConcept('');
    setExpenseType('fixed');
    setExpenseAmount('');
    setExpenseQty('1');
    setExpenseNotes('');
    setIsAddingExpense(false);
  };

  const handleOpenEditExpense = (item: BanquetExpenseItem) => {
    setEditingExpenseId(item.id);
    setExpenseConcept(item.concept);
    setExpenseType(item.type);
    setExpenseAmount(String(item.amount));
    setExpenseQty(String(item.quantity || 1));
    setExpenseNotes(item.notes || '');
    setIsAddingExpense(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseConcept.trim()) return;
    const numericAmount = Number(expenseAmount);
    if (isNaN(numericAmount) || numericAmount < 0) return;

    const newItem: BanquetExpenseItem = {
      id: editingExpenseId || `bexp-${Date.now()}`,
      concept: expenseConcept.trim(),
      type: expenseType,
      amount: numericAmount,
      quantity: expenseType === 'fixed' ? Math.max(1, Number(expenseQty) || 1) : 1,
      notes: expenseNotes.trim() || null,
    };

    const nextList = editingExpenseId
      ? extraExpenses.map((ex) => (ex.id === editingExpenseId ? newItem : ex))
      : [...extraExpenses, newItem];

    setSaving(true);
    try {
      await onUpdateMenuConfig({
        extra_expenses: nextList,
      });
      resetExpenseForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const nextList = extraExpenses.filter((ex) => ex.id !== id);
    await onUpdateMenuConfig({
      extra_expenses: nextList,
    });
  };

  const previewExpenseTotal = calculateBanquetExpenseItemTotal(
    {
      id: 'preview',
      concept: expenseConcept || 'Gasto',
      type: expenseType,
      amount: Number(expenseAmount) || 0,
      quantity: expenseType === 'fixed' ? Math.max(1, Number(expenseQty) || 1) : 1,
    },
    calculation.adultCount,
    calculation.childCount
  );

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-sand/30 text-brand-ink border border-border-subtle">
            <UtensilsCrossed className="w-5 h-5 text-text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                Presupuesto del Banquete &amp; Catering
              </h2>
              {menuSupplier && (
                <span className="text-[11px] font-semibold text-brand-terracotta bg-bg-secondary px-2.5 py-0.5 rounded-full border border-border-subtle">
                  {menuSupplier.name}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Cálculo automático de cubiertos (adultos y niños) + partidas y gastos adicionales del banquete
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (isAddingExpense) {
                resetExpenseForm();
              } else {
                resetExpenseForm();
                setIsAddingExpense(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Añadir Gasto al Banquete</span>
          </button>

          {onOpenBanquetPayments && (
            <button
              type="button"
              onClick={onOpenBanquetPayments}
              className="px-3.5 py-2 rounded-xl border border-border-strong bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-text-accent" />
              <span>Pagos Banquete</span>
              {banquetPayments.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {banquetPayments.length}
                </span>
              )}
            </button>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 rounded-xl border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-secondary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-text-accent" />
              <span>Ajustar cubiertos</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-xl border border-border-subtle text-text-muted hover:text-text-primary text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer shadow-soft"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Breakdown Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Adultos */}
        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Users className="w-4 h-4 text-text-accent" />
              Menú Adulto
            </span>
            <span className="text-xs font-mono font-medium text-text-muted">
              {formatCurrency(Number(adultPriceInput) || 0)} / pers.
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-border-subtle/60">
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary">
                {calculation.adultCount}
              </span>
              <span className="text-xs text-text-muted ml-1.5">
                adultos {useManual ? '(manual)' : '(en lista)'}
              </span>
            </div>
            <div className="text-base font-serif font-bold text-text-primary">
              {formatCurrency(calculation.adultTotal)}
            </div>
          </div>
          <p className="text-[11px] text-text-muted">
            {calculation.adultCount} × {formatCurrency(Number(adultPriceInput) || 0)}
          </p>
        </div>

        {/* 2. Niños */}
        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-brand-terracotta" />
              Menú Infantil
            </span>
            <span className="text-xs font-mono font-medium text-text-muted">
              {formatCurrency(Number(childPriceInput) || 0)} / niño
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-border-subtle/60">
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary">
                {calculation.childCount}
              </span>
              <span className="text-xs text-text-muted ml-1.5">
                niños {useManual ? '(manual)' : '(en lista)'}
              </span>
            </div>
            <div className="text-base font-serif font-bold text-text-primary">
              {formatCurrency(calculation.childTotal)}
            </div>
          </div>
          <p className="text-[11px] text-text-muted">
            {calculation.childCount} × {formatCurrency(Number(childPriceInput) || 0)}
          </p>
        </div>

        {/* 3. Gastos Adicionales del Banquete */}
        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-600" />
              Gastos y Extras
            </span>
            <span className="text-[11px] font-mono text-text-muted">
              {extraExpenses.length} {extraExpenses.length === 1 ? 'concepto' : 'conceptos'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-border-subtle/60">
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary">
                {extraExpenses.length}
              </span>
              <span className="text-xs text-text-muted ml-1.5">partidas</span>
            </div>
            <div className="text-base font-serif font-bold text-text-primary">
              {formatCurrency(calculation.extrasTotal)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted truncate">
              Barra libre, recena, cortador...
            </span>
            <button
              type="button"
              onClick={() => {
                resetExpenseForm();
                setIsAddingExpense(true);
              }}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer shrink-0 ml-1"
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* 4. TOTAL BANQUETE */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-card via-bg-secondary/50 to-brand-sand/20 border-2 border-border-strong shadow-soft flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent font-semibold">
              TOTAL BANQUETE
            </span>
            <Calculator className="w-4 h-4 text-text-accent" />
          </div>

          <div className="my-2">
            <div className="text-3xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(calculation.total)}
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Cubiertos: <strong className="text-text-primary">{formatCurrency(calculation.adultTotal + calculation.childTotal)}</strong>
              {calculation.extrasTotal > 0 && (
                <>
                  {' '}
                  + Extras: <strong className="text-text-primary">{formatCurrency(calculation.extrasTotal)}</strong>
                </>
              )}
            </p>
          </div>

          {paidAmount > 0 ? (
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-border-subtle/60">
              <span className="font-semibold text-emerald-700">
                Pagado: {formatCurrency(paidAmount)}
              </span>
              <button
                type="button"
                onClick={onOpenBanquetPayments}
                className="font-semibold text-amber-800 hover:underline cursor-pointer"
              >
                Falta: {formatCurrency(pendingAmount)} →
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-border-subtle/60">
              <span className="text-text-muted flex items-center gap-1">
                <Info className="w-3 h-3 text-text-accent shrink-0" />
                <span>Sin pagos aún</span>
              </span>
              {onOpenBanquetPayments && (
                <button
                  type="button"
                  onClick={onOpenBanquetPayments}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Registrar señal →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FORMULARIO PARA AÑADIR / EDITAR GASTOS DEL BANQUETE */}
      {isAddingExpense && (
        <form
          onSubmit={handleSaveExpense}
          className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-300/70 space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {editingExpenseId
                  ? 'Editar Gasto del Banquete'
                  : 'Añadir Nuevo Gasto al Presupuesto del Banquete'}
              </h3>
            </div>
            <button
              type="button"
              onClick={resetExpenseForm}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sugerencias rápidas con 1 clic */}
          {!editingExpenseId && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                Ideas rápidas de gastos de banquete (clic para autocompletar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_BANQUET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setExpenseConcept(preset.concept);
                      setExpenseType(preset.type);
                      setExpenseAmount(String(preset.defaultAmount));
                      setExpenseQty(String(preset.defaultQty || 1));
                    }}
                    className="px-2.5 py-1 rounded-full bg-bg-card hover:bg-bg-secondary border border-border-subtle text-[11px] font-medium text-text-primary transition-colors cursor-pointer shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            {/* Concepto */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-text-primary block">
                Concepto del gasto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Cortador de jamón, Recena, Barra libre..."
                value={expenseConcept}
                onChange={(e) => setExpenseConcept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Tipo de cálculo */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-text-primary block">
                Tipo de coste
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as BanquetExpenseType)}
                className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="fixed">Importe Fijo (€)</option>
                <option value="per_guest">
                  Por Comensal ({calculation.adultCount + calculation.childCount} inv.)
                </option>
                <option value="per_adult">
                  Por Adulto ({calculation.adultCount} adultos)
                </option>
              </select>
            </div>

            {/* Importe */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-primary block">
                {expenseType === 'fixed' ? 'Precio unitario (€) *' : 'Precio / pers. (€) *'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Unidades (si es fijo) o Notas */}
            {expenseType === 'fixed' ? (
              <div className="sm:col-span-1 space-y-1">
                <label className="text-xs font-semibold text-text-primary block">
                  Uds.
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={expenseQty}
                  onChange={(e) => setExpenseQty(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <div className="sm:col-span-1 space-y-1">
                <span className="text-[10px] font-mono text-text-muted block">Comensales</span>
                <div className="px-2.5 py-2 rounded-xl bg-bg-secondary text-xs font-semibold text-text-primary text-center">
                  × {expenseType === 'per_adult' ? calculation.adultCount : calculation.adultCount + calculation.childCount}
                </div>
              </div>
            )}

            {/* Botón Guardar */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 px-3 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-soft"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingExpenseId ? 'Actualizar' : 'Añadir'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <input
              type="text"
              placeholder="Nota opcional (ej: 2 horas adicionales tras el baile, IVA incluido...)"
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-bg-card/80 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="text-xs text-text-secondary shrink-0">
              Impacto en el banquete:{' '}
              <strong className="font-serif text-sm text-text-primary">
                +{formatCurrency(previewExpenseTotal)}
              </strong>
            </div>
          </div>
        </form>
      )}

      {/* LISTA DE GASTOS ADICIONALES DEL BANQUETE */}
      {extraExpenses.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-text-accent" />
              Desglose de Gastos Adicionales del Banquete ({extraExpenses.length})
            </span>
            <span className="text-xs font-serif font-bold text-text-primary">
              Subtotal extras: {formatCurrency(calculation.extrasTotal)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {extraExpenses.map((item) => {
              const itemTotal = calculateBanquetExpenseItemTotal(
                item,
                calculation.adultCount,
                calculation.childCount
              );
              const qty = item.quantity || 1;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-bg-secondary/35 border border-border-subtle hover:border-border-strong flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-text-primary truncate">
                        {item.concept}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-bg-card border border-border-subtle text-text-muted">
                        {item.type === 'fixed'
                          ? qty > 1
                            ? `Fijo (${qty} uds.)`
                            : 'Fijo'
                          : item.type === 'per_adult'
                          ? 'Por adulto'
                          : 'Por comensal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {item.type === 'fixed'
                        ? qty > 1
                          ? `${qty} × ${formatCurrency(item.amount)}`
                          : 'Importe fijo en banquete'
                        : item.type === 'per_adult'
                        ? `${calculation.adultCount} adultos × ${formatCurrency(item.amount)}`
                        : `${calculation.adultCount + calculation.childCount} comensales × ${formatCurrency(item.amount)}`}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-serif font-bold text-sm text-text-primary">
                      {formatCurrency(itemTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditExpense(item)}
                      title="Editar gasto"
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(item.id)}
                      title="Eliminar gasto"
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LISTA DE PAGOS Y SEÑALES DEL BANQUETE */}
      {banquetPayments.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              Pagos, Señales y Vencimientos del Banquete ({banquetPayments.length})
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-emerald-700">
                Abonado: {formatCurrency(paidAmount)}
              </span>
              <span className="font-semibold text-amber-800">
                Pendiente: {formatCurrency(pendingAmount)}
              </span>
              {onOpenBanquetPayments && (
                <button
                  type="button"
                  onClick={onOpenBanquetPayments}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  + Añadir pago
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {banquetPayments.map((pay) => {
              const settled = isPaymentSettled(pay);
              return (
                <div
                  key={pay.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    settled
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-amber-50/40 border-amber-200/80'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {settled ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-text-primary truncate">
                        {pay.notes || (settled ? 'Señal / Pago abonado' : 'Pago programado')}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                          settled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {pay.status === 'partial'
                          ? 'Señal / Parcial'
                          : pay.status === 'paid'
                          ? 'Pagado'
                          : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted">
                      {settled && pay.paid_at
                        ? `Abonado el ${formatDateES(pay.paid_at)}`
                        : pay.due_date
                        ? `Vencimiento límite: ${formatDateES(pay.due_date)}`
                        : 'Sin fecha límite asignada'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`font-serif font-bold text-sm mr-1 ${
                        settled ? 'text-emerald-800' : 'text-amber-900'
                      }`}
                    >
                      {formatCurrency(Number(pay.amount))}
                    </span>
                    {!settled && onMarkBanquetPaymentPaid && (
                      <button
                        type="button"
                        onClick={() => onMarkBanquetPaymentPaid(pay.id)}
                        title="Marcar como pagado hoy"
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Abonar</span>
                      </button>
                    )}
                    {onEditBanquetPayment && (
                      <button
                        type="button"
                        onClick={() => onEditBanquetPayment(pay)}
                        title="Editar pago"
                        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteBanquetPayment && (
                      <button
                        type="button"
                        onClick={() => onDeleteBanquetPayment(pay.id)}
                        title="Eliminar pago"
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

      {/* Editing Drawer / Accordion for base menu prices & guest counts */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-border-subtle/60 pb-2">
            <h3 className="text-xs font-semibold text-text-primary">
              Modificar Parámetros de Facturación del Menú Base
            </h3>
            <span className="text-[10px] text-text-muted">Los cambios se aplican al instante</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Precio Adulto */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary block">
                Precio Menú Adulto (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={adultPriceInput}
                onChange={(e) => setAdultPriceInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            {/* Precio Niño */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary block">
                Precio Menú Infantil (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={childPriceInput}
                onChange={(e) => setChildPriceInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            {/* Modo de Conteo */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-text-secondary block">
                Fuente del número de comensales
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUseManual(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                    !useManual
                      ? 'bg-bg-card border-border-strong text-text-primary shadow-xs'
                      : 'bg-bg-secondary/40 border-border-subtle text-text-muted'
                  }`}
                >
                  <div className="font-semibold">✓ Lista de Invitados</div>
                  <div className="text-[10px] text-text-muted mt-0.5">
                    {attendingAdults} ad. / {attendingChildren} niñ.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUseManual(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                    useManual
                      ? 'bg-bg-card border-border-strong text-text-primary shadow-xs'
                      : 'bg-bg-secondary/40 border-border-subtle text-text-muted'
                  }`}
                >
                  <div className="font-semibold">○ Cantidad manual</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Override facturación</div>
                </button>
              </div>
            </div>
          </div>

          {/* Si se eligen cantidades manuales */}
          {useManual && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle/40 animate-fade-in">
              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary block">
                  Adultos manuales
                </label>
                <input
                  type="number"
                  min="0"
                  value={adultOverrideInput}
                  onChange={(e) => setAdultOverrideInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-text-secondary block">
                  Niños manuales
                </label>
                <input
                  type="number"
                  min="0"
                  value={childOverrideInput}
                  onChange={(e) => setChildOverrideInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-medium text-text-secondary block">
              Notas del banquete o condiciones de catering
            </label>
            <input
              type="text"
              placeholder="Ej: Incluye recena, barra libre y maridaje de tintos crianza"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>
        </form>
      )}
    </div>
  );
};
