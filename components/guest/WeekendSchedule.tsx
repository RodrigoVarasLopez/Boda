'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Event, GuestGroup, CMSBlock } from '@/lib/types';
import { Clock, MapPin, Calendar, Sparkles, Navigation } from 'lucide-react';
import { generateGoogleCalendarUrl, downloadICSFile } from '@/lib/utils';

interface WeekendScheduleProps {
  events: Event[];
  group?: GuestGroup;
  timelineBlock?: CMSBlock;
}

export const WeekendSchedule: React.FC<WeekendScheduleProps> = ({
  events,
  group,
  timelineBlock,
}) => {
  // Filter events according to group access rules (Preboda / Boda)
  const visibleEvents = events
    .filter((e) => {
      if (group) {
        return Array.isArray(group.allowed_event_ids) && group.allowed_event_ids.includes(e.id);
      }
      // On public page without group, show all
      return true;
    })
    .sort((a, b) => a.display_order - b.display_order);

  const fridayEvents = visibleEvents.filter((e) => e.day === 'friday');
  const saturdayEvents = visibleEvents.filter((e) => e.day === 'saturday');

  const [activeCalendarModal, setActiveCalendarModal] = useState<Event | null>(null);

  const sectionBadge = timelineBlock?.subtitle || 'Itinerario · Dos Momentos';
  const sectionTitle = group?.name
    ? timelineBlock?.title || 'El Plan de Vuestra Boda'
    : timelineBlock?.content?.public_title || 'Programa del Fin de Semana';
  const sectionDescription =
    timelineBlock?.content?.description ||
    'Empezaremos el viernes en la Bodega El Corro de Villamuriel de Cerrato y el sábado nos casaremos en la Iglesia de Villamuriel de Cerrato antes de ir al cóctel y banquete en Bodega Concejo.';

  const fridayTag = timelineBlock?.content?.friday_tag || 'PARTE 1 · VIERNES 27 AGOSTO';
  const fridayBadge = timelineBlock?.content?.friday_badge || 'Villamuriel de Cerrato';
  const fridayTitle =
    timelineBlock?.content?.friday_title ||
    'Preboda en Bodega El Corro (Villamuriel de Cerrato)';
  const fridayDescription =
    timelineBlock?.content?.friday_description ||
    'Comenzaremos el fin de semana en Villamuriel de Cerrato, en la tradicional Bodega El Corro (situada junto a la esclusa del Canal de Castilla), compartiendo vinos, picoteo y risas con nuestros amigos y familiares.';

  const saturdayTag = timelineBlock?.content?.saturday_tag || 'PARTE 2 · SÁBADO 28 AGOSTO';
  const saturdayBadge =
    timelineBlock?.content?.saturday_badge || 'El Gran Día · Todos los Invitados';
  const saturdayTitle =
    timelineBlock?.content?.saturday_title ||
    'Iglesia de Villamuriel de Cerrato & Bodega Concejo';
  const saturdayDescription =
    timelineBlock?.content?.saturday_description ||
    'Celebraremos la ceremonia religiosa en la Iglesia de Villamuriel de Cerrato y, a continuación, nos trasladaremos a Bodega Concejo para disfrutar del cóctel al aire libre, el banquete y la fiesta (con autobuses de Villamuriel al Concejo y viceversa con parada en Palencia).';
  const saturdayAddress =
    timelineBlock?.content?.saturday_address ||
    'Ceremonia: Iglesia de Villamuriel de Cerrato · Cóctel y Banquete: Bodega Concejo';

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
              href={
                evt.google_maps_url ||
                `https://maps.google.com/?q=${encodeURIComponent(`${evt.location_name} ${evt.address}`)}`
              }
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
          <span>{sectionBadge}</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          {sectionTitle}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          {sectionDescription}
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
                {fridayTag}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-brand-olive/20 text-brand-olive">
                {fridayBadge}
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              {fridayTitle}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              {fridayDescription}
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
                {saturdayTag}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                {saturdayBadge}
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              {saturdayTitle}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              {saturdayDescription}
            </p>
            <div className="pt-3 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-olive" />
                {saturdayAddress}
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
