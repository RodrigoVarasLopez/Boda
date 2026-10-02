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
    <section className="py-12 px-5 max-w-lg mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3 h-3" />
          <span>Recuerdos & Firmas</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
          Libro de Firmas & Fotos
        </h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto">
          Comparte tus mejores deseos y revive los momentos de nuestra boda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-full bg-bg-secondary/70 p-1 border border-border-subtle">
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
        <div className="space-y-6 animate-fade-in">
          {/* Form */}
          <form onSubmit={handlePostMessage} className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <h3 className="font-serif text-xl font-normal text-text-primary">
              Dedicatoria para Stephanie & Rodrigo
            </h3>
            {submittedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Dedicatoria guardada! Gracias por tus palabras para Stephanie & Rodrigo.</span>
              </div>
            )}
            <input
              type="text"
              placeholder="Tu nombre / familia"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              required
            />
            <textarea
              rows={3}
              placeholder="Escribe unas palabras de cariño... (máx 500 caracteres)"
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
              required
            />
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar en el libro</span>
            </button>
          </form>

          {/* List of Messages */}
          <div className="space-y-3">
            {visibleEntries.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-brand-terracotta fill-brand-terracotta/20" />
                    {item.guest_name}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {new Date(item.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-serif italic">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PHOTOS */}
      {activeTab === 'photos' && (
        <div className="space-y-6 animate-fade-in text-center">
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-3">
            <h3 className="font-serif text-2xl font-normal text-text-primary">
              Galería de la Celebración
            </h3>
            <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
              Durante el día de la boda podrás escanear el código QR en las mesas o subir tus fotos favoritas directamente aquí.
            </p>
            <button
              onClick={() => alert('La subida de fotografías se activará el día del enlace.')}
              className="py-3 px-5 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2 cursor-pointer shadow-soft"
            >
              <Camera className="w-4 h-4" />
              <span>Subir fotos de la boda</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft space-y-1">
                <div className="relative h-40 w-full">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Foto de boda'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 250px"
                  />
                </div>
                {photo.caption && (
                  <p className="p-2 text-[10px] text-text-muted font-medium truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
