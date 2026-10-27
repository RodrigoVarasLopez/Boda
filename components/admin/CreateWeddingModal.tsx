'use client';

import React, { useState } from 'react';
import { useWeddingPlanner, DEFAULT_PLATFORM_ORG_ID } from '@/lib/weddings-store';
import { ThemeType } from '@/lib/types';
import {
  X,
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Euro,
  Check,
  Briefcase,
  UserPlus,
  Mail,
  Lock,
} from 'lucide-react';

interface CreateWeddingModalProps {
  onClose: () => void;
  defaultOrgId?: string;
}

export function CreateWeddingModal({ onClose, defaultOrgId }: CreateWeddingModalProps) {
  const { createWedding, organizations } = useWeddingPlanner();

  const [coupleNames, setCoupleNames] = useState('');
  const [weddingDate, setWeddingDate] = useState('2027-09-11T18:00');
  const [locationSummary, setLocationSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [theme, setTheme] = useState<ThemeType>('editorial');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [budgetTarget, setBudgetTarget] = useState<number>(30000);
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    defaultOrgId || DEFAULT_PLATFORM_ORG_ID
  );

  // Optional Basic User (Couple) creation / assignment
  const [assignCoupleUser, setAssignCoupleUser] = useState(false);
  const [coupleEmail, setCoupleEmail] = useState('');
  const [couplePassword, setCouplePassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setCoupleNames(val);
    const generated = val
      .toLowerCase()
      .replace(/[&]/g, 'y')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!coupleNames.trim()) {
      setErrorMsg('Por favor introduce los nombres de la pareja.');
      return;
    }

    const orgObj = organizations.find((o) => o.id === selectedOrgId);

    setSaving(true);
    try {
      const res = await createWedding({
        couple_names: coupleNames.trim(),
        wedding_date: new Date(weddingDate).toISOString(),
        location_summary: locationSummary.trim() || 'Finca & Celebración',
        slug: slug.trim() || undefined,
        theme,
        guest_target_count: guestCount,
        budget_target: budgetTarget,
        planner_org_id: selectedOrgId,
        planner_name: orgObj?.name || 'Administración Oficial · Cartera Directa B2C',
        owner_email: coupleEmail.trim() || undefined,
        create_couple_user: assignCoupleUser && Boolean(coupleEmail.trim() && couplePassword),
        couple_password: couplePassword || undefined,
      });

      if (res && !res.success) {
        setErrorMsg(res.error || 'No se pudo crear la boda en Supabase');
        return;
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-card border border-border-strong rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-card space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alta Real en Base de Datos · B2B &amp; B2C</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-text-primary">
            Registrar Nueva Boda
          </h2>
          <p className="text-xs text-text-muted">
            Se creará una boda independiente en Supabase con su propio presupuesto, lista de invitados, Save the Date y web pública.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de Cartera / Wedding Planner (B2C Admin Default vs B2B Planner) */}
          <div className="p-3.5 rounded-2xl bg-bg-secondary/50 border border-border-subtle space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              <span>Cartera / Wedding Planner Asociada</span>
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.is_platform_default
                    ? `👑 ${org.name} (Clientes B2C del Administrador)`
                    : `💼 ${org.name} (Agencia B2B)`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted">
              Los clientes individuales (B2C) quedan asociados directamente a tu Cartera Oficial de Administrador.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary block">
              Nombres de la Pareja <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={coupleNames}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Alejandro & Carmen"
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
                URL / Slug Web Pública (`/w/...`)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="alejandro-y-carmen"
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
              placeholder="Ej: Finca Las Encinas · Madrid"
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

          {/* Usuario Básico (Pareja) opcional */}
          <div className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-text-accent" />
                <span>Acceso de Usuario Básico (Pareja / Novios)</span>
              </span>
              <input
                type="checkbox"
                checked={assignCoupleUser}
                onChange={(e) => setAssignCoupleUser(e.target.checked)}
                className="rounded border-border-strong text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {assignCoupleUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email de la Pareja
                  </label>
                  <input
                    type="email"
                    value={coupleEmail}
                    onChange={(e) => setCoupleEmail(e.target.value)}
                    placeholder="pareja@email.com"
                    className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Contraseña (si es cuenta nueva)
                  </label>
                  <input
                    type="password"
                    value={couplePassword}
                    onChange={(e) => setCouplePassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full py-2 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
              </div>
            )}
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
              disabled={saving}
              className="py-2.5 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover shadow-soft transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Creando en Base de Datos...' : 'Crear y Activar Boda'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
