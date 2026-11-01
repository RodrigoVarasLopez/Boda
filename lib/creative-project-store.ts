'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CreativeProjectDossier,
  ProposalApprovalStatus,
  CreativeColorSwatch,
  CreativeMoodboardItem,
  CreativeStationeryItem,
  CreativeBudgetPriorityItem,
  CreativeSpecialCorner,
  CreativeSpaceProposal,
  CreativeCompositionItem,
  CreativeLayoutSchema,
  getStoredCreativeDossier,
  setStoredCreativeDossier,
  INITIAL_CREATIVE_DOSSIER,
  CREATIVE_PROJECT_UPDATE_EVENT,
  STORAGE_KEY_CREATIVE_PROJECT,
} from './creative-project-data';
import {
  getStoredBudgetCategories,
  getStoredBudgetSuppliers,
  getEffectiveSupplierPrice,
} from './budget-data';

// Curated Color Palette Presets for 1-click testing by the Wedding Planner
export const COLOR_PALETTE_PRESETS: {
  id: string;
  name: string;
  description: string;
  swatches: CreativeColorSwatch[];
}[] = [
  {
    id: 'cerrato-reserva',
    name: 'Raíces del Cerrato & Reserva (Original)',
    description: 'Piedra caliza, verde olivo silvestre, arena espiga y acento burdeos enológico.',
    swatches: INITIAL_CREATIVE_DOSSIER.color_palette,
  },
  {
    id: 'toscana-sol',
    name: 'Toscana & Atardecer Dorado',
    description: 'Lino crema, terracota suave, verde salvia empolvado, ocre miel y bronce.',
    swatches: [
      {
        id: 'col-1',
        name: 'Crema Travertino',
        hex: '#FAF6F0',
        role: 'Base Principal (45%)',
        usage: 'Mantelería de lino, papel algodón y flor base luminosa.',
      },
      {
        id: 'col-2',
        name: 'Salvia Mediterránea',
        hex: '#7A8B7B',
        role: 'Secundario Botánico (25%)',
        usage: 'Eucalipto, cintas de seda y sobres de papelería.',
      },
      {
        id: 'col-3',
        name: 'Terracota Suave',
        hex: '#C87D65',
        role: 'Acento Cálido (15%)',
        usage: 'Ánforas artesanales, rosas toffee y lacres.',
      },
      {
        id: 'col-4',
        name: 'Ocre Dorado & Miel',
        hex: '#D9B382',
        role: 'Luz & Textura (10%)',
        usage: 'Candelabros de latón, bajoplatos y velas cálidas.',
      },
      {
        id: 'col-5',
        name: 'Sepia Oscuro',
        hex: '#2E2622',
        role: 'Tipografía & Contraste (5%)',
        usage: 'Impresión de minutas, meseros y caligrafía.',
      },
    ],
  },
  {
    id: 'jardin-ingles',
    name: 'Jardín Inglés & Romanticismo Puro',
    description: 'Blanco nube, verde bosque fresco, rosa empolvado blush, champagne y grafito.',
    swatches: [
      {
        id: 'col-1',
        name: 'Blanco Nube & Seda',
        hex: '#FBFBF9',
        role: 'Base Principal (45%)',
        usage: 'Rosas inglesas blancas, mantelería y papelería clásica.',
      },
      {
        id: 'col-2',
        name: 'Verde Jardín Fresco',
        hex: '#4A614D',
        role: 'Secundario Botánico (25%)',
        usage: 'Follaje de jardín, hiedra, ruscus y guirnaldas.',
      },
      {
        id: 'col-3',
        name: 'Rosa Blush Empolvado',
        hex: '#E6CCD2',
        role: 'Matiz Romántico (15%)',
        usage: 'Peonías/rosas de jardín, lazos de gasa y detalles de mesa.',
      },
      {
        id: 'col-4',
        name: 'Champagne & Nácar',
        hex: '#DFD3C3',
        role: 'Neutro Elegante (10%)',
        usage: 'Cristalería labrada, velas altas y filo dorado.',
      },
      {
        id: 'col-5',
        name: 'Gris Antracita',
        hex: '#2B2D2F',
        role: 'Tipografía & Contraste (5%)',
        usage: 'Tipografía serif clásica y monograma.',
      },
    ],
  },
  {
    id: 'minimal-editorial',
    name: 'Minimalismo Editorial Contemporáneo',
    description: 'Monocromo cálido en tonos alabastro, arena, topo arquitectónico y negro tinta.',
    swatches: [
      {
        id: 'col-1',
        name: 'Alabastro Puro',
        hex: '#F5F4F0',
        role: 'Base Principal (50%)',
        usage: 'Orquídeas/rosas blancas, manteles lisos y bloques limpios.',
      },
      {
        id: 'col-2',
        name: 'Piedra Topo (Taupe)',
        hex: '#9E9589',
        role: 'Secundario Arquitectónico (20%)',
        usage: 'Cerámica escultural, servilletas de lino y fondos.',
      },
      {
        id: 'col-3',
        name: 'Arena Desierto',
        hex: '#DDD5C7',
        role: 'Textura Suave (15%)',
        usage: 'Papelería minimalista y mobiliario de diseño.',
      },
      {
        id: 'col-4',
        name: 'Verde Olivo Oscuro',
        hex: '#3F4739',
        role: 'Contraste Orgánico (10%)',
        usage: 'Ramas estructurales de corte arquitectónico.',
      },
      {
        id: 'col-5',
        name: 'Negro Editorial',
        hex: '#141413',
        role: 'Acento Gráfico (5%)',
        usage: 'Tipografía moderna, lazos finos y portavelas.',
      },
    ],
  },
];

