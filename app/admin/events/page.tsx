'use client';

import React, { useState } from 'react';
import { INITIAL_EVENTS, INITIAL_GROUPS } from '@/lib/mock-data';
import { Event } from '@/lib/types';
import { Calendar, Clock, MapPin, Eye, Lock, Plus, Edit2, Users, Check } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const toggleGroupAccess = (eventId: string, groupId: string) => {
    // In mock, toggle allowed event in group
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Gestión de Eventos & Visibilidad
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-primary">
            Eventos &amp; Matriz &ldquo;Tu Boda&rdquo;
          </h1>
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
          <div key={evt.id} className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-medium text-text-accent flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDateEs(evt.start_time, true)}
                </span>
                <h3 className="font-serif text-2xl font-semibold text-text-primary pt-0.5">
                  {evt.title}
                </h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                  evt.visibility === 'everyone'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {evt.visibility === 'everyone' ? (
                  <>
                    <Eye className="w-3 h-3" /> Todos
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> Privado
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-text-secondary">{evt.description}</p>

            <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-border-subtle">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-accent" />
                <span className="font-medium text-text-primary">{evt.location_name}</span>
              </p>
              {evt.dress_code && <p>Dress Code: {evt.dress_code}</p>}
            </div>

            {/* Visibility Group Toggles if Private Event */}
            {evt.visibility === 'selected_groups' && (
              <div className="p-3 rounded-2xl bg-bg-secondary/50 border border-border-subtle space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-text-muted block uppercase tracking-wider">
                  Acceso de Grupos a este Evento:
                </span>
                <div className="flex flex-wrap gap-2">
                  {INITIAL_GROUPS.map((grp) => {
                    const isAllowed = grp.allowed_event_ids.includes(evt.id);
                    return (
                      <button
                        key={grp.id}
                        onClick={() => toggleGroupAccess(evt.id, grp.id)}
                        className={`py-1 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all cursor-pointer ${
                          isAllowed
                            ? 'bg-primary text-primary-text border-primary font-semibold'
                            : 'bg-bg-card text-text-muted border-border-subtle hover:text-text-primary'
                        }`}
                      >
                        {isAllowed && <Check className="w-3 h-3 text-emerald-400" />}
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
