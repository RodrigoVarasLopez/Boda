'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wedding, GuestBookEntry, MediaPhoto } from '@/lib/types';
import { Camera, BookOpen, Send, Sparkles, Heart, Check } from 'lucide-react';

interface MemoriesSectionProps {
  wedding: Wedding;
  guestbookEntries: GuestBookEntry[];
  photos: MediaPhoto[];
  onAddMessage?: (author: string, message: string) => void;
  onUploadPhoto?: (uploader: string, photoUrl: string, caption?: string) => void;
}

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  wedding,
  guestbookEntries,
  photos,
  onAddMessage,
  onUploadPhoto,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [entries, setEntries] = useState<GuestBookEntry[]>(guestbookEntries);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'guestbook' | 'photos'>('guestbook');

  const visibleEntries = entries.filter((item) => !item.status || item.status === 'approved');

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const sanitizedName = name.trim().slice(0, 80);
    const sanitizedMessage = message.trim().slice(0, 500);

    const newEntry: GuestBookEntry = {
      id: `gb-${Date.now()}`,
      wedding_id: wedding.id,
      guest_name: sanitizedName,
      message: sanitizedMessage,
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    if (onAddMessage) onAddMessage(sanitizedName, sanitizedMessage);
    setName('');
    setMessage('');
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  return (
    <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Recuerdos &amp; Firmas</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          Libro de Firmas &amp; Galería
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          Comparte unas palabras con Stephanie &amp; Rodrigo y revive los momentos más emotivos de este fin de semana.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-xs mx-auto flex rounded-full bg-bg-secondary/70 p-1 border border-border-subtle">
        <button
          onClick={() => setActiveTab('guestbook')}
          className={`flex-1 py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guestbook'
              ? 'bg-bg-card text-text-primary shadow-soft font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-text-accent" />
          <span>Libro de Firmas</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-bg-card text-text-primary shadow-soft font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-text-accent" />
          <span>Galería de Fotos</span>
        </button>
      </div>

      {/* TAB 1: GUESTBOOK */}
      {activeTab === 'guestbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Dedication Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handlePostMessage} className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 sticky top-24">
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary">
                Dedicatoria para Stephanie &amp; Rodrigo
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Déjanos un mensaje, un consejo o tus mejores deseos para nuestra nueva etapa juntos.
              </p>

              {submittedSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Dedicatoria guardada! Gracias por tus palabras con tanto cariño.</span>
                </div>
              )}

              <input
                type="text"
                placeholder="Tu nombre o familia..."
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                required
              />

              <textarea
                rows={4}
                placeholder="Escribe tus palabras con cariño... (máximo 500 caracteres)"
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none leading-relaxed"
                required
              />

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar en el libro</span>
              </button>
            </form>
          </div>

          {/* List of Messages */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Mensajes recibidos ({visibleEntries.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {visibleEntries.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-3 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-serif italic">
                    &ldquo;{item.message}&rdquo;
                  </p>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-border-subtle/50">
                    <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                      <Heart className="w-3 h-3 text-brand-terracotta fill-brand-terracotta/20" />
                      {item.guest_name}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-8 animate-fade-in text-center">
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 max-w-xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              Galería de la Celebración
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Durante el día de la boda podrás escanear el código QR de las mesas o subir tus fotografías favoritas directamente desde tu teléfono.
            </p>
            <button
              onClick={() => alert('La subida de fotografías se activará el día del enlace.')}
              className="py-3 px-6 rounded-2xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2 cursor-pointer shadow-soft"
            >
              <Camera className="w-4 h-4" />
              <span>Subir fotos de la boda</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-3xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft space-y-1 group">
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Foto de boda'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 250px"
                  />
                </div>
                {photo.caption && (
                  <p className="p-2.5 text-[11px] text-text-muted font-medium truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
