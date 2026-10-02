'use client';

import React, { useState, useEffect } from 'react';
import { Wedding, GuestGroup, Event, GuestRSVPResponse, DietaryOption, RSVPStatus } from '@/lib/types';
import { Check, X, UserPlus, Heart, Sparkles, AlertCircle, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProgressiveRSVPProps {
  wedding: Wedding;
  group?: GuestGroup;
  events: Event[];
  existingRSVP?: GuestRSVPResponse[];
  onSubmitted?: (responses: GuestRSVPResponse[]) => void;
}

export const ProgressiveRSVP: React.FC<ProgressiveRSVPProps> = ({
  wedding,
  group,
  events,
  existingRSVP,
  onSubmitted,
}) => {
  // Mock fallback guests if accessed publicly without token
  const defaultGuests = group?.guests || [
    {
      id: 'demo-guest-1',
      wedding_id: wedding.id,
      group_id: 'demo-group',
      first_name: 'Invitado/a',
      last_name: '',
      is_plus_one_allowed: true,
    },
  ];

  const allowedEvents = events.filter((e) =>
    e.visibility === 'everyone' || (group?.allowed_event_ids && group.allowed_event_ids.includes(e.id))
  );

  const [responses, setResponses] = useState<Record<string, GuestRSVPResponse>>(() => {
    const map: Record<string, GuestRSVPResponse> = {};
    defaultGuests.forEach((g) => {
      const existing = existingRSVP?.find((r) => r.guest_id === g.id);
      map[g.id] = existing || {
        guest_id: g.id,
        guest_name: `${g.first_name} ${g.last_name}`.trim(),
        status: 'attending',
        attending_event_ids: allowedEvents.map((e) => e.id),
        dietary_choice: 'standard',
        allergies: '',
        plus_one_attending: false,
        plus_one_name: '',
        plus_one_dietary: 'standard',
        message: '',
      };
    });
    return map;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!existingRSVP && existingRSVP.length > 0);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // reduced-motion fallback
    }
  };

  const handleStatusChange = (guestId: string, status: RSVPStatus) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        status,
        attending_event_ids: status === 'attending' ? allowedEvents.map((e) => e.id) : [],
      },
    }));
  };

  const handleDietaryChange = (guestId: string, choice: DietaryOption) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        dietary_choice: choice,
      },
    }));
  };

  const handleAllergiesChange = (guestId: string, val: string) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        allergies: val,
      },
    }));
  };

  const handlePlusOneToggle = (guestId: string, enabled: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        plus_one_attending: enabled,
      },
    }));
  };

  const handlePlusOneName = (guestId: string, val: string) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        plus_one_name: val,
      },
    }));
  };

  const handleMessageChange = (guestId: string, val: string) => {
    setResponses((prev) => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        message: val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalResponses = Object.values(responses);
    setIsSubmitted(true);
    triggerConfetti();
    if (onSubmitted) {
      onSubmitted(finalResponses);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card text-center space-y-5 animate-fade-in my-8 max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-text-primary">
            ¡Respuesta Confirmada!
          </h3>
          <p className="text-sm text-text-secondary">
            Muchas gracias por confirmar. Hemos registrado correctamente los datos de tu grupo en nuestro concierge de boda.
          </p>
        </div>

        <div className="py-3 px-4 rounded-xl bg-bg-secondary/60 text-left text-xs space-y-2 text-text-secondary border border-border-subtle">
          {Object.values(responses).map((res) => (
            <div key={res.guest_id} className="flex justify-between items-center py-1 border-b border-border-subtle/50 last:border-none">
              <span className="font-medium text-text-primary">{res.guest_name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                res.status === 'attending'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {res.status === 'attending' ? 'Asiste' : 'No asiste'}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsSubmitted(false)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-border-strong text-text-secondary font-medium text-xs hover:bg-bg-secondary transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>Modificar respuesta</span>
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 max-w-md mx-auto px-4">
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-6">
        {/* Header */}
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-bg-secondary text-text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Confirmación RSVP</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-text-primary pt-1">
            {group?.name ? `Asistencia para ${group.name}` : 'Confirmar Asistencia'}
          </h3>
          <p className="text-xs text-text-muted">
            Paso {currentStep} de 3 — Se tarda menos de 1 minuto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: ATTENDANCE STATUS FOR EACH GUEST */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              {defaultGuests.map((g) => {
                const res = responses[g.id];
                return (
                  <div key={g.id} className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3">
                    <p className="font-medium text-sm text-text-primary">
                      ¿Asiste {g.first_name} {g.last_name}?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(g.id, 'attending')}
                        className={`py-3 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          res?.status === 'attending'
                            ? 'bg-primary text-primary-text border-primary font-semibold shadow-soft'
                            : 'bg-bg-card text-text-secondary border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Sí, asistiré</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(g.id, 'declined')}
                        className={`py-3 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                          res?.status === 'declined'
                            ? 'bg-rose-900 text-white border-rose-900 font-semibold shadow-soft'
                            : 'bg-bg-card text-text-secondary border-border-subtle hover:border-border-strong'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>No podré ir</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 px-5 rounded-2xl bg-primary text-primary-text text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer shadow-card"
              >
                Siguiente paso: Menú & Preferencias
              </button>
            </div>
          )}

          {/* STEP 2: DIETARY & ALLERGIES & PLUS ONE */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              {defaultGuests.map((g) => {
                const res = responses[g.id];
                if (res?.status === 'declined') return null;

                return (
                  <div key={g.id} className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-4">
                    <p className="font-semibold text-xs uppercase tracking-wider text-text-accent">
                      {g.first_name} {g.last_name}
                    </p>

                    {/* Dietary Choice */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-secondary block">
                        Preferencia alimentaria
                      </label>
                      <select
                        value={res?.dietary_choice || 'standard'}
                        onChange={(e) => handleDietaryChange(g.id, e.target.value as DietaryOption)}
                        className="w-full py-2.5 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                      >
                        <option value="standard">Menú Estándar (Sin restricciones)</option>
                        <option value="vegetarian">Vegetariano</option>
                        <option value="vegan">Vegano</option>
                        <option value="celiac">Celíaco / Sin Gluten</option>
                        <option value="child">Menú Infantil</option>
                        <option value="other">Otro / Especial</option>
                      </select>
                    </div>

                    {/* Allergies Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-secondary block">
                        Alergias o intolerancias específicas (opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: frutos secos, marisco, lactosa..."
                        value={res?.allergies || ''}
                        onChange={(e) => handleAllergiesChange(g.id, e.target.value)}
                        className="w-full py-2.5 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                      />
                    </div>

                    {/* Plus One Section if Allowed */}
                    {g.is_plus_one_allowed && (
                      <div className="pt-2 border-t border-border-subtle space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                            <UserPlus className="w-3.5 h-3.5 text-text-accent" />
                            ¿Llevas acompañante (+1)?
                          </span>
                          <input
                            type="checkbox"
                            checked={res?.plus_one_attending || false}
                            onChange={(e) => handlePlusOneToggle(g.id, e.target.checked)}
                            className="w-4 h-4 rounded text-primary focus:ring-text-accent cursor-pointer"
                          />
                        </div>

                        {res?.plus_one_attending && (
                          <div className="space-y-2 pt-1 animate-fade-in">
                            <input
                              type="text"
                              placeholder="Nombre completo de tu acompañante"
                              value={res?.plus_one_name || ''}
                              onChange={(e) => handlePlusOneName(g.id, e.target.value)}
                              className="w-full py-2.5 px-3 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-border-strong text-xs font-medium text-text-secondary hover:bg-bg-secondary cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-2/3 py-3 px-4 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover cursor-pointer shadow-card"
                >
                  Siguiente paso: Mensaje
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONAL WARM MESSAGE & SUBMIT */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary block">
                  Mensaje opcional para Laura & Rodrigo
                </label>
                <textarea
                  rows={3}
                  placeholder="¡Déjales una palabras con mucho cariño!"
                  value={responses[defaultGuests[0].id]?.message || ''}
                  onChange={(e) => handleMessageChange(defaultGuests[0].id, e.target.value)}
                  className="w-full p-3 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-border-strong text-xs font-medium text-text-secondary hover:bg-bg-secondary cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover cursor-pointer shadow-card flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-primary-text/20" />
                  <span>Enviar Confirmación</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
