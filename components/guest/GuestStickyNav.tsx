'use client';

import React from 'react';
import { Calendar, CheckSquare, Info, Heart, Bookmark } from 'lucide-react';

interface GuestStickyNavProps {
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export const GuestStickyNav: React.FC<GuestStickyNavProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const items = [
    { id: 'welcome', label: 'Inicio', icon: Heart },
    { id: 'rsvp', label: 'RSVP', icon: CheckSquare },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
    { id: 'info', label: 'Guía', icon: Info },
    { id: 'memories', label: 'Memorias', icon: Bookmark },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-bg-card/90 backdrop-blur-md border border-border-strong/60 rounded-full shadow-card p-1.5 transition-all">
      <nav className="flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-text font-bold shadow-soft scale-105'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
