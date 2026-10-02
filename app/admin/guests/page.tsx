'use client';

import React, { useState } from 'react';
import { INITIAL_WEDDING, INITIAL_GROUPS, INITIAL_EVENTS } from '@/lib/mock-data';
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
  PhoneCall
} from 'lucide-react';
import { GuestDrawer } from '@/components/admin/GuestDrawer';
import { ManualRSVPModal } from '@/components/admin/ManualRSVPModal';
import { useWeddingData } from '@/lib/guest-store';
import { buildWhatsAppLink } from '@/lib/utils';

export default function AdminGuestsPage() {
  const { groups, stats, refresh } = useWeddingData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDrawerGroup, setSelectedDrawerGroup] = useState<GuestGroup | null>(null);
  const [selectedModalGroup, setSelectedModalGroup] = useState<GuestGroup | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Gestión de Invitados
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Invitados & Grupos
          </h1>
          <p className="text-xs text-text-muted">
            Gestiona familias, estados de confirmación, visibilidad de eventos y enlaces.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Formulario de alta de nuevo grupo o invitado')}
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
            placeholder="Buscar por nombre o familia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Estado:
          </span>
          {['all', 'draft', 'sent', 'opened', 'responded', 'revoked'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                selectedStatusFilter === st
                  ? 'bg-primary text-primary-text font-semibold shadow-xs'
                  : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {INVITATION_STATUS_LABELS[st as keyof typeof INVITATION_STATUS_LABELS] || st}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW: CARDS */}
      <div className="md:hidden space-y-3">
        {filteredGroups.map((grp) => (
          <div
            key={grp.id}
            className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-3 hover:border-border-strong transition-all"
          >
            <div
              className="flex justify-between items-start cursor-pointer"
              onClick={() => setSelectedDrawerGroup(grp)}
            >
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
            <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModalGroup(grp);
                }}
                className="py-1.5 px-3 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirmar / RSVP</span>
              </button>

              <button
                onClick={() => setSelectedDrawerGroup(grp)}
                className="text-xs font-medium text-text-accent flex items-center gap-1 py-1.5 px-2"
              >
                Detalles →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: ELEGANT CRM TABLE (NO RAW TOKENS) */}
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
                  {/* Group Name (NO RAW TOKENS IN MAIN UI) */}
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

                  {/* Invitation Status Badge */}
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize inline-block ${
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

                  {/* Actions */}
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {/* Manual RSVP Trigger Button */}
                      <button
                        onClick={() => setSelectedModalGroup(grp)}
                        title="Registrar / Modificar confirmación de asistencia (RSVP manual/teléfono)"
                        className="p-2 rounded-xl bg-brand-olive/10 hover:bg-brand-olive/20 text-brand-olive transition-colors cursor-pointer flex items-center gap-1 font-medium text-[11px]"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="hidden xl:inline">Confirmar RSVP</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(grp.token)}
                        title="Copiar enlace de invitación"
                        className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
                      >
                        {copiedToken === grp.token ? (
                          <Check className="w-4 h-4 text-brand-olive" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenWhatsApp(grp)}
                        title="Abrir WhatsApp con mensaje personalizado"
                        className="p-2 rounded-xl text-brand-olive hover:bg-bg-secondary transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedDrawerGroup(grp)}
                        title="Ver detalle de invitación"
                        className="p-2 rounded-xl text-text-accent hover:bg-bg-secondary transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
      />
    </div>
  );
}
