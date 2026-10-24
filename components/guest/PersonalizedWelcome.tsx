'use client';

import React from 'react';
import { Wedding, GuestGroup, CMSBlock } from '@/lib/types';
import { Sparkles, Calendar, MapPin, Wine, Compass, UserCheck } from 'lucide-react';

interface PersonalizedWelcomeProps {
  wedding: Wedding;
  group?: GuestGroup;
  introBlock?: CMSBlock;
}

export const PersonalizedWelcome: React.FC<PersonalizedWelcomeProps> = ({
  wedding,
  group,
  introBlock,
}) => {
  const guestNames = group?.guests?.map((g) => g.first_name).join(' · ');

  const welcomeTitle = group
    ? group.name
    : introBlock?.title || 'Bienvenidos a Nuestra Boda';
  const welcomeQuote =
    group?.custom_message ||
    introBlock?.content?.welcome_quote ||
    wedding.welcome_quote;
  const welcomeBody =
    introBlock?.content?.welcome_body ||
    'Queremos que viváis con nosotros cada instante de esta celebración en las tierras vallisoletanas de Valoria la Buena: un fin de semana diseñado para disfrutar sin prisas de la gastronomía, el vino y los mejores recuerdos.';

  const conciergeTitle = introBlock?.content?.concierge_title || 'Concierge del Invitado';
  const conciergeBadge = introBlock?.content?.concierge_badge || 'Guía 2027';
  const conciergeFooter =
    introBlock?.content?.concierge_footer ||
    'Consulta en esta web el programa interactivo, confirma tu asistencia, gestiona tu menú y descarga los accesos en tu calendario.';

  const defaultConciergeItems = [
    {
      title: '27 & 28 de Agosto de 2027',
      subtitle: 'Viernes Preboda & Sábado Gran Día',
    },
    {
      title: 'Bodega Concejo · Valoria la Buena',
      subtitle: 'Valladolid (Ctra. Valoria Km 3,6)',
    },
    {
      title: 'Banquete al Aire Libre & Música',
      subtitle: 'Maridaje con vinos de autor, cóctel y DJ',
    },
  ];

  const conciergeItems: Array<{ title: string; subtitle: string }> =
    Array.isArray(introBlock?.content?.concierge_items) &&
    introBlock!.content.concierge_items.length > 0
      ? introBlock!.content.concierge_items
      : defaultConciergeItems;

  const icons = [
    <Calendar key="cal" className="w-4 h-4 text-brand-terracotta shrink-0 mt-0.5" />,
    <MapPin key="map" className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />,
    <Wine key="wine" className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />,
  ];

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
              <span>{introBlock?.subtitle || 'Bienvenidos'}</span>
            </div>
          )}

          <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal leading-tight tracking-tight">
            {welcomeTitle}
          </h2>

          <div className="space-y-3">
            <p className="font-serif italic text-lg sm:text-2xl text-text-secondary leading-relaxed">
              &ldquo;{welcomeQuote}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              {welcomeBody}
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
                <span>{conciergeTitle}</span>
              </div>
              <span className="text-[10px] font-mono uppercase text-brand-olive bg-brand-olive/10 px-2.5 py-0.5 rounded-full font-semibold">
                {conciergeBadge}
              </span>
            </div>

            <div className="space-y-3.5 text-xs text-text-secondary">
              {conciergeItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {icons[idx % icons.length]}
                  <div>
                    <span className="font-medium text-text-primary block">{item.title}</span>
                    <span className="text-[11px] text-text-muted">{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border-subtle/60 text-[11px] text-text-muted leading-relaxed">
              {conciergeFooter}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
