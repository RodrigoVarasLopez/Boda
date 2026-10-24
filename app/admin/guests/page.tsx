'use client';

import React, { useState } from 'react';
import { INITIAL_WEDDING, INITIAL_EVENTS } from '@/lib/mock-data';
import { GuestGroup, INVITATION_STATUS_LABELS } from '@/lib/types';
import {
  Users,
  Search,
  Filter,
  Copy,
  MessageCircle,
  Eye,
  Check,
  Plus,
  Calendar,
  SlidersHorizontal,
  UserCheck,
  PhoneCall,
  Cloud,
  CloudUpload,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  X,
  Baby,
  Wine,
} from 'lucide-react';
import { GuestDrawer } from '@/components/admin/GuestDrawer';
import { ManualRSVPModal } from '@/components/admin/ManualRSVPModal';
import { AddGuestModal } from '@/components/admin/AddGuestModal';
import { useWeddingData } from '@/lib/guest-store';
import { buildWhatsAppLink } from '@/lib/utils';

export default function AdminGuestsPage() {
  const {
    groups,
    stats,
    refresh,
    refreshSupabase,
    updateGuestType,
    updateGroupName,
    updateGuestDetails,
    toggleGroupEvent,
    createGroup,
    deleteGroup,
    syncLocalGuestsToSupabase,
    isLoadingSupabase,
    isSyncing,
    isSupabaseOnline,
  } = useWeddingData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDrawerGroup, setSelectedDrawerGroup] = useState<GuestGroup | null>(null);
  const [selectedModalGroup, setSelectedModalGroup] = useState<GuestGroup | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  // Inline editing state for Group Name
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameDraft, setGroupNameDraft] = useState('');

  // Inline editing state for Guest Name & Last Name
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestFirstDraft, setGuestFirstDraft] = useState('');
  const [guestLastDraft, setGuestLastDraft] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveInlineGroupName = async (groupId: string) => {
    const clean = groupNameDraft.trim();
    if (!clean) return;
    setEditingGroupId(null);
    await updateGroupName(groupId, clean);
    showToast('Nombre de familia actualizado');
  };

  const handleSaveInlineGuestName = async (guestId: string) => {
    const cleanFirst = guestFirstDraft.trim();
    const cleanLast = guestLastDraft.trim();
    if (!cleanFirst) return;
    setEditingGuestId(null);
    await updateGuestDetails(guestId, cleanFirst, cleanLast);
    showToast('Nombre de invitado actualizado');
  };

  const handleQuickToggleChild = (guestId: string, currentlyChild: boolean) => {
    const nextType = currentlyChild ? 'adult' : 'child';
    updateGuestType(guestId, nextType);
    showToast(nextType === 'child' ? 'Marcado como Niño (menú infantil)' : 'Marcado como Adulto');
  };

  const handleQuickTogglePreboda = async (groupId: string, currentlyHasPreboda: boolean) => {
    const next = !currentlyHasPreboda;
    await toggleGroupEvent(groupId, 'evt-preboda-cata', next);
    showToast(next ? 'Invitado a Preboda activado' : 'Quitado de Preboda');
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingLocal(true);
    try {
      const res = await syncLocalGuestsToSupabase();
      if (res.success) {
        showToast(`Sincronización completada (${(res as any).count ?? groups.length} grupos en Supabase)`);
      } else {
        showToast(`Error al sincronizar: ${res.error || 'Intenta de nuevo'}`);
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message || 'Error de conexión'}`);
    } finally {
      setIsSyncingLocal(false);
    }
  };

  const filteredGroups = groups.filter((grp) => {
    const matchesSearch =
      grp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grp.guests.some(
        (g) =>
          g.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      selectedStatusFilter === 'all'
        ? true
        : selectedStatusFilter === 'children'
        ? grp.guests.some((g) => g.is_child || g.guest_type === 'child')
        : selectedStatusFilter === 'preboda'
        ? grp.allowed_event_ids.includes('evt-preboda-cata')
        : grp.invitation_status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/i/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleOpenWhatsApp = (grp: GuestGroup) => {
    const url = `${window.location.origin}/i/${grp.token}`;
    const wa = buildWhatsAppLink('', grp.name, INITIAL_WEDDING.couple_names, INITIAL_WEDDING.wedding_date, url, grp.custom_message);
    window.open(wa, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white text-xs font-medium shadow-card flex items-center gap-2.5 animate-slide-up">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
              Gestión de Invitados
            </span>
            {isLoadingSupabase ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-700">
                <Loader2 className="w-2.5 h-2.5 animate-spin" /> Conectando BD...
              </span>
            ) : isSupabaseOnline ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Supabase Activo
              </span>
            ) : null}
          </div>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Invitados & Grupos
          </h1>
          <p className="text-xs text-text-muted">
            Gestiona familias, estados de confirmación, visibilidad de eventos y enlaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Supabase Sync Button */}
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing || isSyncingLocal}
            title="Sincronizar invitados locales con Supabase"
            className="py-2.5 px-3.5 rounded-xl border border-border-subtle hover:border-brand-olive/50 bg-bg-card hover:bg-bg-secondary text-text-secondary font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSyncing || isSyncingLocal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-olive" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5 text-brand-olive" />
            )}
            <span>{isSyncing || isSyncingLocal ? 'Sincronizando...' : 'Sincronizar a BD'}</span>
          </button>

          {/* Add Guest Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir invitado</span>
          </button>
        </div>
      </div>

      {/* Live Headcount KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            TOTAL INVITADOS
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-text-primary">
              {stats.totalGuests}
            </span>
            <span className="text-[11px] text-text-muted">en {stats.totalGroups} grupos</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-secondary">
            <span>{stats.totalAdults ?? stats.totalGuests} adultos</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full text-[10px]">
              <Baby className="w-3 h-3" />
              {stats.totalChildren ?? 0} niños
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-olive/10 border border-brand-olive/20 shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-brand-olive font-semibold block">
            CONFIRMADOS (ASISTEN)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-brand-olive">
              {stats.totalConfirmedHeadcount}
            </span>
            {stats.confirmedPlusOnes > 0 && (
              <span className="text-[11px] text-brand-olive/80">
                ({stats.confirmedAttending} + {stats.confirmedPlusOnes} acomps.)
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-terracotta/10 border border-brand-terracotta/20 shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-brand-terracotta font-semibold block">
            PENDIENTES
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-brand-terracotta">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-brand-terracotta/80">sin responder</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle shadow-card">
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
            NO ASISTEN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif text-3xl font-normal text-text-muted">
              {stats.confirmedDeclined}
            </span>
            <span className="text-[11px] text-text-muted">bajas</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por grupo o nombre de invitado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-text-muted/60"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'preboda', label: '🍷 Con Preboda' },
            { id: 'children', label: `👶 Con Niños (${stats.totalChildren ?? 0})` },
            { id: 'sent', label: 'Enviada' },
            { id: 'opened', label: 'Abierta' },
            { id: 'responded', label: 'Respondida' },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setSelectedStatusFilter(status.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatusFilter === status.id
                  ? 'bg-primary text-primary-text shadow-xs'
                  : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredGroups.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-cream text-text-accent flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-brand-olive" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-text-primary">
              {groups.length === 0 ? 'No hay invitados registrados todavía' : 'Sin resultados para la búsqueda'}
            </h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mt-1">
              {groups.length === 0
                ? 'Empieza creando tu primer grupo o familia con su enlace personalizado para enviar por WhatsApp o ver como invitado.'
                : 'Prueba cambiando los filtros de estado o el término de búsqueda.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-5 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir primer invitado</span>
            </button>
            {groups.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatusFilter('all');
                }}
                className="py-2.5 px-4 rounded-xl border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-secondary cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBILE VIEW: ACCORDION CARDS */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredGroups.map((grp) => {
          const isEditingThisGroup = editingGroupId === grp.id;
          return (
            <div
              key={grp.id}
              onClick={() => setSelectedDrawerGroup(grp)}
              className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 min-w-0">
                  {isEditingThisGroup ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={groupNameDraft}
                        onChange={(e) => setGroupNameDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInlineGroupName(grp.id);
                          if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                        autoFocus
                        className="flex-1 py-1 px-2.5 rounded-lg bg-bg-secondary border border-primary text-sm font-serif text-text-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineGroupName(grp.id)}
                        className="p-1.5 rounded-lg bg-brand-olive text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGroupId(null)}
                        className="p-1.5 rounded-lg bg-bg-secondary text-text-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingGroupId(grp.id);
                        setGroupNameDraft(grp.name);
                      }}
                      className="flex items-center gap-1.5 group/gname"
                    >
                      <h4 className="font-serif text-lg font-normal text-text-primary hover:text-text-accent">
                        {grp.name}
                      </h4>
                      <Pencil className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    </div>
                  )}
                  <p className="text-xs text-text-muted">{grp.guests.length} personas en el grupo</p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${
                    grp.invitation_status === 'responded'
                      ? 'bg-brand-olive/15 text-brand-olive'
                      : grp.invitation_status === 'opened'
                      ? 'bg-blue-100 text-blue-800'
                      : grp.invitation_status === 'sent'
                      ? 'bg-amber-100 text-amber-800'
                      : grp.invitation_status === 'revoked'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {INVITATION_STATUS_LABELS[grp.invitation_status] || grp.invitation_status}
                </span>
              </div>

              {/* Mobile Guests Inline List with Adult/Child Toggle & Name Edit */}
              <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                {grp.guests.map((g) => {
                  const isChild = Boolean(g.is_child || g.guest_type === 'child');
                  const isEditingThisGuest = editingGuestId === g.id;
                  return (
                    <div
                      key={g.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        isChild ? 'bg-amber-50/50 border-amber-200' : 'bg-bg-secondary/30 border-border-subtle/60'
                      }`}
                    >
                      {isEditingThisGuest ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={guestFirstDraft}
                            onChange={(e) => setGuestFirstDraft(e.target.value)}
                            placeholder="Nombre"
                            autoFocus
                            className="w-1/2 py-1 px-2 rounded-lg bg-bg-card border border-primary text-xs"
                          />
                          <input
                            type="text"
                            value={guestLastDraft}
                            onChange={(e) => setGuestLastDraft(e.target.value)}
                            placeholder="Apellidos"
                            className="w-1/2 py-1 px-2 rounded-lg bg-bg-card border border-border-strong text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveInlineGuestName(g.id)}
                            className="p-1.5 rounded-lg bg-brand-olive text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGuestId(null)}
                            className="p-1.5 rounded-lg bg-bg-secondary text-text-muted"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGuestId(g.id);
                              setGuestFirstDraft(g.first_name);
                              setGuestLastDraft(g.last_name || '');
                            }}
                            className="flex items-center gap-1.5 text-left text-text-primary font-medium hover:text-text-accent"
                          >
                            <span>
                              {g.first_name} {g.last_name}
                            </span>
                            <Pencil className="w-3 h-3 text-text-muted" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggleChild(g.id, isChild)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                              isChild
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-bg-card text-text-secondary border border-border-subtle'
                            }`}
                          >
                            {isChild ? (
                              <>
                                <Baby className="w-3 h-3" />
                                <span>Niño</span>
                              </>
                            ) : (
                              <span>Adulto</span>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick manual RSVP trigger button for non-tech guests on mobile */}
              <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModalGroup(grp);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Confirmar RSVP</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`/i/${grp.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="py-1.5 px-2.5 rounded-xl border border-border-subtle text-xs font-medium text-text-primary flex items-center gap-1 hover:bg-bg-secondary"
                    title="Ver experiencia como este invitado"
                  >
                    <Eye className="w-3.5 h-3.5 text-text-accent" />
                    <span>Ver invitado</span>
                  </a>

                  <button
                    onClick={() => setSelectedDrawerGroup(grp)}
                    className="text-xs font-medium text-text-accent flex items-center gap-1 py-1.5 px-2"
                  >
                    Detalles →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: ELEGANT CRM TABLE WITH INLINE EDITING & 1-CLICK CHILD TOGGLE */}
      {filteredGroups.length > 0 && (
        <div className="hidden md:block rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/40 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
                <tr>
                  <th className="p-4">Grupo / Familia (Clic para editar)</th>
                  <th className="p-4">Personas &amp; Selector Adulto / Niño</th>
                  <th className="p-4">Preboda &amp; Eventos</th>
                  <th className="p-4">Estado Invitación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredGroups.map((grp) => {
                  const isEditingThisGroup = editingGroupId === grp.id;
                  const hasPreboda = grp.allowed_event_ids.includes('evt-preboda-cata');
                  return (
                    <tr
                      key={grp.id}
                      className="hover:bg-bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedDrawerGroup(grp)}
                    >
                      {/* Group Name (Inline Editable) */}
                      <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                        {isEditingThisGroup ? (
                          <div className="flex items-center gap-1.5 max-w-xs">
                            <input
                              type="text"
                              value={groupNameDraft}
                              onChange={(e) => setGroupNameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInlineGroupName(grp.id);
                                if (e.key === 'Escape') setEditingGroupId(null);
                              }}
                              autoFocus
                              className="w-full py-1.5 px-2.5 rounded-xl bg-bg-secondary border border-primary text-sm font-serif text-text-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInlineGroupName(grp.id)}
                              className="p-1.5 rounded-lg bg-brand-olive text-white hover:bg-brand-olive/90 cursor-pointer shrink-0"
                              title="Guardar nombre de familia"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGroupId(null)}
                              className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-text-primary cursor-pointer shrink-0"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingGroupId(grp.id);
                              setGroupNameDraft(grp.name);
                            }}
                            className="group/gname inline-flex items-center gap-2 cursor-pointer"
                            title="Haz clic para cambiar el nombre de la familia"
                          >
                            <span className="font-serif text-base font-normal text-text-primary group-hover/gname:text-text-accent transition-colors">
                              {grp.name}
                            </span>
                            <span className="p-1 rounded-md text-text-muted/60 group-hover/gname:text-text-primary group-hover/gname:bg-bg-secondary transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                        <span className="text-[11px] text-text-muted block mt-0.5">
                          {grp.guests.length} {grp.guests.length === 1 ? 'persona' : 'personas'}
                        </span>
                      </td>

                      {/* Guests List (Inline Editable + 1-Click Adulto / Niño Toggle) */}
                      <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1.5">
                          {grp.guests.map((g) => {
                            const isChild = Boolean(g.is_child || g.guest_type === 'child');
                            const isEditingThisGuest = editingGuestId === g.id;
                            return (
                              <div
                                key={g.id}
                                className={`flex items-center justify-between gap-3 py-1 px-2.5 rounded-xl border transition-colors ${
                                  isChild
                                    ? 'bg-amber-50/60 border-amber-200/80'
                                    : 'bg-bg-secondary/25 border-border-subtle/50 hover:border-border-strong/60'
                                }`}
                              >
                                {isEditingThisGuest ? (
                                  <div className="flex items-center gap-1.5 flex-1">
                                    <input
                                      type="text"
                                      value={guestFirstDraft}
                                      onChange={(e) => setGuestFirstDraft(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveInlineGuestName(g.id);
                                        if (e.key === 'Escape') setEditingGuestId(null);
                                      }}
                                      placeholder="Nombre"
                                      autoFocus
                                      className="w-28 sm:w-32 py-1 px-2 rounded-lg bg-bg-card border border-primary text-xs text-text-primary focus:outline-none"
                                    />
                                    <input
                                      type="text"
                                      value={guestLastDraft}
                                      onChange={(e) => setGuestLastDraft(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveInlineGuestName(g.id);
                                        if (e.key === 'Escape') setEditingGuestId(null);
                                      }}
                                      placeholder="Apellidos"
                                      className="w-32 sm:w-36 py-1 px-2 rounded-lg bg-bg-card border border-border-strong text-xs text-text-primary focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineGuestName(g.id)}
                                      className="p-1 rounded-lg bg-brand-olive text-white hover:bg-brand-olive/90 cursor-pointer"
                                      title="Guardar nombre"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingGuestId(null)}
                                      className="p-1 rounded-lg bg-bg-secondary text-text-muted hover:text-text-primary cursor-pointer"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingGuestId(g.id);
                                        setGuestFirstDraft(g.first_name);
                                        setGuestLastDraft(g.last_name || '');
                                      }}
                                      className="group/guest flex items-center gap-1.5 text-left text-text-primary hover:text-text-accent font-medium cursor-pointer"
                                      title="Haz clic para cambiar nombre o apellidos"
                                    >
                                      <span>
                                        {g.first_name} {g.last_name}
                                      </span>
                                      <Pencil className="w-3 h-3 text-text-muted/50 group-hover/guest:text-text-primary transition-colors" />
                                    </button>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleQuickToggleChild(g.id, isChild)}
                                        title={
                                          isChild
                                            ? 'Es Niño (menú infantil). Haz clic para cambiar a Adulto'
                                            : 'Es Adulto. Haz clic para marcar como Niño'
                                        }
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                          isChild
                                            ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                                            : 'bg-bg-card text-text-muted hover:text-text-primary border border-border-subtle hover:border-amber-400'
                                        }`}
                                      >
                                        <Baby className="w-3 h-3" />
                                        <span>{isChild ? 'Niño' : 'Adulto'}</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Preboda & Events Quick Toggle */}
                      <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePreboda(grp.id, hasPreboda)}
                          title="Haz clic para activar o quitar la invitación a la Preboda"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer border ${
                            hasPreboda
                              ? 'bg-brand-olive/15 text-brand-olive border-brand-olive/30 hover:bg-brand-olive/25'
                              : 'bg-bg-secondary/60 text-text-muted border-border-subtle hover:text-text-primary'
                          }`}
                        >
                          <Wine className="w-3.5 h-3.5" />
                          <span>{hasPreboda ? 'Con Preboda (4 ev.)' : 'Solo Sábado (3 ev.)'}</span>
                        </button>
                      </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize inline-flex items-center gap-1.5 ${
                          grp.invitation_status === 'responded'
                            ? 'bg-brand-olive/15 text-brand-olive'
                            : grp.invitation_status === 'opened'
                            ? 'bg-blue-100 text-blue-800'
                            : grp.invitation_status === 'sent'
                            ? 'bg-amber-100 text-amber-800'
                            : grp.invitation_status === 'revoked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {INVITATION_STATUS_LABELS[grp.invitation_status] || grp.invitation_status}
                      </span>
                    </td>

                    {/* Actions Toolbar */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Manual RSVP button */}
                        <button
                          onClick={() => setSelectedModalGroup(grp)}
                          title="Confirmar asistencia telefónica o manual"
                          className="py-1.5 px-2.5 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Confirmar RSVP</span>
                        </button>

                        {/* Copy Link Button */}
                        <button
                          onClick={() => handleCopyLink(grp.token)}
                          title="Copiar enlace directo de invitación"
                          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                        >
                          {copiedToken === grp.token ? (
                            <Check className="w-4 h-4 text-brand-olive" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* WhatsApp Direct */}
                        <button
                          onClick={() => handleOpenWhatsApp(grp)}
                          title="Compartir por WhatsApp"
                          className="p-2 rounded-xl text-brand-olive hover:bg-bg-secondary transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Direct Ver como invitado link */}
                        <a
                          href={`/i/${grp.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Abrir experiencia de ${grp.name} como invitado en nueva pestaña`}
                          className="py-1.5 px-2.5 rounded-xl border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-secondary transition-colors flex items-center gap-1 font-medium text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5 text-text-accent" />
                          <span className="hidden xl:inline">Ver como invitado</span>
                        </a>

                        <button
                          onClick={() => setSelectedDrawerGroup(grp)}
                          title="Ver ficha completa y opciones de invitación"
                          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer text-xs"
                        >
                          <span>Detalles →</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      <AddGuestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGroupCreated={(newGrp) => {
          showToast(`Invitación para ${newGrp.name} creada correctamente`);
        }}
        createGroupAction={createGroup}
      />

      {/* Manual RSVP Modal for offline / non-tech guests */}
      <ManualRSVPModal
        group={selectedModalGroup}
        isOpen={!!selectedModalGroup}
        onClose={() => setSelectedModalGroup(null)}
        onSaved={refresh}
      />

      {/* Invitation Drawer Component */}
      <GuestDrawer
        group={selectedDrawerGroup}
        wedding={INITIAL_WEDDING}
        events={INITIAL_EVENTS}
        onClose={() => setSelectedDrawerGroup(null)}
        onUpdateGroup={() => refresh()}
        onUpdateGuestType={updateGuestType}
        onDeleteGroup={async (groupId) => {
          await deleteGroup(groupId);
          showToast('Invitación eliminada correctamente');
        }}
      />
    </div>
  );
}
