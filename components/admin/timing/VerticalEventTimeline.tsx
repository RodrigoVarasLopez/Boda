'use client';

import React from 'react';
import {
  TimingMilestone,
  TimingDay,
  TIMING_PHASE_LABELS,
} from '@/lib/types';
import { shiftTimeStr } from '@/lib/timing-data';
import {
  Clock,
  MapPin,
  Flame,
  Check,
  ChevronLeft,
  ChevronRight,
  Radio,
  Sparkles,
  Users,
  CheckSquare,
  ArrowDownCircle,
} from 'lucide-react';

interface VerticalEventTimelineProps {
  milestones: TimingMilestone[];
  selectedDay: 'all' | TimingDay;
  onSelectDay?: (day: 'all' | TimingDay) => void;
  simulatedShiftMinutes?: number;
  onSelectCurrentMilestone?: (milestoneId: string) => void;
  onJumpToMilestone?: (milestoneId: string) => void;
  counts?: {
    saturday: number;
    friday: number;
    total: number;
  };
  compact?: boolean;
}

export const VerticalEventTimeline: React.FC<VerticalEventTimelineProps> = ({
  milestones,
  selectedDay,
  onSelectDay,
  simulatedShiftMinutes = 0,
  onSelectCurrentMilestone,
  onJumpToMilestone,
  counts,
  compact = false,
}) => {
  // Milestones already filtered for the selected day (or filter here just in case)
  const dayMilestones = React.useMemo(() => {
    if (selectedDay === 'all') return milestones;
    return milestones.filter((m) => m.day === selectedDay);
  }, [milestones, selectedDay]);

  // Determine which milestone represents "where we currently are in the event"
  const activeIndex = React.useMemo(() => {
    if (dayMilestones.length === 0) return -1;
    // 1. Explicit 'in_progress' milestone
    const inProgressIdx = dayMilestones.findIndex((m) => m.status === 'in_progress');
    if (inProgressIdx !== -1) return inProgressIdx;

    // 2. First milestone after the last 'completed' one
    let lastCompletedIdx = -1;
    dayMilestones.forEach((m, idx) => {
      if (m.status === 'completed') lastCompletedIdx = idx;
    });
    if (lastCompletedIdx !== -1) {
      return Math.min(lastCompletedIdx + 1, dayMilestones.length - 1);
    }

    // 3. Default to first milestone (index 0) so the user always sees the current point indicator
    return 0;
  }, [dayMilestones]);

  const currentMilestone = activeIndex >= 0 ? dayMilestones[activeIndex] : null;
  const nextMilestone =
    activeIndex >= 0 && activeIndex + 1 < dayMilestones.length
      ? dayMilestones[activeIndex + 1]
      : null;

  // Progress percentage along the vertical line (0% at first circle, 100% at last circle)
  const progressPercent = React.useMemo(() => {
    if (dayMilestones.length <= 1 || activeIndex <= 0) return 0;
    return Math.round((activeIndex / (dayMilestones.length - 1)) * 100);
  }, [dayMilestones.length, activeIndex]);

  const completedProportionPercent = React.useMemo(() => {
    if (dayMilestones.length === 0 || activeIndex < 0) return 0;
    return Math.round(((activeIndex + 1) / dayMilestones.length) * 100);
  }, [dayMilestones.length, activeIndex]);

  const dayLabel =
    selectedDay === 'saturday'
      ? 'Sábado · Gran Día'
      : selectedDay === 'friday'
      ? 'Viernes · Preboda'
      : 'Todo el Fin de Semana';

  if (dayMilestones.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
      {/* TOP HEADER & LIVE EVENT POINT TRACKER ("¿EN QUÉ PUNTO NOS ENCONTRAMOS?") */}
      <div className="p-5 sm:p-7 bg-gradient-to-br from-primary/10 via-bg-secondary/50 to-bg-card border-b border-border-subtle space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-text text-[11px] font-semibold uppercase tracking-widest shadow-2xs">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Seguimiento en Vivo · Línea Temporal Vertical</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-text-primary font-normal">
              ¿En qué punto nos encontramos del evento?
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Resumen visual en vertical de todos los hitos de{' '}
              <strong className="text-text-primary">{dayLabel}</strong>. Haz clic en cualquier{' '}
              <strong className="text-primary">círculo</strong> para situar el punto actual de la boda.
            </p>
          </div>

          {/* Day Selector Pills */}
          {onSelectDay && (
            <div className="flex items-center gap-1.5 bg-bg-card p-1.5 rounded-2xl border border-border-subtle shadow-2xs w-fit shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => onSelectDay('saturday')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDay === 'saturday'
                    ? 'bg-primary text-primary-text shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sábado · Gran Día {counts ? `(${counts.saturday})` : ''}
              </button>
              <button
                type="button"
                onClick={() => onSelectDay('friday')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDay === 'friday'
                    ? 'bg-primary text-primary-text shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Viernes · Preboda {counts ? `(${counts.friday})` : ''}
              </button>
              {counts && (
                <button
                  type="button"
                  onClick={() => onSelectDay('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedDay === 'all'
                      ? 'bg-primary text-primary-text shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Todo ({counts.total})
                </button>
              )}
            </div>
          )}
        </div>

        {/* CURRENT POINT STATUS BANNER */}
        {currentMilestone && (
          <div className="p-4 sm:p-5 rounded-2xl bg-bg-card border border-primary/30 shadow-soft grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left: Current Active Milestone */}
            <div className="lg:col-span-6 flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-text flex flex-col items-center justify-center shrink-0 ring-4 ring-primary/20 shadow-soft font-mono">
                <span className="text-[9px] uppercase tracking-wider opacity-80 leading-none">
                  Hito
                </span>
                <span className="text-base font-bold leading-tight">
                  {activeIndex + 1}/{dayMilestones.length}
                </span>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>Punto Actual del Evento</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-primary">
                    {shiftTimeStr(currentMilestone.start_time, simulatedShiftMinutes)} —{' '}
                    {shiftTimeStr(currentMilestone.end_time, simulatedShiftMinutes)} h
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl text-text-primary font-medium truncate">
                  {currentMilestone.title}
                </h3>

                <p className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{currentMilestone.location}</span>
                </p>
              </div>
            </div>

            {/* Middle: Progress & Next Milestone */}
            <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-border-subtle pt-3 lg:pt-0 lg:pl-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">
                  Recorrido de la jornada
                </span>
                <span className="font-mono font-bold text-primary">
                  {completedProportionPercent}% ({activeIndex + 1} de {dayMilestones.length} hitos)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completedProportionPercent}%` }}
                />
              </div>
              {nextMilestone ? (
                <p className="text-[11px] text-text-muted truncate">
                  Siguiente:{' '}
                  <strong className="text-text-primary">
                    {shiftTimeStr(nextMilestone.start_time, simulatedShiftMinutes)}h ·{' '}
                    {nextMilestone.title}
                  </strong>
                </p>
              ) : (
                <p className="text-[11px] text-brand-olive font-semibold">
                  ✓ Último hito de la jornada alcanzado
                </p>
              )}
            </div>

            {/* Right: Step Prev / Next Controls */}
            {onSelectCurrentMilestone && (
              <div className="lg:col-span-2 flex items-center justify-end gap-2 print:hidden">
                <button
                  type="button"
                  disabled={activeIndex <= 0}
                  onClick={() => {
                    if (activeIndex > 0) {
                      onSelectCurrentMilestone(dayMilestones[activeIndex - 1].id);
                    }
                  }}
                  className="p-2.5 rounded-xl border border-border-subtle bg-bg-secondary/50 hover:bg-bg-secondary disabled:opacity-40 text-text-primary transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Retroceder al hito anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={activeIndex >= dayMilestones.length - 1}
                  onClick={() => {
                    if (activeIndex + 1 < dayMilestones.length) {
                      onSelectCurrentMilestone(dayMilestones[activeIndex + 1].id);
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  title="Avanzar al siguiente hito del evento"
                >
                  <span>Siguiente hito</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VERTICAL TIMELINE WITH CIRCLES AND MILESTONE TITLES */}
      <div className="p-5 sm:p-8 bg-bg-card">
        <div className="relative max-w-4xl mx-auto">
          {/* Continuous Vertical Background Line connecting the circles */}
          <div
            className="absolute left-6 sm:left-8 top-6 bottom-6 w-1 bg-border-subtle rounded-full -translate-x-1/2"
            aria-hidden="true"
          />

          {/* Dynamic Vertical Progress Fill Line up to current active circle */}
          <div
            className="absolute left-6 sm:left-8 top-6 w-1 bg-gradient-to-b from-brand-olive via-primary to-primary rounded-full -translate-x-1/2 transition-all duration-500"
            style={{
              height:
                dayMilestones.length > 1
                  ? `calc(${progressPercent}% - 1.5rem)`
                  : '0%',
            }}
            aria-hidden="true"
          />

          <div className="space-y-4 relative z-10">
            {dayMilestones.map((m, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const effStart = shiftTimeStr(m.start_time, simulatedShiftMinutes);
              const effEnd = shiftTimeStr(m.end_time, simulatedShiftMinutes);
              const doneCheck = m.checklist.filter((c) => c.completed).length;

              return (
                <div
                  key={m.id}
                  className={`group relative flex items-start gap-4 sm:gap-6 transition-all ${
                    isCurrent ? 'scale-[1.01]' : ''
                  }`}
                >
                  {/* THE CIRCLE NODE ON THE VERTICAL AXIS */}
                  <button
                    type="button"
                    onClick={() => onSelectCurrentMilestone?.(m.id)}
                    title={
                      onSelectCurrentMilestone
                        ? `Situar el evento en: ${m.title} (${effStart} h)`
                        : `${m.title} (${effStart} h)`
                    }
                    className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shrink-0 transition-all duration-300 cursor-pointer select-none ${
                      isCurrent
                        ? 'bg-primary text-primary-text ring-4 sm:ring-8 ring-primary/20 shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-brand-olive text-white border-2 border-white shadow-soft hover:scale-105'
                        : 'bg-bg-card text-text-secondary border-2 border-border-strong hover:border-primary hover:text-primary shadow-2xs hover:scale-105'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold leading-none mt-0.5">
                          {effStart}
                        </span>
                      </>
                    ) : isCurrent ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping absolute top-1.5 right-1.5" />
                        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-tighter opacity-90 leading-none">
                          AHORA
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold leading-tight mt-0.5">
                          {effStart}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] font-mono text-text-muted leading-none">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono font-bold leading-tight mt-0.5">
                          {effStart}
                        </span>
                      </>
                    )}
                  </button>

                  {/* MILESTONE CIRCLE LABEL CARD WITH TITLE & SUMMARY */}
                  <div
                    onClick={() => onSelectCurrentMilestone?.(m.id)}
                    className={`flex-1 rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/30 shadow-soft'
                        : isCompleted
                        ? 'bg-bg-secondary/35 border-brand-olive/30 opacity-90 hover:opacity-100'
                        : 'bg-bg-card border-border-subtle hover:border-primary/50 hover:bg-bg-secondary/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Badge */}
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary text-primary-text text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                              <Radio className="w-3 h-3 animate-pulse" />
                              <span>Estamos Aquí · En Curso</span>
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-olive/15 text-brand-olive text-[10px] font-semibold uppercase tracking-wider">
                              <Check className="w-3 h-3" />
                              <span>Completado</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted text-[10px] font-mono uppercase tracking-wider">
                              <span>Próximo · Hito {idx + 1}</span>
                            </span>
                          )}

                          {/* Schedule range */}
                          <span className="font-mono text-xs font-bold text-text-primary inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>
                              {effStart} — {effEnd} h
                            </span>
                          </span>

                          {/* Day pill if viewing all */}
                          {selectedDay === 'all' && (
                            <span className="px-2 py-0.5 rounded-md bg-bg-secondary text-[10px] font-mono uppercase font-semibold text-text-secondary">
                              {m.day === 'friday' ? 'Viernes' : 'Sábado'}
                            </span>
                          )}

                          {/* Phase label */}
                          <span className="px-2 py-0.5 rounded-full bg-bg-secondary border border-border-subtle text-[10px] font-semibold text-text-secondary">
                            {TIMING_PHASE_LABELS[m.phase]}
                          </span>

                          {m.is_critical_moment && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-600" />
                              <span>Momento Clave</span>
                            </span>
                          )}
                        </div>

                        {/* MILESTONE TITLE */}
                        <h4
                          className={`font-serif text-base sm:text-xl leading-snug ${
                            isCurrent
                              ? 'text-primary font-semibold'
                              : isCompleted
                              ? 'text-text-primary'
                              : 'text-text-primary'
                          }`}
                        >
                          {m.title}
                        </h4>

                        {!compact && (
                          <p className="text-xs text-text-secondary line-clamp-1">
                            {m.what_happens}
                          </p>
                        )}
                      </div>

                      {/* Right side metadata & Jump to detail button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-1 sm:pt-0">
                        <div className="flex items-center gap-2 text-[11px] text-text-muted">
                          <span className="inline-flex items-center gap-1" title="Ubicación">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span className="max-w-[140px] truncate">{m.location}</span>
                          </span>
                          <span
                            className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-bg-secondary text-text-secondary font-mono text-[10px]"
                            title="Equipos profesionales que intervienen"
                          >
                            <Users className="w-3 h-3 text-primary" />
                            {m.professionals.length}
                          </span>
                          <span
                            className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] ${
                              doneCheck === m.checklist.length && m.checklist.length > 0
                                ? 'bg-brand-olive/15 text-brand-olive font-semibold'
                                : 'bg-bg-secondary text-text-secondary'
                            }`}
                            title="Preparativos listos"
                          >
                            <CheckSquare className="w-3 h-3" />
                            {doneCheck}/{m.checklist.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 print:hidden">
                          {!isCurrent && onSelectCurrentMilestone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCurrentMilestone(m.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-text text-primary text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Situar aquí 📍
                            </button>
                          )}

                          {onJumpToMilestone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onJumpToMilestone(m.id);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ir a la ficha detallada de este hito"
                            >
                              <span>Ver detalle</span>
                              <ArrowDownCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
