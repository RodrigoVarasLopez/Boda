'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_EVENTS } from '@/lib/mock-data';
import { Event, GuestGroup } from '@/lib/types';
import {
  Clock,
  MapPin,
  Eye,
  Lock,
  Plus,
  Check,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { formatDateEs } from '@/lib/utils';
import { useWeddingData } from '@/lib/guest-store';
import { useCMSData } from '@/lib/cms-store';

export default function AdminEventsPage() {
  const { groups, setGroupStageEvents } = useWeddingData();
  const { events } = useCMSData();
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});
  const [searchByEvent, setSearchByEvent] = useState<Record<string, string>>({});
  const [filterModeByEvent, setFilterModeByEvent] = useState<Record<string, 'assigned' | 'all'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleExpandEvent = (eventId: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleToggleFamilyPreboda = async (grp: GuestGroup) => {
    const currentlyInPreboda = grp.allowed_event_ids.includes('evt-preboda-cata');
    const nextPreboda = !currentlyInPreboda;
    await setGroupStageEvents(grp.id, nextPreboda, true);
    showToast(
      nextPreboda
        ? `✓ ${grp.name} añadida a Preboda (actualizado en Invitados)`
        : `✓ ${grp.name} quitada de Preboda (actualizado en Invitados)`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white text-xs font-medium shadow-card flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Gestión de Eventos &amp; Visibilidad
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Eventos &amp; Matriz &ldquo;Tu Boda&rdquo;
          </h1>
          <p className="text-xs text-text-muted">
            Configura el programa del fin de semana y qué familias e invitados asisten a la Preboda y a la Boda.
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {events.map((evt) => {
          const isPrebodaEvent = evt.id === 'evt-preboda-cata' || evt.visibility === 'selected_groups';
          const assignedGroups = isPrebodaEvent
            ? groups.filter((g) => g.allowed_event_ids.includes('evt-preboda-cata'))
            : groups;
          const assignedGuestsCount = assignedGroups.reduce((acc, g) => acc + g.guests.length, 0);
          const isExpanded = Boolean(expandedEventIds[evt.id]);
          const searchQuery = (searchByEvent[evt.id] || '').trim().toLowerCase();
          const filterMode = filterModeByEvent[evt.id] || (isPrebodaEvent ? 'assigned' : 'all');

          const baseListForView = isPrebodaEvent
            ? filterMode === 'assigned'
              ? assignedGroups
              : groups
            : groups;

          const visibleGroups = baseListForView.filter((grp) => {
            if (!searchQuery) return true;
            return (
              grp.name.toLowerCase().includes(searchQuery) ||
              grp.guests.some((gst) =>
                `${gst.first_name} ${gst.last_name || ''}`.toLowerCase().includes(searchQuery)
              )
            );
          });

          return (
            <div
              key={evt.id}
              className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4"
            >
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
                      <Lock className="w-3.5 h-3.5" /> Selección Preboda
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

              {/* Compact Button to Show/Hide Families & Guests per Family */}
              <div className="pt-2 border-t border-border-subtle/50 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-7 h-7 rounded-xl bg-brand-olive/15 text-brand-olive flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="font-semibold text-text-primary block">
                        {assignedGroups.length} {assignedGroups.length === 1 ? 'familia' : 'familias'} ({assignedGuestsCount} invitados)
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {isPrebodaEvent
                          ? 'Sincronizado en tiempo real con la lista de Invitados'
                          : 'Todos los invitados asisten a este evento de la Boda'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpandEvent(evt.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      isExpanded
                        ? 'bg-primary text-primary-text border-primary shadow-xs'
                        : 'bg-bg-secondary/70 hover:bg-bg-secondary text-text-primary border-border-subtle'
                    }`}
                  >
                    <span>{isExpanded ? 'Ocultar familias' : 'Ver por familia'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Collapsible Drawer Inside Card with Families & Their Members */}
                {isExpanded && (
                  <div className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-3">
                    {/* Filter Tabs (For Preboda: "En Preboda" vs "Todas las familias para añadir/quitar") & Search */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
                      {isPrebodaEvent && (
                        <div className="inline-flex rounded-xl bg-bg-card p-1 border border-border-subtle text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setFilterModeByEvent((prev) => ({ ...prev, [evt.id]: 'assigned' }))
                            }
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                              filterMode === 'assigned'
                                ? 'bg-brand-olive text-white'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            Van a Preboda ({assignedGroups.length})
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFilterModeByEvent((prev) => ({ ...prev, [evt.id]: 'all' }))
                            }
                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                              filterMode === 'all'
                                ? 'bg-primary text-primary-text'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            Todas las familias ({groups.length})
                          </button>
                        </div>
                      )}

                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar familia o invitado..."
                          value={searchByEvent[evt.id] || ''}
                          onChange={(e) =>
                            setSearchByEvent((prev) => ({ ...prev, [evt.id]: e.target.value }))
                          }
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Scrollable Compact List of Families and their Guests */}
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {visibleGroups.length === 0 ? (
                        <p className="text-center text-xs text-text-muted py-4">
                          No hay familias que coincidan con el filtro.
                        </p>
                      ) : (
                        visibleGroups.map((grp) => {
                          const isAllowed = grp.allowed_event_ids.includes('evt-preboda-cata');
                          return (
                            <div
                              key={grp.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                                isPrebodaEvent && isAllowed
                                  ? 'bg-bg-card border-brand-olive/40 shadow-2xs'
                                  : 'bg-bg-card/80 border-border-subtle/70'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-serif text-sm font-medium text-text-primary truncate">
                                  {grp.name}
                                </p>
                                <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                                  {grp.guests
                                    .map((g) => `${g.first_name} ${g.last_name || ''}`.trim())
                                    .join(' · ')}
                                </p>
                              </div>

                              {isPrebodaEvent && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFamilyPreboda(grp)}
                                  title={
                                    isAllowed
                                      ? 'Quitar a esta familia de la Preboda'
                                      : 'Añadir a esta familia a la Preboda'
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 border ${
                                    isAllowed
                                      ? 'bg-brand-olive text-white border-brand-olive hover:bg-rose-600 hover:border-rose-600'
                                      : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-brand-olive hover:text-brand-olive'
                                  }`}
                                >
                                  {isAllowed ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Quitar</span>
                                      <X className="w-3 h-3 opacity-80" />
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Añadir</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
