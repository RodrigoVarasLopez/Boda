'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { MediaPhoto } from '@/lib/types';
import { uploadMediaAction } from '@/app/actions';
import { validateMediaFile } from '@/lib/media/urls';
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface MediaUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPhoto: MediaPhoto) => void;
  isAdmin?: boolean;
  guestId?: string;
  defaultUploaderName?: string;
}

export const MediaUploaderModal: React.FC<MediaUploaderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isAdmin = false,
  guestId,
  defaultUploaderName = '',
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploaderName, setUploaderName] = useState(defaultUploaderName);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setCaption('');
    setUploaderName(defaultUploaderName);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  }, [defaultUploaderName, previewUrl]);

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validation = validateMediaFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Archivo no válido.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Por favor selecciona una fotografía.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caption', caption.trim());
      formData.append('uploader_name', uploaderName.trim() || (isAdmin ? 'Stephanie & Rodrigo' : 'Invitado'));
      formData.append('is_admin', isAdmin ? 'true' : 'false');
      formData.append('wedding_id', 'w-stephanie-rodrigo-2027');
      if (guestId) {
        formData.append('guest_id', guestId);
      }

      const result = await uploadMediaAction(formData);

      if (result.success && result.photo) {
        setSuccessMsg(result.message);
        if (onSuccess) {
          onSuccess(result.photo);
        }
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else {
        setErrorMsg(result.message || 'No se pudo subir la fotografía.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error de red al subir la imagen.');
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subir fotografía"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-bg-card border border-border-subtle shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
              {isAdmin ? 'Panel de Administración' : 'Recuerdos de la Boda'}
            </span>
            <h2 className="font-serif text-2xl font-normal text-text-primary">
              {isAdmin ? 'Añadir Fotografía Oficial' : 'Comparte tu Fotografía'}
            </h2>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Dropzone / Preview */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-text-accent bg-bg-secondary/80 scale-[1.01]'
                    : 'border-border-subtle hover:border-text-accent/60 bg-bg-secondary/30 hover:bg-bg-secondary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle shadow-soft text-text-accent">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-text-primary">
                    Arrastra aquí tu foto o <span className="text-text-accent underline">haz clic para examinar</span>
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Formatos admitidos: JPG, PNG, WebP (máx. 10 MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative h-52 w-full rounded-2xl overflow-hidden border border-border-subtle bg-black/10">
                  <Image
                    src={previewUrl}
                    alt="Previsualización"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    title="Cambiar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {selectedFile && (
                  <p className="text-[10px] text-text-muted font-mono flex items-center justify-between">
                    <span className="truncate max-w-[250px]">{selectedFile.name}</span>
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </p>
                )}
              </div>
            )}

            {/* Author / Name (for guests) */}
            {!isAdmin && (
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Tu nombre o grupo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Familia Gómez, Carlos y Laura..."
                  value={uploaderName}
                  maxLength={80}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>
            )}

            {/* Caption */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-medium text-text-secondary">
                  Pie de foto (opcional)
                </label>
                <span className="text-[10px] text-text-muted font-mono">
                  {caption.length}/180
                </span>
              </div>
              <input
                type="text"
                placeholder="Ej: Brindis con los novios en Bodega Concejo..."
                value={caption}
                maxLength={180}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            {/* Info notice */}
            {!isAdmin && (
              <p className="text-[11px] text-text-muted leading-relaxed bg-bg-secondary/40 p-3 rounded-xl border border-border-subtle/50">
                Las fotografías compartidas por los invitados se revisan antes de aparecer en la galería pública para preservar un ambiente agradable para todos.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="py-2.5 px-4 rounded-xl border border-border-subtle bg-bg-secondary/60 text-text-secondary hover:bg-bg-secondary text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="py-2.5 px-5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold transition-all shadow-soft flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo fotografía...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>{isAdmin ? 'Publicar fotografía' : 'Compartir recuerdo'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
