'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Wedding } from '@/lib/types';
import { useWeddingData } from '@/lib/guest-store';
import { Sparkles, Search, ArrowRight, MessageCircle, UserCheck, ShieldCheck } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/utils';

interface PublicRSVPPortalProps {
  wedding: Wedding;
}

export const PublicRSVPPortal: React.FC<PublicRSVPPortalProps> = ({ wedding }) => {
  const { groups } = useWeddingData();
  const [searchTerm, setSearchTerm] = useState('');

  const matchingGroups = searchTerm.trim().length >= 2
    ? groups.filter((g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.guests.some((gst) =>
          `${gst.first_name} ${gst.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  const handleWhatsAppContact = () => {
    const waUrl = buildWhatsAppLink(
      '',
      'Invitado',
      wedding.couple_names,
      wedding.wedding_date,
      typeof window !== 'undefined' ? window.location.href : '',
      'Hola Stephanie y Rodrigo, os escribo desde la web para confirmar nuestra asistencia a vuestra boda.'
    );
    window.open(waUrl, '_blank');
  };

  return (
    <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-3 h-3 text-text-accent" />
          <span>Confirmación de Asistencia</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          Confirma Tu Asistencia
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          Para ofrecer una experiencia a medida, cada invitado cuenta con un enlace personal e intransferible. Por favor, confirma antes del 20 de Julio de 2027.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: Access Your Personal Invitation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-brand-olive" />
              <span>Accede a tu Invitación Personal</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary">
              ¿Tienes tu invitación privada?
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed">
              Introduce tu apellido o nombre para acceder directamente a tu pase de invitado y confirmar menús, alergias y acompañantes.
            </p>

            {/* Quick Search Input */}
            <div className="relative pt-2">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Escribe tu nombre o familia (ej: García, Sofía)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent transition-all"
              />
            </div>

            {/* Matching Results Dropdown */}
            {searchTerm.trim().length >= 2 && (
              <div className="space-y-2 pt-2 animate-fade-in">
                {matchingGroups.length > 0 ? (
                  matchingGroups.map((grp) => (
                    <Link
                      key={grp.id}
                      href={`/i/${grp.token}`}
                      className="p-3.5 rounded-2xl bg-brand-sand/20 hover:bg-brand-sand/40 border border-brand-sand/50 flex items-center justify-between text-xs text-text-primary transition-colors group"
                    >
                      <div>
                        <span className="font-serif font-medium text-sm block">{grp.name}</span>
                        <span className="text-[11px] text-text-muted">
                          {grp.guests.map((g) => g.first_name).join(', ')}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-accent group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-text-muted italic p-2 text-center">
                    No se encontró ninguna invitación con ese nombre. Consulta el botón de WhatsApp abajo.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Demo Previews */}
          <div className="pt-4 border-t border-border-subtle/60 space-y-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
              O PRUEBA CON EJEMPLOS DE INVITACIÓN:
            </span>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/i/token-garcia-772"
                className="py-1.5 px-3 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 border border-border-subtle text-[11px] font-medium text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>Familia García (Sábado)</span>
                <ArrowRight className="w-3 h-3 text-text-muted" />
              </Link>
              <Link
                href="/i/token-sofia-409"
                className="py-1.5 px-3 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 border border-border-subtle text-[11px] font-medium text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>Sofía Martín (Preboda + Acompañante)</span>
                <ArrowRight className="w-3 h-3 text-text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Contact Directly by Phone / WhatsApp */}
        <div className="p-6 sm:p-8 rounded-3xl bg-brand-cream/40 border border-brand-sand/60 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-olive font-semibold text-xs uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-brand-olive" />
              <span>Confirmación Telefónica / WhatsApp</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary">
              ¿Prefieres avisarnos directamente?
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed">
              Si no encuentras tu enlace privado o prefieres confirmar por WhatsApp o llamada, ¡estamos a tu completa disposición! Nos encargaremos de registrar tu asistencia y menú personalmente.
            </p>

            <div className="p-4 rounded-2xl bg-white/70 border border-border-subtle/60 space-y-2 text-xs">
              <p className="font-medium text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-olive" />
                <span>Atención directa con Stephanie & Rodrigo</span>
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Podrás indicarnos tu menú (estándar, vegetariano, celíaco, etc.), alergias y si asistes acompañado/a.
              </p>
            </div>
          </div>

          <button
            onClick={handleWhatsAppContact}
            className="w-full py-3.5 px-5 rounded-2xl bg-brand-olive text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-brand-olive/90 shadow-card transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Confirmar por WhatsApp con los novios</span>
          </button>
        </div>
      </div>
    </section>
  );
};
