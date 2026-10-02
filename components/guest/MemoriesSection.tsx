'use client';

import React, { useState } from 'react';
import { Wedding, GuestBookEntry, MediaPhoto } from '@/lib/types';
import { Camera, BookOpen, Send, Sparkles, Image as ImageIcon, Heart } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'guestbook' | 'photos'>('guestbook');

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const newEntry: GuestBookEntry = {
      id: `gb-${Date.now()}`,
      wedding_id: wedding.id,
      guest_name: name,
      message: message,
      created_at: new Date().toISOString(),
    };

    setEntries([newEntry, ...entries]);
    if (onAddMessage) onAddMessage(name, message);
    setName('');
    setMessage('');
  };

  return (
    <section className="py-10 px-4 max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Memorias & Recuerdos</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-semibold pt-1">
          Libro de Firmas & Fotos
        </h2>
        <p className="text-xs text-text-muted">
          Deja vuestros mejores deseos y comparte los momentos de la celebración.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-bg-secondary p-1 border border-border-subtle">
        <button
          onClick={() => setActiveTab('guestbook')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'guestbook'
              ? 'bg-bg-card text-text-primary shadow-soft font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Libro de Firmas</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-bg-card text-text-primary shadow-soft font-semibold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Galería de Fotos</span>
        </button>
      </div>

      {/* TAB 1: GUESTBOOK */}
      {activeTab === 'guestbook' && (
        <div className="space-y-6 animate-fade-in">
          {/* Form */}
          <form onSubmit={handlePostMessage} className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-3">
            <h3 className="font-serif text-lg font-semibold text-text-primary">
              Firmar en el libro digital
            </h3>
            <input
              type="text"
              placeholder="Tu nombre / familia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              required
            />
            <textarea
              rows={3}
              placeholder="Escribe tu mensaje para Laura & Rodrigo..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
              required
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publicar mensaje</span>
            </button>
          </form>

          {/* List of Messages */}
          <div className="space-y-3">
            {entries.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-primary flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-text-accent" />
                    {item.guest_name}
                  </span>
                  <span className="text-[10px] text-text-muted">
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
          <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-3">
            <ImageIcon className="w-8 h-8 text-text-accent mx-auto" />
            <h3 className="font-serif text-xl font-semibold text-text-primary">
              Galería Fotográfica de la Boda
            </h3>
            <p className="text-xs text-text-muted">
              El día de la boda podrás escanear el QR en las mesas o subir directamente aquí las fotos tomadas durante el evento.
            </p>
            <button
              onClick={() => alert('La subida en directo se activará el día de la boda.')}
              className="py-3 px-5 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-2 cursor-pointer shadow-soft"
            >
              <Camera className="w-4 h-4" />
              <span>Subir fotos de la boda</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-2xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft">
                <img src={photo.photo_url} alt={photo.caption || 'Foto de boda'} className="w-full h-36 object-cover" />
                {photo.caption && (
                  <p className="p-2 text-[11px] text-text-muted font-medium truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
