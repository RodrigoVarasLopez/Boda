'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_EVENTS, INITIAL_GROUPS } from '@/lib/mock-data';
import { Event } from '@/lib/types';
import { Clock, MapPin, Eye, Lock, Plus, Check } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  const toggleGroupAccess = (eventId: string, groupId: string) => {
    INITIAL_GROUPS.forEach((g) => {
      if (g.id === groupId) {
        if (g.allowed_event_ids.includes(eventId)) {
          g.allowed_event_ids = g.allowed_event_ids.filter((id) => id !== eventId);
        } else {
          g.allowed_event_ids.push(eventId);
        }
      }
    });
    setEvents([...events]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Gestión de Eventos & Visibilidad
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Eventos &amp; Matriz &ldquo;Tu Boda&rdquo;
          </h1>
          <p className="text-xs text-text-muted">
            Configura el programa del fin de semana y qué grupos tienen acceso a eventos privados.
          </p>
        </div>

        <button
          onClick={() => alert('Función para crear nuevo evento')}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => (
          <div key={evt.id} className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            {evt.image_url && (
              <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-2">
                <Image
                  src={evt.image_url}
                  alt={evt.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                    {evt.day_label || (evt.day === 'friday' ? 'Viernes' : 'Sábado')}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-text-accent flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateEs(evt.start_time, true)}
                </span>
                <h3 className="font-serif text-2xl font-normal text-text-primary pt-0.5">
                  {evt.title}
                </h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                  evt.visibility === 'everyone'
                    ? 'bg-brand-olive/15 text-brand-olive'
                    : 'bg-brand-sand/50 text-brand-ink'
                }`}
              >
                {evt.visibility === 'everyone' ? (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Todos
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Privado
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">{evt.description}</p>

            <div className="text-xs text-text-muted space-y-1 pt-3 border-t border-border-subtle/50">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-accent" />
                <span className="font-medium text-text-primary">{evt.location_name}</span>
              </p>
              {evt.dress_code && <p className="pl-5 text-[11px]">Dress Code: {evt.dress_code}</p>}
            </div>

            {/* Visibility Group Toggles if Private Event */}
            {evt.visibility === 'selected_groups' && (
              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2 pt-2">
                <span className="text-[10px] font-mono tracking-widest text-text-muted block uppercase">
                  Acceso de Grupos a este Evento:
                </span>
                <div className="flex flex-wrap gap-2">
                  {INITIAL_GROUPS.map((grp) => {
                    const isAllowed = grp.allowed_event_ids.includes(evt.id);
                    return (
                      <button
                        key={grp.id}
                        onClick={() => toggleGroupAccess(evt.id, grp.id)}
                        className={`py-1 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isAllowed
                            ? 'bg-primary text-primary-text border-primary font-semibold shadow-xs'
                            : 'bg-bg-card text-text-muted border-border-subtle hover:text-text-primary'
                        }`}
                      >
                        {isAllowed && <Check className="w-3 h-3 text-brand-sand" />}
                        <span>{grp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
