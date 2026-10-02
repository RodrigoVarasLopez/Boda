'use client';

import React, { useState } from 'react';
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

export default function PublicWeddingPage() {
  const params = useParams();
  const [isRevealed, setIsRevealed] = useState(false);
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

  return (
    <main className="min-h-screen pb-28 bg-bg-primary text-text-primary transition-colors duration-300">
      {/* Quick Theme Switcher Pill for Preview */}
      <div className="max-w-md mx-auto pt-4 px-4 flex justify-end">
        <ThemeSelector compact />
      </div>

      <div id="welcome">
        <PersonalizedWelcome wedding={INITIAL_WEDDING} />
      </div>

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

      {/* Floating Sticky Mobile Navigation */}
      <GuestStickyNav
        activeSection={activeSection}
        onSelectSection={scrollToSection}
      />
    </main>
  );
}
