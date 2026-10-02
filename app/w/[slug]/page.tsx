'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { INITIAL_WEDDING, INITIAL_EVENTS, INITIAL_CMS_BLOCKS, INITIAL_GUESTBOOK, INITIAL_MEDIA } from '@/lib/mock-data';
import { RevealScreen } from '@/components/guest/RevealScreen';
import { PersonalizedWelcome } from '@/components/guest/PersonalizedWelcome';
import { ProgressiveRSVP } from '@/components/guest/ProgressiveRSVP';
import { WeekendSchedule } from '@/components/guest/WeekendSchedule';
import { UsefulInfo } from '@/components/guest/UsefulInfo';
import { MemoriesSection } from '@/components/guest/MemoriesSection';
import { GuestStickyNav } from '@/components/guest/GuestStickyNav';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { Heart, Sparkles, ChevronDown } from 'lucide-react';

export default function PublicWeddingPage() {
  const params = useParams();
  const [isRevealed, setIsRevealed] = useState(true);
  const [activeSection, setActiveSection] = useState('welcome');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isRevealed) {
    return (
      <RevealScreen
        wedding={INITIAL_WEDDING}
        onOpen={() => setIsRevealed(true)}
      />
    );
  }

  const storyBlock = INITIAL_CMS_BLOCKS.find((b) => b.type === 'story');

  return (
    <main className="min-h-screen pb-32 bg-bg-primary text-text-primary transition-colors duration-300 overflow-x-hidden">
      {/* Top Header Pill for Preview */}
      <div className="max-w-md mx-auto pt-4 sm:pt-6 px-4 flex justify-between items-center gap-2 text-xs text-text-muted">
        <span className="font-serif italic text-text-secondary text-sm">Stephanie & Rodrigo</span>
        <ThemeSelector compact />
      </div>

      {/* Editorial Hero Banner */}
      <section className="py-12 px-6 max-w-lg mx-auto text-center space-y-6 animate-fade-in">
        <div className="relative h-72 w-full rounded-3xl overflow-hidden shadow-card border border-border-subtle">
          <Image
            src="/images/bodega/bodega-concejo-banquete-noche.png"
            alt="Stephanie & Rodrigo — Boda en Bodega Concejo"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white text-center space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-sand block">
              28 · 08 · 2027 · Bodega Concejo (Valladolid)
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight">
              Stephanie & Rodrigo
            </h1>
            <p className="text-xs uppercase tracking-widest text-white/80">Nos Casamos</p>
          </div>
        </div>
      </section>

      <div id="welcome">
        <PersonalizedWelcome wedding={INITIAL_WEDDING} />
      </div>

      {/* Editorial Story Section: 01 NOSOTROS */}
      {storyBlock && (
        <section className="py-12 px-6 max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="space-y-2 text-center">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent font-semibold block">
              01 · NOSOTROS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
              Nuestra Historia
            </h2>
          </div>

          <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-card border border-border-subtle">
            <Image
              src="/images/bodega/vinedos-valoria-barrica.png"
              alt="Viñedos de Bodega Concejo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>

          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-4 text-xs text-text-secondary leading-relaxed">
            {storyBlock.content?.paragraphs?.map((p: string, idx: number) => (
              <p key={idx} className="font-serif italic text-sm text-text-secondary leading-relaxed">
                &ldquo;{p}&rdquo;
              </p>
            ))}
          </div>
        </section>
      )}

      <div id="rsvp">
        <ProgressiveRSVP
          wedding={INITIAL_WEDDING}
          events={INITIAL_EVENTS}
        />
      </div>

      <div id="schedule">
        <WeekendSchedule
          events={INITIAL_EVENTS}
        />
      </div>

      <div id="info">
        <UsefulInfo
          wedding={INITIAL_WEDDING}
          blocks={INITIAL_CMS_BLOCKS}
        />
      </div>

      <div id="memories">
        <MemoriesSection
          wedding={INITIAL_WEDDING}
          guestbookEntries={INITIAL_GUESTBOOK}
          photos={INITIAL_MEDIA}
        />
      </div>

      {/* Editorial Footer */}
      <footer className="text-center py-16 px-6 border-t border-border-subtle/60 space-y-3 mt-16 max-w-lg mx-auto">
        <h3 className="font-serif text-3xl font-normal text-text-primary tracking-tight">
          Stephanie & Rodrigo
        </h3>
        <p className="text-[10px] font-mono tracking-[0.25em] text-text-muted uppercase">
          28 · 08 · 2027 · Bodega Concejo · Valoria La Buena (Valladolid)
        </p>
        <p className="text-xs font-serif italic text-text-secondary">
          Con todo nuestro cariño
        </p>
      </footer>

      {/* Floating Sticky Mobile Navigation */}
      <GuestStickyNav
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />
    </main>
  );
}
