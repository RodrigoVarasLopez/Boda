'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_GUESTBOOK, INITIAL_MEDIA } from '@/lib/mock-data';
import Link from 'next/link';
import { BookOpen, Camera, Trash2, Heart, Plus, ArrowRight } from 'lucide-react';
import { formatDateEs } from '@/lib/utils';

export default function AdminMediaPage() {
  const [entries, setEntries] = useState(INITIAL_GUESTBOOK);
  const [photos, setPhotos] = useState(INITIAL_MEDIA);

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('¿Eliminar esta fotografía de la galería?')) {
      setPhotos(photos.filter((p) => p.id !== id));
    }
  };

  const handleAddPhoto = () => {
    const caption = prompt('Introduce un pie de foto / descripción:');
    if (!caption) return;
    const newPhoto = {
      id: `m-${Date.now()}`,
      wedding_id: 'w-stephanie-rodrigo-2027',
      uploader_name: 'Stephanie & Rodrigo',
      photo_url: '/wedding/hero-mediterranean.jpg',
      caption,
      created_at: new Date().toISOString(),
    };
    setPhotos([newPhoto, ...photos]);
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
            Memorias & Fotografías
          </h1>
          <p className="text-xs text-text-muted">
            Gestiona la galería de fotografías compartidas y previsualiza dedicatorias.
          </p>
        </div>

        <button
          onClick={handleAddPhoto}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-2 hover:bg-primary-hover shadow-soft transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir fotografía</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploaded Photos */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
              <Camera className="w-4 h-4" />
              <span>Galería de Fotos ({photos.length})</span>
            </div>
            <span className="text-[11px] text-text-muted">Públicas en la web</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft space-y-1 relative group">
                <div className="relative h-36 w-full">
                  <Image
                    src={p.photo_url}
                    alt={p.caption || 'Foto'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 250px"
                  />
                  <button
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2 text-[10px] text-text-secondary truncate">
                  {p.caption || 'Sin título'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guestbook Preview Card */}
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Últimas Firmas ({entries.length})</span>
            </div>
            <Link
              href="/admin/guestbook"
              className="text-xs text-text-accent hover:underline flex items-center gap-1 font-medium"
            >
              <span>Moderación completa</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {entries.slice(0, 3).map((item) => (
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

          <Link
            href="/admin/guestbook"
            className="w-full py-2.5 px-3 rounded-xl border border-border-strong text-text-secondary text-xs font-medium flex items-center justify-center gap-2 hover:bg-bg-secondary transition-colors"
          >
            <span>Ir al panel de firmas & moderación</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
