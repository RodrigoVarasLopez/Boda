'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, Link2, Check, X } from 'lucide-react';

export const PROJECT_GALLERY_PRESETS = [
  {
    label: 'Banquete Nocturno Bodega Concejo',
    url: '/images/bodega/bodega-concejo-banquete-noche.png',
  },
  {
    label: 'Viñedos y Barrica Valoria',
    url: '/images/bodega/vinedos-valoria-barrica.png',
  },
  {
    label: 'Sala de Barricas Bodega',
    url: '/images/bodega/sala-barricas-bodega.png',
  },
  {
    label: 'Cata y Rincón Enológico',
    url: '/images/bodega/cata-vino-burro-loco.png',
  },
  {
    label: 'Fachada Bodega Concejo',
    url: '/images/bodega/bodega-concejo-fachada-logo.png',
  },
  {
    label: 'Detalle Floral Orgánico',
    url: '/wedding/floral-detail.jpg',
  },
  {
    label: 'Puesta en Mesa & Lino',
    url: '/wedding/table-setting.jpg',
  },
  {
    label: 'Arquitectura & Ceremonia',
    url: '/wedding/venue-editorial.jpg',
  },
  {
    label: 'Atardecer Mediterráneo',
    url: '/wedding/sunset-mediterranean.jpg',
  },
  {
    label: 'Editorial Pareja Horizontal',
    url: '/wedding/hero-mediterranean.jpg',
  },
];

interface ImagePickerFieldProps {
  value: string;
  onChange: (newUrl: string) => void;
  label?: string;
  compact?: boolean;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  value,
  onChange,
  label = 'Fotografía de referencia',
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      if (!rawDataUrl) return;

      // Compress image via canvas so localStorage stays fast and light
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1100;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          onChange(compressed);
        } else {
          onChange(rawDataUrl);
        }
      };
      img.onerror = () => {
        onChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {!compact && (
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir foto desde dispositivo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowGallery(!showGallery);
            setShowUrlInput(false);
          }}
          className="px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-secondary text-text-primary text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-primary" />
          <span>Elegir de galería</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setUrlDraft(value);
            setShowUrlInput(!showUrlInput);
            setShowGallery(false);
          }}
          className="px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Pegar URL</span>
        </button>
      </div>

      {/* URL Input Drawer */}
      {showUrlInput && (
        <div className="p-2.5 rounded-xl bg-bg-card border border-border-subtle flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            placeholder="https://... o /images/..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-bg-secondary/50 border border-border-subtle text-xs text-text-primary"
          />
          <button
            type="button"
            onClick={() => {
              if (urlDraft.trim()) onChange(urlDraft.trim());
              setShowUrlInput(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-1.5 text-text-muted hover:text-text-primary cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Visual Preset Gallery Drawer */}
      {showGallery && (
        <div className="p-3 rounded-2xl bg-bg-card border border-border-subtle shadow-card space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Selecciona una fotografía del banco visual:
            </span>
            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="text-text-muted hover:text-text-primary p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {PROJECT_GALLERY_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setShowGallery(false);
                  }}
                  className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-border-subtle hover:border-border-strong'
                  }`}
                >
                  <div className="relative h-16 w-full bg-neutral-200">
                    <Image
                      src={preset.url}
                      alt={preset.label}
                      fill
                      className="object-cover"
                      sizes="140px"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="p-1.5 text-[10px] font-medium text-text-primary truncate bg-bg-card">
                    {preset.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
