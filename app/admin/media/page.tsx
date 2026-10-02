'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_GUESTBOOK, INITIAL_MEDIA } from '@/lib/mock-data';
import { BookOpen, Camera, Trash2, Heart } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';

export default function AdminMediaPage() {
  const [entries, setEntries] = useState(INITIAL_GUESTBOOK);
  const [photos, setPhotos] = useState(INITIAL_MEDIA);

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Contenido de los Invitados
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            Memorias & Libro de Firmas
          </h1>
          <p className="text-xs text-text-muted">
            Modera las firmas de los invitados y supervisa la galería de fotografías compartidas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guestbook Messages */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Mensajes del Libro de Firmas ({entries.length})</span>
          </div>

          <div className="space-y-3">
            {entries.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-brand-terracotta fill-brand-terracotta/20" />
                    {item.guest_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-mono">{formatDateEs(item.created_at)}</span>
                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary italic font-serif leading-relaxed">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Photos */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Galería de Fotos ({photos.length})</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft space-y-1">
                <div className="relative h-36 w-full">
                  <Image
                    src={p.photo_url}
                    alt={p.caption || 'Foto'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 250px"
                  />
                </div>
                <div className="p-2 text-[10px] text-text-secondary truncate">
                  {p.caption || 'Sin título'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
