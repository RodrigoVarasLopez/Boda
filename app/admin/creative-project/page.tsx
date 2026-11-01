'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useCreativeProjectStore,
  COLOR_PALETTE_PRESETS,
} from '@/lib/creative-project-store';
import {
  ProposalApprovalStatus,
  APPROVAL_STATUS_LABELS,
  CreativeMoodboardItem,
  CreativeSpaceProposal,
  CreativeCompositionItem,
  CreativeSpecialCorner,
  CreativeLayoutSchema,
  CreativeStationeryItem,
  CreativeBudgetPriorityItem,
} from '@/lib/creative-project-data';
import { formatCurrency } from '@/lib/budget-data';
import { ImagePickerField } from '@/components/admin/creative/ImagePickerField';
import {
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
  Trash2,
  MapPin,
  Lightbulb,
  Recycle,
  Check,
  XCircle,
  ArrowUpRight,
  Sliders,
  Eye,
  X,
  Image as ImageIcon,
  Wand2,
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
    updateProjectMeta,
    updateConcept,
    addMoodboardItem,
    updateMoodboardItem,
    deleteMoodboardItem,
    addColorSwatch,
    updateColorSwatch,
    deleteColorSwatch,
    applyColorPalettePreset,
    updateMaterialsAndFlorals,
    updateSpaceProposalStatus,
    updateSpaceProposal,
    addComposition,
    updateComposition,
    deleteComposition,
    updateCornerStatus,
    updateSpecialCorner,
    addSpecialCorner,
    deleteSpecialCorner,
    updateLayoutSchema,
    addLayoutSchema,
    deleteLayoutSchema,
    updateStationeryIdentity,
    updateStationeryStatus,
    updateStationeryPiece,
    addStationeryPiece,
    deleteStationeryPiece,
    updateCoherenceGuidelines,
    addBudgetPriorityItem,
    updateBudgetPriorityItem,
    deleteBudgetPriorityItem,
    resetCreativeDossier,
  } = useCreativeProjectStore();

  const [activeTab, setActiveTab] = useState<DossierTab>('all');
  const [studioEditMode, setStudioEditMode] = useState<boolean>(true);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- SECTION 1: CONCEPT EDIT STATE ---
  const [editingConcept, setEditingConcept] = useState(false);
  const [projectTitleDraft, setProjectTitleDraft] = useState('');
  const [projectSubtitleDraft, setProjectSubtitleDraft] = useState('');
  const [conceptTitle, setConceptTitle] = useState('');
  const [conceptTagline, setConceptTagline] = useState('');
  const [conceptNarrative, setConceptNarrative] = useState('');
  const [conceptReality, setConceptReality] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // --- SECTION 2: MOODBOARD EDIT STATE ---
  const [editingMoodboardId, setEditingMoodboardId] = useState<string | null>(null);
  const [isAddingMoodboard, setIsAddingMoodboard] = useState(false);
  const [mbForm, setMbForm] = useState<Omit<CreativeMoodboardItem, 'id'>>({
    title: '',
    category: 'Inspiración & Escenografía',
    image_url: '/wedding/floral-detail.jpg',
    description: '',
    execution_note: '',
  });

  // --- SECTION 3: PALETTE ADD STATE ---
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorForm, setNewColorForm] = useState({
    name: '',
    hex: '#C9B79C',
    role: 'Acento Complementario (10%)',
    usage: '',
  });

  // --- SECTION 4: MATERIALS & FLORALS EDIT STATE ---
  const [editingMaterials, setEditingMaterials] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    texture: '',
    application: '',
  });
  const [newBloom, setNewBloom] = useState('');
  const [newFoliage, setNewFoliage] = useState('');

  // --- SECTIONS 5, 6, 7: SPACE PROPOSALS EDIT STATE ---
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [newInterventionText, setNewInterventionText] = useState<Record<string, string>>({});

  // --- SECTION 8: COMPOSITIONS EDIT STATE ---
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [isAddingComp, setIsAddingComp] = useState(false);
  const [compForm, setCompForm] = useState<Omit<CreativeCompositionItem, 'id'>>({
    title: '',
    zone: '',
    flowers_and_greenery: '',
    vessels_and_props: '',
    dimensions_and_height: '',
    quantity_estimate: '',
  });

  // --- SECTION 9: SPECIAL CORNERS EDIT STATE ---
  const [editingCornerId, setEditingCornerId] = useState<string | null>(null);
  const [newCornerElementText, setNewCornerElementText] = useState<Record<string, string>>({});
  const [isAddingCorner, setIsAddingCorner] = useState(false);
  const [cornerForm, setCornerForm] = useState({
    title: '',
    location_moment: '',
    image_url: '/images/bodega/vinedos-valoria-barrica.png',
    concept_description: '',
    elements_included: ['Estructura principal decorada', 'Iluminación cálida focal'],
    functional_goal: '',
    status: 'in_review' as ProposalApprovalStatus,
  });

  // --- SECTION 10: LAYOUT SCHEMAS EDIT STATE ---
  const [editingLayoutId, setEditingLayoutId] = useState<string | null>(null);
  const [newZoneByLayout, setNewZoneByLayout] = useState<
    Record<string, { name: string; position_label: string; description: string; flow_note: string }>
  >({});

  // --- SECTION 11: STATIONERY EDIT STATE ---
  const [editingStationeryIdentity, setEditingStationeryIdentity] = useState(false);
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [newPieceName, setNewPieceName] = useState('');
  const [newPieceMoment, setNewPieceMoment] = useState('');
  const [newPieceFormat, setNewPieceFormat] = useState('');
  const [newPieceFinish, setNewPieceFinish] = useState('');

  // --- SECTION 12: COHERENCE GUIDELINES EDIT STATE ---
  const [newGoldenRule, setNewGoldenRule] = useState({ title: '', description: '' });
  const [newDoItem, setNewDoItem] = useState('');
  const [newDontItem, setNewDontItem] = useState('');

  // --- SECTION 13: BUDGET PRIORITIES EDIT STATE ---
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [isAddingPriority, setIsAddingPriority] = useState(false);
  const [prioForm, setPrioForm] = useState<Omit<CreativeBudgetPriorityItem, 'id'>>({
    element_name: '',
    category_link: 'Decoración Concejo',
    priority_level: 'alta',
    visual_impact_score: 9,
    estimated_share: '15% de la partida decorativa',
    rationale: '',
    smart_saving_tip: '',
  });

  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-text-muted font-medium">
            Cargando estudio interactivo del proyecto creativo...
          </p>
        </div>
      </div>
    );
  }

  const showSection = (tabGroup: DossierTab) =>
    activeTab === 'all' || activeTab === tabGroup;

  const isCustomImage = (src: string) =>
    src.startsWith('data:') || src.startsWith('http');

  const handleOpenEditConcept = () => {
    setProjectTitleDraft(dossier.project_title);
    setProjectSubtitleDraft(dossier.project_subtitle);
    setConceptTitle(dossier.concept.title);
    setConceptTagline(dossier.concept.tagline);
    setConceptNarrative(dossier.concept.narrative);
    setConceptReality(dossier.concept.how_to_bring_to_reality);
    setEditingConcept(true);
  };

  const handleSaveConcept = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMeta({
      project_title: projectTitleDraft.trim() || dossier.project_title,
      project_subtitle: projectSubtitleDraft.trim() || dossier.project_subtitle,
    });
    updateConcept({
      title: conceptTitle.trim() || dossier.concept.title,
      tagline: conceptTagline.trim() || dossier.concept.tagline,
      narrative: conceptNarrative.trim() || dossier.concept.narrative,
      how_to_bring_to_reality:
        conceptReality.trim() || dossier.concept.how_to_bring_to_reality,
    });
    setEditingConcept(false);
    showToast('✓ Concepto creativo actualizado');
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-fade-in border border-neutral-700 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          CABECERA PRINCIPAL DEL ESTUDIO & BARRA DE MODO EDICIÓN / PRESENTACIÓN
         ===================================================================== */}
      <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-widest">
              <Palette className="w-3.5 h-3.5" />
              <span>Estudio Interactivo Wedding Planner · {dossier.project_title}</span>
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

          {/* Mode Toggle & Print Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0 print:hidden">
            {/* Switch between Planner Edit Mode & Clean Client View */}
            <div className="inline-flex rounded-2xl bg-bg-secondary p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => setStudioEditMode(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  studioEditMode
                    ? 'bg-primary text-primary-text shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Modo Editor (Planner)</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioEditMode(false)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  !studioEditMode
                    ? 'bg-primary text-primary-text shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Cliente Limpia</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir o guardar Dossier completo en PDF"
            >
              <Printer className="w-4 h-4 text-text-muted" />
              <span>Exportar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    '¿Restaurar todos los 13 apartados del dossier creativo a sus valores originales?'
                  )
                ) {
                  resetCreativeDossier();
                  showToast('Dossier restaurado a los valores por defecto');
                }
              }}
              className="p-2.5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Restaurar dossier original"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Helper Banner when in Studio Edit Mode */}
        {studioEditMode && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 print:hidden">
            <div className="flex items-start sm:items-center gap-2.5">
              <Wand2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Modo Estudio Activo:</strong> Puedes cambiar cualquier fotografía (subiendo archivos desde tu ordenador/móvil o eligiendo de la galería), probar paletas cromáticas con 1 clic, y editar cada rincón, plano, flor o pieza de papelería en los 13 apartados.
              </span>
            </div>
            <span className="font-mono text-[11px] font-semibold text-amber-800 shrink-0">
              Guardado automático en tiempo real
            </span>
          </div>
        )}

        {/* SECTION FILTER TABS */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 print:hidden">
          {[
            { id: 'all', label: 'Ver Todo el Dossier (13 apartados)' },
            { id: 'concept_moodboard', label: '1-2. Concepto & Moodboard Fotos' },
            { id: 'palette_materials', label: '3-4. Estudio de Color, Texturas & Flores' },
            { id: 'spaces', label: '5-7. Ceremonia, Cóctel & Banquete' },
            { id: 'corners_compositions', label: '8-9. Composiciones & 3 Rincones' },
            { id: 'layouts_stationery', label: '10-11. Planos & Papelería' },
            { id: 'coherence_budget', label: '12-13. Coherencia & Presupuesto' },
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
          APARTADO 01: EXPLICACIÓN DEL CONCEPTO CREATIVO
         ===================================================================== */}
      {showSection('concept_moodboard') && (
        <div className="space-y-8">
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 01 · Hilo Conductor &amp; Narrativa
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Explicación del concepto creativo
                </h2>
              </div>

              {studioEditMode && !editingConcept && (
                <button
                  type="button"
                  onClick={handleOpenEditConcept}
                  className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Concepto y Textos</span>
                </button>
              )}
            </div>

            {editingConcept ? (
              <form
                onSubmit={handleSaveConcept}
                className="p-5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-4 animate-fade-in"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Nombre del Proyecto Creativo
                    </label>
                    <input
                      type="text"
                      value={projectTitleDraft}
                      onChange={(e) => setProjectTitleDraft(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Subtítulo del Dossier
                    </label>
                    <input
                      type="text"
                      value={projectSubtitleDraft}
                      onChange={(e) => setProjectSubtitleDraft(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      Lema / Subtítulo Conceptual
                    </label>
                    <input
                      type="text"
                      value={conceptTagline}
                      onChange={(e) => setConceptTagline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                    Narrativa y Explicación del Concepto
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
                    className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-card text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
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

                  {/* Interactive Keywords Pills */}
                  <div className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {dossier.concept.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-3 py-1 rounded-full bg-bg-secondary border border-border-subtle text-[11px] font-medium text-text-primary inline-flex items-center gap-1.5"
                        >
                          <span>✦ {kw}</span>
                          {studioEditMode && (
                            <button
                              type="button"
                              onClick={() => {
                                updateConcept({
                                  keywords: dossier.concept.keywords.filter((k) => k !== kw),
                                });
                                showToast('Palabra clave eliminada');
                              }}
                              className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                              title="Quitar etiqueta"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {studioEditMode && (
                      <div className="flex items-center gap-2 max-w-sm print:hidden">
                        <input
                          type="text"
                          placeholder="+ Añadir palabra clave de estilo..."
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newKeyword.trim()) {
                              e.preventDefault();
                              updateConcept({
                                keywords: [...dossier.concept.keywords, newKeyword.trim()],
                              });
                              setNewKeyword('');
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-bg-secondary/50 border border-border-subtle text-xs text-text-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newKeyword.trim()) return;
                            updateConcept({
                              keywords: [...dossier.concept.keywords, newKeyword.trim()],
                            });
                            setNewKeyword('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-border-subtle text-xs font-semibold cursor-pointer"
                        >
                          Añadir
                        </button>
                      </div>
                    )}
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

          {/* =====================================================================
              APARTADO 02: MOODBOARD E IDENTIDAD VISUAL (EDITOR DE FOTOS Y TARJETAS)
             ===================================================================== */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 02 · Atmósfera, Fotografías &amp; Dirección de Arte
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Moodboard e identidad visual
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Sube vuestras propias fotografías de inspiración o selecciona del banco visual y detalla cómo se ejecutará cada referencia.
                </p>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setIsAddingMoodboard(!isAddingMoodboard)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-text hover:bg-primary-hover text-xs font-semibold inline-flex items-center gap-1.5 shadow-soft cursor-pointer print:hidden"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Añadir Foto al Moodboard</span>
                </button>
              )}
            </div>

            {/* Add New Moodboard Item Drawer */}
            {isAddingMoodboard && (
              <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-primary/30 space-y-4 animate-fade-in">
                <h4 className="font-serif text-lg text-text-primary">
                  Nueva tarjeta de inspiración para el Moodboard
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Título de la referencia *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Iluminación de velas en escalinata"
                      value={mbForm.title}
                      onChange={(e) => setMbForm({ ...mbForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Iluminación / Flores / Mesa / Rincón"
                      value={mbForm.category}
                      onChange={(e) => setMbForm({ ...mbForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                </div>

                <ImagePickerField
                  label="Fotografía para esta tarjeta"
                  value={mbForm.image_url}
                  onChange={(url) => setMbForm({ ...mbForm, image_url: url })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Descripción estética
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Qué transmite esta referencia visual..."
                      value={mbForm.description}
                      onChange={(e) => setMbForm({ ...mbForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-text-secondary mb-1">
                      Cómo lo haremos realidad en la boda
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Traducción técnica (materiales, proveedor, ubicación)..."
                      value={mbForm.execution_note}
                      onChange={(e) => setMbForm({ ...mbForm, execution_note: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingMoodboard(false)}
                    className="px-4 py-2 rounded-xl border border-border-subtle bg-bg-card text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!mbForm.title.trim()) return;
                      addMoodboardItem({
                        title: mbForm.title.trim(),
                        category: mbForm.category.trim() || 'Inspiración',
                        image_url: mbForm.image_url,
                        description: mbForm.description.trim(),
                        execution_note: mbForm.execution_note.trim(),
                      });
                      setMbForm({
                        title: '',
                        category: 'Inspiración & Escenografía',
                        image_url: '/wedding/floral-detail.jpg',
                        description: '',
                        execution_note: '',
                      });
                      setIsAddingMoodboard(false);
                      showToast('✓ Nueva referencia añadida al Moodboard');
                    }}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Añadir al Moodboard
                  </button>
                </div>
              </div>
            )}

            {/* Moodboard Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dossier.moodboard.map((item) => {
                const isEditingThis = editingMoodboardId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-bg-secondary/30 border border-border-subtle overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-56 w-full overflow-hidden bg-neutral-200">
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          unoptimized={isCustomImage(item.image_url)}
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 380px"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-black/65 text-white backdrop-blur-xs text-[10px] font-semibold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>

                        {studioEditMode && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 print:hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingMoodboardId(isEditingThis ? null : item.id)
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-neutral-900 text-[11px] font-semibold shadow-md inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3 text-primary" />
                              <span>{isEditingThis ? 'Cerrar' : 'Editar foto / texto'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar "${item.title}" del Moodboard?`)) {
                                  deleteMoodboardItem(item.id);
                                  showToast('Referencia eliminada del Moodboard');
                                }
                              }}
                              className="p-1.5 rounded-xl bg-white/95 hover:bg-rose-50 text-rose-600 shadow-md cursor-pointer"
                              title="Eliminar tarjeta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditingThis ? (
                        <div className="p-4 space-y-3 bg-bg-card border-b border-border-subtle animate-fade-in">
                          <ImagePickerField
                            compact
                            value={item.image_url}
                            onChange={(url) => {
                              updateMoodboardItem(item.id, { image_url: url });
                              showToast('✓ Fotografía del Moodboard actualizada');
                            }}
                          />
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) =>
                              updateMoodboardItem(item.id, { category: e.target.value })
                            }
                            placeholder="Categoría"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                          />
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateMoodboardItem(item.id, { title: e.target.value })
                            }
                            placeholder="Título"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold text-text-primary"
                          />
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) =>
                              updateMoodboardItem(item.id, { description: e.target.value })
                            }
                            placeholder="Descripción visual"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                          />
                          <textarea
                            rows={2}
                            value={item.execution_note}
                            onChange={(e) =>
                              updateMoodboardItem(item.id, { execution_note: e.target.value })
                            }
                            placeholder="Cómo se ejecutará en la realidad"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMoodboardId(null);
                              showToast('✓ Cambios guardados');
                            }}
                            className="w-full py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                          >
                            Listo
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 space-y-2">
                          <h3 className="font-serif text-lg text-text-primary font-medium">
                            {item.title}
                          </h3>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {!isEditingThis && (
                      <div className="px-4 pb-4 pt-2 border-t border-border-subtle/60">
                        <p className="text-[11px] text-primary font-medium leading-snug">
                          <strong>Cómo lo haremos realidad:</strong> {item.execution_note}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADOS 03 Y 04: ESTUDIO DE PALETA CROMÁTICA + MATERIALES Y FLORES
         ===================================================================== */}
      {showSection('palette_materials') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* APARTADO 03: ESTUDIO INTERACTIVO DE PALETA CROMÁTICA */}
          <div className="lg:col-span-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 03 · Estudio Interactivo de Color
                </span>
                <h2 className="font-serif text-2xl text-text-primary mt-0.5">
                  Paleta cromática
                </h2>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setIsAddingColor(!isAddingColor)}
                  className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1 cursor-pointer print:hidden"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Color</span>
                </button>
              )}
            </div>

            {/* Visual Harmony Proportion Strip */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                Equilibrio Visual de la Paleta en Vivo:
              </span>
              <div className="h-8 w-full rounded-2xl overflow-hidden flex border border-border-strong shadow-xs">
                {dossier.color_palette.map((sw, i) => (
                  <div
                    key={sw.id}
                    style={{
                      backgroundColor: sw.hex,
                      flex: i === 0 ? 3 : i === 1 ? 2 : 1.2,
                    }}
                    className="h-full transition-all duration-300 relative group"
                    title={`${sw.name} (${sw.hex})`}
                  />
                ))}
              </div>
            </div>

            {/* 1-Click Preset Palettes Selector for Wedding Planner */}
            {studioEditMode && (
              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-2 print:hidden">
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold block">
                  Probar Paletas de Inspiración con 1 Clic:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COLOR_PALETTE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        applyColorPalettePreset(preset.id);
                        showToast(`✓ Paleta "${preset.name}" aplicada`);
                      }}
                      className="p-2 rounded-xl bg-bg-card hover:border-primary border border-border-subtle text-left space-y-1.5 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1">
                        {preset.swatches.map((s) => (
                          <span
                            key={s.id}
                            style={{ backgroundColor: s.hex }}
                            className="w-4 h-4 rounded-full border border-neutral-300"
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-semibold text-text-primary leading-tight">
                        {preset.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Color Swatch Form */}
            {isAddingColor && (
              <div className="p-4 rounded-2xl bg-bg-secondary/50 border border-primary/30 space-y-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorForm.hex}
                    onChange={(e) =>
                      setNewColorForm({ ...newColorForm, hex: e.target.value.toUpperCase() })
                    }
                    className="w-12 h-10 rounded-xl cursor-pointer border border-border-strong"
                  />
                  <input
                    type="text"
                    placeholder="Nombre del color (ej. Verde Salvia)"
                    value={newColorForm.name}
                    onChange={(e) =>
                      setNewColorForm({ ...newColorForm, name: e.target.value })
                    }
                    className="flex-1 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Proporción / Rol (ej. Secundario Botánico 25%)"
                  value={newColorForm.role}
                  onChange={(e) =>
                    setNewColorForm({ ...newColorForm, role: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
                <input
                  type="text"
                  placeholder="¿Dónde se aplica? (mantelería, flores, lacres...)"
                  value={newColorForm.usage}
                  onChange={(e) =>
                    setNewColorForm({ ...newColorForm, usage: e.target.value })
                  }
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingColor(false)}
                    className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-card text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newColorForm.name.trim()) return;
                      addColorSwatch({
                        name: newColorForm.name.trim(),
                        hex: newColorForm.hex,
                        role: newColorForm.role.trim() || 'Acento (10%)',
                        usage: newColorForm.usage.trim() || 'Detalles decorativos',
                      });
                      setNewColorForm({
                        name: '',
                        hex: '#C9B79C',
                        role: 'Acento Complementario (10%)',
                        usage: '',
                      });
                      setIsAddingColor(false);
                      showToast('✓ Nuevo color añadido a la paleta');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Guardar Color
                  </button>
                </div>
              </div>
            )}

            {/* Editable Swatch Cards */}
            <div className="space-y-3">
              {dossier.color_palette.map((swatch) => (
                <div
                  key={swatch.id}
                  className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle flex items-start gap-3.5"
                >
                  <label
                    className="relative cursor-pointer shrink-0 group"
                    title="Haz clic para abrir el selector de color"
                  >
                    <div
                      style={{ backgroundColor: swatch.hex }}
                      className="w-14 h-14 rounded-2xl border border-border-strong shadow-xs flex items-center justify-center"
                    >
                      {studioEditMode && (
                        <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded transition-opacity">
                          Cambiar
                        </span>
                      )}
                    </div>
                    <input
                      type="color"
                      value={swatch.hex}
                      onChange={(e) =>
                        updateColorSwatch(swatch.id, {
                          hex: e.target.value.toUpperCase(),
                        })
                      }
                      className="sr-only"
                    />
                  </label>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    {studioEditMode ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={swatch.name}
                            onChange={(e) =>
                              updateColorSwatch(swatch.id, { name: e.target.value })
                            }
                            className="flex-1 px-2 py-1 rounded-lg bg-bg-card border border-border-subtle font-serif text-sm font-medium text-text-primary"
                          />
                          <input
                            type="text"
                            value={swatch.hex}
                            onChange={(e) =>
                              updateColorSwatch(swatch.id, { hex: e.target.value })
                            }
                            className="w-20 px-2 py-1 rounded-lg bg-bg-card border border-border-subtle font-mono text-[11px] text-center text-text-secondary"
                          />
                          <button
                            type="button"
                            onClick={() => deleteColorSwatch(swatch.id)}
                            className="p-1 text-text-muted hover:text-rose-600 cursor-pointer"
                            title="Eliminar color"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={swatch.role}
                          onChange={(e) =>
                            updateColorSwatch(swatch.id, { role: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-bg-card border border-border-subtle text-[11px] font-mono text-primary"
                        />
                        <input
                          type="text"
                          value={swatch.usage}
                          onChange={(e) =>
                            updateColorSwatch(swatch.id, { usage: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-secondary"
                        />
                      </>
                    ) : (
                      <>
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
                        <p className="text-xs text-text-secondary leading-snug">
                          {swatch.usage}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APARTADO 04: SELECCIÓN DE MATERIALES, TEXTURAS Y ESTILO FLORAL */}
          <div className="lg:col-span-7 rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-olive font-semibold block">
                  Apartado 04 · Tacto, Materia &amp; Botánica
                </span>
                <h2 className="font-serif text-2xl text-text-primary mt-0.5">
                  Selección de materiales, texturas y estilo floral
                </h2>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setEditingMaterials(!editingMaterials)}
                  className="px-3 py-1.5 rounded-xl bg-brand-olive/15 text-brand-olive hover:bg-brand-olive/25 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{editingMaterials ? 'Cerrar edición' : 'Editar Materiales y Flores'}</span>
                </button>
              )}
            </div>

            {/* Materiales y Texturas */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Materiales y Texturas Principales ({dossier.materials_and_florals.materials_list.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dossier.materials_and_florals.materials_list.map((mat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-1.5 relative"
                  >
                    {editingMaterials ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={mat.name}
                            onChange={(e) => {
                              const nextList = [...dossier.materials_and_florals.materials_list];
                              nextList[idx] = { ...mat, name: e.target.value };
                              updateMaterialsAndFlorals({ materials_list: nextList });
                            }}
                            className="flex-1 px-2 py-1 rounded bg-bg-card border border-border-subtle text-xs font-semibold text-text-primary"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const nextList = dossier.materials_and_florals.materials_list.filter(
                                (_, i) => i !== idx
                              );
                              updateMaterialsAndFlorals({ materials_list: nextList });
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={mat.texture}
                          onChange={(e) => {
                            const nextList = [...dossier.materials_and_florals.materials_list];
                            nextList[idx] = { ...mat, texture: e.target.value };
                            updateMaterialsAndFlorals({ materials_list: nextList });
                          }}
                          placeholder="Textura / Acabado"
                          className="w-full px-2 py-1 rounded bg-bg-card border border-border-subtle text-[11px] text-primary"
                        />
                        <textarea
                          rows={2}
                          value={mat.application}
                          onChange={(e) => {
                            const nextList = [...dossier.materials_and_florals.materials_list];
                            nextList[idx] = { ...mat, application: e.target.value };
                            updateMaterialsAndFlorals({ materials_list: nextList });
                          }}
                          placeholder="Aplicación en la boda"
                          className="w-full px-2 py-1 rounded bg-bg-card border border-border-subtle text-xs text-text-secondary"
                        />
                      </>
                    ) : (
                      <>
                        <p className="font-serif text-base font-medium text-text-primary">
                          {mat.name}
                        </p>
                        <p className="text-[11px] text-primary font-medium">{mat.texture}</p>
                        <p className="text-xs text-text-secondary leading-snug">
                          {mat.application}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {editingMaterials && (
                <div className="p-3 rounded-xl bg-bg-secondary/50 border border-border-subtle grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Nuevo material (ej. Terciopelo)"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Textura (ej. Suave y mate)"
                    value={newMaterial.texture}
                    onChange={(e) => setNewMaterial({ ...newMaterial, texture: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Uso (ej. Lazos de servilleta)"
                    value={newMaterial.application}
                    onChange={(e) =>
                      setNewMaterial({ ...newMaterial, application: e.target.value })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMaterial.name.trim()) return;
                      updateMaterialsAndFlorals({
                        materials_list: [
                          ...dossier.materials_and_florals.materials_list,
                          {
                            name: newMaterial.name.trim(),
                            texture: newMaterial.texture.trim() || 'Textura natural',
                            application: newMaterial.application.trim() || 'Decoración',
                          },
                        ],
                      });
                      setNewMaterial({ name: '', texture: '', application: '' });
                      showToast('✓ Material añadido');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    + Añadir Material
                  </button>
                </div>
              )}
            </div>

            {/* Estilo Floral Editable */}
            <div className="p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-4">
              {editingMaterials ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase text-brand-olive font-semibold">
                    Título y Descripción del Estilo Floral
                  </label>
                  <input
                    type="text"
                    value={dossier.materials_and_florals.floral_style_title}
                    onChange={(e) =>
                      updateMaterialsAndFlorals({ floral_style_title: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs font-bold text-text-primary"
                  />
                  <textarea
                    rows={2}
                    value={dossier.materials_and_florals.floral_style_description}
                    onChange={(e) =>
                      updateMaterialsAndFlorals({ floral_style_description: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-brand-olive font-bold text-xs uppercase tracking-wider">
                    <Flower2 className="w-4 h-4" />
                    <span>{dossier.materials_and_florals.floral_style_title}</span>
                  </div>
                  <p className="text-xs text-text-primary leading-relaxed">
                    {dossier.materials_and_florals.floral_style_description}
                  </p>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Flores Protagonistas */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-olive font-semibold block">
                    Flores Protagonistas
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-primary">
                    {dossier.materials_and_florals.primary_blooms.map((b, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 bg-bg-card/70 px-2.5 py-1.5 rounded-lg border border-border-subtle">
                        <span>• {b}</span>
                        {studioEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              updateMaterialsAndFlorals({
                                primary_blooms:
                                  dossier.materials_and_florals.primary_blooms.filter(
                                    (_, idx) => idx !== i
                                  ),
                              });
                            }}
                            className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {studioEditMode && (
                    <div className="flex gap-1.5 print:hidden">
                      <input
                        type="text"
                        placeholder="+ Añadir flor (ej. Peonía blanca)..."
                        value={newBloom}
                        onChange={(e) => setNewBloom(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newBloom.trim()) return;
                          updateMaterialsAndFlorals({
                            primary_blooms: [
                              ...dossier.materials_and_florals.primary_blooms,
                              newBloom.trim(),
                            ],
                          });
                          setNewBloom('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-olive text-white text-xs font-semibold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Verdes y Acentos */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-olive font-semibold block">
                    Verdes, Ramas y Acentos
                  </span>
                  <ul className="space-y-1.5 text-xs text-text-primary">
                    {dossier.materials_and_florals.foliage_and_accents.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 bg-bg-card/70 px-2.5 py-1.5 rounded-lg border border-border-subtle">
                        <span>• {f}</span>
                        {studioEditMode && (
                          <button
                            type="button"
                            onClick={() => {
                              updateMaterialsAndFlorals({
                                foliage_and_accents:
                                  dossier.materials_and_florals.foliage_and_accents.filter(
                                    (_, idx) => idx !== i
                                  ),
                              });
                            }}
                            className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {studioEditMode && (
                    <div className="flex gap-1.5 print:hidden">
                      <input
                        type="text"
                        placeholder="+ Añadir verde / rama..."
                        value={newFoliage}
                        onChange={(e) => setNewFoliage(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFoliage.trim()) return;
                          updateMaterialsAndFlorals({
                            foliage_and_accents: [
                              ...dossier.materials_and_florals.foliage_and_accents,
                              newFoliage.trim(),
                            ],
                          });
                          setNewFoliage('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-olive text-white text-xs font-semibold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-brand-olive/20 text-xs text-text-secondary">
                {editingMaterials ? (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-brand-olive font-semibold mb-1">
                      Estilo de Recipientes, Copas y Jarrones
                    </label>
                    <input
                      type="text"
                      value={dossier.materials_and_florals.vessels_style}
                      onChange={(e) =>
                        updateMaterialsAndFlorals({ vessels_style: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  </div>
                ) : (
                  <>
                    <strong className="text-text-primary">Recipientes y jarrones: </strong>
                    {dossier.materials_and_florals.vessels_style}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADOS 05, 06 Y 07: PROPUESTAS INDIVIDUALES DE CEREMONIA, CÓCTEL Y BANQUETE
         ===================================================================== */}
      {showSection('spaces') && (
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
              Apartados 05, 06 y 07 · Escenografía Individual por Escenarios
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
              Propuestas individuales: Ceremonia, Bienvenida &amp; Cóctel y Banquete
            </h2>
          </div>

          <div className="space-y-6">
            {dossier.space_proposals.map((prop, index) => {
              const isEditingThisSpace = editingSpaceId === prop.id;
              return (
                <div
                  key={prop.id}
                  className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                >
                  {/* Left Image Column */}
                  <div className="lg:col-span-4 relative min-h-[280px] lg:min-h-full bg-neutral-200">
                    <Image
                      src={prop.image_url}
                      alt={prop.title}
                      fill
                      unoptimized={isCustomImage(prop.image_url)}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 420px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                      <span className="px-3 py-1 rounded-full bg-black/65 text-white text-[10px] font-mono uppercase tracking-widest font-semibold">
                        Apartado 0{index + 5}
                      </span>

                      {studioEditMode && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingSpaceId(isEditingThisSpace ? null : prop.id)
                          }
                          className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold shadow-md inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>{isEditingThisSpace ? 'Cerrar Editor' : 'Editar Foto y Propuesta'}</span>
                        </button>
                      )}
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

                  {/* Right Details or Editor Column */}
                  <div className="lg:col-span-8 p-6 sm:p-7 space-y-4 flex flex-col justify-between">
                    {isEditingThisSpace ? (
                      <div className="space-y-4 animate-fade-in">
                        <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-primary/30 space-y-3">
                          <ImagePickerField
                            label={`Fotografía de portada para ${prop.title}`}
                            value={prop.image_url}
                            onChange={(url) => {
                              updateSpaceProposal(prop.id, { image_url: url });
                              showToast('✓ Fotografía del escenario actualizada');
                            }}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Título de la Propuesta
                              </label>
                              <input
                                type="text"
                                value={prop.title}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, { title: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Subtítulo Estético
                              </label>
                              <input
                                type="text"
                                value={prop.subtitle}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, { subtitle: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Ubicación y Horario
                              </label>
                              <input
                                type="text"
                                value={prop.location}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, { location: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                              Resumen de Atmósfera y Concepto del Espacio
                            </label>
                            <textarea
                              rows={2}
                              value={prop.atmosphere_summary}
                              onChange={(e) =>
                                updateSpaceProposal(prop.id, {
                                  atmosphere_summary: e.target.value,
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Iluminación y Ambiente
                              </label>
                              <textarea
                                rows={2}
                                value={prop.lighting_and_ambience}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, {
                                    lighting_and_ambience: e.target.value,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Producción Técnica
                              </label>
                              <textarea
                                rows={2}
                                value={prop.technical_execution}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, {
                                    technical_execution: e.target.value,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-text-muted mb-1">
                                Optimización &amp; Reutilización
                              </label>
                              <textarea
                                rows={2}
                                value={prop.reusable_tip}
                                onChange={(e) =>
                                  updateSpaceProposal(prop.id, {
                                    reusable_tip: e.target.value,
                                  })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSpaceId(null);
                              showToast('✓ Propuesta de escenario guardada');
                            }}
                            className="px-5 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                          >
                            Guardar y ver diseño
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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

                          {/* Key Interventions with inline add/remove */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold block">
                              Intervenciones Decorativas y Puntos Focales ({prop.key_interventions.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {prop.key_interventions.map((interv, i) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-xl bg-bg-secondary/35 border border-border-subtle text-xs text-text-primary leading-relaxed flex items-start justify-between gap-2"
                                >
                                  <span>{interv}</span>
                                  {studioEditMode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const next = prop.key_interventions.filter(
                                          (_, idx) => idx !== i
                                        );
                                        updateSpaceProposal(prop.id, {
                                          key_interventions: next,
                                        });
                                      }}
                                      className="text-text-muted hover:text-rose-600 shrink-0 cursor-pointer print:hidden"
                                      title="Eliminar intervención"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {studioEditMode && (
                              <div className="flex gap-2 pt-1 print:hidden">
                                <input
                                  type="text"
                                  placeholder={`+ Añadir nuevo punto decorativo a ${prop.title}...`}
                                  value={newInterventionText[prop.id] || ''}
                                  onChange={(e) =>
                                    setNewInterventionText((prev) => ({
                                      ...prev,
                                      [prop.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === 'Enter' &&
                                      (newInterventionText[prop.id] || '').trim()
                                    ) {
                                      e.preventDefault();
                                      updateSpaceProposal(prop.id, {
                                        key_interventions: [
                                          ...prop.key_interventions,
                                          newInterventionText[prop.id].trim(),
                                        ],
                                      });
                                      setNewInterventionText((prev) => ({
                                        ...prev,
                                        [prop.id]: '',
                                      }));
                                      showToast('✓ Intervención añadida');
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const txt = (newInterventionText[prop.id] || '').trim();
                                    if (!txt) return;
                                    updateSpaceProposal(prop.id, {
                                      key_interventions: [...prop.key_interventions, txt],
                                    });
                                    setNewInterventionText((prev) => ({
                                      ...prev,
                                      [prop.id]: '',
                                    }));
                                    showToast('✓ Intervención añadida');
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                                >
                                  Añadir
                                </button>
                              </div>
                            )}
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
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADOS 08 Y 09: COMPOSICIONES DECORATIVAS + 3 RINCONES ESPECIALES
         ===================================================================== */}
      {showSection('corners_compositions') && (
        <div className="space-y-8">
          {/* 8. Composiciones y referencias decorativas */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 08 · Fichas Técnicas de Floristería y Escenografía
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Composiciones y referencias decorativas
                </h2>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setIsAddingComp(!isAddingComp)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Añadir Ficha de Composición</span>
                </button>
              )}
            </div>

            {isAddingComp && (
              <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-primary/30 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Título (ej. Centro de Mesa Imperial)"
                    value={compForm.title}
                    onChange={(e) => setCompForm({ ...compForm, title: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Zona (ej. Salón Principal / Ceremonia)"
                    value={compForm.zone}
                    onChange={(e) => setCompForm({ ...compForm, zone: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Flores y verdes empleados..."
                    value={compForm.flowers_and_greenery}
                    onChange={(e) =>
                      setCompForm({ ...compForm, flowers_and_greenery: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Recipientes, portavelas y soportes..."
                    value={compForm.vessels_and_props}
                    onChange={(e) =>
                      setCompForm({ ...compForm, vessels_and_props: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Dimensiones y altura máxima"
                    value={compForm.dimensions_and_height}
                    onChange={(e) =>
                      setCompForm({ ...compForm, dimensions_and_height: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dotación / Cantidad estimada"
                    value={compForm.quantity_estimate}
                    onChange={(e) =>
                      setCompForm({ ...compForm, quantity_estimate: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingComp(false)}
                    className="px-4 py-1.5 rounded-xl border border-border-subtle bg-bg-card text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!compForm.title.trim()) return;
                      addComposition(compForm);
                      setCompForm({
                        title: '',
                        zone: '',
                        flowers_and_greenery: '',
                        vessels_and_props: '',
                        dimensions_and_height: '',
                        quantity_estimate: '',
                      });
                      setIsAddingComp(false);
                      showToast('✓ Ficha de composición añadida');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Guardar Ficha
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dossier.compositions.map((comp) => {
                const isEditingThisComp = editingCompId === comp.id;
                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-3 flex flex-col justify-between"
                  >
                    {isEditingThisComp ? (
                      <div className="space-y-2 animate-fade-in">
                        <input
                          type="text"
                          value={comp.zone}
                          onChange={(e) =>
                            updateComposition(comp.id, { zone: e.target.value })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-[11px] font-mono text-primary"
                        />
                        <input
                          type="text"
                          value={comp.title}
                          onChange={(e) =>
                            updateComposition(comp.id, { title: e.target.value })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-xs font-semibold"
                        />
                        <textarea
                          rows={2}
                          value={comp.flowers_and_greenery}
                          onChange={(e) =>
                            updateComposition(comp.id, {
                              flowers_and_greenery: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-xs"
                        />
                        <textarea
                          rows={2}
                          value={comp.vessels_and_props}
                          onChange={(e) =>
                            updateComposition(comp.id, {
                              vessels_and_props: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-xs"
                        />
                        <input
                          type="text"
                          value={comp.dimensions_and_height}
                          onChange={(e) =>
                            updateComposition(comp.id, {
                              dimensions_and_height: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-xs"
                        />
                        <input
                          type="text"
                          value={comp.quantity_estimate}
                          onChange={(e) =>
                            updateComposition(comp.id, {
                              quantity_estimate: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1 rounded bg-bg-card border border-border-subtle text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCompId(null)}
                          className="w-full py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                        >
                          Listo
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-semibold">
                              {comp.zone}
                            </span>
                            {studioEditMode && (
                              <div className="flex items-center gap-1 print:hidden">
                                <button
                                  type="button"
                                  onClick={() => setEditingCompId(comp.id)}
                                  className="p-1 text-text-muted hover:text-primary cursor-pointer"
                                  title="Editar ficha"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteComposition(comp.id)}
                                  className="p-1 text-text-muted hover:text-rose-600 cursor-pointer"
                                  title="Eliminar ficha"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 9. Diseño conceptual de hasta tres rincones especiales */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 09 · Experiencias &amp; Rincones con Alma
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Diseño conceptual de hasta tres rincones especiales
                </h2>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setIsAddingCorner(!isAddingCorner)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Añadir Rincón Especial</span>
                </button>
              )}
            </div>

            {isAddingCorner && (
              <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-primary/30 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Título del Rincón (ej. Rincón de Bienvenida / Cigar Bar)"
                    value={cornerForm.title}
                    onChange={(e) => setCornerForm({ ...cornerForm, title: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Ubicación y momento (ej. Jardín de Cóctel)"
                    value={cornerForm.location_moment}
                    onChange={(e) =>
                      setCornerForm({ ...cornerForm, location_moment: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <ImagePickerField
                  label="Fotografía del Rincón Especial"
                  value={cornerForm.image_url}
                  onChange={(url) => setCornerForm({ ...cornerForm, image_url: url })}
                />
                <textarea
                  rows={2}
                  placeholder="Descripción conceptual del rincón..."
                  value={cornerForm.concept_description}
                  onChange={(e) =>
                    setCornerForm({ ...cornerForm, concept_description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                />
                <input
                  type="text"
                  placeholder="Objetivo funcional (ej. Evitar colas en la entrada al salón)"
                  value={cornerForm.functional_goal}
                  onChange={(e) =>
                    setCornerForm({ ...cornerForm, functional_goal: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCorner(false)}
                    className="px-4 py-1.5 rounded-xl border border-border-subtle bg-bg-card text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!cornerForm.title.trim()) return;
                      addSpecialCorner(cornerForm);
                      setIsAddingCorner(false);
                      showToast('✓ Nuevo rincón especial añadido');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Guardar Rincón
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {dossier.special_corners.map((corner, idx) => {
                const isEditingCorner = editingCornerId === corner.id;
                return (
                  <div
                    key={corner.id}
                    className="rounded-2xl bg-bg-secondary/30 border border-border-subtle overflow-hidden flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="relative h-52 w-full bg-neutral-200">
                        <Image
                          src={corner.image_url}
                          alt={corner.title}
                          fill
                          unoptimized={isCustomImage(corner.image_url)}
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 380px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex justify-between items-center gap-1">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 text-white text-[10px] font-mono font-semibold">
                            Rincón Especial 0{idx + 1}
                          </span>
                          <div className="flex items-center gap-1 print:hidden">
                            <select
                              value={corner.status}
                              onChange={(e) => {
                                updateCornerStatus(
                                  corner.id,
                                  e.target.value as ProposalApprovalStatus
                                );
                                showToast('Estado del rincón actualizado');
                              }}
                              className="px-2 py-1 rounded-lg bg-white/95 text-neutral-900 text-[10px] font-semibold cursor-pointer"
                            >
                              {Object.entries(APPROVAL_STATUS_LABELS).map(([k, label]) => (
                                <option key={k} value={k}>
                                  {label}
                                </option>
                              ))}
                            </select>

                            {studioEditMode && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingCornerId(isEditingCorner ? null : corner.id)
                                  }
                                  className="p-1.5 rounded-lg bg-white/95 text-primary hover:bg-white shadow cursor-pointer"
                                  title="Editar foto y rincón"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Eliminar "${corner.title}"?`)) {
                                      deleteSpecialCorner(corner.id);
                                      showToast('Rincón eliminado');
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-50 shadow cursor-pointer"
                                  title="Eliminar rincón"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-[10px] text-brand-sand font-mono">
                            {corner.location_moment}
                          </p>
                        </div>
                      </div>

                      {isEditingCorner ? (
                        <div className="p-4 space-y-2.5 bg-bg-card border-b border-border-subtle animate-fade-in">
                          <ImagePickerField
                            compact
                            value={corner.image_url}
                            onChange={(url) => {
                              updateSpecialCorner(corner.id, { image_url: url });
                              showToast('✓ Foto del rincón actualizada');
                            }}
                          />
                          <input
                            type="text"
                            value={corner.title}
                            onChange={(e) =>
                              updateSpecialCorner(corner.id, { title: e.target.value })
                            }
                            placeholder="Título del rincón"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={corner.location_moment}
                            onChange={(e) =>
                              updateSpecialCorner(corner.id, {
                                location_moment: e.target.value,
                              })
                            }
                            placeholder="Ubicación y momento"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                          />
                          <textarea
                            rows={2}
                            value={corner.concept_description}
                            onChange={(e) =>
                              updateSpecialCorner(corner.id, {
                                concept_description: e.target.value,
                              })
                            }
                            placeholder="Concepto del rincón"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                          />
                          <textarea
                            rows={2}
                            value={corner.functional_goal}
                            onChange={(e) =>
                              updateSpecialCorner(corner.id, {
                                functional_goal: e.target.value,
                              })
                            }
                            placeholder="Objetivo funcional"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingCornerId(null)}
                            className="w-full py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                          >
                            Listo
                          </button>
                        </div>
                      ) : (
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
                                <li key={i} className="flex items-start justify-between gap-2">
                                  <span className="flex items-start gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 mt-0.5" />
                                    <span>{el}</span>
                                  </span>
                                  {studioEditMode && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateSpecialCorner(corner.id, {
                                          elements_included: corner.elements_included.filter(
                                            (_, idx) => idx !== i
                                          ),
                                        });
                                      }}
                                      className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>

                            {studioEditMode && (
                              <div className="flex gap-1.5 pt-1.5 print:hidden">
                                <input
                                  type="text"
                                  placeholder="+ Añadir elemento al rincón..."
                                  value={newCornerElementText[corner.id] || ''}
                                  onChange={(e) =>
                                    setNewCornerElementText((prev) => ({
                                      ...prev,
                                      [corner.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = (newCornerElementText[corner.id] || '').trim();
                                    if (!val) return;
                                    updateSpecialCorner(corner.id, {
                                      elements_included: [...corner.elements_included, val],
                                    });
                                    setNewCornerElementText((prev) => ({
                                      ...prev,
                                      [corner.id]: '',
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-bg-card border-t border-border-subtle text-[11px] text-text-secondary">
                      <strong className="text-text-primary">Objetivo funcional: </strong>
                      {corner.functional_goal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADOS 10 Y 11: ESQUEMAS DE DISTRIBUCIÓN + PAPELERÍA ACORDADA
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
            </div>

            <div className="space-y-5">
              {dossier.layout_schemas.map((schema) => {
                const isEditingSchema = editingLayoutId === schema.id;
                const draftZone = newZoneByLayout[schema.id] || {
                  name: '',
                  position_label: '',
                  description: '',
                  flow_note: '',
                };

                return (
                  <div
                    key={schema.id}
                    className="p-5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                      {isEditingSchema ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={schema.space_name}
                            onChange={(e) =>
                              updateLayoutSchema(schema.id, { space_name: e.target.value })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={schema.subtitle}
                            onChange={(e) =>
                              updateLayoutSchema(schema.id, { subtitle: e.target.value })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                          <input
                            type="text"
                            value={schema.orientation_note}
                            onChange={(e) =>
                              updateLayoutSchema(schema.id, {
                                orientation_note: e.target.value,
                              })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-serif text-xl text-text-primary font-medium flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-primary" />
                            <span>{schema.space_name}</span>
                          </h3>
                          <p className="text-xs text-text-muted">{schema.subtitle}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {!isEditingSchema && (
                          <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                            Clave técnica: {schema.orientation_note}
                          </span>
                        )}
                        {studioEditMode && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingLayoutId(isEditingSchema ? null : schema.id)
                            }
                            className="px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs font-semibold text-primary hover:bg-bg-secondary cursor-pointer print:hidden"
                          >
                            {isEditingSchema ? 'Cerrar edición' : 'Editar Zonas del Plano'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {schema.zones.map((z, idx) => (
                        <div
                          key={z.id}
                          className="p-4 rounded-2xl bg-bg-card border border-border-subtle relative space-y-2 shadow-2xs"
                        >
                          {isEditingSchema ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-1">
                                <input
                                  type="text"
                                  value={z.position_label}
                                  onChange={(e) => {
                                    const nextZones = [...schema.zones];
                                    nextZones[idx] = { ...z, position_label: e.target.value };
                                    updateLayoutSchema(schema.id, { zones: nextZones });
                                  }}
                                  className="flex-1 px-2 py-1 rounded bg-bg-secondary/40 border border-border-subtle text-[10px] font-mono text-primary"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextZones = schema.zones.filter((_, i) => i !== idx);
                                    updateLayoutSchema(schema.id, { zones: nextZones });
                                  }}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={z.name}
                                onChange={(e) => {
                                  const nextZones = [...schema.zones];
                                  nextZones[idx] = { ...z, name: e.target.value };
                                  updateLayoutSchema(schema.id, { zones: nextZones });
                                }}
                                className="w-full px-2 py-1 rounded bg-bg-secondary/40 border border-border-subtle text-xs font-semibold"
                              />
                              <textarea
                                rows={2}
                                value={z.description}
                                onChange={(e) => {
                                  const nextZones = [...schema.zones];
                                  nextZones[idx] = { ...z, description: e.target.value };
                                  updateLayoutSchema(schema.id, { zones: nextZones });
                                }}
                                className="w-full px-2 py-1 rounded bg-bg-secondary/40 border border-border-subtle text-xs"
                              />
                              <input
                                type="text"
                                value={z.flow_note}
                                onChange={(e) => {
                                  const nextZones = [...schema.zones];
                                  nextZones[idx] = { ...z, flow_note: e.target.value };
                                  updateLayoutSchema(schema.id, { zones: nextZones });
                                }}
                                className="w-full px-2 py-1 rounded bg-bg-secondary/40 border border-border-subtle text-[11px] text-brand-olive"
                              />
                            </div>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {isEditingSchema && (
                      <div className="p-3 rounded-xl bg-bg-card border border-border-subtle grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <input
                          type="text"
                          placeholder="Nueva Zona (ej. Barra Libre)"
                          value={draftZone.name}
                          onChange={(e) =>
                            setNewZoneByLayout((prev) => ({
                              ...prev,
                              [schema.id]: { ...draftZone, name: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Posición (ej. Lateral Norte)"
                          value={draftZone.position_label}
                          onChange={(e) =>
                            setNewZoneByLayout((prev) => ({
                              ...prev,
                              [schema.id]: { ...draftZone, position_label: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Descripción de elementos..."
                          value={draftZone.description}
                          onChange={(e) =>
                            setNewZoneByLayout((prev) => ({
                              ...prev,
                              [schema.id]: { ...draftZone, description: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Flujo de invitados..."
                          value={draftZone.flow_note}
                          onChange={(e) =>
                            setNewZoneByLayout((prev) => ({
                              ...prev,
                              [schema.id]: { ...draftZone, flow_note: e.target.value },
                            }))
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!draftZone.name.trim()) return;
                            updateLayoutSchema(schema.id, {
                              zones: [
                                ...schema.zones,
                                {
                                  id: `z-${Date.now()}`,
                                  name: draftZone.name.trim(),
                                  position_label:
                                    draftZone.position_label.trim() || 'Zona Adicional',
                                  description: draftZone.description.trim(),
                                  flow_note:
                                    draftZone.flow_note.trim() || 'Circulación despejada',
                                },
                              ],
                            });
                            setNewZoneByLayout((prev) => ({
                              ...prev,
                              [schema.id]: {
                                name: '',
                                position_label: '',
                                description: '',
                                flow_note: '',
                              },
                            }));
                            showToast('✓ Zona añadida al plano');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                        >
                          + Añadir Zona
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 11. Identidad gráfica y diseño de toda la papelería acordada */}
          <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold block">
                  Apartado 11 · Dirección Gráfica &amp; Piezas Impresas
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-text-primary mt-0.5">
                  Identidad gráfica y diseño de toda la papelería acordada
                </h2>
              </div>

              {studioEditMode && (
                <button
                  type="button"
                  onClick={() => setEditingStationeryIdentity(!editingStationeryIdentity)}
                  className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {editingStationeryIdentity
                      ? 'Cerrar editor gráfico'
                      : 'Editar Monograma, Fuentes y Papel'}
                  </span>
                </button>
              )}
            </div>

            {/* Graphic Identity Specs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  key: 'monogram_concept' as const,
                  label: 'Monograma & Sello',
                  val: dossier.stationery.monogram_concept,
                },
                {
                  key: 'typography_serif' as const,
                  label: 'Tipografía Principal (Serif)',
                  val: dossier.stationery.typography_serif,
                },
                {
                  key: 'typography_sans' as const,
                  label: 'Tipografía Secundaria (Sans)',
                  val: dossier.stationery.typography_sans,
                },
                {
                  key: 'paper_and_seals' as const,
                  label: 'Soporte, Papel y Lacres',
                  val: dossier.stationery.paper_and_seals,
                },
              ].map((spec) => (
                <div
                  key={spec.key}
                  className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1.5"
                >
                  <span className="text-[10px] font-mono uppercase text-primary font-semibold block">
                    {spec.label}
                  </span>
                  {editingStationeryIdentity ? (
                    <textarea
                      rows={3}
                      value={spec.val}
                      onChange={(e) =>
                        updateStationeryIdentity({ [spec.key]: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary"
                    />
                  ) : (
                    <p className="text-xs text-text-primary leading-relaxed">{spec.val}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Agreed Stationery Pieces Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>
                  Desglose de Piezas de Papelería Acordadas ({dossier.stationery.pieces.length})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dossier.stationery.pieces.map((piece) => {
                  const isEditingThisPiece = editingPieceId === piece.id;
                  return (
                    <div
                      key={piece.id}
                      className="p-4 rounded-2xl bg-bg-secondary/25 border border-border-subtle flex flex-col justify-between gap-3"
                    >
                      {isEditingThisPiece ? (
                        <div className="space-y-2 animate-fade-in">
                          <input
                            type="text"
                            value={piece.piece_name}
                            onChange={(e) =>
                              updateStationeryPiece(piece.id, { piece_name: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={piece.moment}
                            onChange={(e) =>
                              updateStationeryPiece(piece.id, { moment: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                          <input
                            type="text"
                            value={piece.format_and_paper}
                            onChange={(e) =>
                              updateStationeryPiece(piece.id, {
                                format_and_paper: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                          <input
                            type="text"
                            value={piece.finish_details}
                            onChange={(e) =>
                              updateStationeryPiece(piece.id, {
                                finish_details: e.target.value,
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingPieceId(null)}
                            className="w-full py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                          >
                            Listo
                          </button>
                        </div>
                      ) : (
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

                            <div className="flex items-center gap-1 shrink-0 print:hidden">
                              <select
                                value={piece.status}
                                onChange={(e) => {
                                  updateStationeryStatus(
                                    piece.id,
                                    e.target.value as ProposalApprovalStatus
                                  );
                                  showToast(`Estado de "${piece.piece_name}" actualizado`);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
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

                              {studioEditMode && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setEditingPieceId(piece.id)}
                                    className="p-1.5 text-text-muted hover:text-primary cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteStationeryPiece(piece.id)}
                                    className="p-1.5 text-text-muted hover:text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-text-secondary">
                            <strong>Formato y soporte:</strong> {piece.format_and_paper}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            <strong>Acabado:</strong> {piece.finish_details}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {studioEditMode && (
                <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle grid grid-cols-1 sm:grid-cols-5 gap-2 print:hidden">
                  <input
                    type="text"
                    placeholder="+ Nueva pieza (ej. Tarjeta agradecimiento)"
                    value={newPieceName}
                    onChange={(e) => setNewPieceName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Momento (ej. Banquete)"
                    value={newPieceMoment}
                    onChange={(e) => setNewPieceMoment(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Formato y papel..."
                    value={newPieceFormat}
                    onChange={(e) => setNewPieceFormat(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Acabados (lacre, cinta...)"
                    value={newPieceFinish}
                    onChange={(e) => setNewPieceFinish(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPieceName.trim()) return;
                      addStationeryPiece({
                        piece_name: newPieceName.trim(),
                        moment: newPieceMoment.trim() || 'Jornada de la boda',
                        format_and_paper:
                          newPieceFormat.trim() || 'Papel algodón 300g coordinado',
                        finish_details:
                          newPieceFinish.trim() || 'Tipografía y monograma oficial',
                        status: 'in_review',
                      });
                      setNewPieceName('');
                      setNewPieceMoment('');
                      setNewPieceFormat('');
                      setNewPieceFinish('');
                      showToast('✓ Pieza añadida a la papelería');
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    + Añadir Pieza
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          APARTADOS 12 Y 13: COHERENCIA VISUAL + PRIORIZACIÓN SEGÚN PRESUPUESTO
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
              {dossier.coherence_guidelines.golden_rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-bg-secondary/35 border border-border-subtle space-y-1.5 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg text-text-primary font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                      <span>{rule.title}</span>
                    </h3>
                    {studioEditMode && (
                      <button
                        type="button"
                        onClick={() => {
                          updateCoherenceGuidelines({
                            golden_rules:
                              dossier.coherence_guidelines.golden_rules.filter(
                                (_, i) => i !== idx
                              ),
                          });
                        }}
                        className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>

            {studioEditMode && (
              <div className="p-3.5 rounded-2xl bg-bg-secondary/40 border border-border-subtle flex flex-col sm:flex-row gap-2 print:hidden">
                <input
                  type="text"
                  placeholder="Título de nueva regla de coherencia..."
                  value={newGoldenRule.title}
                  onChange={(e) =>
                    setNewGoldenRule({ ...newGoldenRule, title: e.target.value })
                  }
                  className="sm:w-64 px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs"
                />
                <input
                  type="text"
                  placeholder="Explicación de la recomendación..."
                  value={newGoldenRule.description}
                  onChange={(e) =>
                    setNewGoldenRule({ ...newGoldenRule, description: e.target.value })
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newGoldenRule.title.trim()) return;
                    updateCoherenceGuidelines({
                      golden_rules: [
                        ...dossier.coherence_guidelines.golden_rules,
                        {
                          title: newGoldenRule.title.trim(),
                          description: newGoldenRule.description.trim(),
                        },
                      ],
                    });
                    setNewGoldenRule({ title: '', description: '' });
                    showToast('✓ Regla de coherencia añadida');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                >
                  + Añadir Regla
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* QUÉ SÍ POTENCIAR */}
              <div className="p-5 rounded-2xl bg-brand-olive/10 border border-brand-olive/30 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-olive flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Qué SÍ potenciar para mantener la armonía</span>
                </span>
                <ul className="space-y-2 text-xs text-text-primary">
                  {dossier.coherence_guidelines.dos.map((d, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </span>
                      {studioEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            updateCoherenceGuidelines({
                              dos: dossier.coherence_guidelines.dos.filter(
                                (_, idx) => idx !== i
                              ),
                            });
                          }}
                          className="text-text-muted hover:text-rose-600 cursor-pointer print:hidden"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {studioEditMode && (
                  <div className="flex gap-1.5 pt-1 print:hidden">
                    <input
                      type="text"
                      placeholder="+ Añadir recomendación positiva..."
                      value={newDoItem}
                      onChange={(e) => setNewDoItem(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDoItem.trim()) return;
                        updateCoherenceGuidelines({
                          dos: [...dossier.coherence_guidelines.dos, newDoItem.trim()],
                        });
                        setNewDoItem('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-olive text-white text-xs font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* QUÉ EVITAR */}
              <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Qué evitar para no romper la estética</span>
                </span>
                <ul className="space-y-2 text-xs text-rose-950">
                  {dossier.coherence_guidelines.donts.map((dn, i) => (
                    <li key={i} className="flex items-start justify-between gap-2">
                      <span className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold">×</span>
                        <span>{dn}</span>
                      </span>
                      {studioEditMode && (
                        <button
                          type="button"
                          onClick={() => {
                            updateCoherenceGuidelines({
                              donts: dossier.coherence_guidelines.donts.filter(
                                (_, idx) => idx !== i
                              ),
                            });
                          }}
                          className="text-rose-400 hover:text-rose-700 cursor-pointer print:hidden"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {studioEditMode && (
                  <div className="flex gap-1.5 pt-1 print:hidden">
                    <input
                      type="text"
                      placeholder="+ Añadir elemento a evitar..."
                      value={newDontItem}
                      onChange={(e) => setNewDontItem(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDontItem.trim()) return;
                        updateCoherenceGuidelines({
                          donts: [...dossier.coherence_guidelines.donts, newDontItem.trim()],
                        });
                        setNewDontItem('');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}
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
              </div>

              <div className="flex items-center gap-3 flex-wrap shrink-0">
                <div className="p-3 rounded-2xl bg-bg-secondary/50 border border-border-subtle flex items-center gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-text-muted block">
                      Partidas Decorativas en Presupuesto
                    </span>
                    <p className="font-serif text-lg text-text-primary font-semibold">
                      {stats.totalDecoBudget > 0
                        ? formatCurrency(stats.totalDecoBudget)
                        : 'Ver en Presupuesto'}
                    </p>
                  </div>
                  <Link
                    href="/admin/budget"
                    className="px-3 py-1.5 rounded-xl bg-bg-card border border-border-subtle text-xs font-semibold hover:bg-bg-secondary inline-flex items-center gap-1 print:hidden"
                  >
                    <span>Presupuesto</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {studioEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsAddingPriority(!isAddingPriority)}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-text text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Añadir Prioridad</span>
                  </button>
                )}
              </div>
            </div>

            {isAddingPriority && (
              <div className="p-5 rounded-2xl bg-bg-secondary/40 border border-primary/30 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Elemento decorativo..."
                    value={prioForm.element_name}
                    onChange={(e) =>
                      setPrioForm({ ...prioForm, element_name: e.target.value })
                    }
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <select
                    value={prioForm.priority_level}
                    onChange={(e) =>
                      setPrioForm({
                        ...prioForm,
                        priority_level: e.target.value as 'alta' | 'media' | 'optimizable',
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  >
                    <option value="alta">Prioridad Alta</option>
                    <option value="media">Prioridad Media</option>
                    <option value="optimizable">Prioridad Optimizable</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Peso (ej. 20% partida)"
                    value={prioForm.estimated_share}
                    onChange={(e) =>
                      setPrioForm({ ...prioForm, estimated_share: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <textarea
                    rows={2}
                    placeholder="¿Por qué priorizarlo? (Impacto visual y en fotos)..."
                    value={prioForm.rationale}
                    onChange={(e) => setPrioForm({ ...prioForm, rationale: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                  <textarea
                    rows={2}
                    placeholder="Fórmula de optimización de presupuesto / reutilización..."
                    value={prioForm.smart_saving_tip}
                    onChange={(e) =>
                      setPrioForm({ ...prioForm, smart_saving_tip: e.target.value })
                    }
                    className="px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPriority(false)}
                    className="px-4 py-1.5 rounded-xl border border-border-subtle bg-bg-card text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!prioForm.element_name.trim()) return;
                      addBudgetPriorityItem(prioForm);
                      setIsAddingPriority(false);
                      showToast('✓ Elemento añadido a la matriz de presupuesto');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                  >
                    Guardar Prioridad
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {dossier.budget_priorities.map((item) => {
                const isEditingPrio = editingPriorityId === item.id;
                return (
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
                    {isEditingPrio ? (
                      <div className="lg:col-span-12 space-y-3 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <input
                            type="text"
                            value={item.element_name}
                            onChange={(e) =>
                              updateBudgetPriorityItem(item.id, {
                                element_name: e.target.value,
                              })
                            }
                            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-semibold"
                          />
                          <select
                            value={item.priority_level}
                            onChange={(e) =>
                              updateBudgetPriorityItem(item.id, {
                                priority_level: e.target.value as
                                  | 'alta'
                                  | 'media'
                                  | 'optimizable',
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          >
                            <option value="alta">Prioridad Alta</option>
                            <option value="media">Prioridad Media</option>
                            <option value="optimizable">Prioridad Optimizable</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono">Impacto:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={item.visual_impact_score}
                              onChange={(e) =>
                                updateBudgetPriorityItem(item.id, {
                                  visual_impact_score: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <textarea
                            rows={2}
                            value={item.rationale}
                            onChange={(e) =>
                              updateBudgetPriorityItem(item.id, { rationale: e.target.value })
                            }
                            className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                          <textarea
                            rows={2}
                            value={item.smart_saving_tip}
                            onChange={(e) =>
                              updateBudgetPriorityItem(item.id, {
                                smart_saving_tip: e.target.value,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingPriorityId(null)}
                            className="px-4 py-1.5 rounded-lg bg-primary text-primary-text text-xs font-semibold cursor-pointer"
                          >
                            Listo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="lg:col-span-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
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
                                Impacto: <strong>{item.visual_impact_score}/10</strong>
                              </span>
                            </div>

                            {studioEditMode && (
                              <div className="flex items-center gap-1 print:hidden">
                                <button
                                  type="button"
                                  onClick={() => setEditingPriorityId(item.id)}
                                  className="p-1 text-text-muted hover:text-primary cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteBudgetPriorityItem(item.id)}
                                  className="p-1 text-text-muted hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
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
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
