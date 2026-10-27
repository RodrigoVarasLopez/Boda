'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Shield, UserCheck, Eye, ArrowRight, LayoutDashboard, CalendarHeart } from 'lucide-react';
import { INITIAL_WEDDING, INITIAL_GROUPS } from '@/lib/mock-data';
import { ThemeSelector } from '@/components/admin/ThemeSelector';

export default function RootHomePage() {
  const sampleToken = INITIAL_GROUPS[0]?.token || 'token-familia-varas-lopez-ange-1';
  const sampleName = INITIAL_GROUPS[0]?.name || 'Familia Varas López';

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
            Acceso Rápido a Experiencias &amp; Plataforma
          </span>

          <div className="space-y-3">
            {/* Save the Date - Highlighted */}
            <Link
              href="/save-the-date"
              className="p-5 rounded-2xl bg-gradient-to-r from-brand-sand/40 via-bg-card to-amber-500/10 border-2 border-brand-gold/40 hover:border-brand-gold flex items-center justify-between group transition-all shadow-soft hover:shadow-card"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-gold/20 text-brand-dark border border-brand-gold/30">
                    <Sparkles className="w-3 h-3 text-brand-gold" />
                    Experiencia Oficial
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">28 · 08 · 2027</span>
                </div>
                <span className="font-serif font-bold text-text-primary block text-base flex items-center gap-2">
                  <CalendarHeart className="w-5 h-5 text-brand-gold" />
                  Save the Date Interactivo (/save-the-date)
                </span>
                <span className="text-xs text-text-muted block text-left">
                  Experiencia editorial previa con cuenta atrás, calendario para agendar, historia, enclave y música
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-gold group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </Link>

            {/* Invitación Personalizada */}
            <Link
              href={`/i/${sampleToken}`}
              className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle hover:border-text-accent flex items-center justify-between group transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-text-primary block text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Invitación Personalizada: {sampleName}
                </span>
                <span className="text-xs text-text-muted block">
                  Experiencia completa con RSVP, menús, traslados y accesos a eventos (/i/{sampleToken})
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-accent group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </Link>

            {/* Public Website */}
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
                  Vista editorial completa sin token de invitado personalizado
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-text-accent group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </Link>

            {/* Wedding Planner Multi-Boda Portal */}
            <Link
              href="/admin/weddings"
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/10 via-bg-card to-indigo-900/10 border border-purple-400/40 hover:border-purple-500 flex items-center justify-between group transition-all"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-text-primary block text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Panel Wedding Planner Multi-Boda (/admin/weddings)
                </span>
                <span className="text-xs text-text-muted block text-left">
                  Capa superior de gestión de múltiples bodas de diferentes parejas de clientes
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
            </Link>

            {/* Admin SaaS Operating System */}
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
                  Gestión de invitados, RSVP, WhatsApp helper, CMS, visibilidad y eventos
                </span>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
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
