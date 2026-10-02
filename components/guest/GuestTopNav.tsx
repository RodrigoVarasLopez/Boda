'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wedding, GuestGroup } from '@/lib/types';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { Menu, X, Sparkles, UserCheck } from 'lucide-react';

interface GuestTopNavProps {
  wedding: Wedding;
  group?: GuestGroup;
  activeSection: string;
  onSelectSection: (sectionId: string) => void;
}

export const GuestTopNav: React.FC<GuestTopNavProps> = ({
  wedding,
  group,
  activeSection,
  onSelectSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'welcome', label: 'Inicio' },
    { id: 'story', label: 'Nosotros' },
    { id: 'schedule', label: 'Programa' },
    { id: 'info', label: 'Bodega & Guía' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'memories', label: 'Memorias' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg-card/90 backdrop-blur-md border-b border-border-subtle shadow-soft py-3'
          : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent py-4 text-white'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        {/* Left: Brand Monogram */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSection('welcome')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span
              className={`font-serif text-xl sm:text-2xl font-normal tracking-tight transition-colors ${
                isScrolled ? 'text-text-primary' : 'text-white'
              }`}
            >
              {wedding.couple_names}
            </span>
          </button>

          {group ? (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-brand-sand/30 border border-brand-sand/50 text-text-primary backdrop-blur-xs">
              <UserCheck className="w-3.5 h-3.5 text-brand-olive" />
              <span>Invitación: {group.name}</span>
            </span>
          ) : (
            <span
              className={`hidden lg:inline text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${
                isScrolled
                  ? 'text-text-muted border-border-subtle bg-bg-secondary/60'
                  : 'text-white/80 border-white/20 bg-black/20'
              }`}
            >
              Bodega Concejo · 28 · 08 · 2027
            </span>
          )}
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectSection(link.id)}
                className={`py-1.5 px-3 rounded-full text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? isScrolled
                      ? 'bg-primary text-primary-text font-semibold shadow-xs'
                      : 'bg-white text-black font-semibold shadow-soft'
                    : isScrolled
                    ? 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/60'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Selector & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <ThemeSelector compact />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer ${
              isScrolled
                ? 'text-text-primary hover:bg-bg-secondary'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Menú de navegación"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-card border-b border-border-subtle p-4 space-y-1.5 shadow-card animate-fade-in text-text-primary">
          {group && (
            <div className="pb-2 mb-2 border-b border-border-subtle flex items-center gap-2 text-xs text-text-accent font-medium">
              <UserCheck className="w-4 h-4 text-brand-olive" />
              <span>Invitación para {group.name}</span>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onSelectSection(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                activeSection === link.id
                  ? 'bg-primary text-primary-text font-semibold'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
