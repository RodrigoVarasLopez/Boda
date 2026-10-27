'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWeddingPlanner } from '@/lib/weddings-store';
import { CreateWeddingModal } from '@/components/admin/CreateWeddingModal';
import {
  Briefcase,
  Plus,
  Calendar,
  MapPin,
  Users,
  Euro,
  Check,
  Eye,
  Sparkles,
  ExternalLink,
  Trash2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
} from 'lucide-react';

export default function WeddingPlannerPage() {
  const router = useRouter();
  const {
    weddings,
    activeWedding,
    activeWeddingId,
    selectWedding,
    deleteWedding,
    stats,
  } = useWeddingPlanner();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'planning'>('all');

  const filteredWeddings = weddings.filter((w) => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const getDaysUntil = (dateStr: string) => {
    try {
      const target = new Date(dateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? `${diff} días restantes` : 'Celebrada';
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSelectAndManage = (weddingId: string) => {
    selectWedding(weddingId);
    router.push('/admin');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Capa Superior · Multi-Boda Wedding Planner</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Cartera de Bodas &amp; Clientes
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
            Gestiona de forma independiente múltiples bodas desde un único centro de mando. Cambia de boda activa con un clic para acceder a sus invitados, presupuesto, Save the Date y contenido web.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="py-3 px-5 rounded-2xl bg-primary text-primary-text font-semibold text-xs sm:text-sm flex items-center gap-2 hover:bg-primary-hover shadow-card transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Nueva Boda</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold block">
            Total Bodas en Cartera
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-text-primary">
              {stats.totalWeddings}
            </span>
            <span className="text-xs text-text-muted">parejas</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-semibold block">
            Confirmadas / En Marcha
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-emerald-600">
              {stats.confirmedWeddings}
            </span>
            <span className="text-xs text-text-muted">bodas</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-accent font-semibold block">
            Invitados Estimados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-text-primary">
              {stats.totalTargetGuests}
            </span>
            <span className="text-xs text-text-muted">asistentes globales</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-dark dark:text-brand-cream font-semibold block">
            Presupuesto Cartera
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-text-primary">
              {stats.totalBudgetTarget.toLocaleString('es-ES')} €
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-4">
        {(['all', 'confirmed', 'planning'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`py-2 px-4 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filter === tab
                ? 'bg-primary text-primary-text shadow-soft'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'all' ? 'Todas las Bodas' : tab === 'confirmed' ? 'Confirmadas' : 'En Planificación'}
          </button>
        ))}
      </div>

      {/* Weddings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWeddings.map((w) => {
          const isActive = w.id === activeWeddingId;
          const countdown = getDaysUntil(w.wedding_date);

          return (
            <div
              key={w.id}
              className={`rounded-3xl bg-bg-card border p-6 flex flex-col justify-between transition-all shadow-card space-y-6 ${
                isActive
                  ? 'border-primary ring-2 ring-primary/20 shadow-soft'
                  : 'border-border-subtle hover:border-border-strong'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
                        isActive
                          ? 'bg-primary text-primary-text border-primary'
                          : 'bg-bg-secondary text-text-secondary border-border-subtle'
                      }`}
                    >
                      {isActive ? '✦ Boda Activa' : 'Boda en Cartera'}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {countdown}
                    </span>
                  </div>

                  {/* Delete button if more than 1 */}
                  {weddings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la boda de ${w.couple_names} de la cartera?`)) {
                          deleteWedding(w.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar boda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-text-primary tracking-tight">
                    {w.couple_names}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-accent shrink-0" />
                    <span>{formatDate(w.wedding_date)}</span>
                  </p>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                    <span className="truncate">{w.location_summary}</span>
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-border-subtle/60 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-text-muted block">
                    Invitados
                  </span>
                  <span className="font-semibold text-text-primary">
                    {w.guest_target_count || 100} previstos
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-text-muted block">
                    Presupuesto
                  </span>
                  <span className="font-semibold text-text-primary">
                    {(w.budget_target || 25000).toLocaleString('es-ES')} €
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {isActive ? (
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
                  >
                    <span>Entrar al Panel de Control</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectAndManage(w.id)}
                    className="w-full py-2.5 px-4 rounded-xl border border-border-strong hover:bg-primary hover:text-primary-text hover:border-primary text-text-primary text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Activar y Gestionar Boda</span>
                  </button>
                )}

                {/* Secondary Links: Invitación y Save the Date */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/w/${w.slug}`}
                    target="_blank"
                    className="flex-1 py-2 px-2.5 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-[11px] font-medium text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Invitación</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </Link>

                  <Link
                    href="/save-the-date"
                    target="_blank"
                    className="flex-1 py-2 px-2.5 rounded-xl border border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save the Date</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateWeddingModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
