'use client';

import React from 'react';
import { Heart, Sparkles, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';
import { Wedding, GuestGroup } from '@/lib/types';

interface RevealScreenProps {
  wedding: Wedding;
  group?: GuestGroup;
  onOpen: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  wedding,
  group,
  onOpen,
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-6 py-12 text-center bg-bg-primary relative overflow-hidden transition-colors duration-500">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full border border-border-subtle/40 opacity-50 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-border-subtle/40 opacity-50 pointer-events-none" />

      {/* Header Badge */}
      <div className="animate-fade-in pt-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest bg-bg-secondary text-text-accent border border-border-subtle shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-text-accent" />
          Invitación Oficial de Boda
        </span>
      </div>

      {/* Main Editorial Invitation Content */}
      <div className="my-auto max-w-sm w-full space-y-8 animate-fade-in">
        {/* Recipient Greeting if Group Exists */}
        {group && (
          <div className="py-2 px-4 rounded-xl bg-bg-secondary/60 border border-border-subtle/60 backdrop-blur-xs">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
              Especialmente preparada para
            </p>
            <p className="font-serif text-xl font-semibold text-text-primary">
              {group.name}
            </p>
          </div>
        )}

        {/* Couple Names */}
        <div className="space-y-3">
          <h1 className="font-serif text-5xl sm:text-6xl font-normal tracking-tight text-text-primary leading-none">
            {wedding.couple_names}
          </h1>
          <div className="flex items-center justify-center gap-2 text-text-muted text-xs uppercase tracking-widest">
            <span className="h-px w-8 bg-border-strong" />
            <span>Se casan</span>
            <span className="h-px w-8 bg-border-strong" />
          </div>
        </div>

        {/* Hero Phrase */}
        <p className="font-serif italic text-lg sm:text-xl text-text-secondary leading-relaxed px-2">
          &ldquo;{wedding.hero_message}&rdquo;
        </p>

        {/* Quick Date & Location Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-text-secondary pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle shadow-soft w-full sm:w-auto justify-center">
            <Calendar className="w-4 h-4 text-text-accent" />
            <span>{formatDateEs(wedding.wedding_date)}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle shadow-soft w-full sm:w-auto justify-center">
            <MapPin className="w-4 h-4 text-text-accent" />
            <span>{wedding.location_summary}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm pb-6 animate-fade-in">
        <button
          onClick={onOpen}
          className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-text font-medium text-base shadow-card hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-text-accent"
        >
          <span>Abrir invitación</span>
          <ChevronDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
