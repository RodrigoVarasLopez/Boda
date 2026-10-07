'use client';

import React, { useState, useMemo } from 'react';
import { useMediaStore } from '@/lib/media-store';
import { GuestBookEntryStatus } from '@/lib/types';
import {
  approveGuestbookAction,
  hideGuestbookAction,
  deleteGuestbookAction,
} from '@/app/actions';
import {
  BookOpen,
  Check,
  EyeOff,
  Trash2,
  Heart,
  Search,
  Filter,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export default function AdminGuestbookPage() {
  const {
    guestbook,
    approveGuestbookEntry,
    hideGuestbookEntry,
    deleteGuestbookEntry,
  } = useMediaStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GuestBookEntryStatus>('all');

  const filteredEntries = useMemo(() => {
    return guestbook.filter((e) => {
      const matchesSearch =
        e.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || (e.status || 'approved') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [guestbook, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: guestbook.length,
      pending: guestbook.filter((e) => e.status === 'pending').length,
      approved: guestbook.filter((e) => !e.status || e.status === 'approved').length,
      hidden: guestbook.filter((e) => e.status === 'hidden').length,
    };
  }, [guestbook]);

  const handleApprove = async (id: string) => {
    approveGuestbookEntry(id);
    await approveGuestbookAction(id);
  };

  const handleHide = async (id: string) => {
    hideGuestbookEntry(id);
    await hideGuestbookAction(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar definitivamente este mensaje del libro de firmas?')) {
      deleteGuestbookEntry(id);
      await deleteGuestbookAction(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Moderación de Firmas
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Libro de Firmas
          </h1>
          <p className="text-xs text-text-muted">
            Supervisa, aprueba y modera los mensajes y dedicatorias de los invitados para Stephanie &amp; Rodrigo.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Estado:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-primary text-primary-text font-semibold shadow-xs'
                : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] opacity-80">({counts.all})</span>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pendientes</span>
            <span className="text-[10px] font-bold">({counts.pending})</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Aprobados</span>
            <span className="text-[10px] opacity-80">({counts.approved})</span>
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'hidden'
                ? 'bg-zinc-700 text-white font-semibold shadow-xs'
                : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <span>Ocultos</span>
            <span className="text-[10px] opacity-80">({counts.hidden})</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 rounded-3xl bg-bg-card border border-border-subtle text-center text-xs text-text-muted space-y-2">
            <MessageSquare className="w-6 h-6 text-text-muted mx-auto" />
            <p>No hay mensajes que coincidan con el filtro seleccionado.</p>
          </div>
        ) : (
          filteredEntries.map((item) => {
            const isApproved = item.status === 'approved' || !item.status;
            const isPending = item.status === 'pending';
            const isHidden = item.status === 'hidden';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-4 hover:border-text-accent/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center text-xs font-serif font-bold text-text-accent">
                      {item.guest_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-text-primary flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-brand-terracotta fill-brand-terracotta/20" />
                        {item.guest_name}
                      </h4>
                      <span className="text-[10px] text-text-muted font-mono">
                        {new Date(item.created_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Visible en la web
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        Pendiente de moderación
                      </span>
                    )}
                    {isHidden && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                        Oculto
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-bg-secondary/30 border border-border-subtle/50 font-serif italic text-xs sm:text-sm text-text-primary leading-relaxed">
                  &ldquo;{item.message}&rdquo;
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {!isApproved && (
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-soft"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar mensaje</span>
                    </button>
                  )}

                  {!isHidden && (
                    <button
                      onClick={() => handleHide(item.id)}
                      className="py-1.5 px-3 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-text-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-xl text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
