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
  Receipt,
  LogOut,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { ThemeSelector } from '@/components/admin/ThemeSelector';
import { WeddingSwitcher } from '@/components/admin/WeddingSwitcher';
import { useWeddingPlanner } from '@/lib/weddings-store';
import { INITIAL_WEDDING } from '@/lib/mock-data';
import { useWeddingData } from '@/lib/guest-store';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/admin/weddings', label: 'Mis Bodas (Planner)', icon: Briefcase },
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'wedding_planner' | 'basic_user'>(
    'super_admin'
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const { groups } = useWeddingData();
  const { activeWedding, selectWedding } = useWeddingPlanner();

  React.useEffect(() => {
    if (pathname === '/admin/login') return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (data?.user) {
          const email = (data.user.email || '').toLowerCase();
          setUserEmail(data.user.email || null);
          const metaRole = data.user.user_metadata?.role;
          if (
            metaRole === 'super_admin' ||
            metaRole === 'wedding_planner' ||
            metaRole === 'basic_user'
          ) {
            setUserRole(metaRole);
          } else if (email === 'rodrigovaraslopez@gmail.com') {
            setUserRole('super_admin');
          } else if (email.includes('weddingplanner')) {
            setUserRole('wedding_planner');
          } else if (email) {
            setUserRole('basic_user');
          }

          // If basic_user has an assigned wedding, ensure it is active
          const assignedIds = data.user.user_metadata?.assigned_wedding_ids;
          if (metaRole === 'basic_user' && Array.isArray(assignedIds) && assignedIds.length === 1) {
            selectWedding(assignedIds[0]);
          }
        }
      })
      .catch(() => {});
  }, [pathname, selectWedding]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut errors if in local demo mode
    }
    // Clear demo cookie and any client-accessible auth cookies
    document.cookie = 'boda_admin_demo=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0]?.trim();
      if (name && name.startsWith('sb-')) {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });
    window.location.replace('/admin/login');
  };

  const isPlannerOrAdmin = userRole === 'super_admin' || userRole === 'wedding_planner';
  const visibleNavItems = isPlannerOrAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.href !== '/admin/weddings');

  const userLabel =
    userRole === 'super_admin'
      ? 'Super Admin'
      : userRole === 'wedding_planner'
      ? 'Wedding Planner'
      : userEmail
      ? userEmail.split('@')[0]
      : 'Pareja';

  const roleBadgeShort =
    userRole === 'super_admin' ? '👑' : userRole === 'wedding_planner' ? 'WP' : '💍';

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
            <WeddingSwitcher />
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
            href={`/w/${activeWedding.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover shadow-soft transition-colors"
            title="Abrir web pública de boda"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver web</span>
          </Link>

          {/* Save the Date link */}
          <Link
            href="/save-the-date"
            target="_blank"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-medium hover:bg-amber-100/80 transition-colors shadow-xs"
            title="Abrir Save the Date oficial"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden lg:inline">Save the Date</span>
            <span className="lg:hidden">STD</span>
          </Link>

          {/* Active User Badge */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-bg-secondary/60 border border-border-subtle text-[11px] text-text-secondary"
            title={userEmail || 'Sesión activa'}
          >
            <div className="w-6 h-6 rounded-full bg-brand-cream border border-border-strong flex items-center justify-center font-serif text-[10px] font-medium text-text-primary shadow-xs">
              {roleBadgeShort}
            </div>
            <span className="max-w-[130px] truncate font-medium text-text-primary">
              {userLabel}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-200 bg-rose-50/60 text-xs font-medium text-rose-700 hover:bg-rose-100/80 transition-colors cursor-pointer"
            title="Cerrar sesión y cambiar de usuario"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{loggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container (Sidebar + Content) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-56 bg-bg-card border-r border-border-subtle flex-col justify-between p-4 sticky top-[61px] h-[calc(100vh-61px)] z-30">
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
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

          <div className="space-y-2">
            {userEmail && (
              <div className="px-3 py-2 rounded-xl bg-bg-secondary/60 border border-border-subtle text-[11px] text-center truncate" title={userEmail}>
                <span className="text-text-muted block text-[10px] uppercase tracking-wider">
                  {userLabel}
                </span>
                <span className="font-medium text-text-primary truncate block">{userEmail}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100/70 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
            <Link
              href="/save-the-date"
              target="_blank"
              className="block p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-center space-y-0.5 hover:border-amber-400 transition-colors group"
              title="Abrir Save the Date interactivo"
            >
              <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300 font-semibold text-[10px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Save the Date</span>
              </div>
              <p className="font-serif italic text-text-primary font-medium truncate">
                {activeWedding.couple_names}
              </p>
              <p className="font-mono text-[10px] text-text-muted group-hover:text-text-primary">
                Abrir vista ↗
              </p>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-card border-b border-border-subtle p-4 space-y-1.5 animate-fade-in z-30">
            {visibleNavItems.map((item) => {
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
            <div className="pt-2 mt-2 border-t border-border-subtle">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Cerrando sesión...' : `Cerrar sesión (${userLabel})`}</span>
              </button>
            </div>
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
