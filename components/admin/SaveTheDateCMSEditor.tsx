'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useSaveTheDateConfig,
  DEFAULT_SAVE_THE_DATE_IMAGES,
  DEFAULT_SAVE_THE_DATE_WHATSAPP,
} from '@/lib/save-the-date-store';
import { SaveTheDateImages } from '@/lib/types';
import {
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  Upload,
  RotateCcw,
  Check,
  ExternalLink,
  Copy,
  Calendar,
  MapPin,
  Heart,
  Eye,
  Sliders,
} from 'lucide-react';

interface ImageSlotMeta {
  key: keyof SaveTheDateImages;
  title: string;
  section: string;
  aspect: string;
  description: string;
  defaultSrc: string;
}

const IMAGE_SLOTS: ImageSlotMeta[] = [
  {
    key: 'hero_mobile',
    title: 'Hero Portada (Móvil)',
    section: '00 · Apertura',
    aspect: 'aspect-[9/16] max-h-[140px]',
    description: 'Imagen vertical protagonista en teléfonos y apertura móvil.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.hero_mobile,
  },
  {
    key: 'hero_desktop',
    title: 'Hero Portada (Escritorio)',
    section: '00 · Apertura',
    aspect: 'aspect-[16/9] max-h-[140px]',
    description: 'Imagen cinematográfica panorámica a pantalla completa en PC.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.hero_desktop,
  },
  {
    key: 'story_1_portrait',
    title: 'Historia I · Retrato Vertical',
    section: '01 · Historia',
    aspect: 'aspect-[3/4] max-h-[140px]',
    description: 'Primera viñeta: mirada o inicio del viaje de los novios.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_1_portrait,
  },
  {
    key: 'story_1_wide',
    title: 'Historia I · Formato Ancho',
    section: '01 · Historia',
    aspect: 'aspect-[3/2] max-h-[140px]',
    description: 'Detalle complementario apaisado de la primera escena.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_1_wide,
  },
  {
    key: 'story_2_detail',
    title: 'Historia II · Detalle Anillos',
    section: '01 · Historia',
    aspect: 'aspect-[4/5] max-h-[140px]',
    description: 'Fotografía cercana de alianzas, manos o detalle íntimo.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_2_detail,
  },
  {
    key: 'story_2_portrait',
    title: 'Historia II · Retrato Principal',
    section: '01 · Historia',
    aspect: 'aspect-[3/4] max-h-[140px]',
    description: 'Retrato central con luz cálida del atardecer o abrazo.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_2_portrait,
  },
  {
    key: 'story_3_portrait',
    title: 'Historia III · Retrato Dorado',
    section: '01 · Historia',
    aspect: 'aspect-[3/4] max-h-[140px]',
    description: 'Tercera parada de la historia, brindis u hora dorada.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_3_portrait,
  },
  {
    key: 'story_3_candid',
    title: 'Historia III · Espontánea',
    section: '01 · Historia',
    aspect: 'aspect-[4/5] max-h-[140px]',
    description: 'Risa, momento natural o complicidad sin posar.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.story_3_candid,
  },
  {
    key: 'date_horizon',
    title: 'Fecha · Fondo Horizonte',
    section: '02 · Calendario',
    aspect: 'aspect-[21/9] max-h-[140px]',
    description: 'Franja panorámica apaisada de la sección interactiva de fecha.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.date_horizon,
  },
  {
    key: 'final_portrait',
    title: 'Cierre · Retrato Protagonista',
    section: '03 · Guarda la Fecha',
    aspect: 'aspect-[3/4] max-h-[140px]',
    description: 'Retrato vertical final junto a los botones de compartir.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.final_portrait,
  },
  {
    key: 'final_wide',
    title: 'Cierre · Marco Panorámico',
    section: '03 · Guarda la Fecha',
    aspect: 'aspect-[16/10] max-h-[140px]',
    description: 'Fotografía ancha de despedida y horizonte de celebración.',
    defaultSrc: DEFAULT_SAVE_THE_DATE_IMAGES.final_wide,
  },
];

