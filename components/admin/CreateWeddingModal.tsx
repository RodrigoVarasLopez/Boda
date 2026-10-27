'use client';

import React, { useState } from 'react';
import { useWeddingPlanner } from '@/lib/weddings-store';
import { ThemeType } from '@/lib/types';
import { X, Sparkles, Calendar, MapPin, Users, Euro, Check } from 'lucide-react';

interface CreateWeddingModalProps {
  onClose: () => void;
}

export function CreateWeddingModal({ onClose }: CreateWeddingModalProps) {
  const { createWedding } = useWeddingPlanner();

  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('2027-09-11T18:00');
  const [locationSummary, setLocationSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState<ThemeType>('editorial');
  const [guestCount, setGuestCount] = useState<number>(120);
  const [budgetTarget, setBudgetTarget] = useState<number>(30000);

  const handleNameChange = (val: string) => {
    setCoupleNames(val);
    if (!slug || slug === '') {
      const generated = val
        .toLowerCase()
        .replace(/[&]/g, 'y')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleNames.trim()) {
      alert('Por favor introduce los nombres de la pareja.');
      return;
    }

    createWedding({
      couple_names: coupleNames.trim(),
      wedding_date: new Date(weddingDate).toISOString(),
      location_summary: locationSummary.trim() || 'Finca & Celebración',
      slug: slug.trim() || undefined,
      theme,
      guest_target_count: guestCount,
      budget_target: budgetTarget,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border-strong rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-card space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wedding Planner Multiboda</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-text-primary">
            Registrar Nueva Boda
          </h2>
          <p className="text-xs text-text-muted">
            Crea un nuevo enlace para tu cartera de clientes. Tendrá su propia invitación, Save the Date y panel de gestión.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary block">
              Nombres de la Pareja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={coupleNames}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Carlos & Elena"
              className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-text-accent" />
                Fecha &amp; Hora
              </label>
              <input
                type="datetime-local"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary block">
                URL / Slug Personalizado
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="carlos-y-elena"
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-olive" />
              Lugar / Finca / Ciudad
            </label>
            <input
              type="text"
              required
              value={locationSummary}
              onChange={(e) => setLocationSummary(e.target.value)}
              placeholder="Ej: Finca El Soto · Madrid"
              className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-text-accent" />
                Invitados Estimados
              </label>
              <input
                type="number"
                min="10"
                max="2000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary flex items-center gap-1">
                <Euro className="w-3.5 h-3.5 text-emerald-600" />
                Presupuesto Objetivo (€)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={budgetTarget}
                onChange={(e) => setBudgetTarget(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary block">
              Tema Visual de la Boda
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['editorial', 'mediterranean', 'cinematic'] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                    theme === t
                      ? 'border-primary bg-primary/10 text-text-primary font-bold shadow-xs'
                      : 'border-border-subtle hover:bg-bg-secondary text-text-secondary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-border-subtle text-text-secondary hover:bg-bg-secondary text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover shadow-soft transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Crear y Gestionar Boda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
