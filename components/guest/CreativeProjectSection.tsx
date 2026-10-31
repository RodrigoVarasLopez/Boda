'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCreativeProjectStore } from '@/lib/creative-project-store';
import {
  Palette,
  Sparkles,
  Flower2,
  Layers,
  LayoutGrid,
  FileText,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const CreativeProjectSection: React.FC = () => {
  const { dossier, stats } = useCreativeProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const dossierIncludedList = [
    'Explicación del concepto creativo.',
    'Moodboard e identidad visual.',
    'Paleta cromática.',
    'Selección de materiales, texturas y estilo floral.',
    'Propuesta individual de ceremonia.',
    'Propuesta individual de bienvenida y cóctel.',
    'Propuesta individual de banquete.',
    'Composiciones y referencias decorativas.',
    'Diseño conceptual de hasta tres rincones especiales.',
    'Esquemas orientativos de distribución cuando sean necesarios.',
    'Identidad gráfica y diseño de toda la papelería acordada.',
    'Recomendaciones para mantener la coherencia visual.',
    'Orientación sobre los elementos decorativos que conviene priorizar según vuestro presupuesto.',
  ];

  return (
    <div className="pt-6">
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-10 space-y-6 relative overflow-hidden">
        {/* Header & Description */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest">
              <Palette className="w-3.5 h-3.5" />
              <span>Dossier Digital Personalizado · Dirección de Arte</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-normal text-text-primary leading-tight">
              Presentación de vuestro proyecto creativo
            </h3>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Todas nuestras propuestas se recogerán en un dossier digital personalizado.{' '}
              <strong className="text-text-primary font-semibold">
                No será simplemente una recopilación de imágenes bonitas
              </strong>
              , sino un proyecto creado para que podáis visualizar vuestra boda y comprender cómo
              llevar cada idea a la realidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="py-2.5 px-4 rounded-2xl bg-bg-secondary hover:bg-border-subtle/60 border border-border-subtle text-text-primary text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Ocultar vista previa del dossier' : 'Ver vista previa del dossier'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <Link
              href="/admin/creative-project"
              className="py-2.5 px-4 rounded-2xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft transition-colors"
            >
              <span>Abrir Dossier Digital Completo</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* "Vuestro dossier incluirá:" 13 items grid */}
        <div className="p-5 sm:p-6 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="font-serif text-xl text-text-primary font-medium">
              Vuestro dossier incluirá:
            </h4>
            <span className="text-xs font-mono text-brand-olive font-semibold">
              {stats.approvedCount}/{stats.totalDeliverables} propuestas validadas ({stats.approvalPercent}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {dossierIncludedList.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-bg-card border border-border-subtle/80 flex items-start gap-2.5 text-xs text-text-primary shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-snug font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette Strip Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {dossier.color_palette.map((col) => (
            <div
              key={col.id}
              className="p-3 rounded-2xl bg-bg-secondary/30 border border-border-subtle flex items-center gap-3"
            >
              <div
                style={{ backgroundColor: col.hex }}
                className="w-9 h-9 rounded-xl border border-border-strong shrink-0 shadow-2xs"
              />
              <div className="min-w-0">
                <p className="text-xs font-serif font-medium text-text-primary truncate">
                  {col.name}
                </p>
                <span className="text-[10px] font-mono text-text-muted block">
                  {col.hex} · {col.role.split('(')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Interactive Dossier Preview */}
        {isExpanded && (
          <div className="pt-6 border-t border-border-subtle space-y-6 animate-fade-in">
            {/* Concept Summary */}
            <div className="p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Concepto Rector · {dossier.project_title}
              </span>
              <h5 className="font-serif text-xl text-text-primary italic">
                &ldquo;{dossier.concept.title}&rdquo;
              </h5>
              <p className="text-xs text-text-secondary leading-relaxed">
                {dossier.concept.narrative}
              </p>
            </div>

            {/* 3 Space Proposals Preview */}
            <div className="space-y-3">
              <h5 className="font-serif text-xl text-text-primary">
                Propuestas por Escenario: Ceremonia, Cóctel y Banquete
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dossier.space_proposals.map((sp) => (
                  <div
                    key={sp.id}
                    className="rounded-2xl bg-bg-secondary/25 border border-border-subtle overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 w-full">
                        <Image
                          src={sp.image_url}
                          alt={sp.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 350px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <span className="text-[10px] font-mono text-brand-sand flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{sp.location}</span>
                          </span>
                          <p className="font-serif text-base font-medium">{sp.title}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {sp.atmosphere_summary}
                        </p>
                      </div>
                    </div>
                    <div className="px-4 pb-3 pt-2 border-t border-border-subtle/60 text-[11px] text-brand-olive font-medium">
                      ✦ {sp.reusable_tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Special Corners Preview */}
            <div className="space-y-3">
              <h5 className="font-serif text-xl text-text-primary">
                Diseño Conceptual de Tres Rincones Especiales
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dossier.special_corners.map((corner) => (
                  <div
                    key={corner.id}
                    className="p-4 rounded-2xl bg-bg-secondary/25 border border-border-subtle space-y-2"
                  >
                    <span className="text-[10px] font-mono uppercase text-primary font-semibold block">
                      Rincón 0{corner.corner_number} · {corner.location_moment}
                    </span>
                    <h6 className="font-serif text-lg text-text-primary font-medium">
                      {corner.title}
                    </h6>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {corner.concept_description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
