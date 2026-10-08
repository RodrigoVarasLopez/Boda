'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarDays,
  PanelsTopLeft,
  Image as ImageIcon,
  BookOpen,
  Settings2,
  Eye,
  Menu,
  X,
  UserCheck,
  Receipt
} from 'lucide-react';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { INITIAL_WEDDING } from '@/lib/mock-data';
import { useWeddingData } from '@/lib/guest-store';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/budget', label: 'Presupuesto', icon: Receipt },
  { href: '/admin/guests', label: 'Invitados', icon: Users },
  { href: '/admin/rsvp', label: 'RSVP', icon: ClipboardCheck },
  { href: '/admin/events', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/cms', label: 'Web & CMS', icon: PanelsTopLeft },
  { href: '/admin/guestbook', label: 'Firmas', icon: BookOpen },
  { href: '/admin/media', label: 'Memorias', icon: ImageIcon },
  { href: '/admin/settings', label: 'Ajustes', icon: Settings2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { groups } = useWeddingData();

  const firstToken = groups.length > 0 ? groups[0].token : null;
  const guestUrl = firstToken ? `/i/${firstToken}` : '/admin/guests';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col transition-colors duration-300">
      {/* Top Application Header */}
      <header className="bg-bg-card border-b border-border-subtle px-4 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-bg-secondary"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-normal text-text-primary tracking-tight">
              {INITIAL_WEDDING.couple_names}
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-widest uppercase text-text-accent px-2 py-0.5 rounded-md bg-bg-secondary border border-border-subtle">
              Admin OS
            </span>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSelector compact />
          
          {/* Ver como invitado with quick selector */}
          <div className="relative group">
            <Link
              href={guestUrl}
              target={firstToken ? '_blank' : '_self'}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-border-strong text-xs font-medium text-text-primary hover:bg-bg-secondary transition-colors"
              title={firstToken ? `Abrir vista de invitado (${groups[0].name})` : 'Ir a Gestión de Invitados'}
            >
              <UserCheck className="w-3.5 h-3.5 text-text-accent" />
              <span className="hidden sm:inline">Ver como invitado</span>
              <span className="sm:hidden">Invitado</span>
            </Link>

            {/* Quick dropdown menu for choosing specific guest profile */}
            <div className="hidden group-hover:block absolute right-0 top-full pt-1.5 z-50 w-64 animate-fade-in">
              <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-card p-2 space-y-1 text-xs">
                <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted px-2 py-1 block font-semibold">
                  INVITACIONES REALES:
                </span>
                {groups.length === 0 ? (
                  <div className="p-3 text-center space-y-1">
                    <p className="text-[11px] text-text-muted">Aún no hay invitados registrados.</p>
                    <Link
                      href="/admin/guests"
                      className="text-xs text-primary font-semibold hover:underline block"
                    >
                      + Añadir primer invitado →
                    </Link>
                  </div>
                ) : (
                  <>
                    {groups.slice(0, 4).map((grp) => (
                      <Link
                        key={grp.id}
                        href={`/i/${grp.token}`}
                        target="_blank"
                        className="flex flex-col p-2 rounded-xl hover:bg-bg-secondary transition-colors"
                      >
                        <span className="font-semibold text-text-primary">{grp.name}</span>
                        <span className="text-[11px] text-text-muted">
                          {grp.guests.length} {grp.guests.length === 1 ? 'persona' : 'personas'} · {grp.invitation_status}
                        </span>
                      </Link>
                    ))}
                    <div className="pt-1 border-t border-border-subtle">
                      <Link
                        href="/admin/guests"
                        className="block text-center py-1.5 text-[11px] text-text-accent hover:underline font-medium"
                      >
                        Ver todos los invitados en CRM →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/w/${INITIAL_WEDDING.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover shadow-soft transition-colors"
            title="Abrir web pública de boda"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver web</span>
          </Link>

          {/* Avatar Monogram */}
          <div className="w-8 h-8 rounded-full bg-brand-cream border border-border-strong flex items-center justify-center font-serif text-xs font-medium text-text-primary shadow-xs">
            S&amp;R
          </div>
        </div>
      </header>

      {/* Main Layout Container (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-56 bg-bg-card border-r border-border-subtle flex-col justify-between p-4 sticky top-[61px] h-[calc(100vh-61px)] z-30">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-text font-semibold shadow-soft'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-[11px] text-text-muted text-center space-y-1">
            <p className="font-serif italic text-text-primary font-medium">Stephanie & Rodrigo</p>
            <p className="font-mono text-[10px]">25 · 08 · 2027</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-card border-b border-border-subtle p-4 space-y-1.5 animate-fade-in z-30">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-text font-semibold'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
