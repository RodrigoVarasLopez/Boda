'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTimingStore } from '@/lib/timing-store';
import {
  TIMING_PHASE_LABELS,
  PROFESSIONAL_ROLE_LABELS,
  TimingDay,
} from '@/lib/types';
import { VerticalEventTimeline } from '@/components/admin/timing/VerticalEventTimeline';
import {
  Clock,
  Sparkles,
  Users,
  CheckSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export const PersonalizedTimingSection: React.FC = () => {
  const { milestones, metrics, setCurrentEventMilestone } = useTimingStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDay, setSelectedDay] = useState<'all' | TimingDay>('saturday');

  const visibleMilestones =
    selectedDay === 'all'
      ? milestones
      : milestones.filter((m) => m.day === selectedDay);

  return (
    <div className="pt-6">
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Top Badge & Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              <span>Organización &amp; Cobertura Integral</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary leading-tight">
              Elaboración de vuestro timing personalizado
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Prepararemos un cronograma detallado de toda la jornada, desde los preparativos
              acordados hasta los momentos finales de nuestra cobertura.{' '}
              <strong className="text-text-primary font-semibold">
                No será simplemente un listado de horarios:
              </strong>{' '}
              será nuestra herramienta de trabajo para saber qué tiene que suceder en cada momento,
              qué profesionales intervienen, qué necesitamos tener preparado y cómo evitar retrasos
              innecesarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="py-2.5 px-4 rounded-2xl bg-bg-secondary hover:bg-border-subtle/60 border border-border-subtle text-text-primary text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Ocultar cronograma detallado' : 'Explorar cronograma de trabajo'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <Link
              href="/admin/timing"
              className="py-2.5 px-4 rounded-2xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft transition-colors"
            >
              <span>Gestionar Timing</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Key Operational Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-lg text-text-primary font-medium">
              Qué tiene que suceder
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Guion minuto a minuto desde los preparativos de novio y novia hasta el baile y el cierre de nuestra cobertura ({metrics.coverageSpanLabel}).
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-lg text-text-primary font-medium">
              Qué profesionales intervienen
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Coordinación sincronizada entre Fotografía &amp; Vídeo, Estilismo, Floristería, Ceremonia, Autobuses, Bodega Concejo y DJ.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-brand-olive/20 text-brand-olive flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-lg text-text-primary font-medium">
              Qué tener preparado
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Checklist previa por cada bloque (vestido, alianzas, lecturas, arroz, ramos de entrega, canciones y bengalas) con su responsable asignado.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-lg text-amber-950 font-medium">
              Cómo evitar retrasos
            </h4>
            <p className="text-xs text-amber-900/85 leading-relaxed">
              Protocolos preventivos, tiempos de colchón (+{metrics.totalBufferMinutes} min de margen) y pautas clave para disfrutar sin prisas ni imprevistos.
            </p>
          </div>
        </div>

        {/* VERTICAL TIMELINE SUMMARY BY SELECTED DAY WITH CIRCLES & CURRENT EVENT POINT */}
        <div className="pt-2">
          <VerticalEventTimeline
            milestones={milestones}
            selectedDay={selectedDay}
            onSelectDay={(day) => setSelectedDay(day)}
            counts={{
              saturday: metrics.saturdayCount,
              friday: metrics.fridayCount,
              total: metrics.totalMilestones,
            }}
            onSelectCurrentMilestone={(id) => {
              setCurrentEventMilestone(id);
            }}
            onJumpToMilestone={(id) => {
              setIsExpanded(true);
              setTimeout(() => {
                const el = document.getElementById(`guest-milestone-card-${id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 120);
            }}
          />
        </div>

        {/* Expandable Interactive Run-of-Show Explorer */}
        {isExpanded && (
          <div className="pt-6 border-t border-border-subtle space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex rounded-2xl bg-bg-secondary/60 p-1 border border-border-subtle w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedDay('saturday')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDay === 'saturday'
                      ? 'bg-primary text-primary-text shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Sábado · Gran Día ({metrics.saturdayCount} bloques)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay('friday')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDay === 'friday'
                      ? 'bg-primary text-primary-text shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Viernes · Preboda ({metrics.fridayCount} bloque)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDay === 'all'
                      ? 'bg-primary text-primary-text shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Todo ({metrics.totalMilestones})
                </button>
              </div>

              <span className="text-xs text-text-muted">
                Preparativos verificados: <strong className="text-brand-olive">{metrics.completedChecklistItems}/{metrics.totalChecklistItems} ({metrics.checklistCompletionPercent}%)</strong>
              </span>
            </div>

            <div className="space-y-4">
              {visibleMilestones.map((m) => (
                <div
                  key={m.id}
                  id={`guest-milestone-card-${m.id}`}
                  className="p-5 rounded-2xl bg-bg-secondary/25 border border-border-subtle space-y-4 scroll-mt-24"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle/70 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary text-primary-text">
                          {m.start_time} — {m.end_time} h
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-bg-card border border-border-subtle text-text-secondary font-semibold">
                          {TIMING_PHASE_LABELS[m.phase]}
                        </span>
                        {m.is_critical_moment && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 inline-flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            <span>Momento Clave</span>
                          </span>
                        )}
                      </div>
                      <h5 className="font-serif text-xl text-text-primary">{m.title}</h5>
                    </div>

                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{m.location}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-bg-card border border-border-subtle space-y-1">
                      <span className="text-[10px] font-mono uppercase text-primary font-semibold block">
                        1. Qué sucede
                      </span>
                      <p className="text-text-secondary leading-relaxed">{m.what_happens}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-primary font-semibold block">
                        2. Profesionales
                      </span>
                      <div className="space-y-1">
                        {m.professionals.map((p) => (
                          <div key={p.id} className="text-[11px]">
                            <strong className="text-text-primary">{p.name}</strong>{' '}
                            <span className="text-text-muted">({PROFESSIONAL_ROLE_LABELS[p.role]}):</span>{' '}
                            <span className="text-text-secondary">{p.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-card border border-border-subtle space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-brand-olive font-semibold block">
                        3. Qué tener preparado
                      </span>
                      <ul className="space-y-1">
                        {m.checklist.map((c) => (
                          <li key={c.id} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                c.completed ? 'text-brand-olive' : 'text-text-muted/50'
                              }`}
                            />
                            <span className="text-text-secondary">
                              {c.task} <strong className="text-text-primary">({c.responsible})</strong>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
                        4. Evitar retrasos (+{m.buffer_minutes}m)
                      </span>
                      <p className="text-[11px] text-amber-950 leading-relaxed">
                        {m.anti_delay_protocol}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
