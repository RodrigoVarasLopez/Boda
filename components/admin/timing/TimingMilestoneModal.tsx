'use client';

import React, { useState, useEffect } from 'react';
import {
  TimingMilestone,
  TimingDay,
  TimingPhase,
  TimingStatus,
  TimingProfessional,
  TimingChecklistItem,
  ProfessionalRole,
  TIMING_PHASE_LABELS,
  TIMING_STATUS_LABELS,
  PROFESSIONAL_ROLE_LABELS,
} from '@/lib/types';
import {
  X,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CheckSquare,
  ShieldAlert,
  Plus,
  Trash2,
  Flame,
} from 'lucide-react';

interface TimingMilestoneModalProps {
  isOpen: boolean;
  milestoneToEdit: TimingMilestone | null;
  defaultDay?: TimingDay;
  onClose: () => void;
  onSave: (
    data: Omit<TimingMilestone, 'id' | 'wedding_id' | 'sort_order'>,
    existingId?: string
  ) => void;
}

export const TimingMilestoneModal: React.FC<TimingMilestoneModalProps> = ({
  isOpen,
  milestoneToEdit,
  defaultDay = 'saturday',
  onClose,
  onSave,
}) => {
  const [day, setDay] = useState<TimingDay>(defaultDay);
  const [phase, setPhase] = useState<TimingPhase>('ceremonia');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('14:00');
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<TimingStatus>('pending');
  const [isCriticalMoment, setIsCriticalMoment] = useState(false);
  const [leadCoordinator, setLeadCoordinator] = useState('');

  // 1. Qué sucede
  const [whatHappens, setWhatHappens] = useState('');
  const [coverageNotes, setCoverageNotes] = useState('');

  // 2. Profesionales
  const [professionals, setProfessionals] = useState<TimingProfessional[]>([]);

  // 3. Qué necesitamos tener preparado (Checklist)
  const [checklist, setChecklist] = useState<TimingChecklistItem[]>([]);

  // 4. Cómo evitar retrasos innecesarios
  const [antiDelayProtocol, setAntiDelayProtocol] = useState('');
  const [commonRisks, setCommonRisks] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (milestoneToEdit) {
      setDay(milestoneToEdit.day);
      setPhase(milestoneToEdit.phase);
      setStartTime(milestoneToEdit.start_time);
      setEndTime(milestoneToEdit.end_time);
      setBufferMinutes(milestoneToEdit.buffer_minutes ?? 10);
      setTitle(milestoneToEdit.title);
      setLocation(milestoneToEdit.location);
      setStatus(milestoneToEdit.status);
      setIsCriticalMoment(Boolean(milestoneToEdit.is_critical_moment));
      setLeadCoordinator(milestoneToEdit.lead_coordinator || '');
      setWhatHappens(milestoneToEdit.what_happens);
      setCoverageNotes(milestoneToEdit.coverage_notes || '');
      setProfessionals(
        milestoneToEdit.professionals.map((p) => ({ ...p }))
      );
      setChecklist(
        milestoneToEdit.checklist.map((c) => ({ ...c }))
      );
      setAntiDelayProtocol(milestoneToEdit.anti_delay_protocol);
      setCommonRisks(milestoneToEdit.common_risks || '');
    } else {
      setDay(defaultDay);
      setPhase(defaultDay === 'friday' ? 'preboda' : 'ceremonia');
      setStartTime(defaultDay === 'friday' ? '20:00' : '12:30');
      setEndTime(defaultDay === 'friday' ? '22:00' : '13:30');
      setBufferMinutes(10);
      setTitle('');
      setLocation(
        defaultDay === 'friday'
          ? 'Bodega El Corro · Villamuriel de Cerrato'
          : 'Bodega Concejo · Valoria la Buena'
      );
      setStatus('pending');
      setIsCriticalMoment(false);
      setLeadCoordinator('Rodrigo & Stephanie');
      setWhatHappens('');
      setCoverageNotes('');
      setProfessionals([
        {
          id: `prof-${Date.now()}`,
          role: 'foto_video',
          name: 'Equipo Fotografía & Vídeo',
          action: '',
        },
      ]);
      setChecklist([
        {
          id: `chk-${Date.now()}`,
          task: '',
          responsible: 'Pareja / Coordinación',
          completed: false,
        },
      ]);
      setAntiDelayProtocol('');
      setCommonRisks('');
    }
  }, [isOpen, milestoneToEdit, defaultDay]);

  if (!isOpen) return null;

  const handleAddProfessional = () => {
    setProfessionals((prev) => [
      ...prev,
      {
        id: `prof-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        role: 'foto_video',
        name: '',
        action: '',
      },
    ]);
  };

  const handleUpdateProfessional = (
    id: string,
    field: keyof TimingProfessional,
    value: string
  ) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemoveProfessional = (id: string) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddChecklist = () => {
    setChecklist((prev) => [
      ...prev,
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        task: '',
        responsible: 'Pareja / Coordinación',
        completed: false,
      },
    ]);
  };

  const handleUpdateChecklist = (
    id: string,
    field: keyof TimingChecklistItem,
    value: string | boolean
  ) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !whatHappens.trim()) return;

    const cleanProfessionals = professionals
      .filter((p) => p.name.trim() || p.action.trim())
      .map((p) => ({
        ...p,
        name: p.name.trim() || PROFESSIONAL_ROLE_LABELS[p.role],
        action: p.action.trim() || 'Intervención y cobertura coordinada en este bloque',
      }));

    const cleanChecklist = checklist
      .filter((c) => c.task.trim())
      .map((c) => ({
        ...c,
        task: c.task.trim(),
        responsible: c.responsible.trim() || 'Coordinación',
      }));

    onSave(
      {
        day,
        phase,
        start_time: startTime,
        end_time: endTime,
        buffer_minutes: Number(bufferMinutes) || 0,
        title: title.trim(),
        location: location.trim() || 'Ubicación principal',
        status,
        is_critical_moment: isCriticalMoment,
        lead_coordinator: leadCoordinator.trim() || undefined,
        what_happens: whatHappens.trim(),
        coverage_notes: coverageNotes.trim() || undefined,
        professionals: cleanProfessionals,
        checklist: cleanChecklist,
        anti_delay_protocol:
          antiDelayProtocol.trim() ||
          'Respetar el margen de seguridad y avisar con 10 minutos de antelación a los profesionales implicados.',
        common_risks: commonRisks.trim() || undefined,
      },
      milestoneToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/40">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
              Herramienta de Trabajo &amp; Escaleta Operativa
            </span>
            <h2 className="font-serif text-2xl text-text-primary">
              {milestoneToEdit
                ? 'Editar Hito del Timing Personalizado'
                : 'Nuevo Hito del Timing Personalizado'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 0: Horario, Fase y Ubicación */}
          <div className="p-4 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Jornada
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as TimingDay)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                >
                  <option value="friday">Viernes · Preboda</option>
                  <option value="saturday">Sábado · Gran Día (Boda)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Etapa de la Jornada
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as TimingPhase)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                >
                  {Object.entries(TIMING_PHASE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Estado Operativo
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TimingStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                >
                  {Object.entries(TIMING_STATUS_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs font-mono text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs font-mono text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Colchón Anti-Retraso (min)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs font-mono text-text-primary"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-medium cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={isCriticalMoment}
                    onChange={(e) => setIsCriticalMoment(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Momento Clave</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Título del Momento / Bloque *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Preparativos de la Novia: Maquillaje, Ramo y Vestido"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Responsable / Coordinador
                </label>
                <input
                  type="text"
                  placeholder="Ej: Maître / Madrina / Testigo"
                  value={leadCoordinator}
                  onChange={(e) => setLeadCoordinator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Ubicación Exacta
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej: Iglesia de Santa María la Mayor · Villamuriel de Cerrato"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* PILAR 1: QUÉ TIENE QUE SUCEDER EN CADA MOMENTO */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>1. ¿Qué tiene que suceder en este momento?</span>
            </div>

            <div>
              <label className="block text-[11px] text-text-muted mb-1">
                Secuencia detallada de acciones y desarrollo del bloque *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe paso a paso qué ocurre en este tramo horario, quién interviene primero y cuál es la dinámica..."
                value={whatHappens}
                onChange={(e) => setWhatHappens(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] text-text-muted mb-1">
                Notas de cobertura técnica (luz, sonido, planos clave de foto/vídeo)
              </label>
              <input
                type="text"
                placeholder="Ej: Pasillo despejado sin móviles; luz natural junto al ventanal..."
                value={coverageNotes}
                onChange={(e) => setCoverageNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary"
              />
            </div>
          </div>

          {/* PILAR 2: QUÉ PROFESIONALES INTERVIENEN */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>2. ¿Qué profesionales intervienen?</span>
              </div>
              <button
                type="button"
                onClick={handleAddProfessional}
                className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir profesional</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  className="p-3 rounded-xl bg-bg-secondary/35 border border-border-subtle grid grid-cols-1 sm:grid-cols-12 gap-2 items-start"
                >
                  <div className="sm:col-span-3">
                    <select
                      value={prof.role}
                      onChange={(e) =>
                        handleUpdateProfessional(
                          prof.id,
                          'role',
                          e.target.value as ProfessionalRole
                        )
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] text-text-primary"
                    >
                      {Object.entries(PROFESSIONAL_ROLE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Nombre del proveedor / equipo"
                      value={prof.name}
                      onChange={(e) =>
                        handleUpdateProfessional(prof.id, 'name', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] text-text-primary"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Cometido exacto en este momento..."
                      value={prof.action}
                      onChange={(e) =>
                        handleUpdateProfessional(prof.id, 'action', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] text-text-primary"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveProfessional(prof.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Quitar profesional"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PILAR 3: QUÉ NECESITAMOS TENER PREPARADO */}
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-olive font-semibold text-xs uppercase tracking-wider">
                <CheckSquare className="w-4 h-4" />
                <span>3. ¿Qué necesitamos tener preparado? (Checklist)</span>
              </div>
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-2.5 py-1 rounded-lg bg-brand-olive/15 text-brand-olive hover:bg-brand-olive/25 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir elemento</span>
              </button>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-bg-secondary/35 border border-border-subtle grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-7 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) =>
                        handleUpdateChecklist(item.id, 'completed', e.target.checked)
                      }
                      className="rounded text-brand-olive"
                    />
                    <input
                      type="text"
                      placeholder="Ej: Alianzas sueltas en el porta-alianzas, vestido fuera de la funda..."
                      value={item.task}
                      onChange={(e) =>
                        handleUpdateChecklist(item.id, 'task', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] text-text-primary"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Responsable (ej. Padrino, Novia...)"
                      value={item.responsible}
                      onChange={(e) =>
                        handleUpdateChecklist(item.id, 'responsible', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-[11px] text-text-primary"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(item.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Quitar ítem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PILAR 4: CÓMO EVITAR RETRASOS INNECESARIOS */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>4. ¿Cómo evitar retrasos innecesarios en este punto?</span>
            </div>

            <div>
              <label className="block text-[11px] text-amber-900/80 font-medium mb-1">
                Protocolo anti-retrasos y pauta de coordinación *
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Quienes ayudan a vestir a la novia deben estar ya vestidos antes de que llegue el fotógrafo..."
                value={antiDelayProtocol}
                onChange={(e) => setAntiDelayProtocol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-text-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] text-amber-900/80 font-medium mb-1">
                Cuello de botella / riesgo frecuente a vigilar
              </label>
              <input
                type="text"
                placeholder="Ej: Retraso en peluquería o invitados bloqueando el pasillo de salida..."
                value={commonRisks}
                onChange={(e) => setCommonRisks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-text-primary"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle bg-bg-card text-text-secondary hover:bg-bg-secondary text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold shadow-soft inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{milestoneToEdit ? 'Guardar Cambios' : 'Añadir al Cronograma'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
