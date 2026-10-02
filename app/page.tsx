'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Shield, UserCheck, Eye, ArrowRight, LayoutDashboard } from 'lucide-react';
import { INITIAL_WEDDING, INITIAL_GROUPS } from '@/lib/mock-data';
import { ThemeSelector } from '@/components/admin/ThemeSelector';

export default function RootHomePage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary p-6 flex flex-col justify-between items-center text-center animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-4 h-4 text-text-accent" />
          <span>Plataforma Privada de Boda + Guest CRM</span>
        </div>

        <h1 className="font-serif text-5xl font-bold tracking-tight text-text-primary">
          {INITIAL_WEDDING.couple_names}
        </h1>
        <p className="font-serif italic text-lg text-text-secondary">
          Wedding Concierge & Operating System
        </p>
      </div>

      {/* Demo Selector Options */}
      <div className="w-full space-y-4 my-8">
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card text-left space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Demostración Interactiva de Experiencias
          </span>

          <div className="space-y-3">
            {/* Link 1: Guest Experience - Familia García */}
            <Link
              href="/i/token-garcia-772"
              className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-text-accent flex items-center justify-between group transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-text-primary block text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Invitación Personalizada: Familia García
                </span>
                <span className="text-xs text-text-muted block">
                  Ver como invitado (Ceremonia, Banquete al aire libre y Fiesta en Bodega Concejo)
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-accent group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Link 2: Guest Experience - Sofía Martín */}
            <Link
              href="/i/token-sofia-409"
              className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-text-accent flex items-center justify-between group transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-text-primary block text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Invitación Personalizada: Sofía Martín
                </span>
                <span className="text-xs text-text-muted block">
                  Ver como amiga íntima (Incluye Preboda &amp; Cata el Viernes + Acompañante +1)
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-accent group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Link 3: Public Website */}
            <Link
              href="/w/stephanie-y-rodrigo"
              className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-text-accent flex items-center justify-between group transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-text-primary block text-sm flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-text-accent" />
                  Web Pública de Boda (/w/stephanie-y-rodrigo)
                </span>
                <span className="text-xs text-text-muted block">
                  Vista sin token de invitado personalizado
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-accent group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Link 4: Admin SaaS Operating System */}
            <Link
              href="/admin"
              className="p-4 rounded-2xl bg-primary text-primary-text flex items-center justify-between group shadow-card hover:bg-primary-hover transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold block text-sm flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Panel de Administración CRM (/admin)
                </span>
                <span className="text-xs opacity-80 block">
                  Gestión de invitados, RSVP, WhatsApp helper, visibilidad y contenidos
                </span>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Live Theme Switcher */}
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2 text-left">
          <span className="text-xs font-semibold text-text-muted block">Probar Temas Visuales:</span>
          <ThemeSelector compact />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-xs text-text-muted pb-4">
        Antigravity Engineering • Built with Next.js 15, TypeScript & Tailwind CSS
      </footer>
    </main>
  );
}