export function SaveTheDateCMSEditor() {
  const { config, updateConfig, updateImage, resetToDefaults } = useSaveTheDateConfig();
  const [toast, setToast] = useState<string | null>(null);
  const [copiedTest, setCopiedTest] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (key: keyof SaveTheDateImages, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        updateImage(key, dataUrl);
        showToast(`✓ Imagen "${key}" actualizada con éxito`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyTestWhatsApp = async () => {
    try {
      const shareUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/save-the-date`
          : 'https://stephanieyrodrigo.com/save-the-date';

      let text = config.whatsapp_message;
      if (!text.includes('http://') && !text.includes('https://')) {
        text = `${text}\n\n${shareUrl}`;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedTest(true);
      showToast('✓ Mensaje de WhatsApp copiado al portapapeles');
      setTimeout(() => setCopiedTest(false), 3000);
    } catch {}
  };

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 py-3 px-5 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-card flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Hero Banner for Save the Date CMS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-brand-sand/30 to-amber-600/10 border border-amber-300/40 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Editor Exclusivo Save the Date</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-primary">
            Gestión Visual & Difusión por WhatsApp
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            Personaliza todas las fotografías del Save the Date, ajusta los textos principales y define el mensaje predefinido que los invitados o vosotros copiaréis y enviaréis con 1 clic por WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            href="/save-the-date"
            target="_blank"
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-2 hover:bg-primary-hover shadow-soft transition-colors w-full sm:w-auto"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Save the Date</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>

          <button
            type="button"
            onClick={() => {
              if (confirm('¿Restablecer todas las fotos y textos del Save the Date a los valores por defecto?')) {
                resetToDefaults();
                showToast('Save the Date restablecido a valores por defecto');
              }
            }}
            className="py-2.5 px-3.5 rounded-xl border border-border-subtle bg-bg-card text-text-secondary text-xs font-medium hover:bg-bg-secondary flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto cursor-pointer"
            title="Restablecer valores originales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Por defecto</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: WHATSAPP INTEGRATION & LIVE PREVIEW */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary">
              1. Mensaje Predefinido para WhatsApp
            </h3>
            <p className="text-xs text-text-muted">
              Este es el texto que se copiará automáticamente al portapapeles cuando los novios o invitados pulsen &ldquo;Copiar para WhatsApp&rdquo;.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Editor Form */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-text-accent" />
                Redacción del Mensaje para WhatsApp
              </label>
              <span className="text-[10px] font-mono text-text-muted">
                {config.whatsapp_message.length} caracteres
              </span>
            </div>

            <textarea
              rows={8}
              value={config.whatsapp_message}
              onChange={(e) =>
                updateConfig((prev) => ({ ...prev, whatsapp_message: e.target.value }))
              }
              placeholder="Escribe el mensaje con emojis, saltos de línea y detalles..."
              className="w-full p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed resize-y"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  updateConfig((prev) => ({
                    ...prev,
                    whatsapp_message: DEFAULT_SAVE_THE_DATE_WHATSAPP,
                  }))
                }
                className="text-[11px] text-text-muted hover:text-text-primary underline cursor-pointer"
              >
                Restablecer texto sugerido de WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopyTestWhatsApp}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-2 shadow-soft transition-colors cursor-pointer"
              >
                {copiedTest ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTest ? '¡Texto Copiado!' : 'Probar Copia'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Interactive Mockup Bubble */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-[#0B141A] text-white shadow-card border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25D366] text-[#0B141A] flex items-center justify-center font-bold text-[11px]">
                  WA
                </div>
                <div>
                  <span className="font-semibold block text-[11px] text-neutral-200">
                    Vista Previa en WhatsApp
                  </span>
                  <span className="text-[10px] text-emerald-400">En línea</span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Burbuja Real</span>
            </div>

            {/* Bubble */}
            <div className="bg-[#005C4B] rounded-2xl p-4 text-xs sm:text-sm text-neutral-100 shadow-sm relative space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
              <p>{config.whatsapp_message}</p>
              <div className="pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[10px] text-emerald-200/80">
                <span className="truncate max-w-[200px] text-emerald-300 underline font-mono">
                  https://.../save-the-date
                </span>
                <span className="flex items-center gap-1 font-mono">
                  11:45 <span className="text-cyan-300">✓✓</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center italic pt-1">
              Así lo recibirán los invitados en sus dispositivos al compartir o pegar el mensaje.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: BASIC TEXT & DATES OF SAVE THE DATE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Heart className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary">
              2. Textos &amp; Datos Principales del Save the Date
            </h3>
            <p className="text-xs text-text-muted">
              Nombres que presiden la cabecera, fecha de formato visual y lugar de celebración.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Nombres de los Novios
            </label>
            <input
              type="text"
              value={config.couple_names}
              onChange={(e) =>
                updateConfig((prev) => ({ ...prev, couple_names: e.target.value }))
              }
              placeholder="Rodrigo & Stephanie"
              className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              Fecha Visual
            </label>
            <input
              type="text"
              value={config.wedding_date_display}
              onChange={(e) =>
                updateConfig((prev) => ({ ...prev, wedding_date_display: e.target.value }))
              }
              placeholder="28 · 08 · 2027"
              className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Ubicación / Finca
            </label>
            <input
              type="text"
              value={config.wedding_location}
              onChange={(e) =>
                updateConfig((prev) => ({ ...prev, wedding_location: e.target.value }))
              }
              placeholder="Villamuriel de Cerrato · Palencia"
              className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: SAVE THE DATE IMAGE REPOSITORY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-text-accent" />
            <div>
              <h3 className="font-serif text-xl font-bold text-text-primary">
                3. Galería de Imágenes del Save the Date ({IMAGE_SLOTS.length} Fotos)
              </h3>
              <p className="text-xs text-text-muted">
                Cambia cualquier foto subiendo un archivo desde tu equipo o pegando una URL de imagen.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {IMAGE_SLOTS.map((slot) => {
            const currentUrl = config.images[slot.key] || slot.defaultSrc;
            const isCustom = currentUrl !== slot.defaultSrc;

            return (
              <div
                key={slot.key}
                className={`p-5 rounded-3xl bg-bg-card border transition-all shadow-card flex flex-col justify-between space-y-4 ${
                  isCustom ? 'border-brand-gold/60 ring-1 ring-brand-gold/20' : 'border-border-subtle'
                }`}
              >
                {/* Slot Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-bold">
                      {slot.section}
                    </span>
                    {isCustom && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-400/30">
                        Personalizada
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-base text-text-primary">{slot.title}</h4>
                  <p className="text-[11px] text-text-muted">{slot.description}</p>
                </div>

                {/* Image Thumbnail Preview */}
                <div
                  className={`relative w-full ${slot.aspect} rounded-2xl overflow-hidden bg-bg-secondary border border-border-subtle shadow-inner group`}
                >
                  <Image
                    src={currentUrl}
                    alt={slot.title}
                    fill
                    unoptimized={currentUrl.startsWith('data:')}
                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                    sizes="350px"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-[11px] text-center font-medium">
                    Vista actual de {slot.title}
                  </div>
                </div>

                {/* Input & Upload Controls */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">
                      Ruta o Enlace (URL)
                    </label>
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => updateImage(slot.key, e.target.value)}
                      placeholder="/save-the-date/... o https://..."
                      className="w-full py-2 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-text-accent"
                    />
                  </div>

                  {/* Actions: Subir Archivo + Restaurar Original */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[slot.key] = el;
                      }}
                      accept="image/*"
                      onChange={(e) => handleFileUpload(slot.key, e)}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[slot.key]?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-bg-secondary border border-border-subtle hover:bg-bg-primary text-text-primary text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-text-accent" />
                      <span>Subir foto</span>
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          updateImage(slot.key, slot.defaultSrc);
                          showToast(`Imagen ${slot.title} restaurada`);
                        }}
                        className="py-2 px-2.5 rounded-xl border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
                        title="Restablecer original"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
