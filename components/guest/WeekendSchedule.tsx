'use client';

import React, { useState } from 'react';
import { Event, GuestGroup } from '@/lib/types';
import { Clock, MapPin, Calendar, Sparkles, Navigation } from 'lucide-react';
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
    return false;
  }).sort((a, b) => a.display_order - b.display_order);

  const [activeCalendarModal, setActiveCalendarModal] = useState<Event | null>(null);

  return (
    <section className="py-12 px-5 max-w-lg mx-auto space-y-10 animate-fade-in">
      {/* Title & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3 h-3" />
          <span>Itinerario · Tu Boda</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
          {group?.name ? `El Plan de Fin de Semana` : 'Agenda del Fin de Semana'}
        </h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto">
          Los momentos y celebraciones especialmente preparados para ti.
        </p>
      </div>

      {/* Events Timeline */}
      <div className="relative pl-6 border-l border-border-strong/60 space-y-8 ml-3">
        {visibleEvents.map((evt) => {
          const eventTime = new Date(evt.start_time).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[30px] top-2 w-3 h-3 rounded-full bg-brand-sand border-2 border-primary shadow-xs group-hover:scale-125 transition-transform" />

              {/* Event Card */}
              <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-4 hover:border-border-strong transition-all">
                {/* Time & Title */}
                <div className="space-y-1">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-accent flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {eventTime}h · {formatDateEs(evt.start_time).split(',')[0]}
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-text-primary">
                    {evt.title}
                  </h3>
                </div>

                {/* Event Description */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {evt.description}
                </p>

                {/* Location & Dress Code */}
                <div className="space-y-2 text-xs text-text-secondary pt-3 border-t border-border-subtle/50">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-text-primary block">{evt.location_name}</span>
                      <span className="text-text-muted text-[11px]">{evt.address}</span>
                    </div>
                  </div>

                  {evt.dress_code && (
                    <div className="text-[11px] text-text-muted pl-6">
                      <span className="text-text-secondary font-medium">Dress Code:</span> {evt.dress_code}
                    </div>
                  )}
                </div>

                {/* Action Buttons: Cómo llegar & Añadir al Calendario */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={evt.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-bg-secondary text-text-primary text-xs font-medium border border-border-subtle hover:border-border-strong transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-text-accent" />
                    <span>Cómo llegar</span>
                  </a>

                  <button
                    onClick={() => setActiveCalendarModal(evt)}
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-bg-secondary text-text-primary text-xs font-medium border border-border-subtle hover:border-border-strong transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-text-accent" />
                    <span>Añadir al calendario</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Action Modal */}
      {activeCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card p-6 rounded-3xl max-w-sm w-full border border-border-subtle shadow-card space-y-4 text-center">
            <h4 className="font-serif text-2xl font-normal text-text-primary">
              Guardar {activeCalendarModal.title}
            </h4>
            <p className="text-xs text-text-secondary">
              Añade el evento directamente a tu agenda personal con ubicación y recordatorios.
            </p>

            <div className="space-y-2 pt-2">
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
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-2 shadow-soft hover:bg-primary-hover transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Google Calendar</span>
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
                className="w-full py-3 px-4 rounded-xl bg-bg-secondary text-text-primary font-medium text-xs border border-border-subtle hover:border-border-strong flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Descargar archivo .ICS (Apple / Outlook)</span>
              </button>
            </div>

            <button
              onClick={() => setActiveCalendarModal(null)}
              className="text-xs text-text-muted hover:text-text-primary pt-2 underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
