'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCreativeProjectStore } from '@/lib/creative-project-store';
import {
  ProposalApprovalStatus,
  APPROVAL_STATUS_LABELS,
} from '@/lib/creative-project-data';
import { formatCurrency } from '@/lib/budget-data';
import {
  Sparkles,
  Palette,
  Flower2,
  Compass,
  Layers,
  LayoutGrid,
  FileText,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Printer,
  RotateCcw,
  Edit3,
  Plus,
  MapPin,
  Lightbulb,
  Recycle,
  Check,
  XCircle,
  Eye,
  ArrowUpRight,
} from 'lucide-react';

type DossierTab =
  | 'all'
  | 'concept_moodboard'
  | 'palette_materials'
  | 'spaces'
  | 'corners_compositions'
  | 'layouts_stationery'
  | 'coherence_budget';

export default function AdminCreativeProjectPage() {
  const {
    isLoaded,
    dossier,
    stats,
    updateConcept,
    updateSpaceProposalStatus,
    updateCornerStatus,
    updateStationeryStatus,
    addStationeryPiece,
    updateColorSwatch,
    resetCreativeDossier,
  } = useCreativeProjectStore();

  const [activeTab, setActiveTab] = useState<DossierTab>('all');
  const [editingConcept, setEditingConcept] = useState(false);
  const [conceptTitle, setConceptTitle] = useState('');
  const [conceptTagline, setConceptTagline] = useState('');
  const [conceptNarrative, setConceptNarrative] = useState('');
  const [conceptReality, setConceptReality] = useState('');

  // Quick add stationery state
  const [newPieceName, setNewPieceName] = useState('');
  const [newPieceMoment, setNewPieceMoment] = useState('');
  const [newPieceFormat, setNewPieceFormat] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartEditConcept = () => {
    setConceptTitle(dossier.concept.title);
    setConceptTagline(dossier.concept.tagline);
    setConceptNarrative(dossier.concept.narrative);
    setConceptReality(dossier.concept.how_to_bring_to_reality);
    setEditingConcept(true);
  };

  const handleSaveConcept = (e: React.FormEvent) => {
    e.preventDefault();
    updateConcept({
      title: conceptTitle.trim() || dossier.concept.title,
      tagline: conceptTagline.trim() || dossier.concept.tagline,
      narrative: conceptNarrative.trim() || dossier.concept.narrative,
      how_to_bring_to_reality:
        conceptReality.trim() || dossier.concept.how_to_bring_to_reality,
    });
    setEditingConcept(false);
    showToast('Concepto creativo actualizado en el dossier');
  };

  const handleAddStationery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPieceName.trim()) return;
    addStationeryPiece({
      piece_name: newPieceName.trim(),
      moment: newPieceMoment.trim() || 'Jornada de la boda',
      format_and_paper:
        newPieceFormat.trim() || 'Papel algodón 300g a juego con la colección',
      finish_details: 'Tipografía y monograma oficial R&S',
      status: 'in_review',
    });
    setNewPieceName('');
    setNewPieceMoment('');
    setNewPieceFormat('');
    showToast('Pieza añadida al plan de papelería acordada');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">
            Cargando dossier digital de vuestro proyecto creativo...
          </p>
        </div>
      </div>
    );
  }

  const showSection = (tabGroup: DossierTab) =>
    activeTab === 'all' || activeTab === tabGroup;

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-fade-in border border-neutral-700 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER & DOSSIER INDEX */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest">
              <Palette className="w-3.5 h-3.5" />
              <span>Dossier Digital Personalizado · Dirección de Arte</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal tracking-tight">
              Presentación de vuestro proyecto creativo
            </h1>

            <p className="text-sm text-text-secondary leading-relaxed">
              Todas nuestras propuestas se recogerán en un dossier digital personalizado.{' '}
              <strong className="font-semibold text-text-primary">
                No será simplemente una recopilación de imágenes bonitas
              </strong>
              , sino un proyecto creado para que podáis visualizar vuestra boda y comprender cómo
              llevar cada idea a la realidad.
            </p>
          </div>

          {/* Global Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold inline-flex items-center gap-2 shadow-soft transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar Dossier PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    '¿Restaurar el dossier creativo a su versión base oficial?'
                  )
                ) {
                  resetCreativeDossier();
                  showToast('Dossier restaurado a la versión original');
                }
              }}
              className="p-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Restaurar dossier por defecto"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 13 INCLUDED PILLARS CHECKLIST BADGES */}
        <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
              Contenido Integral de Vuestro Dossier (13 Apartados Técnicos y Estéticos):
            </span>
            <span className="text-xs text-text-muted">
              Propuestas validadas:{' '}
              <strong className="text-brand-olive">
                {stats.approvedCount}/{stats.totalDeliverables} ({stats.approvalPercent}%)
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {[
              '1. Explicación del concepto creativo',
              '2. Moodboard e identidad visual',
              '3. Paleta cromática',
              '4. Selección de materiales, texturas y estilo floral',
              '5. Propuesta individual de ceremonia',
              '6. Propuesta individual de bienvenida y cóctel',
              '7. Propuesta individual de banquete',
              '8. Composiciones y referencias decorativas',
              '9. Diseño conceptual de hasta tres rincones especiales',
              '10. Esquemas orientativos de distribución',
              '11. Identidad gráfica y diseño de toda la papelería acordada',
              '12. Recomendaciones para mantener la coherencia visual',
              '13. Orientación sobre elementos decorativos a priorizar según presupuesto',
            ].map((item) => (
              <div
                key={item}
                className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle/80 flex items-center gap-2 text-text-primary"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                <span className="text-[11px] font-medium leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION FILTER TABS */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 print:hidden">
          {[
            { id: 'all', label: 'Dossier Completo (13 apartados)' },
            { id: 'concept_moodboard', label: '1-2. Concepto & Moodboard' },
            { id: 'palette_materials', label: '3-4. Paleta, Texturas & Flores' },
            { id: 'spaces', label: '5-7. Ceremonia, Cóctel & Banquete' },
            { id: 'corners_compositions', label: '8-9. Composiciones & 3 Rincones' },
            { id: 'layouts_stationery', label: '10-11. Esquemas & Papelería' },
            { id: 'coherence_budget', label: '12-13. Coherencia & Prioridades Presupuesto' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DossierTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-text border-primary shadow-xs'
                  : 'bg-bg-secondary/50 text-text-secondary border-border-subtle hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SECCIONES 1 Y 2: CONCEPTO CREATIVO + MOODBOARD E IDENTIDAD VISUAL
         ===================================================================== */}
      {showSection('concept_moodboard') && (
        <div className="space-y-6">
          {/* 1. Explicación del concepto creativo */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 01 · Hilo Conductor &amp; Narrativa
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Explicación del concepto creativo
                </h2>
              </div>
              {!editingConcept && (
                <button
                  type="button"
                  onClick={handleStartEditConcept}
                  className="px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-secondary/50 hover:bg-bg-secondary text-xs font-semibold text-text-primary inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  <span>Personalizar concepto</span>
                </button>
              )}
            </div>

            {editingConcept ? (
              <form
                onSubmit={handleSaveConcept}
                className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                    Título del Concepto Creativo
                  </label>
                  <input
                    type="text"
                    value={conceptTitle}
                    onChange={(e) => setConceptTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                    Subtítulo / Lema Conceptual
                  </label>
                  <input
                    type="text"
                    value={conceptTagline}
                    onChange={(e) => setConceptTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                    Explicación del Concepto
                  </label>
                  <textarea
                    rows={3}
                    value={conceptNarrative}
                    onChange={(e) => setConceptNarrative(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                    Cómo llevamos la idea a la realidad técnica
                  </label>
                  <textarea
                    rows={2}
                    value={conceptReality}
                    onChange={(e) => setConceptReality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingConcept(false)}
                    className="px-3.5 py-2 rounded-xl border border-border-subtle bg-bg-card text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Guardar Concepto
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl text-primary italic">
                    &ldquo;{dossier.concept.title}&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-text-primary">
                    {dossier.concept.tagline}
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {dossier.concept.narrative}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {dossier.concept.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-3 py-1 rounded-full bg-bg-secondary border border-border-subtle text-[11px] font-medium text-text-primary"
                      >
                        ✦ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-olive">
                    <Compass className="w-4 h-4" />
                    <span>De la Idea a la Realidad Técnica</span>
                  </div>
                  <p className="text-xs text-text-primary leading-relaxed">
                    {dossier.concept.how_to_bring_to_reality}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Moodboard e identidad visual */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 02 · Atmósfera &amp; Dirección de Arte
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Moodboard e identidad visual
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Cada imagen de referencia va acompañada de su traducción técnica real en la iglesia y en Bodega Concejo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dossier.moodboard.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-bg-secondary/30 border border-border-subtle overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 380px"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/65 text-white backdrop-blur-xs text-[10px] font-semibold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-serif text-lg text-text-primary font-medium">
                        {item.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-border-subtle/60">
                    <p className="text-[11px] text-primary font-medium leading-snug">
                      <strong>Cómo lo haremos realidad:</strong> {item.execution_note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIONES 3 Y 4: PALETA CROMÁTICA + MATERIALES, TEXTURAS Y FLORES
         ===================================================================== */}
      {showSection('palette_materials') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 3. Paleta Cromática */}
          <div className="lg:col-span-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 03 · Armonía de Color
              </span>
              <h2 className="font-serif text-2xl text-text-primary mt-0.5">
                Paleta cromática
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Proporción cromática estudiada para mantener calidez y luz natural. Puedes ajustar cualquier tono haciendo clic en su muestra:
              </p>
            </div>

            <div className="space-y-3">
              {dossier.color_palette.map((swatch) => (
                <div
                  key={swatch.id}
                  className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle flex items-start gap-3.5"
                >
                  <label className="relative cursor-pointer shrink-0" title="Cambiar tono HEX">
                    <div
                      style={{ backgroundColor: swatch.hex }}
                      className="w-12 h-12 rounded-2xl border border-border-strong shadow-xs"
                    />
                    <input
                      type="color"
                      value={swatch.hex}
                      onChange={(e) => {
                        updateColorSwatch(swatch.id, { hex: e.target.value.toUpperCase() });
                        showToast(`Color ${swatch.name} actualizado`);
                      }}
                      className="sr-only"
                    />
                  </label>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif text-base font-medium text-text-primary">
                        {swatch.name}
                      </h4>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg-card border border-border-subtle text-text-secondary">
                        {swatch.hex}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block">
                      {swatch.role}
                    </span>
                    <p className="text-xs text-text-secondary leading-snug">{swatch.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Selección de materiales, texturas y estilo floral */}
          <div className="lg:col-span-7 rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-7 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-olive font-semibold block">
                Apartado 04 · Tacto, Materia &amp; Botánica
              </span>
              <h2 className="font-serif text-2xl text-text-primary mt-0.5">
                Selección de materiales, texturas y estilo floral
              </h2>
            </div>

            {/* Materiales y Texturas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Materiales y Texturas Principales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossier.materials_and_florals.materials_list.map((mat) => (
                  <div
                    key={mat.name}
                    className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-1"
                  >
                    <p className="font-serif text-base font-medium text-text-primary">
                      {mat.name}
                    </p>
                    <p className="text-[11px] text-primary font-medium">{mat.texture}</p>
                    <p className="text-xs text-text-secondary leading-snug">
                      {mat.application}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estilo Floral */}
            <div className="p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-3">
              <div className="flex items-center gap-2 text-brand-olive font-bold text-xs uppercase tracking-wider">
                <Flower2 className="w-4 h-4" />
                <span>{dossier.materials_and_florals.floral_style_title}</span>
              </div>
              <p className="text-xs text-text-primary leading-relaxed">
                {dossier.materials_and_florals.floral_style_description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-olive font-semibold block mb-1.5">
                    Flores Protagonistas
                  </span>
                  <ul className="space-y-1 text-xs text-text-primary">
                    {dossier.materials_and_florals.primary_blooms.map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <span className="text-brand-olive">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-olive font-semibold block mb-1.5">
                    Verdes, Ramas y Acentos
                  </span>
                  <ul className="space-y-1 text-xs text-text-primary">
                    {dossier.materials_and_florals.foliage_and_accents.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <span className="text-brand-olive">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-olive/20 text-xs text-text-secondary">
                <strong className="text-text-primary">Recipientes y jarrones: </strong>
                {dossier.materials_and_florals.vessels_style}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIONES 5, 6 Y 7: PROPUESTAS DE CEREMONIA, CÓCTEL Y BANQUETE
         ===================================================================== */}
      {showSection('spaces') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartados 05, 06 y 07 · Escenografía por Escenarios
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Propuestas individuales: Ceremonia, Bienvenida &amp; Cóctel y Banquete
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {dossier.space_proposals.map((prop, index) => (
              <div
                key={prop.id}
                className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Left Image Column */}
                <div className="lg:col-span-4 relative min-h-[260px] lg:min-h-full">
                  <Image
                    src={prop.image_url}
                    alt={prop.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/65 text-white text-[10px] font-mono uppercase tracking-widest font-semibold">
                      Apartado 0{index + 5}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <p className="text-xs font-mono text-brand-sand flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{prop.location}</span>
                    </p>
                    <h3 className="font-serif text-2xl font-normal">{prop.title}</h3>
                    <p className="text-xs text-white/85">{prop.subtitle}</p>
                  </div>
                </div>

                {/* Right Details Column */}
                <div className="lg:col-span-8 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                      <p className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed max-w-2xl">
                        {prop.atmosphere_summary}
                      </p>

                      <select
                        value={prop.status}
                        onChange={(e) => {
                          updateSpaceProposalStatus(
                            prop.id,
                            e.target.value as ProposalApprovalStatus
                          );
                          showToast(`Estado de "${prop.title}" actualizado`);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer shrink-0 print:hidden ${
                          prop.status === 'approved'
                            ? 'bg-brand-olive/15 text-brand-olive border-brand-olive/30'
                            : prop.status === 'in_review'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-bg-secondary text-text-secondary border-border-subtle'
                        }`}
                      >
                        {Object.entries(APPROVAL_STATUS_LABELS).map(([k, label]) => (
                          <option key={k} value={k}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Key Interventions */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold block">
                        Intervenciones Decorativas y Puntos Focales:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {prop.key_interventions.map((interv, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-bg-secondary/35 border border-border-subtle text-xs text-text-primary leading-relaxed"
                          >
                            {interv}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lighting, Execution & Reusable Tip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border-subtle text-xs">
                    <div className="p-3 rounded-xl bg-bg-secondary/25 border border-border-subtle">
                      <span className="font-semibold text-text-primary flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        Iluminación y Ambiente
                      </span>
                      <p className="text-[11px] text-text-secondary leading-snug">
                        {prop.lighting_and_ambience}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-bg-secondary/25 border border-border-subtle">
                      <span className="font-semibold text-text-primary flex items-center gap-1.5 mb-1">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        Producción Técnica
                      </span>
                      <p className="text-[11px] text-text-secondary leading-snug">
                        {prop.technical_execution}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-brand-olive/10 border border-brand-olive/30">
                      <span className="font-semibold text-brand-olive flex items-center gap-1.5 mb-1">
                        <Recycle className="w-3.5 h-3.5" />
                        Optimización &amp; Reutilización
                      </span>
                      <p className="text-[11px] text-text-primary leading-snug">
                        {prop.reusable_tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIONES 8 Y 9: COMPOSICIONES DECORATIVAS + 3 RINCONES ESPECIALES
         ===================================================================== */}
      {showSection('corners_compositions') && (
        <div className="space-y-8">
          {/* 8. Composiciones y referencias decorativas */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 08 · Fichas Técnicas de Floristería y Escenografía
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Composiciones y referencias decorativas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dossier.compositions.map((comp) => (
                <div
                  key={comp.id}
                  className="p-5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold">
                      {comp.zone}
                    </span>
                    <h3 className="font-serif text-lg text-text-primary font-medium">
                      {comp.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <strong>Composición botánica:</strong> {comp.flowers_and_greenery}
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <strong>Base y elementos:</strong> {comp.vessels_and_props}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-subtle/70 space-y-1 text-[11px]">
                    <p className="text-text-primary">
                      <strong>Dimensiones:</strong> {comp.dimensions_and_height}
                    </p>
                    <p className="text-brand-olive font-semibold">
                      Dotación estimada: {comp.quantity_estimate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Diseño conceptual de hasta tres rincones especiales */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 09 · Experiencias &amp; Rincones con Alma
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Diseño conceptual de hasta tres rincones especiales
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Tres instalaciones pensadas tanto por su estética editorial como por su utilidad real para los invitados durante la jornada.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {dossier.special_corners.map((corner) => (
                <div
                  key={corner.id}
                  className="rounded-2xl bg-bg-secondary/30 border border-border-subtle overflow-hidden flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="relative h-48 w-full">
                      <Image
                        src={corner.image_url}
                        alt={corner.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 380px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-mono font-semibold">
                          Rincón Especial 0{corner.corner_number}
                        </span>
                        <select
                          value={corner.status}
                          onChange={(e) => {
                            updateCornerStatus(
                              corner.id,
                              e.target.value as ProposalApprovalStatus
                            );
                            showToast(`Estado del Rincón ${corner.corner_number} actualizado`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/90 text-neutral-900 text-[10px] font-semibold cursor-pointer print:hidden"
                        >
                          {Object.entries(APPROVAL_STATUS_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-[10px] text-brand-sand font-mono">
                          {corner.location_moment}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-serif text-xl text-text-primary font-normal">
                        {corner.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {corner.concept_description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block">
                          Elementos que componen el rincón:
                        </span>
                        <ul className="space-y-1 text-xs text-text-primary">
                          {corner.elements_included.map((el, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 mt-0.5" />
                              <span>{el}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-bg-card border-t border-border-subtle text-[11px] text-text-secondary">
                    <strong className="text-text-primary">Objetivo funcional: </strong>
                    {corner.functional_goal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIONES 10 Y 11: ESQUEMAS DE DISTRIBUCIÓN + PAPELERÍA ACORDADA
         ===================================================================== */}
      {showSection('layouts_stationery') && (
        <div className="space-y-8">
          {/* 10. Esquemas orientativos de distribución */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 10 · Planimetría Conceptual &amp; Flujos de Paso
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Esquemas orientativos de distribución
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Zonificación espacial de cada escenario para garantizar perspectivas limpias en fotografía y evitar aglomeraciones de invitados.
              </p>
            </div>

            <div className="space-y-5">
              {dossier.layout_schemas.map((schema) => (
                <div
                  key={schema.id}
                  className="p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div>
                      <h3 className="font-serif text-xl text-text-primary font-medium flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-primary" />
                        <span>{schema.space_name}</span>
                      </h3>
                      <p className="text-xs text-text-muted">{schema.subtitle}</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                      Clave técnica: {schema.orientation_note}
                    </span>
                  </div>

                  {/* Interactive Architectural Flow Diagram */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {schema.zones.map((z, idx) => (
                      <div
                        key={z.id}
                        className="p-4 rounded-2xl bg-bg-card border border-border-subtle relative space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary font-mono text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-text-accent font-semibold">
                            {z.position_label}
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-medium text-text-primary">
                          {z.name}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {z.description}
                        </p>
                        <p className="text-[11px] text-brand-olive font-medium pt-1 border-t border-border-subtle/60">
                          Flujo: {z.flow_note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 11. Identidad gráfica y diseño de toda la papelería acordada */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 11 · Dirección Gráfica &amp; Piezas Impresas
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Identidad gráfica y diseño de toda la papelería acordada
              </h2>
            </div>

            {/* Graphic Identity Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-semibold">
                  Monograma &amp; Sello
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {dossier.stationery.monogram_concept}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-semibold">
                  Tipografía Principal (Serif)
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {dossier.stationery.typography_serif}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-semibold">
                  Tipografía Secundaria (Sans)
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {dossier.stationery.typography_sans}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-semibold">
                  Soporte, Papel y Lacres
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {dossier.stationery.paper_and_seals}
                </p>
              </div>
            </div>

            {/* Agreed Stationery Pieces Table/Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Desglose de Piezas de Papelería Acordadas ({dossier.stationery.pieces.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dossier.stationery.pieces.map((piece) => (
                  <div
                    key={piece.id}
                    className="p-4 rounded-2xl bg-bg-secondary/25 border border-border-subtle flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-text-accent font-semibold block">
                            {piece.moment}
                          </span>
                          <h4 className="font-serif text-lg text-text-primary font-medium">
                            {piece.piece_name}
                          </h4>
                        </div>

                        <select
                          value={piece.status}
                          onChange={(e) => {
                            updateStationeryStatus(
                              piece.id,
                              e.target.value as ProposalApprovalStatus
                            );
                            showToast(`Estado de "${piece.piece_name}" actualizado`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer shrink-0 print:hidden ${
                            piece.status === 'approved'
                              ? 'bg-brand-olive/15 text-brand-olive border-brand-olive/30'
                              : piece.status === 'in_review'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-bg-card text-text-secondary border-border-subtle'
                          }`}
                        >
                          {Object.entries(APPROVAL_STATUS_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="text-xs text-text-secondary">
                        <strong>Formato y soporte:</strong> {piece.format_and_paper}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        <strong>Acabado:</strong> {piece.finish_details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Add Stationery Piece */}
              <form
                onSubmit={handleAddStationery}
                className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle flex flex-col sm:flex-row gap-2 print:hidden"
              >
                <input
                  type="text"
                  placeholder="+ Añadir nueva pieza de papelería (ej. Tarjeta de agradecimiento, Cartel Cigar Bar...)"
                  value={newPieceName}
                  onChange={(e) => setNewPieceName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
                <input
                  type="text"
                  placeholder="Momento (ej. Banquete)"
                  value={newPieceMoment}
                  onChange={(e) => setNewPieceMoment(e.target.value)}
                  className="sm:w-44 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
                <input
                  type="text"
                  placeholder="Formato / Papel"
                  value={newPieceFormat}
                  onChange={(e) => setNewPieceFormat(e.target.value)}
                  className="sm:w-56 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir pieza</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECCIONES 12 Y 13: COHERENCIA VISUAL + PRIORIZACIÓN SEGÚN PRESUPUESTO
         ===================================================================== */}
      {showSection('coherence_budget') && (
        <div className="space-y-8">
          {/* 12. Recomendaciones para mantener la coherencia visual */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                Apartado 12 · Manual de Dirección Artística
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                Recomendaciones para mantener la coherencia visual
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dossier.coherence_guidelines.golden_rules.map((rule) => (
                <div
                  key={rule.title}
                  className="p-4 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-1.5"
                >
                  <h3 className="font-serif text-lg text-text-primary font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span>{rule.title}</span>
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Qué SÍ potenciar para mantener la armonía</span>
                </span>
                <ul className="space-y-2 text-xs text-text-primary">
                  {dossier.coherence_guidelines.dos.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Qué evitar para no romper la estética</span>
                </span>
                <ul className="space-y-2 text-xs text-rose-950">
                  {dossier.coherence_guidelines.donts.map((dn, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">×</span>
                      <span>{dn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 13. Orientación sobre los elementos decorativos que conviene priorizar según vuestro presupuesto */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-semibold block">
                  Apartado 13 · Inversión Inteligente &amp; Retorno Visual
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Orientación sobre los elementos decorativos que conviene priorizar según vuestro presupuesto
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Matriz de impacto fotográfico y emocional para invertir donde realmente transforma la experiencia y optimizar mediante reutilización.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-bg-secondary/50 border border-border-subtle flex items-center gap-4 shrink-0">
                <div>
                  <span className="text-[10px] font-mono uppercase text-text-muted block">
                    Partidas Decorativas en Presupuesto
                  </span>
                  <p className="font-serif text-xl text-text-primary font-semibold">
                    {stats.totalDecoBudget > 0
                      ? formatCurrency(stats.totalDecoBudget)
                      : 'Ver en Presupuesto'}
                  </p>
                </div>
                <Link
                  href="/admin/budget"
                  className="px-3 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover inline-flex items-center gap-1 print:hidden"
                >
                  <span>Ir a Presupuesto</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {dossier.budget_priorities.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border grid grid-cols-1 lg:grid-cols-12 gap-4 items-start ${
                    item.priority_level === 'alta'
                      ? 'bg-amber-50/40 border-amber-200/90'
                      : item.priority_level === 'media'
                      ? 'bg-bg-secondary/35 border-border-subtle'
                      : 'bg-bg-secondary/20 border-border-subtle/70'
                  }`}
                >
                  <div className="lg:col-span-4 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                          item.priority_level === 'alta'
                            ? 'bg-amber-500 text-white'
                            : item.priority_level === 'media'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-brand-olive/15 text-brand-olive'
                        }`}
                      >
                        Prioridad {item.priority_level}
                      </span>
                      <span className="text-[11px] font-mono text-text-muted">
                        Impacto visual: <strong>{item.visual_impact_score}/10</strong>
                      </span>
                    </div>
                    <h3 className="font-serif text-lg text-text-primary font-medium">
                      {item.element_name}
                    </h3>
                    <p className="text-[11px] text-primary font-medium">
                      Partida vinculada: {item.category_link} · ({item.estimated_share})
                    </p>
                  </div>

                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-text-muted font-semibold block">
                      ¿Por qué priorizarlo?
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.rationale}
                    </p>
                  </div>

                  <div className="lg:col-span-4 p-3.5 rounded-xl bg-brand-olive/10 border border-brand-olive/25 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-brand-olive font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Fórmula de optimización de presupuesto</span>
                    </span>
                    <p className="text-xs text-text-primary leading-relaxed">
                      {item.smart_saving_tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
