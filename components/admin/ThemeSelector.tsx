'use client';

import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { ThemeType } from '@/lib/types';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeType; name: string; color: string; desc: string }[] = [
    { id: 'editorial', name: 'Editorial / Ivory', color: '#8C6D46', desc: 'Elegancia clásica, lino, serif refinado' },
    { id: 'mediterranean', name: 'Mediterranean / Warm', color: '#234741', desc: 'Verde olivo, terracota, calidez estival' },
    { id: 'cinematic', name: 'Black & White / Cinematic', color: '#F4F4F5', desc: 'Minimalismo contemporáneo, alto contraste' },
  ];

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-bg-card border border-border-subtle shadow-soft">
        <Palette className="w-3.5 h-3.5 text-text-accent ml-1.5" />
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            className={`w-6 h-6 rounded-full border transition-transform cursor-pointer flex items-center justify-center ${
              theme === t.id ? 'ring-2 ring-text-accent scale-110 border-text-accent' : 'border-border-subtle opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: t.color }}
          >
            {theme === t.id && <Check className="w-3 h-3 text-white mix-blend-difference stroke-[3]" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-3 ${
            theme === t.id
              ? 'bg-bg-card border-text-accent ring-2 ring-text-accent shadow-card'
              : 'bg-bg-secondary/40 border-border-subtle hover:border-border-strong'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-serif font-bold text-base text-text-primary">{t.name}</span>
            <div className="w-5 h-5 rounded-full border border-border-subtle shadow-xs" style={{ backgroundColor: t.color }} />
          </div>
          <p className="text-xs text-text-muted">{t.desc}</p>
        </button>
      ))}
    </div>
  );
};
