'use client';

import React, { useState } from 'react';
import { Event, GuestGroup } from '@/lib/types';
import { Clock, MapPin, Calendar, ExternalLink, Sparkles, Shirt } from 'lucide-react';
import { formatDateEs, generateGoogleCalendarUrl, downloadICSFile } from '@/lib/utils';

interface WeekendScheduleProps {
  events: Event[];
  group?: GuestGroup;
  guestFirstName?: string;
}

export const WeekendSchedule: React.FC<WeekendScheduleProps> = ({
  events,
  group,
  guestFirstName = 'invitado',
}) => {
  // Filter events according to group access rules
  const visibleEvents = events.filter((e) => {
    if (e.visibility === 'everyone') return true;
    if (group?.allowed_event_ids?.includes(e.id)) return true;
    return false;
  }).sort((a, b) => a.display_order - b.display_order);

  const [activeCalendarModal, setActiveCalendarModal] = useState<Event | null>(null);

  return (
    <section className="py-10 px-4 max-w-lg mx-auto space-y-8 animate-fade-in">
      {/* Title & Differential Concept Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tu Boda • Agenda Personalizada</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-semibold pt-1">
          {group?.name ? `Tu Plan de Fin de Semana, ${group.name.split(' ')[0]}` : 'Agenda del Fin de Semana'}
        </h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto">
          Este es el itinerario exclusivo de eventos a los que estás invitado/a.
        </p>
      </div>

      {/* Events Timeline */}
      <div className="relative pl-6 border-l-2 border-border-subtle space-y-8 ml-2">
        {visibleEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bg-card border-2 border-text-accent shadow-sm group-hover:scale-110 transition-transform" />

            {/* Event Card */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-4 hover:border-border-strong transition-colors">
              {/* Event Time & Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-accent">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDateEs(evt.start_time, true)}</span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-text-primary">
                  {evt.title}
                </h3>
              </div>

              {/* Event Description */}
              <p className="text-xs text-text-secondary leading-relaxed">
                {evt.description}
              </p>

              {/* Location & Dress Code */}
              <div className="space-y-2 text-xs text-text-secondary pt-1 border-t border-border-subtle/50">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-text-primary block">{evt.location_name}</span>
                    <span className="text-text-muted">{evt.address}</span>
                  </div>
                </div>

                {evt.dress_code && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Shirt className="w-4 h-4 text-text-accent shrink-0" />
                    <span><strong className="text-text-primary font-medium">Dress Code:</strong> {evt.dress_code}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Maps & Add to Calendar */}
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={evt.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-bg-secondary text-text-primary text-xs font-medium border border-border-subtle hover:border-border-strong transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-text-accent" />
                  <span>Ver en Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-text-muted ml-0.5" />
                </a>

                <button
                  onClick={() => setActiveCalendarModal(evt)}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-bg-secondary text-text-primary text-xs font-medium border border-border-subtle hover:border-border-strong transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-text-accent" />
                  <span>Añadir al Calendario</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Action Modal */}
      {activeCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card p-6 rounded-3xl max-w-sm w-full border border-border-subtle shadow-card space-y-4 text-center">
            <h4 className="font-serif text-xl font-bold text-text-primary">
              Guardar {activeCalendarModal.title}
            </h4>
            <p className="text-xs text-text-secondary">
              Selecciona tu calendario preferido para guardar el evento con todos los recordatorios.
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
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-2 shadow-soft hover:bg-primary-hover"
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
                className="w-full py-3 px-4 rounded-xl bg-bg-secondary text-text-primary font-medium text-xs border border-border-subtle hover:border-border-strong flex items-center justify-center gap-2 cursor-pointer"
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
