'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Event, GuestGroup } from '@/lib/types';
import { Clock, MapPin, Calendar, Sparkles, Navigation, Wine } from 'lucide-react';
import { formatDateEs, generateGoogleCalendarUrl, downloadICSFile } from '@/lib/utils';

interface WeekendScheduleProps {
  events: Event[];
  group?: GuestGroup;
}

export const WeekendSchedule: React.FC<WeekendScheduleProps> = ({
  events,
  group,
}) => {
  // Filter events according to group access rules
  const visibleEvents = events.filter((e) => {
    if (e.visibility === 'everyone') return true;
    if (group?.allowed_event_ids?.includes(e.id)) return true;
    // On public page without group, show all with privacy note
    if (!group) return true;
    return false;
  }).sort((a, b) => a.display_order - b.display_order);

  const fridayEvents = visibleEvents.filter((e) => e.day === 'friday');
  const saturdayEvents = visibleEvents.filter((e) => e.day === 'saturday');

  const [activeCalendarModal, setActiveCalendarModal] = useState<Event | null>(null);

  const renderEventCard = (evt: Event) => {
    const eventTime = new Date(evt.start_time).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return (
      <div key={evt.id} className="relative group flex flex-col h-full">
        {/* Event Card */}
        <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden hover:border-border-strong hover:shadow-hover transition-all flex flex-col justify-between h-full">
          <div>
            {/* Card Hero Image if present */}
            {evt.image_url && (
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={evt.image_url}
                  alt={evt.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 text-white/95 backdrop-blur-xs border border-white/20">
                    {evt.day_label || (evt.day === 'friday' ? 'Viernes' : 'Sábado')}
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 font-mono text-xs text-brand-sand tracking-wider font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{eventTime} h</span>
                  </div>
                </div>
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-3.5">
              {!evt.image_url && (
                <div className="flex items-center gap-2 font-mono text-xs text-text-accent font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{eventTime} h</span>
                </div>
              )}

              <h4 className="font-serif text-xl sm:text-2xl font-normal text-text-primary leading-snug">
                {evt.title}
              </h4>

              <div className="space-y-1 text-xs text-text-muted">
                <p className="flex items-start gap-1.5 font-medium text-text-secondary">
                  <MapPin className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                  <span>{evt.location_name}</span>
                </p>
                {evt.address && (
                  <p className="pl-5 text-[11px] text-text-muted leading-relaxed">
                    {evt.address}
                  </p>
                )}
              </div>

              <p className="text-xs text-text-secondary leading-relaxed pt-1">
                {evt.description}
              </p>

              {evt.dress_code && (
                <div className="p-3 rounded-2xl bg-bg-secondary/50 border border-border-subtle text-[11px] text-text-secondary">
                  <span className="font-semibold text-text-primary">Código de vestimenta: </span>
                  {evt.dress_code}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Maps & Calendar */}
          <div className="p-5 sm:p-6 pt-0 border-t border-border-subtle/40 flex items-center justify-between gap-2 mt-auto">
            <a
              href={evt.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(`${evt.location_name} ${evt.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary text-[11px] font-medium transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-olive" />
              <span>Cómo llegar</span>
            </a>

            <button
              onClick={() => setActiveCalendarModal(evt)}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl border border-border-subtle hover:border-border-strong text-text-primary text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-text-accent" />
              <span>Calendario</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Title & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Itinerario · Dos Momentos</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          {group?.name ? `El Plan de Vuestra Boda` : 'Programa del Fin de Semana'}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          La celebración se divide en dos momentos únicos entre viñedos, bodega y música en directo.
        </p>
      </div>

      {/* ========================================================
          PARTE 1: VIERNES — PREBODA & CATA EN LA BODEGA DE RODRIGO
         ======================================================== */}
      {fridayEvents.length > 0 && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-brand-olive/10 border border-brand-olive/20 shadow-soft space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-brand-olive font-semibold">
                PARTE 1 · VIERNES 27 AGOSTO
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-brand-olive/20 text-brand-olive">
                Amigos · Exclusivo
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              Preboda &amp; Cata en la Bodega
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              Una velada íntima reservada para nuestros amigos más cercanos: paseo por los viñedos, visita guiada a la sala de crianza en barricas de roble y cata de nuestros mejores vinos de autor con maridaje antes del gran día.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fridayEvents.map(renderEventCard)}
          </div>
        </div>
      )}

      {/* ========================================================
          PARTE 2: SÁBADO — EL GRAN DÍA EN BODEGA CONCEJO
         ======================================================== */}
      {saturdayEvents.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent font-semibold">
                PARTE 2 · SÁBADO 28 AGOSTO
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                El Gran Día · Todos los Invitados
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              Boda en Bodega Concejo
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              Ceremonia civil al aire libre, banquete en la terraza de viñedos con música en directo y la mejor fiesta con DJ y barra libre bajo las estrellas.
            </p>
            <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-olive" />
                Ctra. Valoria Km 3,6 · 47200 Valoria La Buena (Valladolid)
              </span>
              <a
                href="https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-text-accent hover:underline flex items-center gap-1"
              >
                <span>Abrir en Google Maps</span>
                <Navigation className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {saturdayEvents.map(renderEventCard)}
          </div>
        </div>
      )}

      {/* Calendar Action Modal */}
      {activeCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card p-6 sm:p-8 rounded-3xl max-w-md w-full border border-border-subtle shadow-card space-y-5 text-center">
            <h4 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              Guardar {activeCalendarModal.title}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Añade el evento directamente a tu agenda personal con ubicación exacta y recordatorio para no perderte ningún detalle.
            </p>

            <div className="space-y-2.5 pt-2">
              <a
                href={generateGoogleCalendarUrl(
                  activeCalendarModal.title,
                  activeCalendarModal.description,
                  `${activeCalendarModal.location_name}, ${activeCalendarModal.address}`,
                  activeCalendarModal.start_time,
                  activeCalendarModal.end_time
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveCalendarModal(null)}
                className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-text font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-soft hover:bg-primary-hover transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Añadir a Google Calendar</span>
              </a>

              <button
                onClick={() => {
                  downloadICSFile(
                    activeCalendarModal.title,
                    activeCalendarModal.description,
                    `${activeCalendarModal.location_name}, ${activeCalendarModal.address}`,
                    activeCalendarModal.start_time,
                    activeCalendarModal.end_time
                  );
                  setActiveCalendarModal(null);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-bg-secondary text-text-primary font-medium text-xs sm:text-sm border border-border-subtle hover:border-border-strong flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Descargar archivo .ICS (Apple Calendar / Outlook)</span>
              </button>
            </div>

            <button
              onClick={() => setActiveCalendarModal(null)}
              className="text-xs text-text-muted hover:text-text-primary pt-2 underline cursor-pointer"
            >
              Cerrar ventana
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
