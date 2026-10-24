'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Wedding, GuestGroup, CMSBlock } from '@/lib/types';

interface RevealScreenProps {
  wedding: Wedding;
  group?: GuestGroup;
  heroBlock?: CMSBlock;
  onOpen: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  wedding,
  group,
  heroBlock,
  onOpen,
}) => {
  const envelopeDay = heroBlock?.content?.envelope_day || '28';
  const envelopeMonthYear = heroBlock?.content?.envelope_month_year || 'Agosto · 2027';
  const coupleNames = heroBlock?.title || wedding.couple_names;
  const envelopeTagline = heroBlock?.content?.envelope_tagline || 'Nos Casamos';
  const locationSummary = heroBlock?.content?.location_detail
    ? `${heroBlock.content.location_highlight || 'Bodega Concejo'} · ${heroBlock.content.location_detail}`
    : wedding.location_summary;
  const heroMessage = heroBlock?.content?.hero_message || wedding.hero_message;
  const envelopeButton = heroBlock?.content?.envelope_button || 'Abrir invitación';

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-6 py-12 text-center bg-bg-primary relative overflow-hidden transition-colors duration-500 selection:bg-brand-sand">
      {/* Subtle Editorial Decorative Framing */}
      <div className="absolute inset-4 sm:inset-8 border border-border-subtle/50 pointer-events-none rounded-2xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-cream/30 blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <header className="pt-4 z-10 animate-fade-in">
        {group ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-bg-card/80 border border-border-subtle backdrop-blur-xs shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary">
              Invitación para {group.name}
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-semibold tracking-widest uppercase text-text-muted">
            Invitación de Boda
          </span>
        )}
      </header>

      {/* Hero Editorial Composition */}
      <main className="my-auto max-w-md w-full space-y-10 z-10 animate-slide-up">
        {/* Date Monogram */}
        <div className="space-y-1">
          <p className="font-serif text-5xl sm:text-6xl font-light text-text-primary tracking-tight leading-none">
            {envelopeDay}
          </p>
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-text-accent">
            {envelopeMonthYear}
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-border-strong/60" />
          <span className="text-brand-terracotta text-sm">✦</span>
          <span className="h-px w-10 bg-border-strong/60" />
        </div>

        {/* Couple Names */}
        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-text-primary tracking-tight leading-tight break-words">
            {coupleNames}
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] font-medium text-text-muted">
            {envelopeTagline}
          </p>
        </div>

        {/* Location & Quote */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
            {locationSummary}
          </p>
          <p className="font-serif italic text-base sm:text-lg text-text-secondary/80 max-w-xs mx-auto leading-relaxed">
            &ldquo;{heroMessage}&rdquo;
          </p>
        </div>
      </main>

      {/* Bottom CTA Action Button */}
      <footer className="w-full max-w-xs pb-4 z-10 animate-fade-in">
        <button
          onClick={onOpen}
          className="w-full py-4 px-6 rounded-full bg-primary text-primary-text font-medium text-sm shadow-card hover:bg-primary-hover active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-text-accent"
        >
          <span className="tracking-wide">{envelopeButton}</span>
          <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5 text-primary-text/80" />
        </button>
      </footer>
    </div>
  );
};
