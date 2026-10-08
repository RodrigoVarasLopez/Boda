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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
      selectedStatusFilter === 'all' || grp.invitation_status === selectedStatusFilter;

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
            { id: 'draft', label: 'Borrador' },
            { id: 'sent', label: 'Enviada' },
            { id: 'opened', label: 'Abierta' },
            { id: 'responded', label: 'Respondida' },
            { id: 'revoked', label: 'Revocada' },
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
        {filteredGroups.map((grp) => (
          <div
            key={grp.id}
            onClick={() => setSelectedDrawerGroup(grp)}
            className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-serif text-lg font-normal text-text-primary">{grp.name}</h4>
                <p className="text-xs text-text-muted">{grp.guests.length} personas en el grupo</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
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
        ))}
      </div>

      {/* DESKTOP VIEW: ELEGANT CRM TABLE (NO RAW TOKENS) */}
      {filteredGroups.length > 0 && (
        <div className="hidden md:block rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-secondary/40 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
                <tr>
                  <th className="p-4">Grupo / Familia</th>
                  <th className="p-4">Invitados</th>
                  <th className="p-4">Eventos Visibles</th>
                  <th className="p-4">Estado Invitación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredGroups.map((grp) => (
                  <tr
                    key={grp.id}
                    className="hover:bg-bg-secondary/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedDrawerGroup(grp)}
                  >
                    {/* Group Name */}
                    <td className="p-4">
                      <span className="font-serif text-base font-normal text-text-primary block">
                        {grp.name}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        {grp.guests.length} personas
                      </span>
                    </td>

                    {/* Guests List */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {grp.guests.map((g) => (
                          <div key={g.id} className="flex items-center gap-1.5 text-text-secondary">
                            <span>{g.first_name} {g.last_name}</span>
                            {g.is_child && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-brand-sand/40 text-brand-dark border border-border-subtle">
                                Niño
                              </span>
                            )}
                            {g.is_plus_one_allowed && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-bg-secondary text-brand-terracotta border border-border-subtle">
                                +1
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Visible Events Count */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary/60 text-text-secondary text-[11px]">
                        <Calendar className="w-3 h-3 text-text-accent" />
                        {grp.allowed_event_ids.length} eventos
                      </span>
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
                ))}
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
