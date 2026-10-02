'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  FileText,
  Image as ImageIcon,
  Settings,
  Eye,
  Heart,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { INITIAL_WEDDING } from '@/lib/mock-data';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/guests', label: 'Invitados & Enlaces', icon: Users },
    { href: '/admin/rsvp', label: 'RSVP Breakdown', icon: CheckSquare },
    { href: '/admin/events', label: 'Eventos & Visibilidad', icon: Calendar },
    { href: '/admin/cms', label: 'CMS de Boda', icon: FileText },
    { href: '/admin/media', label: 'Memorias & Firmas', icon: ImageIcon },
    { href: '/admin/settings', label: 'Ajustes & Temas', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 bg-bg-card border-r border-border-subtle flex-col justify-between p-6 sticky top-0 h-screen z-30 shadow-soft">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-text-accent" />
              Wedding CRM & Operating System
            </span>
            <h1 className="font-serif text-2xl font-semibold text-text-primary tracking-tight">
              {INITIAL_WEDDING.couple_names}
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
        </div>

        {/* Footer Actions */}
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <ThemeSelector compact />
          <Link
            href="/w/laura-y-rodrigo"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl border border-border-strong text-text-primary font-medium text-xs flex items-center justify-center gap-2 hover:bg-bg-secondary transition-colors"
          >
            <Eye className="w-4 h-4 text-text-accent" />
            <span>Ver Web Pública</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-bg-card border-b border-border-subtle p-4 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-text-accent fill-text-accent/20" />
          <span className="font-serif font-semibold text-lg">{INITIAL_WEDDING.couple_names}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-text-primary hover:bg-bg-secondary cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-card border-b border-border-subtle p-4 space-y-2 animate-fade-in z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
}
