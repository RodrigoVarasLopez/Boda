'use client';

import React from 'react';
import { Wedding, GuestGroup } from '@/lib/types';
import { Heart, Sparkles } from 'lucide-react';

interface PersonalizedWelcomeProps {
  wedding: Wedding;
  group?: GuestGroup;
}

export const PersonalizedWelcome: React.FC<PersonalizedWelcomeProps> = ({
  wedding,
  group,
}) => {
  return (
    <section className="py-12 px-6 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-secondary text-text-accent border border-border-subtle mb-2">
        <Heart className="w-5 h-5 fill-text-accent/20 text-text-accent" />
      </div>

      {group ? (
        <div className="space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-semibold">
            ¡Hola, {group.name}!
          </h2>
          <p className="font-serif italic text-lg text-text-secondary leading-relaxed">
            {group.custom_message ||
              `Tenemos muchas ganas de celebrar este día tan especial contigo y tu familia.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-semibold">
            Nos casamos
          </h2>
          <p className="font-serif italic text-lg text-text-secondary leading-relaxed">
            {wedding.welcome_quote}
          </p>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft text-left space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-accent">
          <Sparkles className="w-4 h-4" />
          <span>Tu Concierge Digital de Boda</span>
        </div>
        <p className="text-sm text-text-secondary leading-normal">
          A través de este enlace personal podrás confirmar tu asistencia, consultar los horarios actualizados de tus eventos, ver indicaciones para llegar y guardar todos los detalles en tu calendario.
        </p>
      </div>
    </section>
  );
};
