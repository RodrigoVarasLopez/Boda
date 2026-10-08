'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetCategory, BudgetType, BUDGET_TYPE_LABELS } from '@/lib/types';
import {
  X,
  Plus,
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
  Check,
} from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  categoryToEdit?: BudgetCategory | null;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    name: string;
    budget_type: BudgetType;
    description?: string | null;
    icon?: string | null;
  }) => Promise<void>;
}

const CATEGORY_SUGGESTIONS = [
  { name: 'Papelería e Imprenta', icon: 'Receipt', type: 'fixed' as BudgetType },
  { name: 'Invitaciones y Caligrafía', icon: 'Receipt', type: 'fixed' as BudgetType },
  { name: 'Maquillaje y Estilismo', icon: 'Scissors', type: 'fixed' as BudgetType },
  { name: 'Peluquería', icon: 'Scissors', type: 'fixed' as BudgetType },
  { name: 'Transporte y Coche Clásico', icon: 'Car', type: 'fixed' as BudgetType },
  { name: 'Autobuses Invitados', icon: 'Bus', type: 'fixed' as BudgetType },
  { name: 'Alojamiento y Hotel', icon: 'Crown', type: 'fixed' as BudgetType },
  { name: 'Tarta Nupcial & Candy Bar', icon: 'Cake', type: 'mixed' as BudgetType },
  { name: 'Ramo de Novia', icon: 'Flower2', type: 'fixed' as BudgetType },
  { name: 'Zapatos y Accesorios', icon: 'Shirt', type: 'fixed' as BudgetType },
  { name: 'Alianzas y Joyería', icon: 'Crown', type: 'fixed' as BudgetType },
  { name: 'Luna de Miel', icon: 'Heart', type: 'fixed' as BudgetType },
  { name: 'Animación Infantil & Guardería', icon: 'Sparkles', type: 'fixed' as BudgetType },
  { name: 'Detalles Invitados', icon: 'Gift', type: 'per_guest' as BudgetType },
];

const AVAILABLE_ICONS = [
  { name: 'Flower2', icon: Flower2, label: 'Flores' },
  { name: 'Sparkles', icon: Sparkles, label: 'Decoración' },
  { name: 'Music', icon: Music, label: 'Música' },
  { name: 'Headphones', icon: Headphones, label: 'DJ' },
  { name: 'Crown', icon: Crown, label: 'Joyería/Corona' },
  { name: 'Shirt', icon: Shirt, label: 'Moda/Vestido' },
  { name: 'Flame', icon: Flame, label: 'Pirotecnia' },
  { name: 'Camera', icon: Camera, label: 'Foto/Vídeo' },
  { name: 'Guitar', icon: Guitar, label: 'Banda/Guitarra' },
  { name: 'Mic2', icon: Mic2, label: 'Voz/Sonido' },
  { name: 'Wine', icon: Wine, label: 'Bodega/Vino' },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Catering' },
  { name: 'Receipt', icon: Receipt, label: 'Papelería' },
  { name: 'Bus', icon: Bus, label: 'Autobús' },
  { name: 'Car', icon: Car, label: 'Vehículo' },
  { name: 'Gift', icon: Gift, label: 'Detalles' },
  { name: 'Heart', icon: Heart, label: 'Romance' },
  { name: 'Scissors', icon: Scissors, label: 'Estilismo' },
  { name: 'Cake', icon: Cake, label: 'Tarta' },
  { name: 'Palette', icon: Palette, label: 'Arte/Diseño' },
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSubmit,
}) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetType>('fixed');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setBudgetType(categoryToEdit.budget_type);
      setDescription(categoryToEdit.description || '');
      setIcon(categoryToEdit.icon || 'Sparkles');
    } else {
      setName('');
      setBudgetType('fixed');
      setDescription('');
      setIcon('Sparkles');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSelectSuggestion = (s: typeof CATEGORY_SUGGESTIONS[0]) => {
    setName(s.name);
    setIcon(s.icon);
    setBudgetType(s.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        id: categoryToEdit?.id,
        name: name.trim(),
        budget_type: budgetType,
        description: description.trim() || null,
        icon,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting category:', err);
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
            <h3 className="font-serif text-2xl text-text-primary font-medium tracking-tight">
              {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría de Gasto'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Organiza presupuestos y proveedores para este concepto
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Suggestions Chips (only if creating new) */}
          {!categoryToEdit && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Sugerencias rápidas
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-neutral-50/80 rounded-xl border border-neutral-100">
                {CATEGORY_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-border-subtle text-text-secondary hover:text-text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>+</span>
                    <span>{sug.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Autobuses Invitados, Maquillaje..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Budget Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tipo de cálculo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['fixed', 'per_guest', 'mixed'] as BudgetType[]).map((type) => {
                const isCurrent = budgetType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBudgetType(type)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                        : 'border-border-subtle bg-bg-card text-text-secondary hover:border-neutral-300'
                    }`}
                  >
                    {BUDGET_TYPE_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Icono visual
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-2 bg-neutral-50/70 border border-border-subtle rounded-xl max-h-36 overflow-y-auto">
              {AVAILABLE_ICONS.map((ic) => {
                const IconComponent = ic.icon;
                const isSel = icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcon(ic.name)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                      isSel
                        ? 'border-primary bg-primary/15 text-primary shadow-2xs'
                        : 'border-transparent text-text-muted hover:text-text-primary hover:bg-white'
                    }`}
                    title={ic.label}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[9px] truncate max-w-full">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Descripción o notas
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre lo que debe incluir esta partida..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-border-subtle bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
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
              disabled={loading || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover text-sm font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{categoryToEdit ? 'Guardar Cambios' : 'Crear Categoría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
