'use client';

import React, { useState, useEffect } from 'react';
import { GuestGroup, DietaryOption, RSVPStatus, GroupRSVPSubmission } from '@/lib/types';
import { saveManualGroupRSVP, getStoredRSVPS } from '@/lib/guest-store';
import {
  X,
  UserCheck,
  Check,
  XCircle,
  Clock,
  Utensils,
  AlertCircle,
  UserPlus,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface ManualRSVPModalProps {
  group: GuestGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

interface MemberFormState {
  guestId: string;
  guestName: string;
  status: RSVPStatus;
  dietaryChoice: DietaryOption;
  allergies: string;
  plusOneAllowed: boolean;
  plusOneAttending: boolean;
  plusOneName: string;
  plusOneDietary: DietaryOption;
}

const DIETARY_LABELS: Record<DietaryOption, string> = {
  standard: 'Estándar',
  vegetarian: 'Vegetariano',
  vegan: 'Vegano',
  celiac: 'Celíaco (Sin gluten)',
  child: 'Menú Infantil',
  other: 'Otro',
};

export const ManualRSVPModal: React.FC<ManualRSVPModalProps> = ({
  group,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [members, setMembers] = useState<MemberFormState[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Initialize modal state from group and existing RSVPs
  useEffect(() => {
    if (!group) return;

    const allRsvps = getStoredRSVPS();
    const existingGroupRsvp = allRsvps.find((r) => r.group_id === group.id);

    const initialMembers: MemberFormState[] = group.guests.map((g) => {
      const existing = existingGroupRsvp?.responses.find((res) => res.guest_id === g.id);

      return {
        guestId: g.id,
        guestName: `${g.first_name} ${g.last_name}`.trim(),
        status: existing?.status || (group.invitation_status === 'responded' ? 'attending' : 'attending'),
        dietaryChoice: existing?.dietary_choice || (g.dietary_restrictions as DietaryOption) || 'standard',
        allergies: existing?.allergies || g.allergies || '',
        plusOneAllowed: g.is_plus_one_allowed,
        plusOneAttending: existing?.plus_one_attending ?? false,
        plusOneName: existing?.plus_one_name || '',
        plusOneDietary: existing?.plus_one_dietary || 'standard',
      };
    });

    setMembers(initialMembers);
    setNotes(existingGroupRsvp?.responses[0]?.message || 'Confirmación registrada manualmente');
    setFeedback(null);
  }, [group]);

  if (!isOpen || !group) return null;

  // Bulk actions
  const handleSetAllStatus = (newStatus: RSVPStatus) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        status: newStatus,
      }))
    );
  };

  const handleMemberChange = (guestId: string, updates: Partial<MemberFormState>) => {
    setMembers((prev) =>
      prev.map((m) => (m.guestId === guestId ? { ...m, ...updates } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const responsesPayload = members.map((m) => ({
        guestId: m.guestId,
        status: m.status,
        dietaryChoice: m.dietaryChoice,
        allergies: m.allergies.trim(),
        plusOneAttending: m.plusOneAllowed ? m.plusOneAttending : false,
        plusOneName: m.plusOneAttending ? m.plusOneName.trim() : undefined,
        plusOneDietary: m.plusOneAttending ? m.plusOneDietary : 'standard',
        message: notes.trim(),
      }));

      const res = await saveManualGroupRSVP(group.id, responsesPayload);
      if (res.success) {
        setFeedback(res.message);
        setTimeout(() => {
          setIsSubmitting(false);
          onSaved?.();
          onClose();
        }, 600);
      } else {
        alert(res.message);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting manual RSVP:', err);
      setIsSubmitting(false);
    }
  };

  const totalAttending = members.filter((m) => m.status === 'attending').length;
  const totalPlusOnes = members.filter((m) => m.status === 'attending' && m.plusOneAttending).length;
  const totalHeadcount = totalAttending + totalPlusOnes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-editorial max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex justify-between items-start bg-bg-secondary/20">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-brand-olive/15 text-brand-olive font-semibold">
              <PhoneCall className="w-3 h-3" />
              <span>Confirmación Asistida / Telefónica</span>
            </div>
            <h2 className="font-serif text-2xl font-normal text-text-primary">
              Registrar Asistencia: {group.name}
            </h2>
            <p className="text-xs text-text-muted">
              Actualiza el recuento para invitados que han confirmado por llamada, WhatsApp o en persona.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Quick Bulk Actions */}
          <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="font-medium text-text-secondary">Acción rápida para todo el grupo:</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSetAllStatus('attending')}
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-xl bg-brand-olive text-white font-medium hover:bg-brand-olive/90 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Asisten todos</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetAllStatus('declined')}
                className="flex-1 sm:flex-none py-1.5 px-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>No asiste nadie</span>
              </button>
            </div>
          </div>

          {/* Members Breakdown */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
              DETALLE POR INVITADO ({members.length})
            </span>

            {members.map((member) => (
              <div
                key={member.guestId}
                className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-medium text-text-primary">
                      {member.guestName}
                    </span>
                    {member.plusOneAllowed && (
                      <span className="text-[9px] font-semibold bg-bg-secondary text-brand-terracotta px-1.5 py-0.5 rounded-md border border-border-subtle">
                        +1 Permitido
                      </span>
                    )}
                  </div>

                  {/* Attendance Switcher */}
                  <div className="inline-flex rounded-xl bg-bg-secondary/60 p-1 border border-border-subtle">
                    <button
                      type="button"
                      onClick={() => handleMemberChange(member.guestId, { status: 'attending' })}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        member.status === 'attending'
                          ? 'bg-brand-olive text-white font-semibold shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>Asiste</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMemberChange(member.guestId, { status: 'declined' })}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        member.status === 'declined'
                          ? 'bg-rose-600 text-white font-semibold shadow-xs'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>No asiste</span>
                    </button>
                  </div>
                </div>

                {/* Extended Details if Attending */}
                {member.status === 'attending' && (
                  <div className="pt-3 border-t border-border-subtle/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                    {/* Menu Choice */}
                    <div>
                      <label className="text-[11px] font-medium text-text-muted block mb-1">
                        Tipo de Menú
                      </label>
                      <select
                        value={member.dietaryChoice}
                        onChange={(e) =>
                          handleMemberChange(member.guestId, {
                            dietaryChoice: e.target.value as DietaryOption,
                          })
                        }
                        className="w-full py-1.5 px-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                      >
                        {Object.entries(DIETARY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Allergies */}
                    <div>
                      <label className="text-[11px] font-medium text-text-muted block mb-1">
                        Alergias o Intolerancias
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Gluten, marisco, lactosa..."
                        value={member.allergies}
                        onChange={(e) =>
                          handleMemberChange(member.guestId, { allergies: e.target.value })
                        }
                        className="w-full py-1.5 px-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                      />
                    </div>

                    {/* Plus One details if allowed */}
                    {member.plusOneAllowed && (
                      <div className="sm:col-span-2 pt-2 border-t border-border-subtle/40 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.plusOneAttending}
                            onChange={(e) =>
                              handleMemberChange(member.guestId, {
                                plusOneAttending: e.target.checked,
                              })
                            }
                            className="rounded border-border-strong text-brand-olive focus:ring-brand-olive"
                          />
                          <span className="font-medium text-text-primary">
                            Viene con acompañante (+1)
                          </span>
                        </label>

                        {member.plusOneAttending && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 animate-fade-in">
                            <div>
                              <input
                                type="text"
                                placeholder="Nombre del acompañante"
                                value={member.plusOneName}
                                onChange={(e) =>
                                  handleMemberChange(member.guestId, {
                                    plusOneName: e.target.value,
                                  })
                                }
                                className="w-full py-1.5 px-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                              />
                            </div>
                            <div>
                              <select
                                value={member.plusOneDietary}
                                onChange={(e) =>
                                  handleMemberChange(member.guestId, {
                                    plusOneDietary: e.target.value as DietaryOption,
                                  })
                                }
                                className="w-full py-1.5 px-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                              >
                                {Object.entries(DIETARY_LABELS).map(([key, label]) => (
                                  <option key={key} value={key}>
                                    Acompañante: {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes / Origin of confirmation */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-text-muted block">
              Notas u origen de la confirmación (opcional):
            </label>
            <input
              type="text"
              placeholder="Ej: Confirmado por llamada con Rodrigo el 2 de octubre"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          {/* Headcount Preview Banner */}
          <div className="p-4 rounded-2xl bg-brand-cream/60 border border-brand-sand/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-serif text-sm font-normal text-brand-ink block">
                Impacto en el Recuento:
              </span>
              <span className="text-[11px] text-text-secondary">
                {totalHeadcount > 0
                  ? `Se sumarán ${totalHeadcount} asistentes al recuento global.`
                  : 'Ningún asistente confirmado en este grupo.'}
              </span>
            </div>
            <span className="font-serif text-2xl font-bold text-brand-olive">
              +{totalHeadcount} pers.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl border border-border-subtle text-text-secondary hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-brand-olive text-white font-medium hover:bg-brand-olive/90 shadow-soft transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar y Actualizar Recuento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
