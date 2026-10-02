'use client';

import React from 'react';
import { Wedding, GuestGroup } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface PersonalizedWelcomeProps {
  wedding: Wedding;
  group?: GuestGroup;
}

export const PersonalizedWelcome: React.FC<PersonalizedWelcomeProps> = ({
  wedding,
  group,
}) => {
  const guestNames = group?.guests?.map((g) => g.first_name).join(' · ');

  return (
    <section className="py-12 px-6 max-w-lg mx-auto text-center space-y-8 animate-fade-in">
      {/* Personalized Badge */}
      {group && (
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-text-muted">
            Invitación Personalizada
          </p>
          {guestNames && (
            <p className="text-xs font-serif italic text-text-accent tracking-wide">
              {guestNames}
            </p>
          )}
        </div>
      )}

      {/* Welcome Title & Message */}
      <div className="space-y-4">
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal leading-snug">
          {group ? group.name : 'Bienvenidos a nuestra boda'}
        </h2>
        <p className="font-serif italic text-lg sm:text-xl text-text-secondary leading-relaxed max-w-md mx-auto">
          {group?.custom_message || wedding.welcome_quote}
        </p>
      </div>

      {/* Concierge Info Card */}
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-card text-left space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cream/40 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Concierge Digital de Boda</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Este espacio es tu guía interactiva para todo el fin de semana. Desde aquí podrás confirmar tu asistencia, consultar los horarios actualizados de tus eventos, indicaciones de llegada y guardar los detalles en tu calendario.
        </p>
      </div>
    </section>
  );
};
