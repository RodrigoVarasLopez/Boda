'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MediaPhoto } from '@/lib/types';
import { X, ChevronLeft, ChevronRight, User, Calendar, MessageSquare } from 'lucide-react';

interface MediaViewerProps {
  photos: MediaPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [mounted, setMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePhoto = photos[currentIndex];

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1); // loop
    }
  }, [currentIndex, photos.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0); // loop
    }
  }, [currentIndex, photos.length, onNavigate]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    setTouchStartX(null);
  };

  if (!mounted || !isOpen || !activePhoto) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotografía"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white/80 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="hidden sm:inline text-white/60">
            {activePhoto.original_filename || 'Fotografía de la boda'}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
          title="Cerrar visor (Esc)"
          aria-label="Cerrar visor"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 z-20 p-3 sm:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95"
            title="Fotografía anterior (Flecha izquierda)"
            aria-label="Fotografía anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 z-20 p-3 sm:p-3.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95"
            title="Fotografía siguiente (Flecha derecha)"
            aria-label="Fotografía siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[82vh] p-4 sm:p-8 flex items-center justify-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={activePhoto.photo_url}
            alt={activePhoto.caption || 'Fotografía de boda Stephanie & Rodrigo'}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div
        className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-3xl mx-auto space-y-2 text-center sm:text-left">
          {activePhoto.caption ? (
            <p className="font-serif text-base sm:text-lg text-white font-normal leading-relaxed">
              &ldquo;{activePhoto.caption}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-white/50 italic">Sin pie de foto</p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-white/70">
            {activePhoto.uploader_name && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-terracotta" />
                <span className="font-medium text-white/90">{activePhoto.uploader_name}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/50" />
              <span>
                {new Date(activePhoto.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
