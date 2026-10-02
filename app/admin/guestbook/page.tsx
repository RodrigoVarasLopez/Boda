'use client';

import React, { useState } from 'react';
import { INITIAL_GUESTBOOK } from '@/lib/mock-data';
import { GuestBookEntry } from '@/lib/types';
import { BookOpen, Check, EyeOff, Trash2, Heart, Search, Filter } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';

export default function AdminGuestbookPage() {
  const [entries, setEntries] = useState<GuestBookEntry[]>(INITIAL_GUESTBOOK);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (e.status || 'approved') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleHide = (id: string) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'hidden' } : item))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar definitivamente este mensaje del libro de firmas?')) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
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
            Supervisa, aprueba y modera los mensajes y dedicatorias de los invitados.
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
          {(['all', 'approved', 'pending', 'hidden'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-text font-semibold shadow-xs'
                  : 'bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {st === 'all' && 'Todos'}
              {st === 'approved' && 'Aprobados'}
              {st === 'pending' && 'Pendientes'}
              {st === 'hidden' && 'Ocultos'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 rounded-3xl bg-bg-card border border-border-subtle text-center text-xs text-text-muted">
            No hay mensajes que coincidan con el filtro seleccionado.
          </div>
        ) : (
          filteredEntries.map((item) => {
            const currentStatus = item.status || 'approved';
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-3 hover:border-border-strong transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-brand-terracotta fill-brand-terracotta/20" />
                    <span className="font-semibold text-xs text-text-primary">
                      {item.guest_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        currentStatus === 'approved'
                          ? 'bg-brand-olive/15 text-brand-olive'
                          : currentStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {currentStatus === 'approved' && 'Aprobado'}
                      {currentStatus === 'pending' && 'Pendiente'}
                      {currentStatus === 'hidden' && 'Oculto'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">
                      {formatDateEs(item.created_at, true)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {currentStatus !== 'approved' && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="p-1.5 rounded-lg text-brand-olive hover:bg-brand-olive/10 transition-colors cursor-pointer"
                          title="Aprobar para publicar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {currentStatus !== 'hidden' && (
                        <button
                          onClick={() => handleHide(item.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:bg-bg-secondary transition-colors cursor-pointer"
                          title="Ocultar de la vista pública"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar mensaje definitivamente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed font-serif italic pl-6 border-l-2 border-brand-sand">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
