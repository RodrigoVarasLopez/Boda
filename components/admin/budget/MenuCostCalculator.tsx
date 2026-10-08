'use client';

import React, { useState } from 'react';
import { BudgetMenuConfig, BudgetSupplier } from '@/lib/types';
import { formatCurrency, calculateMenuTotal } from '@/lib/budget-data';
import {
  UtensilsCrossed,
  Users,
  Baby,
  Calculator,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface MenuCostCalculatorProps {
  menuConfig: BudgetMenuConfig;
  attendingAdults: number;
  attendingChildren: number;
  menuSupplier?: BudgetSupplier | null;
  onUpdateMenuConfig: (data: {
    adult_price: number;
    child_price: number;
    adult_count_override?: number | null;
    child_count_override?: number | null;
    use_manual_counts: boolean;
    notes?: string | null;
  }) => Promise<void>;
}

export const MenuCostCalculator: React.FC<MenuCostCalculatorProps> = ({
  menuConfig,
  attendingAdults,
  attendingChildren,
  menuSupplier,
  onUpdateMenuConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adultPriceInput, setAdultPriceInput] = useState(String(menuConfig.adult_price));
  const [childPriceInput, setChildPriceInput] = useState(String(menuConfig.child_price));
  const [useManual, setUseManual] = useState(menuConfig.use_manual_counts);
  const [adultOverrideInput, setAdultOverrideInput] = useState(
    menuConfig.adult_count_override != null ? String(menuConfig.adult_count_override) : String(attendingAdults)
  );
  const [childOverrideInput, setChildOverrideInput] = useState(
    menuConfig.child_count_override != null ? String(menuConfig.child_count_override) : String(attendingChildren)
  );
  const [notesInput, setNotesInput] = useState(menuConfig.notes || '');
  const [saving, setSaving] = useState(false);

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
      menuConfig.adult_count_override != null ? String(menuConfig.adult_count_override) : String(attendingAdults)
    );
    setChildOverrideInput(
      menuConfig.child_count_override != null ? String(menuConfig.child_count_override) : String(attendingChildren)
    );
    setNotesInput(menuConfig.notes || '');
    setIsEditing(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-sand/30 text-brand-ink border border-border-subtle">
            <UtensilsCrossed className="w-5 h-5 text-text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                Cálculo del Menú & Catering
              </h2>
              {menuSupplier && (
                <span className="text-[11px] font-semibold text-brand-terracotta bg-bg-secondary px-2.5 py-0.5 rounded-full border border-border-subtle">
                  {menuSupplier.name}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Cálculo en vivo vinculado a confirmaciones RSVP reales de adultos y niños
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 rounded-xl border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-secondary text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-text-accent" />
              <span>Ajustar precios o comensales</span>
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
                className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer shadow-soft"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adultos */}
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
                adultos {useManual ? '(manual)' : 'asistentes'}
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

        {/* Niños */}
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
                niños {useManual ? '(manual)' : 'asistentes'}
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

        {/* TOTAL MENÚ */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-card via-bg-secondary/50 to-brand-sand/20 border-2 border-border-strong shadow-soft flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent font-semibold">
              TOTAL ESTIMADO CATERING
            </span>
            <Calculator className="w-4 h-4 text-text-accent" />
          </div>

          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
              {formatCurrency(calculation.total)}
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Total comensales: <strong className="text-text-primary">{calculation.adultCount + calculation.childCount}</strong> ({calculation.adultCount} ad. + {calculation.childCount} niñ.)
            </p>
          </div>

          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <Info className="w-3 h-3 text-text-accent" />
            <span>Se actualiza automáticamente al cambiar confirmaciones de invitados</span>
          </div>
        </div>
      </div>

      {/* Editing Drawer / Accordion */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border-subtle/60 pb-2">
            <h3 className="text-xs font-semibold text-text-primary">
              Modificar Parámetros de Facturación del Menú
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
                  <div className="font-semibold">✓ Confirmados CRM</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{attendingAdults} ad. / {attendingChildren} niñ.</div>
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
