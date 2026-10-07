'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Wedding, GuestBookEntry, MediaPhoto } from '@/lib/types';
import { useMediaStore } from '@/lib/media-store';
import { submitGuestbookAction } from '@/app/actions';
import { MediaViewer } from '@/components/media/MediaViewer';
import { MediaUploaderModal } from '@/components/media/MediaUploaderModal';
import {
  Camera,
  BookOpen,
  Send,
  Sparkles,
  Heart,
  Check,
  UploadCloud,
  ChevronDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface MemoriesSectionProps {
  wedding: Wedding;
  guestbookEntries?: GuestBookEntry[];
  photos?: MediaPhoto[];
  invitationId?: string;
  defaultGuestName?: string;
}

const PAGE_SIZE = 12;

export const MemoriesSection: React.FC<MemoriesSectionProps> = ({
  wedding,
  guestbookEntries: initialEntries,
  photos: initialPhotos,
  invitationId,
  defaultGuestName = '',
}) => {
  const {
    photos: storePhotos,
    guestbook: storeGuestbook,
    addPhoto: storeAddPhoto,
    addGuestbookEntry: storeAddEntry,
  } = useMediaStore();

  const [activeTab, setActiveTab] = useState<'guestbook' | 'photos'>('guestbook');

  // Guestbook Form State
  const [name, setName] = useState(defaultGuestName);
  const [message, setMessage] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [messageSuccessNotice, setMessageSuccessNotice] = useState<string | null>(null);
  const [messageErrorNotice, setMessageErrorNotice] = useState<string | null>(null);

  // Gallery State
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [selectedViewerIndex, setSelectedViewerIndex] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filter ONLY approved and visible items for guest viewing
  const approvedPhotos = useMemo(() => {
    const list = storePhotos && storePhotos.length > 0 ? storePhotos : (initialPhotos || []);
    return list.filter(
      (p) => p.is_visible !== false && (p.status === 'approved' || p.is_approved)
    );
  }, [storePhotos, initialPhotos]);

  const approvedEntries = useMemo(() => {
    const list = storeGuestbook && storeGuestbook.length > 0 ? storeGuestbook : (initialEntries || []);
    return list.filter(
      (e) => !e.status || e.status === 'approved'
    );
  }, [storeGuestbook, initialEntries]);

  // Paginated photos
  const displayedPhotos = useMemo(() => {
    return approvedPhotos.slice(0, displayLimit);
  }, [approvedPhotos, displayLimit]);

  const hasMorePhotos = approvedPhotos.length > displayLimit;

  // Handle Guestbook Submission
  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmittingMessage) return;

    setIsSubmittingMessage(true);
    setMessageErrorNotice(null);
    setMessageSuccessNotice(null);

    try {
      const result = await submitGuestbookAction({
        wedding_id: wedding.id,
        guest_name: name.trim(),
        message: message.trim(),
        invitation_id: invitationId,
      });

      if (result.success && result.entry) {
        storeAddEntry(result.entry);
        setMessageSuccessNotice(result.message);
        setMessage('');
        setTimeout(() => {
          setMessageSuccessNotice(null);
        }, 5000);
      } else {
        setMessageErrorNotice(result.message || 'Error al enviar la dedicatoria.');
      }
    } catch (err: any) {
      setMessageErrorNotice(err?.message || 'Error de conexión.');
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  return (
    <section id="memorias" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12 animate-fade-in">
      {/* Editorial Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Memorias de la Boda</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          Libro de Firmas &amp; Galería
        </h2>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Comparte unas palabras con Stephanie &amp; Rodrigo y revive los momentos más especiales de este fin de semana en Bodega Concejo.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="max-w-xs mx-auto flex rounded-full bg-bg-secondary/70 p-1 border border-border-subtle shadow-soft">
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
          <span>Galería ({approvedPhotos.length})</span>
        </button>
      </div>

      {/* TAB 1: GUESTBOOK */}
      {activeTab === 'guestbook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Dedication Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handlePostMessage}
              className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 sticky top-24"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
                  Vuestra dedicatoria
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-text-primary">
                  Para Stephanie &amp; Rodrigo
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Déjanos un mensaje, un consejo o tus mejores deseos para nuestra nueva etapa juntos.
                </p>
              </div>

              {messageSuccessNotice && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="leading-snug">{messageSuccessNotice}</span>
                </div>
              )}

              {messageErrorNotice && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center animate-fade-in flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="leading-snug">{messageErrorNotice}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Tu nombre o familia
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre..."
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-text-secondary">
                    Mensaje con cariño
                  </label>
                  <span className="text-[10px] text-text-muted font-mono">
                    {message.length}/500
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Escribe tus palabras... (máximo 500 caracteres)"
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none leading-relaxed"
                  required
                />
              </div>

              <p className="text-[10px] text-text-muted leading-relaxed">
                Por moderación, tu mensaje aparecerá en el libro tras una breve confirmación.
              </p>

              <button
                type="submit"
                disabled={isSubmittingMessage || !name.trim() || !message.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingMessage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando dedicatoria...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar en el libro</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List of Messages */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Dedicatorias publicadas ({approvedEntries.length})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {approvedEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-soft space-y-3 flex flex-col justify-between"
                >
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

      {/* TAB 2: PHOTOS GALLERY */}
      {activeTab === 'photos' && (
        <div className="space-y-10 animate-fade-in">
          {/* Guest Upload CTA Banner */}
          <div className="p-8 sm:p-10 rounded-3xl bg-bg-card border border-border-subtle shadow-card text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-bg-secondary text-text-accent flex items-center justify-center mx-auto shadow-xs border border-border-subtle">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
              Galería de la Celebración
            </h3>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
              ¿Tienes fotografías del fin de semana en Bodega Concejo? Comparte tus fotos favoritas para añadirlas al álbum colectivo de Stephanie &amp; Rodrigo.
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="py-3 px-6 rounded-2xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-all inline-flex items-center gap-2 cursor-pointer shadow-soft hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>Subir fotos de la boda</span>
            </button>
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setSelectedViewerIndex(index)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-border-subtle bg-bg-card shadow-soft hover:shadow-hover hover:border-text-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-black/5">
                  <Image
                    src={photo.photo_url}
                    alt={photo.caption || 'Foto de boda'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                      Ver foto
                    </span>
                  </div>
                </div>

                {photo.caption && (
                  <p className="p-3 text-[11px] text-text-muted font-medium truncate group-hover:text-text-primary transition-colors">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMorePhotos && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
                className="py-3 px-6 rounded-2xl border border-border-subtle bg-bg-card text-text-primary hover:bg-bg-secondary text-xs font-medium transition-all inline-flex items-center gap-2 cursor-pointer shadow-soft"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Cargar más fotografías ({approvedPhotos.length - displayedPhotos.length} restantes)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Viewer */}
      {selectedViewerIndex !== null && (
        <MediaViewer
          photos={approvedPhotos}
          currentIndex={selectedViewerIndex}
          isOpen={selectedViewerIndex !== null}
          onClose={() => setSelectedViewerIndex(null)}
          onNavigate={(newIdx) => setSelectedViewerIndex(newIdx)}
        />
      )}

      {/* Upload Modal */}
      <MediaUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        isAdmin={false}
        defaultUploaderName={name}
        onSuccess={(newPhoto) => {
          storeAddPhoto(newPhoto);
        }}
      />
    </section>
  );
};
