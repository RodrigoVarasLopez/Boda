'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
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
import { PersonalizedWelcome } from '@/components/guest/PersonalizedWelcome';
import { ProgressiveRSVP } from '@/components/guest/ProgressiveRSVP';
import { WeekendSchedule } from '@/components/guest/WeekendSchedule';
import { UsefulInfo } from '@/components/guest/UsefulInfo';
import { MemoriesSection } from '@/components/guest/MemoriesSection';
import { GuestStickyNav } from '@/components/guest/GuestStickyNav';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { AlertTriangle, HeartHandshake } from 'lucide-react';

export default function PersonalizedInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  const group = INITIAL_GROUPS.find((g) => g.token === token);
  const groupRSVP = INITIAL_RSVPS.find((r) => r.token === token);

  const [isRevealed, setIsRevealed] = useState(false);
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
            Este enlace de invitación ha expirado, no existe o ha sido actualizado por los novios.
          </p>
          <div className="pt-3 border-t border-border-subtle">
            <p className="text-[11px] text-text-muted flex items-center justify-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-text-accent" />
              Ponte en contacto con Laura o Rodrigo para cualquier consulta.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    <main className="min-h-screen pb-28 bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Quick Theme Switcher Pill for Preview */}
      <div className="max-w-md mx-auto pt-4 px-4 flex justify-between items-center text-xs text-text-muted">
        <span className="font-medium">Invitación para {group.name}</span>
        <ThemeSelector compact />
      </div>

      <div id="welcome">
        <PersonalizedWelcome wedding={INITIAL_WEDDING} group={group} />
      </div>

      <div id="rsvp">
        <ProgressiveRSVP
          wedding={INITIAL_WEDDING}
          group={group}
          events={INITIAL_EVENTS}
          existingRSVP={groupRSVP?.responses}
        />
      </div>

      <div id="schedule">
        <WeekendSchedule
          events={INITIAL_EVENTS}
          group={group}
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

      {/* Floating Sticky Mobile Navigation */}
      <GuestStickyNav
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />
    </main>
  );
}
