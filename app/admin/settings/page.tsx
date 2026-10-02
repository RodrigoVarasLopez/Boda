'use client';

import React, { useState } from 'react';
import { INITIAL_WEDDING } from '@/lib/mock-data';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { Settings, Shield, Calendar, CreditCard, Save, Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [wedding, setWedding] = useState(INITIAL_WEDDING);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Configuración & Sistema de Diseño
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-primary">
            Ajustes & Sistema Visual
          </h1>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-5 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Guardado' : 'Guardar Cambios'}</span>
        </button>
      </div>

      {/* Theme Selector Section */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
        <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Tema Visual de la Plataforma (3 Conceptos CSS)</span>
        </div>
        <p className="text-xs text-text-muted">
          Selecciona el sistema visual de la boda. Los cambios se aplicarán instantáneamente a todas las invitaciones sin alterar la estructura.
        </p>
        <ThemeSelector />
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General & Privacy */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Privacidad & Fechas Límite</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                Nombres de la Pareja
              </label>
              <input
                type="text"
                value={wedding.couple_names}
                onChange={(e) => setWedding({ ...wedding, couple_names: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                Fecha Límite de Confirmación (RSVP)
              </label>
              <input
                type="datetime-local"
                value={new Date(wedding.rsvp_deadline).toISOString().slice(0, 16)}
                onChange={(e) => setWedding({ ...wedding, rsvp_deadline: new Date(e.target.value).toISOString() })}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>
        </div>

        {/* Gift Bank IBAN Details */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Datos Bancarios (Lista de Bodas)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                Titular de la Cuenta
              </label>
              <input
                type="text"
                value={wedding.iban_details?.account_holder || ''}
                onChange={(e) =>
                  setWedding({
                    ...wedding,
                    iban_details: { ...wedding.iban_details!, account_holder: e.target.value },
                  })
                }
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-primary block">
                IBAN
              </label>
              <input
                type="text"
                value={wedding.iban_details?.iban || ''}
                onChange={(e) =>
                  setWedding({
                    ...wedding,
                    iban_details: { ...wedding.iban_details!, iban: e.target.value },
                  })
                }
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
