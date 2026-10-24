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
  Heart,
  Trash2,
} from 'lucide-react';
import { GuestDrawer } from '@/components/admin/GuestDrawer';
import { ManualRSVPModal } from '@/components/admin/ManualRSVPModal';
import { AddGuestModal } from '@/components/admin/AddGuestModal';
import { useWeddingData } from '@/lib/guest-store';
import { buildWhatsAppLink } from '@/lib/utils';

export default function AdminGuestsPage() {
  const {
    groups,
    allResponses,
    stats,
    refresh,
    refreshSupabase,
    updateGuestType,
    updateGroupName,
    updateGuestDetails,
    addGuestToGroup,
    removeGuestFromGroup,
    setGroupStageEvents,
    setSingleGuestAttendance,
    createGroup,
    deleteGroup,
    syncLocalGuestsToSupabase,
    isLoadingSupabase,
    isSyncing,
    isSupabaseOnline,
  } = useWeddingData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDrawerGroupId, setSelectedDrawerGroupId] = useState<string | null>(null);
  const [selectedModalGroupId, setSelectedModalGroupId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  // Derive active drawer/modal group from live `groups` state so edits never go stale
  const selectedDrawerGroup = groups.find((g) => g.id === selectedDrawerGroupId) || null;
  const selectedModalGroup = groups.find((g) => g.id === selectedModalGroupId) || null;

  // Inline editing state for Group Name
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameDraft, setGroupNameDraft] = useState('');

  // Inline editing state for Guest Full Name (double-click to edit)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [guestFullNameDraft, setGuestFullNameDraft] = useState('');

  // Inline adding state for adding a new member to an existing family
  const [addingToGroupId, setAddingToGroupId] = useState<string | null>(null);
  const [newGuestFirst, setNewGuestFirst] = useState('');
  const [newGuestLast, setNewGuestLast] = useState('');
  const [newGuestType, setNewGuestType] = useState<'adult' | 'child'>('adult');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveInlineGroupName = async (groupId: string, originalName?: string) => {
    const clean = groupNameDraft.trim();
    setEditingGroupId(null);
    if (!clean || (originalName && clean === originalName.trim())) {
      return;
    }
    await updateGroupName(groupId, clean);
    showToast('✓ Nombre de familia actualizado');
  };

  const handleSaveInlineGuestName = async (guestId: string, originalFull?: string) => {
    const cleanFull = guestFullNameDraft.trim().replace(/\s+/g, ' ');
    setEditingGuestId(null);
    if (!cleanFull || (originalFull && cleanFull === originalFull.trim().replace(/\s+/g, ' '))) {
      return;
    }
    const parts = cleanFull.split(' ');
    const cleanFirst = parts[0] || cleanFull;
    const cleanLast = parts.slice(1).join(' ');
    await updateGuestDetails(guestId, cleanFirst, cleanLast);
    showToast('✓ Nombre de invitado actualizado');
  };

  const handleAddInlineGuestToFamily = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    const cleanFirst = newGuestFirst.trim();
    const cleanLast = newGuestLast.trim();
    if (!cleanFirst) return;
    setAddingToGroupId(null);
    setNewGuestFirst('');
    setNewGuestLast('');
    setNewGuestType('adult');
    await addGuestToGroup(groupId, cleanFirst, cleanLast, newGuestType);
    showToast(`✓ ${cleanFirst} ${cleanLast} añadido a la familia`.trim());
  };

  const handleRemoveInlineGuestFromFamily = async (
    groupId: string,
    guestId: string,
    guestName: string,
    totalInGroup: number
  ) => {
    if (totalInGroup <= 1) {
      alert('La familia debe tener al menos un invitado. Si quieres borrar toda la familia, usa el botón de eliminar familia a la derecha de Detalles.');
      return;
    }
    if (!confirm(`¿Quitar a "${guestName}" de esta familia?`)) return;
    await removeGuestFromGroup(groupId, guestId);
    showToast(`✓ ${guestName} eliminado de la familia`);
  };

  const handleDeleteFamily = async (grp: GuestGroup) => {
    if (!confirm(`¿Eliminar por completo a la familia "${grp.name}" (${grp.guests.length} ${grp.guests.length === 1 ? 'persona' : 'personas'})?`)) {
      return;
    }
    if (selectedDrawerGroupId === grp.id) {
      setSelectedDrawerGroupId(null);
    }
    if (selectedModalGroupId === grp.id) {
      setSelectedModalGroupId(null);
    }
    await deleteGroup(grp.id);
    showToast(`✓ Familia "${grp.name}" eliminada correctamente`);
  };

  const handleQuickToggleChild = (guestId: string, currentlyChild: boolean) => {
    const nextType = currentlyChild ? 'adult' : 'child';
    updateGuestType(guestId, nextType);
    showToast(nextType === 'child' ? 'Marcado como Niño (menú infantil)' : 'Marcado como Adulto');
  };

  const handleQuickToggleStageEvent = async (
    grp: GuestGroup,
    stage: 'preboda' | 'boda' = 'preboda'
  ) => {
    const currentlyPreboda = grp.allowed_event_ids.includes('evt-preboda-cata');
    const nextPreboda = stage === 'preboda' ? !currentlyPreboda : currentlyPreboda;
    // Todos los invitados van a la boda siempre (nextBoda = true)
    await setGroupStageEvents(grp.id, nextPreboda, true);
    showToast(nextPreboda ? '✓ Preboda activada para esta familia' : '✓ Preboda quitada para esta familia');
  };

  const handleQuickToggleAttendance = async (
    groupId: string,
    guestId: string,
    currentStatus?: 'attending' | 'declined' | 'pending'
  ) => {
    const nextStatus = currentStatus === 'attending' ? 'declined' : 'attending';
    await setSingleGuestAttendance(groupId, guestId, nextStatus);
    showToast(
      nextStatus === 'attending'
        ? 'Marcado como Asiste (sumado al banquete)'
        : 'Marcado como No asiste (descontado del banquete)'
    );
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
          const isAddingToThisGroup = addingToGroupId === grp.id;
          const hasPreboda = grp.allowed_event_ids.includes('evt-preboda-cata');

          return (
            <div
              key={grp.id}
              onClick={() => setSelectedDrawerGroupId(grp.id)}
              className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1 min-w-0">
                  {isEditingThisGroup ? (
                    <input
                      type="text"
                      value={groupNameDraft}
                      onChange={(e) => setGroupNameDraft(e.target.value)}
                      onBlur={() => handleSaveInlineGroupName(grp.id, grp.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveInlineGroupName(grp.id, grp.name);
                        if (e.key === 'Escape') setEditingGroupId(null);
                      }}
                      autoFocus
                      className="w-full py-0.5 bg-transparent border-b border-primary text-lg font-serif text-text-primary focus:outline-none"
                    />
                  ) : (
                    <h4
                      onDoubleClick={() => {
                        setEditingGroupId(grp.id);
                        setGroupNameDraft(grp.name);
                      }}
                      title="Doble clic para editar el nombre de la familia"
                      className="font-serif text-lg font-normal text-text-primary hover:text-text-accent cursor-text select-none"
                    >
                      {grp.name}
                    </h4>
                  )}
                  <p className="text-xs text-text-muted mt-0.5">
                    {grp.guests.length} personas · Doble clic en un nombre para editarlo
                  </p>
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

              {/* Mobile Preboda Toggle Centered */}
              <div className="flex items-center justify-center pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleQuickToggleStageEvent(grp, 'preboda')}
                  className={`py-1.5 px-4 rounded-full text-xs font-semibold inline-flex items-center justify-center gap-1.5 border transition-colors ${
                    hasPreboda
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs'
                      : 'bg-bg-secondary/50 text-text-muted border-border-subtle'
                  }`}
                >
                  <Wine className="w-3.5 h-3.5" />
                  <span>{hasPreboda ? '✓ Preboda' : '+ Preboda'}</span>
                </button>
              </div>

              {/* Mobile Guests Inline List with Double-Click Name Edit & Adult/Child Toggle */}
              <div className="space-y-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                {grp.guests.map((g) => {
                  const isChild = Boolean(g.is_child || g.guest_type === 'child');
                  const isEditingThisGuest = editingGuestId === g.id;
                  const fullName = `${g.first_name} ${g.last_name || ''}`.trim();
                  return (
                    <div
                      key={g.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        isChild ? 'bg-amber-50/50 border-amber-200' : 'bg-bg-secondary/30 border-border-subtle/60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        {isEditingThisGuest ? (
                          <input
                            type="text"
                            value={guestFullNameDraft}
                            onChange={(e) => setGuestFullNameDraft(e.target.value)}
                            onBlur={() => handleSaveInlineGuestName(g.id, fullName)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineGuestName(g.id, fullName);
                              if (e.key === 'Escape') setEditingGuestId(null);
                            }}
                            autoFocus
                            className="w-full py-0.5 bg-transparent border-b border-primary text-xs font-medium text-text-primary focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() => {
                              setEditingGuestId(g.id);
                              setGuestFullNameDraft(fullName);
                            }}
                            title="Doble clic para editar nombre"
                            className="block truncate text-left text-text-primary font-medium hover:text-text-accent cursor-text select-none"
                          >
                            {fullName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
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
                        {grp.guests.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveInlineGuestFromFamily(
                                grp.id,
                                g.id,
                                fullName,
                                grp.guests.length
                              )
                            }
                            className="p-1 rounded-lg text-text-muted hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isAddingToThisGroup ? (
                  <form
                    onSubmit={(e) => handleAddInlineGuestToFamily(e, grp.id)}
                    className="p-2.5 rounded-xl bg-brand-olive/10 border border-brand-olive/30 space-y-2 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        required
                        placeholder="Nombre *"
                        value={newGuestFirst}
                        onChange={(e) => setNewGuestFirst(e.target.value)}
                        autoFocus
                        className="py-1.5 px-2 rounded-lg bg-bg-card border border-border-subtle text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Apellidos"
                        value={newGuestLast}
                        onChange={(e) => setNewGuestLast(e.target.value)}
                        className="py-1.5 px-2 rounded-lg bg-bg-card border border-border-subtle text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex rounded-lg bg-bg-card p-0.5 border border-border-subtle">
                        <button
                          type="button"
                          onClick={() => setNewGuestType('adult')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            newGuestType === 'adult' ? 'bg-primary text-primary-text' : 'text-text-secondary'
                          }`}
                        >
                          Adulto
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewGuestType('child')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            newGuestType === 'child' ? 'bg-amber-500 text-white' : 'text-text-secondary'
                          }`}
                        >
                          Niño
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAddingToGroupId(null)}
                          className="px-2 py-1 rounded-lg text-[10px] text-text-muted"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded-lg bg-brand-olive text-white text-[10px] font-semibold"
                        >
                          + Añadir
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToGroupId(grp.id);
                      setNewGuestFirst('');
                      setNewGuestLast('');
                      setNewGuestType('adult');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-xl border border-dashed border-brand-olive/40 text-brand-olive hover:bg-brand-olive/10 text-[11px] font-medium flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir persona a esta familia</span>
                  </button>
                )}
              </div>

              {/* Quick manual RSVP trigger button for non-tech guests on mobile */}
              <div className="pt-2 border-t border-border-subtle/50 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModalGroupId(grp.id);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Asistencia / Menús</span>
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
                    onClick={() => setSelectedDrawerGroupId(grp.id)}
                    className="text-xs font-medium text-text-accent flex items-center gap-1 py-1.5 px-2"
                  >
                    Detalles →
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFamily(grp);
                    }}
                    title={`Eliminar familia ${grp.name}`}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: ELEGANT CRM TABLE WITH DOUBLE-CLICK INLINE EDITING */}
      {filteredGroups.length > 0 && (
        <div className="hidden md:block rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/40 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
                <tr>
                  <th className="py-3.5 pl-5 pr-3">Nombre de la Familia</th>
                  <th className="py-3.5 px-3">Invitados (Doble clic para editar nombre)</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Preboda</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Estado Invitación</th>
                  <th className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredGroups.map((grp) => {
                  const isEditingThisGroup = editingGroupId === grp.id;
                  const isAddingToThisGroup = addingToGroupId === grp.id;
                  const hasPreboda = grp.allowed_event_ids.includes('evt-preboda-cata');

                  return (
                    <tr
                      key={grp.id}
                      className="hover:bg-bg-secondary/20 transition-colors"
                    >
                      {/* Group Name (Double-Click Inline Editable - No Button / No Box) */}
                      <td className="py-3.5 pl-5 pr-3 align-middle max-w-[220px]" onClick={(e) => e.stopPropagation()}>
                        {isEditingThisGroup ? (
                          <input
                            type="text"
                            value={groupNameDraft}
                            onChange={(e) => setGroupNameDraft(e.target.value)}
                            onBlur={() => handleSaveInlineGroupName(grp.id, grp.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveInlineGroupName(grp.id, grp.name);
                              if (e.key === 'Escape') setEditingGroupId(null);
                            }}
                            autoFocus
                            className="w-full py-0.5 bg-transparent border-b border-primary text-base font-serif text-text-primary focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() => {
                              setEditingGroupId(grp.id);
                              setGroupNameDraft(grp.name);
                            }}
                            title="Doble clic para editar el nombre de la familia"
                            className="font-serif text-base font-normal text-text-primary hover:text-text-accent transition-colors block cursor-text select-none leading-snug"
                          >
                            {grp.name}
                          </span>
                        )}
                        <span className="text-[11px] text-text-muted block mt-1">
                          {grp.guests.length} {grp.guests.length === 1 ? 'persona' : 'personas'}
                        </span>
                      </td>

                      {/* Guests List (Double-Click Name Edit + Add Person + 1-Click Adulto / Niño Toggle) */}
                      <td className="py-3.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1.5">
                          {grp.guests.map((g) => {
                            const isChild = Boolean(g.is_child || g.guest_type === 'child');
                            const isEditingThisGuest = editingGuestId === g.id;
                            const guestResp = allResponses.find((r) => r.guest_id === g.id);
                            const rsvpStatus = guestResp?.status;
                            const fullName = `${g.first_name} ${g.last_name || ''}`.trim();
                            return (
                              <div
                                key={g.id}
                                className={`flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl border transition-colors ${
                                  isChild
                                    ? 'bg-amber-50/60 border-amber-200/80'
                                    : 'bg-bg-secondary/25 border-border-subtle/50 hover:border-border-strong/60'
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  {isEditingThisGuest ? (
                                    <input
                                      type="text"
                                      value={guestFullNameDraft}
                                      onChange={(e) => setGuestFullNameDraft(e.target.value)}
                                      onBlur={() => handleSaveInlineGuestName(g.id, fullName)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveInlineGuestName(g.id, fullName);
                                        if (e.key === 'Escape') setEditingGuestId(null);
                                      }}
                                      autoFocus
                                      className="w-full py-0.5 bg-transparent border-b border-primary text-xs font-medium text-text-primary focus:outline-none"
                                    />
                                  ) : (
                                    <span
                                      onDoubleClick={() => {
                                        setEditingGuestId(g.id);
                                        setGuestFullNameDraft(fullName);
                                      }}
                                      title="Doble clic para editar nombre y apellidos"
                                      className="block truncate text-left text-text-primary hover:text-text-accent font-medium cursor-text select-none"
                                    >
                                      {fullName}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickToggleAttendance(grp.id, g.id, rsvpStatus)}
                                    title={
                                      rsvpStatus === 'declined'
                                        ? 'Marcado como No asiste (no cuenta en banquete). Clic para marcar que Asiste'
                                        : rsvpStatus === 'attending'
                                        ? 'Confirmado que Asiste. Clic para marcar como No asiste (baja)'
                                        : 'Clic para confirmar asistencia o marcar baja'
                                    }
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer border whitespace-nowrap ${
                                      rsvpStatus === 'declined'
                                        ? 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200'
                                        : rsvpStatus === 'attending'
                                        ? 'bg-brand-olive text-white border-brand-olive shadow-xs'
                                        : 'bg-bg-card text-text-muted border-border-subtle hover:border-brand-olive hover:text-brand-olive'
                                    }`}
                                  >
                                    <span>
                                      {rsvpStatus === 'declined'
                                        ? '✕ Baja'
                                        : rsvpStatus === 'attending'
                                        ? '✓ Asiste'
                                        : 'Asiste'}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickToggleChild(g.id, isChild)}
                                    title={
                                      isChild
                                        ? 'Es Niño (menú infantil). Haz clic para cambiar a Adulto'
                                        : 'Es Adulto. Haz clic para marcar como Niño'
                                    }
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                                      isChild
                                        ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
                                        : 'bg-bg-card text-text-muted hover:text-text-primary border border-border-subtle hover:border-amber-400'
                                    }`}
                                  >
                                    <Baby className="w-3 h-3" />
                                    <span>{isChild ? 'Niño' : 'Adulto'}</span>
                                  </button>
                                  {grp.guests.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveInlineGuestFromFamily(
                                          grp.id,
                                          g.id,
                                          fullName,
                                          grp.guests.length
                                        )
                                      }
                                      title="Quitar a esta persona de la familia"
                                      className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Inline Add Guest to Family Row */}
                          {isAddingToThisGroup ? (
                            <form
                              onSubmit={(e) => handleAddInlineGuestToFamily(e, grp.id)}
                              className="p-2 rounded-xl bg-brand-olive/10 border border-brand-olive/30 flex flex-wrap items-center gap-1.5 text-xs animate-fade-in"
                            >
                              <input
                                type="text"
                                required
                                placeholder="Nombre *"
                                value={newGuestFirst}
                                onChange={(e) => setNewGuestFirst(e.target.value)}
                                autoFocus
                                className="w-24 py-1 px-2 rounded-lg bg-bg-card border border-primary text-xs text-text-primary focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="Apellidos"
                                value={newGuestLast}
                                onChange={(e) => setNewGuestLast(e.target.value)}
                                className="w-28 py-1 px-2 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none"
                              />
                              <div className="inline-flex rounded-lg bg-bg-card p-0.5 border border-border-subtle">
                                <button
                                  type="button"
                                  onClick={() => setNewGuestType('adult')}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium cursor-pointer ${
                                    newGuestType === 'adult'
                                      ? 'bg-primary text-primary-text'
                                      : 'text-text-secondary'
                                  }`}
                                >
                                  Adulto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewGuestType('child')}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-medium cursor-pointer ${
                                    newGuestType === 'child'
                                      ? 'bg-amber-500 text-white'
                                      : 'text-text-secondary'
                                  }`}
                                >
                                  Niño
                                </button>
                              </div>
                              <button
                                type="submit"
                                className="py-1 px-2.5 rounded-lg bg-brand-olive text-white text-[11px] font-semibold hover:bg-brand-olive/90 cursor-pointer"
                              >
                                Añadir
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddingToGroupId(null)}
                                className="py-1 px-2 rounded-lg text-[11px] text-text-muted hover:text-text-primary cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </form>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setAddingToGroupId(grp.id);
                                setNewGuestFirst('');
                                setNewGuestLast('');
                                setNewGuestType('adult');
                              }}
                              className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg border border-dashed border-brand-olive/40 text-brand-olive hover:bg-brand-olive/10 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Añadir invitado a esta familia</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Preboda ONLY (Centered like Estado Invitación) */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleQuickToggleStageEvent(grp, 'preboda')}
                          title="Haz clic para poner o quitar la invitación a la Preboda"
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
                            hasPreboda
                              ? 'bg-brand-olive text-white border-brand-olive shadow-xs hover:bg-brand-olive/90'
                              : 'bg-bg-secondary/50 text-text-muted border-border-subtle hover:border-brand-olive hover:text-text-primary'
                          }`}
                        >
                          <Wine className="w-3 h-3" />
                          <span>{hasPreboda ? '✓ Preboda' : '+ Preboda'}</span>
                        </button>
                      </td>

                      {/* Status Badge (Centered) */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
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

                      {/* Actions Toolbar (Compact, Single-Line, Fits 100% Inside Card) */}
                      <td className="py-3.5 pl-3 pr-5 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {/* Quick Manual RSVP button */}
                          <button
                            type="button"
                            onClick={() => setSelectedModalGroupId(grp.id)}
                            title="Registrar asistencia, tipo de menú o alergias del grupo"
                            className="py-1.5 px-2.5 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Menús</span>
                          </button>

                          {/* Copy Link Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyLink(grp.token)}
                            title="Copiar enlace directo de invitación"
                            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                          >
                            {copiedToken === grp.token ? (
                              <Check className="w-3.5 h-3.5 text-brand-olive" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* WhatsApp Direct */}
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(grp)}
                            title="Compartir por WhatsApp"
                            className="p-1.5 rounded-lg text-brand-olive hover:bg-bg-secondary transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Direct Ver como invitado link */}
                          <a
                            href={`/i/${grp.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Abrir invitación de ${grp.name} en nueva pestaña`}
                            className="p-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-secondary transition-colors inline-flex items-center justify-center"
                          >
                            <Eye className="w-3.5 h-3.5 text-text-accent" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedDrawerGroupId(grp.id)}
                            title="Ver detalles de la familia y configurar invitación"
                            className="py-1.5 px-2.5 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary transition-colors cursor-pointer text-[11px] font-medium whitespace-nowrap"
                          >
                            <span>Detalles</span>
                          </button>

                          {/* Delete entire family button to the right of Detalles */}
                          <button
                            type="button"
                            onClick={() => handleDeleteFamily(grp)}
                            title={`Eliminar toda la familia ${grp.name}`}
                            className="p-1.5 rounded-xl border border-rose-200/80 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer inline-flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        onClose={() => setSelectedModalGroupId(null)}
        onSaved={refresh}
      />

      {/* Invitation Drawer Component */}
      <GuestDrawer
        group={selectedDrawerGroup}
        wedding={INITIAL_WEDDING}
        events={INITIAL_EVENTS}
        onClose={() => setSelectedDrawerGroupId(null)}
        onUpdateGroup={() => refresh()}
        onUpdateGuestType={updateGuestType}
        onDeleteGroup={async (groupId) => {
          await deleteGroup(groupId);
          setSelectedDrawerGroupId(null);
          showToast('Invitación eliminada correctamente');
        }}
      />
    </div>
  );
}
