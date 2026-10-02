'use client';

import React from 'react';
import { Wedding, GuestGroup } from '@/lib/types';
import { Sparkles, Calendar, MapPin, Wine, Compass, UserCheck } from 'lucide-react';

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
    <section className="py-12 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Greeting & Romantic Message */}
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          {group ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sand/30 border border-brand-sand/60 text-text-primary text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-brand-olive" />
              <span>Invitación para {group.name}</span>
              {guestNames && <span className="text-text-muted">({guestNames})</span>}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-bg-secondary text-text-accent text-[11px] font-semibold tracking-widest uppercase border border-border-subtle">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bienvenidos</span>
            </div>
          )}

          <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal leading-tight tracking-tight">
            {group ? group.name : 'Bienvenidos a Nuestra Boda'}
          </h2>

          <div className="space-y-3">
            <p className="font-serif italic text-lg sm:text-2xl text-text-secondary leading-relaxed">
              &ldquo;{group?.custom_message || wedding.welcome_quote}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              Queremos que viváis con nosotros cada instante de esta celebración en las tierras vallisoletanas de Valoria la Buena: un fin de semana diseñado para disfrutar sin prisas de la gastronomía, el vino y los mejores recuerdos.
            </p>
          </div>
        </div>

        {/* Right Column: Digital Concierge Key Highlights Card */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cream/50 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-accent">
                <Compass className="w-4 h-4" />
                <span>Concierge del Invitado</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-brand-olive bg-brand-olive/10 px-2.5 py-0.5 rounded-full font-semibold">
                Guía 2027
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-text-secondary">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-brand-terracotta shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-text-primary block">27 & 28 de Agosto de 2027</span>
                  <span className="text-[11px] text-text-muted">Viernes Preboda & Sábado Gran Día</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-text-primary block">Bodega Concejo · Valoria la Buena</span>
                  <span className="text-[11px] text-text-muted">Valladolid (Ctra. Valoria Km 3,6)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wine className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-text-primary block">Banquete al Aire Libre & Música</span>
                  <span className="text-[11px] text-text-muted">Maridaje con vinos de autor, cóctel y DJ</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-text-muted leading-relaxed">
              Consulta en esta web el programa interactivo, confirma tu asistencia, gestiona tu menú y descarga los accesos en tu calendario.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
