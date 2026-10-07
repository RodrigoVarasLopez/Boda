'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import {
  INITIAL_WEDDING,
  INITIAL_EVENTS,
  INITIAL_GROUPS,
  INITIAL_CMS_BLOCKS,
  INITIAL_GUESTBOOK,
  INITIAL_MEDIA,
  INITIAL_RSVPS
} from '@/lib/mock-data';
import { RevealScreen } from '@/components/guest/RevealScreen';
import { GuestTopNav } from '@/components/guest/GuestTopNav';
import { PersonalizedWelcome } from '@/components/guest/PersonalizedWelcome';
import { ProgressiveRSVP } from '@/components/guest/ProgressiveRSVP';
import { WeekendSchedule } from '@/components/guest/WeekendSchedule';
import { UsefulInfo } from '@/components/guest/UsefulInfo';
import { MemoriesSection } from '@/components/guest/MemoriesSection';
import { GuestStickyNav } from '@/components/guest/GuestStickyNav';
import { AlertTriangle, HeartHandshake, Calendar, UserCheck, Heart } from 'lucide-react';

export default function PersonalizedInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  const group = INITIAL_GROUPS.find((g) => g.token === token);
  const groupRSVP = INITIAL_RSVPS.find((r) => r.token === token);
  // If the group has already opened/responded or if preview param is passed, reveal directly
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('preview') === 'true' || sp.get('revealed') === 'true') return true;
    }
    return group?.invitation_status === 'opened' || group?.invitation_status === 'responded';
  });
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Invalid or Revoked Token Fallback
  if (!group || group.invitation_status === 'revoked') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary text-center">
        <div className="p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card max-w-sm w-full space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Invitación no disponible
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Esta invitación ya no está disponible o el enlace ha expirado.
          </p>
          <div className="pt-3 border-t border-border-subtle">
            <p className="text-[11px] text-text-muted flex items-center justify-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-text-accent" />
              Ponte en contacto con Stephanie o Rodrigo para cualquier consulta.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Envelope / Reveal Gate
  if (!isRevealed) {
    return (
      <RevealScreen
        wedding={INITIAL_WEDDING}
        group={group}
        onOpen={() => setIsRevealed(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Top Luxury Navigation Bar */}
      <GuestTopNav
        wedding={INITIAL_WEDDING}
        group={group}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      <main className="space-y-12 sm:space-y-20 pb-28">
        {/* ========================================================
            EDITORIAL GRAND HERO BANNER (PERSONALIZED)
           ======================================================== */}
        <section id="welcome" className="pt-20 sm:pt-24 px-4 sm:px-8 max-w-6xl mx-auto animate-fade-in">
          <div className="relative h-[480px] sm:h-[580px] w-full rounded-3xl sm:rounded-[36px] overflow-hidden shadow-card border border-border-subtle group">
            <Image
              src="/images/bodega/bodega-concejo-banquete-noche.png"
              alt="Stephanie & Rodrigo — Boda en Bodega Concejo"
              fill
              priority
              className="object-cover group-hover:scale-102 transition-transform duration-700"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Multi-layered luxury gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

            {/* Center / Bottom Editorial Typography */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 text-white text-center sm:text-left space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-sand/30 backdrop-blur-md border border-brand-sand/50 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]">
                  <UserCheck className="w-3.5 h-3.5 text-brand-sand" />
                  <span>Invitación Exclusiva · {group.name}</span>
                </div>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white/90 text-[10px] font-mono tracking-wider">
                  <Calendar className="w-3 h-3" />
                  <span>28 · 08 · 2027</span>
                </div>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight drop-shadow-md">
                Stephanie &amp; Rodrigo
              </h1>

              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-4 text-xs sm:text-sm uppercase tracking-widest text-white/90">
                <span className="font-semibold text-brand-sand">Boda en Bodega Concejo</span>
                <span className="hidden sm:inline text-white/40">✦</span>
                <span className="text-white/80">Valoria la Buena · Valladolid</span>
              </div>

              <p className="font-serif italic text-base sm:text-xl text-white/90 leading-relaxed pt-2 max-w-xl">
                &ldquo;{group.custom_message || INITIAL_WEDDING.hero_message}&rdquo;
              </p>

              {/* Quick Jump Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => scrollToSection('rsvp')}
                  className="py-3 px-6 rounded-full bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-brand-sand transition-colors shadow-card cursor-pointer"
                >
                  Confirmar Asistencia
                </button>
                <button
                  onClick={() => scrollToSection('schedule')}
                  className="py-3 px-6 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/30 font-medium text-xs tracking-wider uppercase hover:bg-black/60 transition-colors cursor-pointer"
                >
                  Ver Mi Programa
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PERSONALIZED WELCOME & CONCIERGE CARD
           ======================================================== */}
        <PersonalizedWelcome wedding={INITIAL_WEDDING} group={group} />

        {/* ========================================================
            PROGRESSIVE RSVP (CUSTOMIZED FOR THIS GUEST GROUP)
           ======================================================== */}
        <div id="rsvp" className="max-w-2xl mx-auto px-4">
          <ProgressiveRSVP
            wedding={INITIAL_WEDDING}
            group={group}
            events={INITIAL_EVENTS}
            existingRSVP={groupRSVP?.responses}
          />
        </div>

        {/* ========================================================
            WEEKEND SCHEDULE (FILTERED BY GUEST PERMISSIONS)
           ======================================================== */}
        <div id="schedule">
          <WeekendSchedule
            events={INITIAL_EVENTS}
            group={group}
          />
        </div>

        {/* ========================================================
            USEFUL INFO & VENUE
           ======================================================== */}
        <div id="info">
          <UsefulInfo
            wedding={INITIAL_WEDDING}
            blocks={INITIAL_CMS_BLOCKS}
          />
        </div>

        {/* ========================================================
            MEMORIES & GUESTBOOK
           ======================================================== */}
        <div id="memories">
          <MemoriesSection
            wedding={INITIAL_WEDDING}
            guestbookEntries={INITIAL_GUESTBOOK}
            photos={INITIAL_MEDIA}
            invitationId={group.id}
            defaultGuestName={group.guests?.[0]?.first_name || group.name || ''}
          />
        </div>

        {/* ========================================================
            EDITORIAL FOOTER
           ======================================================== */}
        <footer className="text-center py-20 px-6 border-t border-border-subtle/60 space-y-4 max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-brand-cream/80 border border-brand-sand mx-auto flex items-center justify-center font-serif text-sm font-medium text-text-primary shadow-xs">
            S&amp;R
          </div>
          <h3 className="font-serif text-3xl sm:text-4xl font-normal text-text-primary tracking-tight">
            Stephanie &amp; Rodrigo
          </h3>
          <p className="text-[11px] font-mono tracking-[0.25em] text-text-muted uppercase">
            28 · 08 · 2027 · Bodega Concejo · Valoria La Buena (Valladolid)
          </p>
          <p className="text-xs font-serif italic text-text-secondary">
            ¡Nos hace una ilusión inmensa contar con vosotros en nuestro gran día!
          </p>
        </footer>
      </main>

      {/* Floating Sticky Mobile Navigation (Only on mobile screens) */}
      <div className="md:hidden">
        <GuestStickyNav
          activeSection={activeSection}
          onSelectSection={scrollToSection}
        />
      </div>
    </div>
  );
}
