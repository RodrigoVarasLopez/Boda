'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCMSData } from '@/lib/cms-store';
import { useWeddingData } from '@/lib/guest-store';
import { CMSBlock } from '@/lib/types';
import { SaveTheDateCMSEditor } from '@/components/admin/SaveTheDateCMSEditor';
import {
  FileText,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit3,
  ExternalLink,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  MapPin,
  Hotel,
  Gift,
  HelpCircle,
  BookOpen,
  Heart,
  Compass,
} from 'lucide-react';

const BLOCK_TYPE_LABELS: Record<
  CMSBlock['type'],
  { label: string; badge: string; description: string; icon: React.ReactNode }
> = {
  hero: {
    label: '1. Portada Principal & Sobre de Invitación',
    badge: 'Hero & Sobre',
    description: 'Nombres de los novios, fecha, frase principal, botones y sobre de apertura de la invitación.',
    icon: <Sparkles className="w-4 h-4 text-text-accent" />,
  },
  intro: {
    label: '2. Bienvenida & Tarjeta Concierge del Invitado',
    badge: 'Bienvenida',
    description: 'Cita romántica de bienvenida, texto introductorio y los 3 puntos clave de la tarjeta Concierge.',
    icon: <Compass className="w-4 h-4 text-brand-olive" />,
  },
  story: {
    label: '3. Nuestra Historia (01 · NOSOTROS)',
    badge: 'Historia',
    description: 'Relato de vuestra historia, párrafos editables, foto con pie de imagen y firma.',
    icon: <Heart className="w-4 h-4 text-brand-terracotta" />,
  },
  timeline: {
    label: '4. Programa del Fin de Semana & Horarios (Preboda y Boda)',
    badge: 'Programa y Eventos',
    description: 'Textos del itinerario de Viernes y Sábado + edición de cada evento (horarios, lugares, dress code).',
    icon: <Calendar className="w-4 h-4 text-text-accent" />,
  },
  venue: {
    label: '5. Guía del Invitado & El Enclave (Bodega Concejo)',
    badge: 'El Lugar',
    description: 'Presentación de la finca/bodega, dirección exacta, enlace a Google Maps e imagen.',
    icon: <MapPin className="w-4 h-4 text-brand-olive" />,
  },
  travel: {
    label: '6. Alojamiento & Autobuses de Traslado',
    badge: 'Viaje y Hoteles',
    description: 'Hoteles recomendados, códigos/tarifas para invitados y horarios o paradas de autobús.',
    icon: <Hotel className="w-4 h-4 text-text-accent" />,
  },
  registry: {
    label: '7. Lista de Bodas & Cuenta Bancaria (IBAN)',
    badge: 'Regalo / IBAN',
    description: 'Mensaje de agradecimiento, titular de la cuenta, banco y número de IBAN.',
    icon: <Gift className="w-4 h-4 text-brand-terracotta" />,
  },
  faq: {
    label: '8. Preguntas Frecuentes (FAQ)',
    badge: 'Preguntas',
    description: 'Respuestas a dudas habituales de los invitados (dress code, alergias, aparcamiento...).',
    icon: <HelpCircle className="w-4 h-4 text-brand-olive" />,
  },
  contact: {
    label: '9. Libro de Firmas, Galería & Pie de Página',
    badge: 'Memorias y Footer',
    description: 'Encabezado del muro de recuerdos y textos finales del pie de página de la invitación.',
    icon: <BookOpen className="w-4 h-4 text-text-accent" />,
  },
};

