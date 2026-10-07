'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MediaPhoto } from '@/lib/types';
import {
  X,
  Check,
  EyeOff,
  Trash2,
  Calendar,
  User,
  HardDrive,
  FileImage,
  Edit2,
  ExternalLink,
} from 'lucide-react';

interface MediaDetailDrawerProps {
  photo: MediaPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
}

export const MediaDetailDrawer: React.FC<MediaDetailDrawerProps> = ({
  photo,
  isOpen,
  onClose,
  onApprove,
  onHide,
  onDelete,
  onUpdateCaption,
}) => {
  const [mounted, setMounted] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (photo) {
      setCaptionValue(photo.caption || '');
      setEditingCaption(false);
    }
  }, [photo]);

  const handleSaveCaption = () => {
    if (photo) {
      onUpdateCaption(photo.id, captionValue);
      setEditingCaption(false);
    }
  };

  const getStatusBadge = () => {
    if (!photo) return null;
    switch (photo.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Aprobada (Pública)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pendiente de moderación
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Oculta en la web
          </span>
        );
    }
  };

  if (!mounted || !isOpen || !photo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalle de fotografía"
      className="fixed inset-0 z-[100] overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-bg-card border-l border-border-subtle shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="p-6 border-b border-border-subtle flex items-center justify-between sticky top-0 bg-bg-card/95 backdrop-blur-sm z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
                Detalles del Archivo
              </span>
              <h3 className="font-serif text-lg font-normal text-text-primary">
                Inspección de Fotografía
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1">
            {/* Image Preview */}
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-border-subtle bg-black/5 shadow-soft group">
              <Image
                src={photo.photo_url}
                alt={photo.caption || 'Foto'}
                fill
                className="object-contain"
              />
              <a
                href={photo.photo_url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                title="Abrir imagen completa"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-[11px]">Ver original</span>
              </a>
            </div>

            {/* Status & Caption */}
            <div className="space-y-3 p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted font-medium">Estado actual:</span>
                {getStatusBadge()}
              </div>

              {/* Editable Caption */}
              <div className="pt-2 border-t border-border-subtle/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">Pie de foto:</span>
                  {!editingCaption && (
                    <button
                      onClick={() => setEditingCaption(true)}
                      className="text-[11px] text-text-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                {editingCaption ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      maxLength={180}
                      value={captionValue}
                      onChange={(e) => setCaptionValue(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setCaptionValue(photo.caption || '');
                          setEditingCaption(false);
                        }}
                        className="py-1 px-2.5 rounded-lg text-xs text-text-muted hover:bg-bg-secondary cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveCaption}
                        className="py-1 px-3 rounded-lg text-xs bg-primary text-primary-text font-medium cursor-pointer"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-primary italic leading-relaxed">
                    {photo.caption ? `“${photo.caption}”` : <span className="text-text-muted">Sin pie de foto asignado</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Technical Metadata */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Metadatos Técnicos
              </h4>

              <div className="grid grid-cols-1 gap-2.5 text-xs text-text-secondary">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/40">
                  <span className="flex items-center gap-2 text-text-muted text-[11px]">
                    <User className="w-3.5 h-3.5" /> Subida por
                  </span>
                  <span className="font-medium text-text-primary">{photo.uploader_name || 'Invitado'}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/40">
                  <span className="flex items-center gap-2 text-text-muted text-[11px]">
                    <Calendar className="w-3.5 h-3.5" /> Fecha
                  </span>
                  <span className="font-mono text-[11px]">
                    {new Date(photo.created_at).toLocaleString('es-ES')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/40">
                  <span className="flex items-center gap-2 text-text-muted text-[11px]">
                    <FileImage className="w-3.5 h-3.5" /> Archivo
                  </span>
                  <span className="font-mono text-[11px] truncate max-w-[200px]" title={photo.original_filename}>
                    {photo.original_filename}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/40">
                  <span className="flex items-center gap-2 text-text-muted text-[11px]">
                    <HardDrive className="w-3.5 h-3.5" /> Tipo &amp; Peso
                  </span>
                  <span className="font-mono text-[11px]">
                    {photo.mime_type} · {photo.file_size ? `${(photo.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Desconocido'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-bg-secondary/30 border border-border-subtle/40 space-y-1">
                  <span className="text-text-muted text-[11px] block">Ruta en Storage:</span>
                  <p className="font-mono text-[10px] text-text-secondary break-all bg-bg-card p-1.5 rounded-lg border border-border-subtle/60">
                    {photo.storage_path}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-6 border-t border-border-subtle bg-bg-secondary/20 space-y-2 sticky bottom-0">
            <div className="flex gap-2">
              {photo.status !== 'approved' && (
                <button
                  onClick={() => onApprove(photo.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-soft"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar</span>
                </button>
              )}

              {photo.status !== 'hidden' && (
                <button
                  onClick={() => onHide(photo.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-secondary text-text-secondary text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-soft"
                >
                  <EyeOff className="w-4 h-4" />
                  <span>Ocultar</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (confirm('¿Eliminar permanentemente esta fotografía de la galería y del almacenamiento?')) {
                  onDelete(photo.id);
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar fotografía</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
