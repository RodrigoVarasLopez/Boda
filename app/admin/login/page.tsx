'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (isProduction) {
          setError('Credenciales incorrectas o usuario no registrado.');
          return;
        }
        // Fallback for demo mode only in local development
        document.cookie = 'boda_admin_demo=true; path=/; max-age=86400';
        router.push('/admin');
        return;
      }

      if (data.session) {
        router.push('/admin');
      }
    } catch {
      if (process.env.NODE_ENV === 'production') {
        setError('Error al conectar con el servicio de autenticación.');
        return;
      }
      // Demo fallback in development
      document.cookie = 'boda_admin_demo=true; path=/; max-age=86400';
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const isProduction = process.env.NODE_ENV === 'production';

  const handleDemoAccess = () => {
    if (isProduction) return;
    document.cookie = 'boda_admin_demo=true; path=/; max-age=86400';
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary text-text-primary">
      <div className="w-full max-w-sm p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-secondary text-text-accent border border-border-subtle">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-text-primary">
            Acceso Administrador
          </h1>
          <p className="text-xs text-text-muted">
            Inicia sesión para gestionar invitados, RSVP y la web de boda.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="admin@bodaweb.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-soft cursor-pointer"
          >
            <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {!isProduction ? (
          <div className="pt-4 border-t border-border-subtle text-center space-y-2">
            <p className="text-[11px] text-text-muted">
              ¿Probando la plataforma en desarrollo local?
            </p>
            <button
              onClick={handleDemoAccess}
              className="w-full py-2 px-3 rounded-xl border border-border-strong text-text-secondary text-xs font-medium hover:bg-bg-secondary transition-colors cursor-pointer"
            >
              Entrar en Modo Demostración
            </button>
          </div>
        ) : (
          <div className="pt-4 border-t border-border-subtle text-center flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acceso seguro protegido con Supabase Auth</span>
          </div>
        )}
      </div>
    </div>
  );
}
