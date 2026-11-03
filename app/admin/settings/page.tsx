'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INITIAL_WEDDING } from '@/lib/mock-data';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { usePlannerProfile, PlannerProfile } from '@/lib/planner-profile-store';
import { useContractsStore } from '@/lib/contracts-store';
import {
  Settings,
  Shield,
  CreditCard,
  Save,
  Check,
  Building2,
  User,
  FileSignature,
  Palette,
  AlertCircle,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  RotateCcw,
} from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'profile' ? 'profile' : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'wedding' | 'themes'>(initialTab);

  // Wedding & Platform state
  const [wedding, setWedding] = useState(INITIAL_WEDDING);
  const [savedWedding, setSavedWedding] = useState(false);

  // Planner Profile state
  const { profile, isComplete, hasAnyData, updateProfile, resetProfile, sessionEmail, sessionName } =
    usePlannerProfile();
  const { applyProfileToAllContracts } = useContractsStore();

  const [formData, setFormData] = useState<PlannerProfile>(profile);
  const [savedProfile, setSavedProfile] = useState(false);
  const [appliedToContracts, setAppliedToContracts] = useState(false);

  // Sync formData with loaded profile
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Handle URL query changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'profile' || tabParam === 'wedding' || tabParam === 'themes') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateProfile(formData);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handleApplyToContracts = () => {
    updateProfile(formData);
    applyProfileToAllContracts(formData);
    setAppliedToContracts(true);
    setTimeout(() => setAppliedToContracts(false), 3000);
  };

  const handleResetProfile = () => {
    if (
      window.confirm(
        '¿Deseas vaciar los datos profesionales de tu cuenta? Los contratos nuevos aparecerán sin datos del profesional.'
      )
    ) {
      resetProfile();
      setFormData({
        business_name: '',
        legal_name: '',
        nif_cif: '',
        address: '',
        phone: '',
        email: '',
        slogan: '',
        bank_name: '',
        iban: '',
        account_holder: '',
        mileage_rate: 0.4,
        mileage_origin: '',
      });
    }
  };

  const handleSaveWedding = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedWedding(true);
    setTimeout(() => setSavedWedding(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Gestión de la Cuenta & Configuración
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Ajustes & Perfil Profesional
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Personaliza tus datos fiscales para contratos, la información de la boda y el sistema de diseño.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'profile'
              ? 'bg-primary text-primary-text shadow-soft'
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Mi Perfil Fiscal & Contratos</span>
          {isComplete ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wedding')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'wedding'
              ? 'bg-primary text-primary-text shadow-soft'
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Web de Boda & RSVP</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === 'themes'
              ? 'bg-primary text-primary-text shadow-soft'
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Sistema Visual (CSS)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MI PERFIL FISCAL & DATOS PARA CONTRATOS                 */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Status Alert Banner */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isComplete
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  isComplete
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3
                  className={`text-xs sm:text-sm font-bold ${
                    isComplete
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {isComplete
                    ? 'Perfil fiscal y profesional completo'
                    : hasAnyData
                    ? 'Perfil fiscal incompleto para contratos'
                    : 'Aún no has configurado tus datos profesionales'}
                </h3>
                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isComplete
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isComplete
                    ? 'Tus contratos de Wedding Planner se generarán automáticamente con tus datos fiscales, nombre comercial e IBAN.'
                    : 'Si dejas estos campos vacíos, los contratos aparecerán sin datos del profesional emisor hasta que los guardes aquí.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasAnyData && (
                <button
                  type="button"
                  onClick={handleResetProfile}
                  className="py-1.5 px-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Vaciar todos los campos"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Vaciar</span>
                </button>
              )}
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-1.5 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
              >
                {savedProfile ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{savedProfile ? 'Guardado' : 'Guardar Perfil'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Identificación Profesional y Legal */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider border-b border-border-subtle pb-3">
              <Building2 className="w-4 h-4" />
              <span>1. Identificación Comercial y Fiscal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Nombre Comercial / Estudio / Marca
                </label>
                <input
                  type="text"
                  placeholder="Ej: RV Wedding & Event Studio"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
                <span className="text-[10px] text-text-muted">
                  Aparece como encabezado principal y marca en contratos y firmas.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Titular Legal / Profesional Autónomo / Razón Social
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rodrigo Varas López"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
                <span className="text-[10px] text-text-muted">
                  Nombre legal que figurará en el REUNIDOS del contrato.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  NIF / CIF / NIE Profesional
                </label>
                <input
                  type="text"
                  placeholder="Ej: 71944951P o B-12345678"
                  value={formData.nif_cif}
                  onChange={(e) => setFormData({ ...formData, nif_cif: e.target.value.toUpperCase() })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Teléfono Profesional
                </label>
                <input
                  type="tel"
                  placeholder="Ej: +34 615 559 110"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Domicilio Profesional / Fiscal Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Paseo de la Castellana 100, 28046 Madrid"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
                <span className="text-[10px] text-text-muted">
                  Domicilio a efectos de notificaciones legales en el contrato.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Email Profesional para Contratos y Notificaciones
                </label>
                <input
                  type="email"
                  placeholder="Ej: contacto@rodrigovaras.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Lema o Slogan Comercial (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diseñando experiencias únicas e inolvidables."
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent italic"
                />
                <span className="text-[10px] text-text-muted">
                  Aparece al pie del contrato y sobre el sello final.
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Datos Bancarios Oficiales */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider border-b border-border-subtle pb-3">
              <CreditCard className="w-4 h-4" />
              <span>2. Datos Bancarios Oficiales para Cobro de Contratos</span>
            </div>
            <p className="text-xs text-text-muted">
              Esta cuenta se insertará en la Cláusula 5 y en el anexo de pagos de cada contrato que emitas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Entidad Bancaria
                </label>
                <input
                  type="text"
                  placeholder="Ej: BBVA, Banco Santander, CaixaBank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rodrigo Varas López"
                  value={formData.account_holder}
                  onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Código IBAN Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: ES57 0182 2754 2202 0159 0988"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent font-mono uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Desplazamientos y Operativa */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider border-b border-border-subtle pb-3">
              <MapPin className="w-4 h-4" />
              <span>3. Parámetros de Kilometraje y Desplazamientos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Localidad / Ciudad de Origen para Kilometraje
                </label>
                <input
                  type="text"
                  placeholder="Ej: Madrid, Valladolid, Zamora"
                  value={formData.mileage_origin}
                  onChange={(e) => setFormData({ ...formData, mileage_origin: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-primary block">
                  Tarifa por Kilómetro (€/km)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  value={formData.mileage_rate}
                  onChange={(e) => setFormData({ ...formData, mileage_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-primary text-primary-text font-semibold text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
              >
                {savedProfile ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
                <span>{savedProfile ? 'Perfil Guardado con Éxito' : 'Guardar Perfil Profesional'}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyToContracts}
                className="py-2.5 px-4 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {appliedToContracts
                    ? '¡Aplicado a todos tus contratos!'
                    : 'Aplicar a todos mis contratos existentes'}
                </span>
              </button>
            </div>

            <span className="text-[11px] text-text-muted">
              {isComplete ? '✓ Perfil completo para contratos' : '⚠️ Faltan datos fiscales obligatorios'}
            </span>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 2: WEB DE BODA & RSVP                                       */}
      {/* ============================================================== */}
      {activeTab === 'wedding' && (
        <form onSubmit={handleSaveWedding} className="space-y-6">
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Privacidad & Fechas Límite de la Boda</span>
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
                  onChange={(e) =>
                    setWedding({ ...wedding, rsvp_deadline: new Date(e.target.value).toISOString() })
                  }
                  className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>
            </div>
          </div>

          {/* Gift Bank IBAN Details */}
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" />
              <span>Datos Bancarios para Regalos de Invitados (Lista de Bodas)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-primary block">
                  Titular de la Cuenta (Pareja)
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
                  IBAN para Regalos
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-primary text-primary-text font-semibold text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
            >
              {savedWedding ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{savedWedding ? 'Guardado' : 'Guardar Ajustes de Boda'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SISTEMA VISUAL & TEMAS CSS                              */}
      {/* ============================================================== */}
      {activeTab === 'themes' && (
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Tema Visual de la Plataforma (3 Conceptos CSS)</span>
          </div>
          <p className="text-xs text-text-muted">
            Selecciona el sistema visual de la boda. Los cambios se aplicarán instantáneamente a todas las
            invitaciones sin alterar la estructura.
          </p>
          <ThemeSelector />
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-text-muted">Cargando ajustes...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
