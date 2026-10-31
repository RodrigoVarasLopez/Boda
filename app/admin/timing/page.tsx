'use client';

import React, { useState, useMemo } from 'react';
import { useTimingStore } from '@/lib/timing-store';
import {
  TimingMilestone,
  TimingDay,
  TimingPhase,
  TimingStatus,
  ProfessionalRole,
  TIMING_PHASE_LABELS,
  TIMING_STATUS_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from '@/lib/types';
import {
  getDurationMinutes,
  formatDurationEs,
  shiftTimeStr,
} from '@/lib/timing-data';
import { TimingMilestoneModal } from '@/components/admin/timing/TimingMilestoneModal';
import {
  Clock,
  Plus,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
  CheckSquare,
  ShieldAlert,
  MapPin,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Edit3,
  Copy,
  Trash2,
  RotateCcw,
  UserCheck,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Layers,
  ListChecks,
} from 'lucide-react';

export default function AdminTimingPage() {
  const {
    isLoaded,
    milestones,
    metrics,
    simulatedShiftMinutes,
    setSimulatedShiftMinutes,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    duplicateMilestone,
    updateMilestoneStatus,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    applyPermanentTimeShift,
    syncProfessionalsFromBudget,
    resetToDefaultTiming,
  } = useTimingStore();

  // Filter states
  const [dayFilter, setDayFilter] = useState<'all' | TimingDay>('saturday');
  const [phaseFilter, setPhaseFilter] = useState<'all' | TimingPhase>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | ProfessionalRole>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'critical' | 'pending_prep'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'worktool' | 'compact'>('worktool');

  // Inline quick-add checklist item per milestone
  const [newTaskByMilestone, setNewTaskByMilestone] = useState<Record<string, string>>({});
  const [newRespByMilestone, setNewRespByMilestone] = useState<Record<string, string>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<TimingMilestone | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    return milestones.filter((m) => {
      if (dayFilter !== 'all' && m.day !== dayFilter) return false;
      if (phaseFilter !== 'all' && m.phase !== phaseFilter) return false;
      if (
        roleFilter !== 'all' &&
        !m.professionals.some((p) => p.role === roleFilter)
      ) {
        return false;
      }
      if (quickFilter === 'critical' && !m.is_critical_moment) return false;
      if (
        quickFilter === 'pending_prep' &&
        !m.checklist.some((c) => !c.completed)
      ) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const inTitle = m.title.toLowerCase().includes(q);
        const inWhat = m.what_happens.toLowerCase().includes(q);
        const inLoc = m.location.toLowerCase().includes(q);
        const inProf = m.professionals.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.action.toLowerCase().includes(q) ||
            PROFESSIONAL_ROLE_LABELS[p.role].toLowerCase().includes(q)
        );
        const inCheck = m.checklist.some(
          (c) =>
            c.task.toLowerCase().includes(q) ||
            c.responsible.toLowerCase().includes(q)
        );
        const inDelay = m.anti_delay_protocol.toLowerCase().includes(q);

        if (!inTitle && !inWhat && !inLoc && !inProf && !inCheck && !inDelay) {
          return false;
        }
      }

      return true;
    });
  }, [milestones, dayFilter, phaseFilter, roleFilter, quickFilter, searchTerm]);

  // Export CSV handler
  const handleExportCSV = () => {
    try {
      const headers = [
        'Día',
        'Hora Inicio',
        'Hora Fin',
        'Duración',
        'Colchón (min)',
        'Etapa',
        'Hito / Momento',
        'Ubicación',
        'Momento Clave',
        'Qué tiene que suceder',
        'Profesionales que intervienen',
        'Qué necesitamos tener preparado (Checklist)',
        'Cómo evitar retrasos innecesarios',
        'Responsable / Coordinador',
      ];

      const rows = filteredMilestones.map((m) => {
        const effStart = shiftTimeStr(m.start_time, simulatedShiftMinutes);
        const effEnd = shiftTimeStr(m.end_time, simulatedShiftMinutes);
        const dur = formatDurationEs(getDurationMinutes(m.start_time, m.end_time));
        const profsStr = m.professionals
          .map((p) => `${PROFESSIONAL_ROLE_LABELS[p.role]} (${p.name}): ${p.action}`)
          .join(' | ');
        const checkStr = m.checklist
          .map((c) => `[${c.completed ? 'LISTO' : 'PENDIENTE'}] ${c.task} (${c.responsible})`)
          .join(' | ');

        return [
          `"${m.day === 'friday' ? 'Viernes Preboda' : 'Sábado Gran Día'}"`,
          `"${effStart}"`,
          `"${effEnd}"`,
          `"${dur}"`,
          m.buffer_minutes,
          `"${TIMING_PHASE_LABELS[m.phase]}"`,
          `"${m.title.replace(/"/g, '""')}"`,
          `"${m.location.replace(/"/g, '""')}"`,
          `"${m.is_critical_moment ? 'SÍ' : 'No'}"`,
          `"${m.what_happens.replace(/"/g, '""')}"`,
          `"${profsStr.replace(/"/g, '""')}"`,
          `"${checkStr.replace(/"/g, '""')}"`,
          `"${m.anti_delay_protocol.replace(/"/g, '""')}"`,
          `"${(m.lead_coordinator || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `timing_personalizado_rodrigo_stephanie_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Timing personalizado exportado a CSV correctamente');
    } catch (e) {
      console.error(e);
      showToast('Error al exportar el cronograma');
    }
  };

  const handleQuickAddChecklist = (milestoneId: string) => {
    const task = (newTaskByMilestone[milestoneId] || '').trim();
    const resp = (newRespByMilestone[milestoneId] || '').trim() || 'Pareja / Coordinación';
    if (!task) return;
    addChecklistItem(milestoneId, task, resp);
    setNewTaskByMilestone((prev) => ({ ...prev, [milestoneId]: '' }));
    setNewRespByMilestone((prev) => ({ ...prev, [milestoneId]: '' }));
    showToast('Elemento añadido a la lista de preparación');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">
            Cargando vuestro timing personalizado...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-fade-in border border-neutral-700 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. EDITORIAL HERO SECTION WITH USER'S EXACT STATEMENT OF PURPOSE */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              <span>Escaleta Operativa &amp; Cobertura Integral</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
              Elaboración de vuestro timing personalizado
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed">
              Prepararemos un cronograma detallado de toda la jornada, desde los preparativos
              acordados hasta los momentos finales de nuestra cobertura.{' '}
              <strong className="font-semibold text-text-primary">
                No será simplemente un listado de horarios:
              </strong>{' '}
              será nuestra herramienta de trabajo para saber{' '}
              <span className="underline decoration-primary/50 underline-offset-4">
                qué tiene que suceder en cada momento
              </span>
              ,{' '}
              <span className="underline decoration-primary/50 underline-offset-4">
                qué profesionales intervienen
              </span>
              ,{' '}
              <span className="underline decoration-brand-olive/60 underline-offset-4">
                qué necesitamos tener preparado
              </span>{' '}
              y{' '}
              <span className="underline decoration-amber-500/60 underline-offset-4">
                cómo evitar retrasos innecesarios
              </span>
              .
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 print:hidden">
            <button
              type="button"
              onClick={() => {
                const count = syncProfessionalsFromBudget();
                showToast(
                  count > 0
                    ? `Sincronizados proveedores seleccionados desde Presupuesto`
                    : 'Proveedores al día con el módulo de Presupuesto'
                );
              }}
              className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-secondary/50 hover:bg-bg-secondary text-text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Importar nombres y teléfonos de los proveedores seleccionados en Presupuesto"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Sincronizar Proveedores</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Descargar escaleta completa en Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-text-muted" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir o guardar en PDF para entregar a proveedores"
            >
              <Printer className="w-3.5 h-3.5 text-text-muted" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMilestoneToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Añadir Hito</span>
            </button>
          </div>
        </div>

        {/* 4 PILLARS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-border-subtle">
          <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                1. QUÉ SUCEDE EN CADA MOMENTO
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-2xl text-text-primary">
              {metrics.totalMilestones} hitos ({metrics.criticalMomentsCount} clave)
            </p>
            <p className="text-[11px] text-text-muted">
              Cobertura Sábado: <strong className="text-text-primary">{metrics.coverageSpanLabel}</strong> ({metrics.totalCoverageHoursLabel})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                2. PROFESIONALES EN ACCIÓN
              </span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="font-serif text-2xl text-text-primary">
              {metrics.uniqueProfessionalsCount} equipos coordinados
            </p>
            <p className="text-[11px] text-text-muted">
              Foto/Vídeo, Maquillaje, Iglesia, Autobuses, Bodega Concejo &amp; DJ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-olive font-semibold">
                3. QUÉ TENER PREPARADO
              </span>
              <CheckSquare className="w-4 h-4 text-brand-olive" />
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-serif text-2xl text-brand-olive">
                {metrics.completedChecklistItems}/{metrics.totalChecklistItems} listos
              </p>
              <span className="font-mono text-xs font-bold text-brand-olive">
                {metrics.checklistCompletionPercent}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/80 overflow-hidden">
              <div
                style={{ width: `${metrics.checklistCompletionPercent}%` }}
                className="h-full bg-brand-olive transition-all duration-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold">
                4. EVITAR RETRASOS
              </span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <p className="font-serif text-2xl text-amber-900">
              +{metrics.totalBufferMinutes} min de colchón
            </p>
            <p className="text-[11px] text-amber-800/80">
              Protocolos preventivos y márgenes de seguridad por fase
            </p>
          </div>
        </div>
      </div>

      {/* 2. ANTI-DELAY SIMULATOR & OPERATIONAL ALERTS BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 print:hidden">
        {/* Live Delay Simulator / Buffer Control */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Simulador de Puntualidad &amp; Reajuste en Tiempo Real</span>
              </span>
              <h2 className="font-serif text-lg text-text-primary mt-0.5">
                ¿Qué pasa si la jornada se adelanta o acumula algún retraso?
              </h2>
            </div>

            {simulatedShiftMinutes !== 0 && (
              <button
                type="button"
                onClick={() => {
                  applyPermanentTimeShift(simulatedShiftMinutes, dayFilter);
                  showToast(
                    `Horarios actualizados permanentemente (${
                      simulatedShiftMinutes > 0 ? `+${simulatedShiftMinutes}` : simulatedShiftMinutes
                    } min)`
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
              >
                Guardar nuevo horario ({simulatedShiftMinutes > 0 ? `+${simulatedShiftMinutes}` : simulatedShiftMinutes}m)
              </button>
            )}
          </div>

          <p className="text-xs text-text-secondary">
            Prueba a desplazar la escaleta para comprobar cómo impacta un desfase en la luz del reportaje o la entrada al banquete, o reajusta todos los horarios con un clic:
          </p>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[-15, -10, 0, 10, 15, 20, 30].map((mins) => {
              const isSelected = simulatedShiftMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSimulatedShiftMinutes(mins)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? mins === 0
                        ? 'bg-primary text-primary-text border-primary shadow-xs'
                        : 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-bg-secondary/60 text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {mins === 0 ? 'En Hora (0 min)' : mins > 0 ? `+${mins} min` : `${mins} min`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Smart Alerts Box */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-text-accent font-semibold block">
            Diagnóstico del Cronograma
          </span>
          <div className="space-y-2">
            {metrics.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  alert.severity === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : alert.severity === 'success'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-bg-secondary/50 border-border-subtle text-text-primary'
                }`}
              >
                {alert.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : alert.severity === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{alert.title}</p>
                  <p className="text-[11px] opacity-85 mt-0.5 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FILTER & VIEW TOOLBAR */}
      <div className="p-4 sm:p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Day selector */}
          <div className="flex items-center gap-1.5 bg-bg-secondary/60 p-1 rounded-2xl border border-border-subtle w-fit">
            <button
              type="button"
              onClick={() => setDayFilter('saturday')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dayFilter === 'saturday'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Sábado · Gran Día ({metrics.saturdayCount})
            </button>
            <button
              type="button"
              onClick={() => setDayFilter('friday')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dayFilter === 'friday'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Viernes · Preboda ({metrics.fridayCount})
            </button>
            <button
              type="button"
              onClick={() => setDayFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dayFilter === 'all'
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Todo el Fin de Semana ({metrics.totalMilestones})
            </button>
          </div>

          {/* View Mode & Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-xl bg-bg-secondary/60 p-1 border border-border-subtle text-xs">
              <button
                type="button"
                onClick={() => setViewMode('worktool')}
                className={`px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'worktool'
                    ? 'bg-bg-card text-text-primary shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Herramienta Detallada (4 Pilares)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-bg-card text-text-primary shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Escaleta Compacta</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    '¿Restaurar la plantilla oficial del timing personalizado de Rodrigo & Stephanie?'
                  )
                ) {
                  resetToDefaultTiming();
                  showToast('Cronograma restaurado a la plantilla oficial');
                }
              }}
              className="p-2 rounded-xl border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-secondary text-xs cursor-pointer"
              title="Restaurar cronograma base por defecto"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Second Row: Search + Phase Filter + Professional Filter + Quick Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-border-subtle">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar momento, profesional, tarea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as 'all' | TimingPhase)}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
            >
              <option value="all">Todas las etapas de la jornada</option>
              {Object.entries(TIMING_PHASE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | ProfessionalRole)}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
            >
              <option value="all">Filtrar por profesional que interviene...</option>
              {Object.entries(PROFESSIONAL_ROLE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setQuickFilter(quickFilter === 'critical' ? 'all' : 'critical')
              }
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                quickFilter === 'critical'
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-bg-secondary/40 border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Momentos Clave</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setQuickFilter(quickFilter === 'pending_prep' ? 'all' : 'pending_prep')
              }
              className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-semibold border inline-flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                quickFilter === 'pending_prep'
                  ? 'bg-brand-olive text-white border-brand-olive'
                  : 'bg-bg-secondary/40 border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Por preparar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TIMELINE MILESTONES WORKSPACE */}
      {filteredMilestones.length === 0 ? (
        <div className="p-12 rounded-3xl bg-bg-card border border-border-subtle text-center space-y-3">
          <Clock className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-serif text-xl text-text-primary">
            No hay hitos que coincidan con los filtros seleccionados
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Cambia los filtros activos o añade un nuevo bloque horario a vuestro timing personalizado.
          </p>
          <button
            type="button"
            onClick={() => {
              setDayFilter('all');
              setPhaseFilter('all');
              setRoleFilter('all');
              setQuickFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
          >
            Mostrar todos los bloques
          </button>
        </div>
      ) : viewMode === 'compact' ? (
        /* COMPACT CALL-SHEET TABLE VIEW */
        <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
          <div className="p-5 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/30">
            <div>
              <h3 className="font-serif text-xl text-text-primary">
                Hoja de Ruta Compacta · Escaleta de Producción
              </h3>
              <p className="text-xs text-text-muted">
                Vista rápida para imprimir o compartir con cada equipo profesional
              </p>
            </div>
            <span className="text-xs font-mono text-text-accent font-semibold">
              {filteredMilestones.length} bloques
            </span>
          </div>

          <div className="divide-y divide-border-subtle">
            {filteredMilestones.map((m) => {
              const effStart = shiftTimeStr(m.start_time, simulatedShiftMinutes);
              const effEnd = shiftTimeStr(m.end_time, simulatedShiftMinutes);
              const dur = formatDurationEs(getDurationMinutes(m.start_time, m.end_time));
              const doneCheck = m.checklist.filter((c) => c.completed).length;

              return (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 hover:bg-bg-secondary/25 transition-colors grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
                >
                  <div className="lg:col-span-2 space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-bg-secondary text-[10px] font-mono uppercase font-semibold text-text-secondary">
                      {m.day === 'friday' ? 'Viernes' : 'Sábado'}
                    </span>
                    <p className="font-mono text-base font-bold text-text-primary">
                      {effStart} — {effEnd}
                    </p>
                    <p className="text-[11px] text-text-muted font-mono">
                      {dur} · Colchón +{m.buffer_minutes}m
                    </p>
                  </div>

                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {TIMING_PHASE_LABELS[m.phase]}
                      </span>
                      {m.is_critical_moment && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">
                          ★ Momento Clave
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif text-lg text-text-primary font-medium">
                      {m.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {m.what_happens}
                    </p>
                    <p className="text-[11px] text-text-muted flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3 h-3 text-text-accent shrink-0" />
                      <span>{m.location}</span>
                    </p>
                  </div>

                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold block">
                      Profesionales ({m.professionals.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {m.professionals.map((p) => (
                        <span
                          key={p.id}
                          className="px-2 py-0.5 rounded-lg bg-bg-secondary border border-border-subtle text-[11px] text-text-primary"
                          title={p.action}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-olive">
                        Preparativos: {doneCheck}/{m.checklist.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMilestoneToEdit(m);
                          setIsModalOpen(true);
                        }}
                        className="text-primary hover:underline font-semibold cursor-pointer print:hidden"
                      >
                        Editar →
                      </button>
                    </div>
                    <p className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 leading-snug">
                      <strong>Anti-retraso:</strong> {m.anti_delay_protocol}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAILED 4-PILLAR WORKTOOL CARDS */
        <div className="space-y-6">
          {filteredMilestones.map((m, idx) => {
            const effStart = shiftTimeStr(m.start_time, simulatedShiftMinutes);
            const effEnd = shiftTimeStr(m.end_time, simulatedShiftMinutes);
            const durationMins = getDurationMinutes(m.start_time, m.end_time);
            const durationLabel = formatDurationEs(durationMins);
            const completedCheckCount = m.checklist.filter((c) => c.completed).length;
            const totalCheckCount = m.checklist.length;
            const allChecksDone = totalCheckCount > 0 && completedCheckCount === totalCheckCount;

            return (
              <div
                key={m.id}
                className={`rounded-3xl bg-bg-card border transition-all shadow-card overflow-hidden ${
                  m.is_critical_moment
                    ? 'border-amber-300/90 ring-1 ring-amber-200/50'
                    : 'border-border-subtle'
                }`}
              >
                {/* Top Milestone Header Bar */}
                <div className="px-5 sm:px-7 py-4 bg-bg-secondary/40 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Step Number & Time Pill */}
                    <div className="flex items-center gap-2 bg-bg-card px-3.5 py-2 rounded-2xl border border-border-strong shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-text font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="font-mono">
                        <div className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-1.5">
                          <span>{effStart} h</span>
                          <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
                          <span>{effEnd} h</span>
                        </div>
                        {simulatedShiftMinutes !== 0 && (
                          <span className="text-[10px] text-amber-700 block">
                            Plan original: {m.start_time} - {m.end_time}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phase, Day, Duration & Buffer Badges */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-primary/10 text-primary">
                          {m.day === 'friday' ? 'Viernes · Preboda' : 'Sábado · Boda'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-bg-secondary border border-border-subtle text-text-secondary">
                          {TIMING_PHASE_LABELS[m.phase]}
                        </span>
                        <span className="text-xs font-mono text-text-muted">
                          Duración: <strong className="text-text-primary">{durationLabel}</strong>
                        </span>
                        {m.buffer_minutes > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-100/80 text-amber-900 border border-amber-300/60">
                            Colchón +{m.buffer_minutes} min
                          </span>
                        )}
                        {m.is_critical_moment && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white inline-flex items-center gap-1 shadow-2xs">
                            <Flame className="w-3 h-3" />
                            <span>Momento Clave de Cobertura</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl text-text-primary font-normal">
                        {m.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1 text-text-secondary font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          {m.location}
                        </span>
                        {m.lead_coordinator && (
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                            Coordina: <strong className="text-text-primary">{m.lead_coordinator}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Card Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 print:hidden">
                    <select
                      value={m.status}
                      onChange={(e) => {
                        updateMilestoneStatus(m.id, e.target.value as TimingStatus);
                        showToast('Estado del bloque actualizado');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                        m.status === 'ready' || m.status === 'completed'
                          ? 'bg-brand-olive/15 text-brand-olive border-brand-olive/30'
                          : m.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-bg-card text-text-secondary border-border-subtle'
                      }`}
                    >
                      {Object.entries(TIMING_STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setMilestoneToEdit(m);
                        setIsModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
                      title="Editar bloque completo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        duplicateMilestone(m.id);
                        showToast('Bloque duplicado');
                      }}
                      className="p-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      title="Duplicar bloque"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el bloque "${m.title}" del cronograma?`)) {
                          deleteMilestone(m.id);
                          showToast('Bloque eliminado del cronograma');
                        }
                      }}
                      className="p-2 rounded-xl bg-bg-card border border-border-subtle text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar bloque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4-PILLAR WORKTOOL GRID */}
                <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* PILAR 1: QUÉ TIENE QUE SUCEDER EN CADA MOMENTO */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>1. Qué tiene que suceder en este momento</span>
                      </div>
                      <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                        {m.what_happens}
                      </p>
                    </div>

                    {m.coverage_notes && (
                      <div className="pt-2.5 mt-2 border-t border-border-subtle/70 text-[11px] text-text-secondary flex items-start gap-2">
                        <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                          Cobertura
                        </span>
                        <span className="italic">{m.coverage_notes}</span>
                      </div>
                    )}
                  </div>

                  {/* PILAR 2: QUÉ PROFESIONALES INTERVIENEN */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                        <Users className="w-4 h-4 shrink-0" />
                        <span>2. Qué profesionales intervienen ({m.professionals.length})</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {m.professionals.map((prof) => (
                        <div
                          key={prof.id}
                          className="p-3 rounded-xl bg-bg-card border border-border-subtle/80 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-text-primary">
                              {prof.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-bg-secondary text-[10px] font-mono text-text-accent font-semibold">
                              {PROFESSIONAL_ROLE_LABELS[prof.role]}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-snug">
                            {prof.action}
                          </p>
                          {prof.contact_phone && (
                            <p className="text-[10px] font-mono text-text-muted pt-0.5">
                              Tel: {prof.contact_phone}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PILAR 3: QUÉ NECESITAMOS TENER PREPARADO (INTERACTIVE CHECKLIST) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-brand-olive/5 border border-brand-olive/25 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-olive">
                          <CheckSquare className="w-4 h-4 shrink-0" />
                          <span>3. Qué necesitamos tener preparado</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            allChecksDone
                              ? 'bg-brand-olive text-white'
                              : 'bg-brand-olive/15 text-brand-olive'
                          }`}
                        >
                          {completedCheckCount}/{totalCheckCount} listos
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {m.checklist.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleChecklistItem(m.id, item.id)}
                            className={`p-2.5 rounded-xl border flex items-start justify-between gap-2.5 cursor-pointer transition-all ${
                              item.completed
                                ? 'bg-bg-card/60 border-brand-olive/30 text-text-muted'
                                : 'bg-bg-card border-border-subtle hover:border-brand-olive'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <button
                                type="button"
                                className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                  item.completed
                                    ? 'bg-brand-olive border-brand-olive text-white'
                                    : 'border-border-strong bg-white'
                                }`}
                              >
                                {item.completed && <Check className="w-3 h-3" />}
                              </button>
                              <div className="min-w-0">
                                <p
                                  className={`text-xs leading-snug ${
                                    item.completed
                                      ? 'line-through text-text-muted'
                                      : 'text-text-primary font-medium'
                                  }`}
                                >
                                  {item.task}
                                </p>
                                <span className="text-[10px] text-text-muted block mt-0.5">
                                  Encargado: <strong>{item.responsible}</strong>
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeChecklistItem(m.id, item.id);
                              }}
                              className="text-text-muted hover:text-rose-600 p-1 shrink-0 print:hidden"
                              title="Eliminar preparativo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Add Preparativo Input */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-1.5 print:hidden">
                      <input
                        type="text"
                        placeholder="+ Añadir qué tener preparado..."
                        value={newTaskByMilestone[m.id] || ''}
                        onChange={(e) =>
                          setNewTaskByMilestone((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddChecklist(m.id);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand-olive"
                      />
                      <input
                        type="text"
                        placeholder="Responsable"
                        value={newRespByMilestone[m.id] || ''}
                        onChange={(e) =>
                          setNewRespByMilestone((prev) => ({
                            ...prev,
                            [m.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddChecklist(m.id);
                          }
                        }}
                        className="sm:w-32 px-2.5 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-brand-olive"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickAddChecklist(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-brand-olive text-white text-xs font-semibold hover:opacity-90 cursor-pointer shrink-0"
                      >
                        Añadir
                      </button>
                    </div>
                  </div>

                  {/* PILAR 4: CÓMO EVITAR RETRASOS INNECESARIOS */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>4. Cómo evitar retrasos innecesarios</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono text-[10px] font-semibold">
                          Margen: +{m.buffer_minutes} min
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                        {m.anti_delay_protocol}
                      </p>
                    </div>

                    {m.common_risks && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold">Riesgo habitual a evitar: </strong>
                          <span>{m.common_risks}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <TimingMilestoneModal
        isOpen={isModalOpen}
        milestoneToEdit={milestoneToEdit}
        defaultDay={dayFilter === 'friday' ? 'friday' : 'saturday'}
        onClose={() => {
          setIsModalOpen(false);
          setMilestoneToEdit(null);
        }}
        onSave={(data, existingId) => {
          if (existingId) {
            updateMilestone(existingId, data);
            showToast('Hito del timing actualizado correctamente');
          } else {
            createMilestone(data);
            showToast('Nuevo hito añadido al timing personalizado');
          }
        }}
      />
    </div>
  );
}
