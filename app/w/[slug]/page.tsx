'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { INITIAL_WEDDING, INITIAL_EVENTS, INITIAL_CMS_BLOCKS, INITIAL_GUESTBOOK, INITIAL_MEDIA } from '@/lib/mock-data';
import { GuestTopNav } from '@/components/guest/GuestTopNav';
import { PersonalizedWelcome } from '@/components/guest/PersonalizedWelcome';
import { WeekendSchedule } from '@/components/guest/WeekendSchedule';
import { UsefulInfo } from '@/components/guest/UsefulInfo';
import { PublicRSVPPortal } from '@/components/guest/PublicRSVPPortal';
import { MemoriesSection } from '@/components/guest/MemoriesSection';
import { GuestStickyNav } from '@/components/guest/GuestStickyNav';
import { Heart, Sparkles, MapPin, Calendar, Clock, ChevronDown } from 'lucide-react';

export default function PublicWeddingPage() {
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const storyBlock = INITIAL_CMS_BLOCKS.find((b) => b.type === 'story');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Top Luxury Navigation Bar */}
      <GuestTopNav
        wedding={INITIAL_WEDDING}
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />

      <main className="space-y-12 sm:space-y-20 pb-28">
        {/* ========================================================
            EDITORIAL GRAND HERO BANNER
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-brand-sand text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] w-fit mx-auto sm:mx-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>28 · Agosto · 2027 · Bodega Concejo (Valladolid)</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight drop-shadow-md">
                Stephanie &amp; Rodrigo
              </h1>

              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-4 text-xs sm:text-sm uppercase tracking-widest text-white/90">
                <span className="font-semibold text-brand-sand">Nos Casamos</span>
                <span className="hidden sm:inline text-white/40">✦</span>
                <span className="text-white/80">Valoria la Buena · Entre Viñedos</span>
              </div>

              <p className="font-serif italic text-base sm:text-xl text-white/90 leading-relaxed pt-2 max-w-xl">
                &ldquo;{INITIAL_WEDDING.hero_message}&rdquo;
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
                  Ver Programa
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            PERSONALIZED WELCOME / CONCIERGE HIGHLIGHTS
           ======================================================== */}
        <PersonalizedWelcome wedding={INITIAL_WEDDING} />

        {/* ========================================================
            NUESTRA HISTORIA (EDITORIAL STORY SECTION: 01 NOSOTROS)
           ======================================================== */}
        {storyBlock && (
          <section id="story" className="py-8 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-10 animate-fade-in">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent font-semibold block">
                01 · NOSOTROS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
                Nuestra Historia
              </h2>
              <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
                El camino que nos ha traído hasta aquí y por qué este rincón enológico de Valladolid es tan especial para nosotros.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo Card */}
              <div className="lg:col-span-5 relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-card border border-border-subtle group">
                <Image
                  src="/images/bodega/vinedos-valoria-barrica.png"
                  alt="Viñedos y barricas de Bodega Concejo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 450px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-sand block">Tradición &amp; Pasión</span>
                  <p className="font-serif text-sm italic">Valoria la Buena (Valladolid)</p>
                </div>
              </div>

              {/* Story Narrative */}
              <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
                {storyBlock.content?.paragraphs?.map((p: string, idx: number) => (
                  <p key={idx} className="font-serif italic text-sm sm:text-base text-text-secondary leading-relaxed">
                    &ldquo;{p}&rdquo;
                  </p>
                ))}
                <div className="pt-4 border-t border-border-subtle/60 flex items-center justify-between text-xs text-text-muted font-sans">
                  <span>Stephanie &amp; Rodrigo</span>
                  <span className="font-mono text-[11px]">Agosto · 2027</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            PROGRAMA DEL FIN DE SEMANA (WEEKEND SCHEDULE)
           ======================================================== */}
        <div id="schedule">
          <WeekendSchedule events={INITIAL_EVENTS} />
        </div>

        {/* ========================================================
            BODEGA CONCEJO & GUÍA DEL INVITADO (USEFUL INFO)
           ======================================================== */}
        <div id="info">
          <UsefulInfo wedding={INITIAL_WEDDING} blocks={INITIAL_CMS_BLOCKS} />
        </div>

        {/* ========================================================
            PORTAL PÚBLICO DE CONFIRMACIÓN (RSVP PORTAL)
           ======================================================== */}
        <div id="rsvp">
          <PublicRSVPPortal wedding={INITIAL_WEDDING} />
        </div>

        {/* ========================================================
            MEMORIAS & LIBRO DE FIRMAS (MEMORIES & GUESTBOOK)
           ======================================================== */}
        <div id="memories">
          <MemoriesSection
            wedding={INITIAL_WEDDING}
            guestbookEntries={INITIAL_GUESTBOOK}
            photos={INITIAL_MEDIA}
          />
        </div>

        {/* ========================================================
            EDITORIAL LUXURY FOOTER
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
            Con todo nuestro cariño. Esperamos compartir este día inolvidable con vosotros.
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
