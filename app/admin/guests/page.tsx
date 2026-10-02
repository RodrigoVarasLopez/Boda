'use client';

import React, { useState } from 'react';
import { INITIAL_WEDDING, INITIAL_GROUPS, INITIAL_EVENTS, INITIAL_RSVPS } from '@/lib/mock-data';
import { GuestGroup, Guest, InvitationStatus, RSVPStatus } from '@/lib/types';
import {
  Users,
  Search,
  Filter,
  Copy,
  MessageCircle,
  Eye,
  Check,
  Plus,
  RefreshCw,
  MoreVertical,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { GuestDrawer } from '@/components/admin/GuestDrawer';
import { buildWhatsAppLink } from '@/lib/utils';

export default function AdminGuestsPage() {
  const [groups, setGroups] = useState<GuestGroup[]>(INITIAL_GROUPS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDrawerGroup, setSelectedDrawerGroup] = useState<GuestGroup | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Flatten guests for table view or render grouped
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-accent block">
            Gestión de Invitados & CRM
          </span>
          <h1 className="font-serif text-3xl font-bold text-text-primary">
            Invitados e Invitaciones
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => alert('Función para añadir grupo/invitado nuevo')}
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Invitado / Grupo</span>
          </button>
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
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-secondary/50 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
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
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Groups Table */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary/60 text-text-muted uppercase text-[10px] tracking-wider font-semibold border-b border-border-subtle">
              <tr>
                <th className="p-4">Grupo / Familia</th>
                <th className="p-4">Invitados</th>
                <th className="p-4">Estado Invitación</th>
                <th className="p-4">Eventos Visibles</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/60">
              {filteredGroups.map((grp) => {
                const groupRSVP = INITIAL_RSVPS.find((r) => r.group_id === grp.id);

                return (
                  <tr
                    key={grp.id}
                    className="hover:bg-bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedDrawerGroup(grp)}
                  >
                    {/* Group Name & Token */}
                    <td className="p-4">
                      <span className="font-semibold text-text-primary block text-sm">
                        {grp.name}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        Token: {grp.token}
                      </span>
                    </td>

                    {/* Guests List */}
                    <td className="p-4">
                      <div className="space-y-1">
                        {grp.guests.map((g) => (
                          <div key={g.id} className="flex items-center gap-1.5 text-text-secondary">
                            <span>{g.first_name} {g.last_name}</span>
                            {g.is_plus_one_allowed && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-bg-secondary text-text-accent border border-border-subtle">
                                +1
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Invitation Status Badge */}
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize inline-block ${
                          grp.invitation_status === 'responded'
                            ? 'bg-emerald-100 text-emerald-800'
                            : grp.invitation_status === 'opened'
                            ? 'bg-blue-100 text-blue-800'
                            : grp.invitation_status === 'sent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {grp.invitation_status}
                      </span>
                    </td>

                    {/* Visible Events Count */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary text-text-secondary font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-text-accent" />
                        {grp.allowed_event_ids.length} eventos
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleCopyLink(grp.token)}
                          title="Copiar enlace de invitación"
                          className="p-2 rounded-xl text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {copiedToken === grp.token ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenWhatsApp(grp)}
                          title="Abrir mensaje de WhatsApp"
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedDrawerGroup(grp)}
                          title="Ver detalle y drawer"
                          className="p-2 rounded-xl text-text-accent hover:bg-bg-secondary transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
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