export default function AdminCMSPage() {
  const {
    blocks,
    events,
    updateBlocks,
    updateBlock,
    updateEvent,
    resetToDefaults,
  } = useCMSData();
  const { groups } = useWeddingData();

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>('block-hero');
  const [savedToast, setSavedToast] = useState(false);
  const [cmsTab, setCmsTab] = useState<'invitation' | 'save-the-date'>('invitation');

  const sampleToken = groups[0]?.token || 'token-familia-varas-lopez-ange-1';

  const triggerSavedBanner = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2800);
  };

  const toggleActive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
    triggerSavedBanner();
  };

  const moveBlock = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => a.display_order - b.display_order);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const temp = sorted[index];
      sorted[index] = sorted[targetIndex];
      sorted[targetIndex] = temp;
      return sorted.map((b, idx) => ({ ...b, display_order: idx + 1 }));
    });
    triggerSavedBanner();
  };

  const handleContentFieldChange = (block: CMSBlock, key: string, value: any) => {
    updateBlock(block.id, {
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.display_order - b.display_order);

  // Extract HH:MM from ISO string and update ISO string preserving date
  const getTimeFromISO = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '18:00';
    }
  };

  const updateTimeInISO = (iso: string, hhmm: string) => {
    try {
      const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
      if (isNaN(h) || isNaN(m)) return iso;
      const d = new Date(iso);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-text-accent">
            Editor Integral de Invitaciones &amp; Web
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mt-1">
            CMS &amp; Narrativa de la Boda
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Reordena, activa o personaliza todos los textos de cada apartado de la invitación y la web de Rodrigo &amp; Stephanie. Los cambios se guardan automáticamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  '¿Quieres restaurar todos los textos y secciones a los valores originales por defecto?'
                )
              ) {
                resetToDefaults();
                triggerSavedBanner();
              }
            }}
            className="py-2.5 px-3.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-secondary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restaurar valores por defecto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>

          <Link
            href="/save-the-date"
            target="_blank"
            className="py-2.5 px-4 rounded-xl border border-amber-300/80 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Ver Save the Date</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>

          <Link
            href={`/i/${sampleToken}?preview=true`}
            target="_blank"
            className="py-2.5 px-4 rounded-xl border border-border-strong bg-bg-card hover:bg-bg-secondary text-text-primary text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>Ver Invitación Invitado</span>
            <ExternalLink className="w-3.5 h-3.5 text-text-accent" />
          </Link>

          <Link
            href="/w/stephanie-y-rodrigo"
            target="_blank"
            className="py-2.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-soft"
          >
            <span>Ver Web Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Floating / Inline Save Confirmation */}
      {savedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-soft animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ¡Cambios guardados! Ya están aplicados en todas las invitaciones personales y en la web pública.
            </span>
          </div>
          <span className="text-[11px] font-mono uppercase text-emerald-600">Sincronizado</span>
        </div>
      )}

      {/* Two CMS Modules Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-3xl bg-bg-card border border-border-subtle shadow-card">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmsTab('invitation')}
            className={`py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              cmsTab === 'invitation'
                ? 'bg-primary text-primary-text shadow-soft'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. La Invitación Web</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                cmsTab === 'invitation' ? 'bg-white/20 text-primary-text' : 'bg-bg-secondary text-text-muted'
              }`}
            >
              9 Bloques
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCmsTab('save-the-date')}
            className={`py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              cmsTab === 'save-the-date'
                ? 'bg-amber-600 text-white shadow-soft'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. El Save the Date</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                cmsTab === 'save-the-date'
                  ? 'bg-white/25 text-white'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              }`}
            >
              Fotos &amp; WhatsApp
            </span>
          </button>
        </div>

        <div className="text-[11px] text-text-muted px-3 text-right hidden lg:block">
          {cmsTab === 'invitation'
            ? 'Gestionando la invitación digital completa con RSVP y programa'
            : 'Gestionando las fotos del Save the Date y texto predefinido para WhatsApp'}
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO ACTIVE TAB */}
      {cmsTab === 'save-the-date' ? (
        <SaveTheDateCMSEditor />
      ) : (
        <>
          {/* Save the Date Notice Card inside Invitation tab */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-bg-card to-amber-100/30 dark:from-amber-950/20 dark:via-bg-card dark:to-amber-900/10 border border-amber-200/70 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Experiencia Previa
                </span>
                <span className="text-xs font-mono text-text-muted">Save the Date</span>
              </div>
              <h2 className="font-serif font-bold text-text-primary text-base sm:text-lg">
                ¿Quieres personalizar las fotos del Save the Date o el texto de WhatsApp?
              </h2>
              <p className="text-xs text-text-secondary">
                Haz clic en la pestaña superior &ldquo;2. El Save the Date&rdquo; para cambiar cualquiera de sus 11 fotografías y configurar el mensaje prediseñado para compartir por WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCmsTab('save-the-date')}
              className="shrink-0 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-soft transition-colors cursor-pointer"
            >
              <span>Ir a Editor Save the Date →</span>
            </button>
          </div>

          {/* Sections Accordion List */}
          <div className="space-y-4">
            {sortedBlocks.map((block, index) => {
              const isExpanded = expandedBlockId === block.id;
              const meta = BLOCK_TYPE_LABELS[block.type] || {
            label: block.title,
            badge: block.type,
            description: 'Sección personalizable de la invitación',
            icon: <FileText className="w-4 h-4 text-text-accent" />,
          };

          return (
            <div
              key={block.id}
              className={`rounded-3xl bg-bg-card border transition-all shadow-card overflow-hidden ${
                block.is_active
                  ? isExpanded
                    ? 'border-text-accent ring-1 ring-text-accent/20'
                    : 'border-border-subtle hover:border-border-strong'
                  : 'border-border-subtle opacity-65 bg-bg-secondary/20'
              }`}
            >
              {/* Card Top Row */}
              <div
                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none hover:bg-bg-secondary/20 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Reorder Buttons */}
                  <div
                    className="flex flex-col gap-1 text-text-muted shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={(e) => moveBlock(index, 'up', e)}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-bg-secondary hover:text-text-primary disabled:opacity-25 cursor-pointer"
                      title="Subir sección"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => moveBlock(index, 'down', e)}
                      disabled={index === sortedBlocks.length - 1}
                      className="p-1 rounded-lg hover:bg-bg-secondary hover:text-text-primary disabled:opacity-25 cursor-pointer"
                      title="Bajar sección"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-bg-secondary text-text-accent border border-border-subtle font-semibold">
                        {meta.icon}
                        <span>{meta.badge}</span>
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                        {meta.label}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted">{meta.description}</p>
                  </div>
                </div>

                {/* Action Controls */}
                <div
                  className="flex items-center gap-2.5 self-end sm:self-center shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleActive(block.id, e)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      block.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-bg-secondary text-text-muted border border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {block.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Activo</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Oculto</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      isExpanded
                        ? 'bg-primary text-primary-text border-primary'
                        : 'bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary border-border-subtle'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Cerrar editor' : 'Editar textos'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* ============================================================
                  EXPANDED EDITOR PANEL FOR EACH SECTION
                 ============================================================ */}
              {isExpanded && (
                <div className="p-6 sm:p-8 border-t border-border-subtle bg-bg-secondary/15 space-y-6 animate-fade-in">
                  {/* 1. HERO & ENVELOPE EDITOR */}
                  {block.type === 'hero' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Nombres de los Novios (Título Principal)
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-text-accent"
                            placeholder="Rodrigo & Stephanie"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Fecha Corta en Portada
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-text-accent"
                            placeholder="28 · 08 · 2027"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Destacado del Lugar (Línea dorada)
                          </label>
                          <input
                            type="text"
                            value={block.content?.location_highlight || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'location_highlight', e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-text-accent"
                            placeholder="Boda en Bodega Concejo"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Población / Provincia
                          </label>
                          <input
                            type="text"
                            value={block.content?.location_detail || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'location_detail', e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-text-accent"
                            placeholder="Valoria la Buena · Valladolid"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Frase Romántica Principal (Sobre y Portada)
                        </label>
                        <textarea
                          rows={2}
                          value={block.content?.hero_message || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'hero_message', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-text-accent"
                          placeholder="Nos casamos y no nos imaginaríamos este día sin vosotros"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Etiqueta Superior Invitación
                          </label>
                          <input
                            type="text"
                            value={block.content?.hero_badge || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'hero_badge', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Texto Botón Confirmar
                          </label>
                          <input
                            type="text"
                            value={block.content?.cta_primary || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'cta_primary', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Texto Botón Programa
                          </label>
                          <input
                            type="text"
                            value={block.content?.cta_secondary || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'cta_secondary', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                          />
                        </div>
                      </div>

                      {/* Sobre de Apertura */}
                      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-accent">
                          Pantalla del Sobre de Apertura (Antes de abrir la invitación)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Día Grande
                            </label>
                            <input
                              type="text"
                              value={block.content?.envelope_day || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'envelope_day', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Mes y Año
                            </label>
                            <input
                              type="text"
                              value={block.content?.envelope_month_year || ''}
                              onChange={(e) =>
                                handleContentFieldChange(
                                  block,
                                  'envelope_month_year',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Subtítulo Bajo Nombres
                            </label>
                            <input
                              type="text"
                              value={block.content?.envelope_tagline || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'envelope_tagline', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Botón Abrir Invitación
                            </label>
                            <input
                              type="text"
                              value={block.content?.envelope_button || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'envelope_button', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. INTRO & CONCIERGE CARD EDITOR */}
                  {block.type === 'intro' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título General de Bienvenida (Web Pública)
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                          <p className="text-[11px] text-text-muted">
                            * En las invitaciones privadas se muestra automáticamente el nombre de la familia invitada.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título de la Tarjeta Derecha (Concierge)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={block.content?.concierge_title || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'concierge_title', e.target.value)
                              }
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                              placeholder="Concierge del Invitado"
                            />
                            <input
                              type="text"
                              value={block.content?.concierge_badge || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'concierge_badge', e.target.value)
                              }
                              className="w-32 px-3 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                              placeholder="Guía 2027"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Cita Principal de Bienvenida (Entre comillas)
                        </label>
                        <textarea
                          rows={2}
                          value={block.content?.welcome_quote || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'welcome_quote', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Párrafo Descriptivo de Bienvenida
                        </label>
                        <textarea
                          rows={3}
                          value={block.content?.welcome_body || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'welcome_body', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      {/* 3 puntos clave del Concierge */}
                      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-accent">
                          Puntos Clave de la Tarjeta Concierge (Fechas, Lugar y Banquete)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(block.content?.concierge_items || []).map(
                            (item: { title: string; subtitle: string }, i: number) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-bg-secondary/40 border border-border-subtle space-y-2"
                              >
                                <span className="text-[10px] font-mono uppercase text-text-muted font-semibold">
                                  Punto {i + 1}
                                </span>
                                <input
                                  type="text"
                                  value={item.title || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.concierge_items || [])];
                                    next[i] = { ...next[i], title: e.target.value };
                                    handleContentFieldChange(block, 'concierge_items', next);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-medium text-text-primary"
                                  placeholder="Título destacado"
                                />
                                <input
                                  type="text"
                                  value={item.subtitle || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.concierge_items || [])];
                                    next[i] = { ...next[i], subtitle: e.target.value };
                                    handleContentFieldChange(block, 'concierge_items', next);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-secondary"
                                  placeholder="Subtítulo"
                                />
                              </div>
                            )
                          )}
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className="text-[11px] font-medium text-text-muted block">
                            Nota al pie de la tarjeta Concierge
                          </label>
                          <input
                            type="text"
                            value={block.content?.concierge_footer || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'concierge_footer', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. NUESTRA HISTORIA EDITOR */}
                  {block.type === 'story' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título de la Sección
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Etiqueta Superior (Ej: 01 · NOSOTROS)
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Subtítulo Introductorio
                        </label>
                        <input
                          type="text"
                          value={block.content?.intro_text || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'intro_text', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      {/* Párrafos de la historia */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-text-primary">
                            Párrafos de Nuestra Historia
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const current = Array.isArray(block.content?.paragraphs)
                                ? block.content.paragraphs
                                : [];
                              handleContentFieldChange(block, 'paragraphs', [
                                ...current,
                                'Nuevo párrafo de vuestra historia...',
                              ]);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir párrafo</span>
                          </button>
                        </div>

                        {(block.content?.paragraphs || []).map((p: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <textarea
                              rows={2}
                              value={p}
                              onChange={(e) => {
                                const next = [...(block.content?.paragraphs || [])];
                                next[idx] = e.target.value;
                                handleContentFieldChange(block, 'paragraphs', next);
                              }}
                              className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = (block.content?.paragraphs || []).filter(
                                  (_: string, i: number) => i !== idx
                                );
                                handleContentFieldChange(block, 'paragraphs', next);
                              }}
                              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
                              title="Eliminar párrafo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. PROGRAMA DEL FIN DE SEMANA & EVENTOS EDITOR */}
                  {block.type === 'timeline' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título en Invitación Privada
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título en Web Pública
                          </label>
                          <input
                            type="text"
                            value={block.content?.public_title || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'public_title', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Etiqueta Superior
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Subtítulo Descriptivo del Programa
                        </label>
                        <input
                          type="text"
                          value={block.content?.description || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'description', e.target.value)
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      {/* Bloques descriptivos Viernes y Sábado */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-olive block">
                            Cabecera Parte 1 · Viernes (Preboda)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={block.content?.friday_tag || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'friday_tag', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                              placeholder="PARTE 1 · VIERNES 27 AGOSTO"
                            />
                            <input
                              type="text"
                              value={block.content?.friday_badge || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'friday_badge', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                              placeholder="Amigos · Exclusivo"
                            />
                          </div>
                          <input
                            type="text"
                            value={block.content?.friday_title || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'friday_title', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold text-text-primary"
                            placeholder="Preboda & Cata en la Bodega"
                          />
                          <textarea
                            rows={2}
                            value={block.content?.friday_description || ''}
                            onChange={(e) =>
                              handleContentFieldChange(
                                block,
                                'friday_description',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-secondary"
                          />
                        </div>

                        <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-accent block">
                            Cabecera Parte 2 · Sábado (El Gran Día)
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={block.content?.saturday_tag || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'saturday_tag', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                              placeholder="PARTE 2 · SÁBADO 28 AGOSTO"
                            />
                            <input
                              type="text"
                              value={block.content?.saturday_badge || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'saturday_badge', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                              placeholder="El Gran Día · Todos los Invitados"
                            />
                          </div>
                          <input
                            type="text"
                            value={block.content?.saturday_title || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'saturday_title', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold text-text-primary"
                            placeholder="Boda en Bodega Concejo"
                          />
                          <textarea
                            rows={2}
                            value={block.content?.saturday_description || ''}
                            onChange={(e) =>
                              handleContentFieldChange(
                                block,
                                'saturday_description',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-secondary"
                          />
                        </div>
                      </div>

                      {/* Tarjetas de cada evento */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                          Horarios y Detalles de Cada Evento (Preboda, Ceremonia, Banquete y Fiesta)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {events.map((evt) => (
                            <div
                              key={evt.id}
                              className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-3 shadow-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-bg-secondary text-text-accent font-semibold">
                                  {evt.day === 'friday' ? 'Viernes · Preboda' : 'Sábado · Boda'}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-text-muted">Hora:</span>
                                  <input
                                    type="time"
                                    value={getTimeFromISO(evt.start_time)}
                                    onChange={(e) =>
                                      updateEvent(evt.id, {
                                        start_time: updateTimeInISO(
                                          evt.start_time,
                                          e.target.value
                                        ),
                                      })
                                    }
                                    className="px-2 py-1 rounded-lg bg-bg-secondary/50 border border-border-subtle text-xs font-mono text-text-primary"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-text-muted block">
                                  Título del Evento
                                </label>
                                <input
                                  type="text"
                                  value={evt.title}
                                  onChange={(e) =>
                                    updateEvent(evt.id, { title: e.target.value })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs font-semibold text-text-primary"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[11px] font-medium text-text-muted block">
                                    Lugar / Zona
                                  </label>
                                  <input
                                    type="text"
                                    value={evt.location_name}
                                    onChange={(e) =>
                                      updateEvent(evt.id, { location_name: e.target.value })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-medium text-text-muted block">
                                    Código de Vestimenta
                                  </label>
                                  <input
                                    type="text"
                                    value={evt.dress_code || ''}
                                    onChange={(e) =>
                                      updateEvent(evt.id, { dress_code: e.target.value })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-text-muted block">
                                  Dirección
                                </label>
                                <input
                                  type="text"
                                  value={evt.address}
                                  onChange={(e) =>
                                    updateEvent(evt.id, { address: e.target.value })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs text-text-secondary"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-medium text-text-muted block">
                                  Descripción
                                </label>
                                <textarea
                                  rows={2}
                                  value={evt.description}
                                  onChange={(e) =>
                                    updateEvent(evt.id, { description: e.target.value })
                                  }
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs text-text-secondary"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. VENUE / EL LUGAR EDITOR */}
                  {block.type === 'venue' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título General (Guía del Invitado)
                          </label>
                          <input
                            type="text"
                            value={block.content?.section_title || 'Guía del Invitado'}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'section_title', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Nombre del Enclave / Finca
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Etiqueta sobre la Foto
                          </label>
                          <input
                            type="text"
                            value={block.content?.venue_badge || 'El Enclave'}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'venue_badge', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Subtítulo de la Guía del Invitado
                        </label>
                        <input
                          type="text"
                          value={block.content?.section_subtitle || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'section_subtitle', e.target.value)
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Descripción de la Bodega / Lugar de Celebración
                        </label>
                        <textarea
                          rows={3}
                          value={block.content?.description || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'description', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Dirección Postal
                          </label>
                          <input
                            type="text"
                            value={block.content?.address || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'address', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Enlace de Google Maps (Cómo llegar)
                          </label>
                          <input
                            type="text"
                            value={block.content?.google_maps_url || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'google_maps_url', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. ALOJAMIENTO & AUTOBUSES EDITOR */}
                  {block.type === 'travel' && (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Título del Apartado de Transporte y Hoteles
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Información de Autobuses y Traslados
                        </label>
                        <textarea
                          rows={2}
                          value={block.content?.bus_info || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'bus_info', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-text-primary">
                            Hoteles Recomendados
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const current = Array.isArray(block.content?.hotels)
                                ? block.content.hotels
                                : [];
                              handleContentFieldChange(block, 'hotels', [
                                ...current,
                                {
                                  name: 'Nuevo Hotel Recomendado',
                                  discount: 'Código o detalle',
                                  distance: 'A 20 min',
                                },
                              ]);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Añadir hotel</span>
                          </button>
                        </div>

                        {(block.content?.hotels || []).map(
                          (
                            hotel: { name: string; discount: string; distance: string },
                            idx: number
                          ) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-bg-card border border-border-subtle grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                            >
                              <div className="sm:col-span-4">
                                <input
                                  type="text"
                                  value={hotel.name || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.hotels || [])];
                                    next[idx] = { ...next[idx], name: e.target.value };
                                    handleContentFieldChange(block, 'hotels', next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold text-text-primary"
                                  placeholder="Nombre del hotel"
                                />
                              </div>
                              <div className="sm:col-span-5">
                                <input
                                  type="text"
                                  value={hotel.discount || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.hotels || [])];
                                    next[idx] = { ...next[idx], discount: e.target.value };
                                    handleContentFieldChange(block, 'hotels', next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                                  placeholder="Tarifa / Descuento / Detalle"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={hotel.distance || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.hotels || [])];
                                    next[idx] = { ...next[idx], distance: e.target.value };
                                    handleContentFieldChange(block, 'hotels', next);
                                  }}
                                  className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-muted"
                                  placeholder="Distancia"
                                />
                              </div>
                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (block.content?.hotels || []).filter(
                                      (_: any, i: number) => i !== idx
                                    );
                                    handleContentFieldChange(block, 'hotels', next);
                                  }}
                                  className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                                  title="Eliminar hotel"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 7. LISTA DE BODAS / REGISTRY EDITOR */}
                  {block.type === 'registry' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título de la Sección (Ej: Lista de Bodas)
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Titular de la Cuenta
                          </label>
                          <input
                            type="text"
                            value={block.content?.account_holder || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'account_holder', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Mensaje de Agradecimiento
                        </label>
                        <textarea
                          rows={2}
                          value={block.content?.message || ''}
                          onChange={(e) =>
                            handleContentFieldChange(block, 'message', e.target.value)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Número de Cuenta IBAN
                          </label>
                          <input
                            type="text"
                            value={block.content?.iban || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'iban', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm font-mono text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Nombre del Banco
                          </label>
                          <input
                            type="text"
                            value={block.content?.bank_name || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'bank_name', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8. PREGUNTAS FRECUENTES (FAQ) EDITOR */}
                  {block.type === 'faq' && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título del Bloque de Preguntas
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full max-w-md px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const current = Array.isArray(block.content?.faqs)
                              ? block.content.faqs
                              : [];
                            handleContentFieldChange(block, 'faqs', [
                              ...current,
                              {
                                question: '¿Nueva pregunta para los invitados?',
                                answer: 'Escribe aquí la respuesta...',
                              },
                            ]);
                          }}
                          className="py-2 px-3.5 rounded-xl bg-primary text-primary-text text-xs font-medium flex items-center gap-1.5 cursor-pointer self-end"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir pregunta</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(block.content?.faqs || []).map(
                          (faq: { question: string; answer: string }, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  value={faq.question || ''}
                                  onChange={(e) => {
                                    const next = [...(block.content?.faqs || [])];
                                    next[idx] = { ...next[idx], question: e.target.value };
                                    handleContentFieldChange(block, 'faqs', next);
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold text-text-primary"
                                  placeholder="Pregunta frecuente"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (block.content?.faqs || []).filter(
                                      (_: any, i: number) => i !== idx
                                    );
                                    handleContentFieldChange(block, 'faqs', next);
                                  }}
                                  className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer shrink-0"
                                  title="Eliminar pregunta"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                rows={2}
                                value={faq.answer || ''}
                                onChange={(e) => {
                                  const next = [...(block.content?.faqs || [])];
                                  next[idx] = { ...next[idx], answer: e.target.value };
                                  handleContentFieldChange(block, 'faqs', next);
                                }}
                                className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-secondary"
                                placeholder="Respuesta..."
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 9. MEMORIAS & PIE DE PÁGINA EDITOR */}
                  {block.type === 'contact' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Título de Memorias y Libro de Firmas
                          </label>
                          <input
                            type="text"
                            value={block.content?.memories_title || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'memories_title', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-text-primary block">
                            Etiqueta Superior de Memorias
                          </label>
                          <input
                            type="text"
                            value={block.content?.memories_badge || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'memories_badge', e.target.value)
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-primary block">
                          Descripción del Libro de Firmas y Galería
                        </label>
                        <textarea
                          rows={2}
                          value={block.content?.memories_description || ''}
                          onChange={(e) =>
                            handleContentFieldChange(
                              block,
                              'memories_description',
                              e.target.value
                            )
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary"
                        />
                      </div>

                      <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-accent">
                          Pie de Página (Final de la Invitación)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Monograma / Iniciales
                            </label>
                            <input
                              type="text"
                              value={block.content?.footer_monogram || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'footer_monogram', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Nombres en el Pie
                            </label>
                            <input
                              type="text"
                              value={block.content?.footer_names || ''}
                              onChange={(e) =>
                                handleContentFieldChange(block, 'footer_names', e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-text-muted block">
                              Fecha y Ubicación en el Pie
                            </label>
                            <input
                              type="text"
                              value={block.content?.footer_date_location || ''}
                              onChange={(e) =>
                                handleContentFieldChange(
                                  block,
                                  'footer_date_location',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-text-muted block">
                            Frase Final de Despedida
                          </label>
                          <input
                            type="text"
                            value={block.content?.footer_quote || ''}
                            onChange={(e) =>
                              handleContentFieldChange(block, 'footer_quote', e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button Footer inside Expanded Card */}
                  <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-text-muted">
                      Los cambios se aplican en tiempo real en todas las invitaciones.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerSavedBanner();
                          setExpandedBlockId(null);
                        }}
                        className="py-2 px-5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar y Cerrar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}
    </div>
  );
}