export function useCreativeProjectStore() {
  const [dossier, setDossier] = useState<CreativeProjectDossier>(() =>
    getStoredCreativeDossier()
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadDossier = useCallback(() => {
    setDossier(getStoredCreativeDossier());
  }, []);

  useEffect(() => {
    reloadDossier();
    setIsLoaded(true);

    const handleUpdate = () => reloadDossier();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith(STORAGE_KEY_CREATIVE_PROJECT)) {
        reloadDossier();
      }
    };

    window.addEventListener(CREATIVE_PROJECT_UPDATE_EVENT, handleUpdate);
    window.addEventListener('boda_planner_updated', handleUpdate);
    window.addEventListener('boda_budget_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(CREATIVE_PROJECT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('boda_planner_updated', handleUpdate);
      window.removeEventListener('boda_budget_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadDossier]);

  const saveDossier = useCallback((next: CreativeProjectDossier) => {
    setDossier(next);
    setStoredCreativeDossier(next);
  }, []);

  // Calculate approval stats and live budget link for decorative categories
  const stats = useMemo(() => {
    const allStatuses: ProposalApprovalStatus[] = [
      ...dossier.space_proposals.map((s) => s.status),
      ...dossier.special_corners.map((c) => c.status),
      ...dossier.stationery.pieces.map((p) => p.status),
    ];
    const totalDeliverables = allStatuses.length;
    const approvedCount = allStatuses.filter((s) => s === 'approved').length;
    const inReviewCount = allStatuses.filter((s) => s === 'in_review').length;
    const approvalPercent =
      totalDeliverables > 0
        ? Math.round((approvedCount / totalDeliverables) * 100)
        : 100;

    const categories = getStoredBudgetCategories();
    const suppliers = getStoredBudgetSuppliers();
    const decoKeywords = ['flor', 'decoración', 'decoracion', 'estación dj', 'pirotecnia'];
    let totalDecoBudget = 0;

    for (const cat of categories) {
      if (decoKeywords.some((kw) => cat.name.toLowerCase().includes(kw))) {
        const selectedSup = suppliers.find(
          (s) => s.category_id === cat.id && s.is_selected
        );
        if (selectedSup) {
          totalDecoBudget += getEffectiveSupplierPrice(selectedSup);
        }
      }
    }

    return {
      totalDeliverables,
      approvedCount,
      inReviewCount,
      approvalPercent,
      totalDecoBudget,
    };
  }, [dossier]);

  // 0. Project Header Meta
  const updateProjectMeta = useCallback(
    (patch: { project_title?: string; project_subtitle?: string }) => {
      const current = getStoredCreativeDossier();
      saveDossier({ ...current, ...patch });
    },
    [saveDossier]
  );

  // 1. Concept
  const updateConcept = useCallback(
    (patch: Partial<CreativeProjectDossier['concept']>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        concept: { ...current.concept, ...patch },
      });
    },
    [saveDossier]
  );

  // 2. Moodboard CRUD
  const addMoodboardItem = useCallback(
    (item: Omit<CreativeMoodboardItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newItem: CreativeMoodboardItem = {
        ...item,
        id: `mb-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      };
      saveDossier({
        ...current,
        moodboard: [...current.moodboard, newItem],
      });
    },
    [saveDossier]
  );

  const updateMoodboardItem = useCallback(
    (id: string, patch: Partial<CreativeMoodboardItem>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        moodboard: current.moodboard.map((m) =>
          m.id === id ? { ...m, ...patch } : m
        ),
      });
    },
    [saveDossier]
  );

  const deleteMoodboardItem = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        moodboard: current.moodboard.filter((m) => m.id !== id),
      });
    },
    [saveDossier]
  );

  // 3. Color Palette CRUD
  const addColorSwatch = useCallback(
    (swatch: Omit<CreativeColorSwatch, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newSwatch: CreativeColorSwatch = {
        ...swatch,
        id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      };
      saveDossier({
        ...current,
        color_palette: [...current.color_palette, newSwatch],
      });
    },
    [saveDossier]
  );

  const updateColorSwatch = useCallback(
    (id: string, patch: Partial<CreativeColorSwatch>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        color_palette: current.color_palette.map((col) =>
          col.id === id ? { ...col, ...patch } : col
        ),
      });
    },
    [saveDossier]
  );

  const deleteColorSwatch = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        color_palette: current.color_palette.filter((col) => col.id !== id),
      });
    },
    [saveDossier]
  );

  const applyColorPalettePreset = useCallback(
    (presetId: string) => {
      const preset = COLOR_PALETTE_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        color_palette: preset.swatches.map((s) => ({ ...s })),
      });
    },
    [saveDossier]
  );

  // 4. Materials, Textures & Florals
  const updateMaterialsAndFlorals = useCallback(
    (patch: Partial<CreativeProjectDossier['materials_and_florals']>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        materials_and_florals: {
          ...current.materials_and_florals,
          ...patch,
        },
      });
    },
    [saveDossier]
  );

  // 5, 6, 7. Space Proposals (Ceremonia, Cóctel, Banquete)
  const updateSpaceProposalStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        space_proposals: current.space_proposals.map((sp) =>
          sp.id === id ? { ...sp, status } : sp
        ),
      });
    },
    [saveDossier]
  );

  const updateSpaceProposal = useCallback(
    (id: string, patch: Partial<CreativeSpaceProposal>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        space_proposals: current.space_proposals.map((sp) =>
          sp.id === id ? { ...sp, ...patch } : sp
        ),
      });
    },
    [saveDossier]
  );

  // 8. Decorative Compositions CRUD
  const addComposition = useCallback(
    (comp: Omit<CreativeCompositionItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newComp: CreativeCompositionItem = {
        ...comp,
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      };
      saveDossier({
        ...current,
        compositions: [...current.compositions, newComp],
      });
    },
    [saveDossier]
  );

  const updateComposition = useCallback(
    (id: string, patch: Partial<CreativeCompositionItem>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        compositions: current.compositions.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      });
    },
    [saveDossier]
  );

  const deleteComposition = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        compositions: current.compositions.filter((c) => c.id !== id),
      });
    },
    [saveDossier]
  );

  // 9. Special Corners CRUD
  const updateCornerStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        special_corners: current.special_corners.map((c) =>
          c.id === id ? { ...c, status } : c
        ),
      });
    },
    [saveDossier]
  );

  const updateSpecialCorner = useCallback(
    (id: string, patch: Partial<CreativeSpecialCorner>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        special_corners: current.special_corners.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      });
    },
    [saveDossier]
  );

  const addSpecialCorner = useCallback(
    (corner: Omit<CreativeSpecialCorner, 'id' | 'corner_number'>) => {
      const current = getStoredCreativeDossier();
      const nextNum = ((current.special_corners.length % 3) + 1) as 1 | 2 | 3;
      const newCorner: CreativeSpecialCorner = {
        ...corner,
        id: `corner-${Date.now()}`,
        corner_number: nextNum,
      };
      saveDossier({
        ...current,
        special_corners: [...current.special_corners, newCorner],
      });
    },
    [saveDossier]
  );

  const deleteSpecialCorner = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        special_corners: current.special_corners.filter((c) => c.id !== id),
      });
    },
    [saveDossier]
  );

  // 10. Layout Schemas CRUD
  const updateLayoutSchema = useCallback(
    (id: string, patch: Partial<CreativeLayoutSchema>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        layout_schemas: current.layout_schemas.map((ls) =>
          ls.id === id ? { ...ls, ...patch } : ls
        ),
      });
    },
    [saveDossier]
  );

  const addLayoutSchema = useCallback(
    (schema: Omit<CreativeLayoutSchema, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newSchema: CreativeLayoutSchema = {
        ...schema,
        id: `layout-${Date.now()}`,
      };
      saveDossier({
        ...current,
        layout_schemas: [...current.layout_schemas, newSchema],
      });
    },
    [saveDossier]
  );

  const deleteLayoutSchema = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        layout_schemas: current.layout_schemas.filter((ls) => ls.id !== id),
      });
    },
    [saveDossier]
  );

  // 11. Stationery Identity & Pieces CRUD
  const updateStationeryIdentity = useCallback(
    (
      patch: Partial<
        Omit<CreativeProjectDossier['stationery'], 'pieces'>
      >
    ) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        stationery: {
          ...current.stationery,
          ...patch,
        },
      });
    },
    [saveDossier]
  );

  const updateStationeryStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        stationery: {
          ...current.stationery,
          pieces: current.stationery.pieces.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        },
      });
    },
    [saveDossier]
  );

  const updateStationeryPiece = useCallback(
    (id: string, patch: Partial<CreativeStationeryItem>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        stationery: {
          ...current.stationery,
          pieces: current.stationery.pieces.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        },
      });
    },
    [saveDossier]
  );

  const addStationeryPiece = useCallback(
    (piece: Omit<CreativeStationeryItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newPiece: CreativeStationeryItem = {
        ...piece,
        id: `stat-${Date.now()}`,
      };
      saveDossier({
        ...current,
        stationery: {
          ...current.stationery,
          pieces: [...current.stationery.pieces, newPiece],
        },
      });
    },
    [saveDossier]
  );

  const deleteStationeryPiece = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        stationery: {
          ...current.stationery,
          pieces: current.stationery.pieces.filter((p) => p.id !== id),
        },
      });
    },
    [saveDossier]
  );

  // 12. Visual Coherence Guidelines CRUD
  const updateCoherenceGuidelines = useCallback(
    (patch: Partial<CreativeProjectDossier['coherence_guidelines']>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        coherence_guidelines: {
          ...current.coherence_guidelines,
          ...patch,
        },
      });
    },
    [saveDossier]
  );

  // 13. Budget Priorities CRUD
  const addBudgetPriorityItem = useCallback(
    (item: Omit<CreativeBudgetPriorityItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newItem: CreativeBudgetPriorityItem = {
        ...item,
        id: `prio-${Date.now()}`,
      };
      saveDossier({
        ...current,
        budget_priorities: [...current.budget_priorities, newItem],
      });
    },
    [saveDossier]
  );

  const updateBudgetPriorityItem = useCallback(
    (id: string, patch: Partial<CreativeBudgetPriorityItem>) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        budget_priorities: current.budget_priorities.map((bp) =>
          bp.id === id ? { ...bp, ...patch } : bp
        ),
      });
    },
    [saveDossier]
  );

  const deleteBudgetPriorityItem = useCallback(
    (id: string) => {
      const current = getStoredCreativeDossier();
      saveDossier({
        ...current,
        budget_priorities: current.budget_priorities.filter((bp) => bp.id !== id),
      });
    },
    [saveDossier]
  );

  const resetCreativeDossier = useCallback(() => {
    setDossier(INITIAL_CREATIVE_DOSSIER);
    setStoredCreativeDossier(INITIAL_CREATIVE_DOSSIER);
  }, []);

  return {
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
  };
}
