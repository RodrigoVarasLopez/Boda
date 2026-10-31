'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CreativeProjectDossier,
  ProposalApprovalStatus,
  CreativeColorSwatch,
  CreativeStationeryItem,
  CreativeBudgetPriorityItem,
  CreativeSpecialCorner,
  CreativeSpaceProposal,
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

    // Pull decorative budget categories from budget store
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

  const updateConcept = useCallback(
    (patch: Partial<CreativeProjectDossier['concept']>) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        concept: { ...current.concept, ...patch },
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateSpaceProposalStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        space_proposals: current.space_proposals.map((sp) =>
          sp.id === id ? { ...sp, status } : sp
        ),
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateSpaceProposal = useCallback(
    (id: string, patch: Partial<CreativeSpaceProposal>) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        space_proposals: current.space_proposals.map((sp) =>
          sp.id === id ? { ...sp, ...patch } : sp
        ),
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateCornerStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        special_corners: current.special_corners.map((c) =>
          c.id === id ? { ...c, status } : c
        ),
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateSpecialCorner = useCallback(
    (id: string, patch: Partial<CreativeSpecialCorner>) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        special_corners: current.special_corners.map((c) =>
          c.id === id ? { ...c, ...patch } : c
        ),
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateStationeryStatus = useCallback(
    (id: string, status: ProposalApprovalStatus) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        stationery: {
          ...current.stationery,
          pieces: current.stationery.pieces.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        },
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const addStationeryPiece = useCallback(
    (piece: Omit<CreativeStationeryItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newPiece: CreativeStationeryItem = {
        ...piece,
        id: `stat-${Date.now()}`,
      };
      const next: CreativeProjectDossier = {
        ...current,
        stationery: {
          ...current.stationery,
          pieces: [...current.stationery.pieces, newPiece],
        },
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const updateColorSwatch = useCallback(
    (id: string, patch: Partial<CreativeColorSwatch>) => {
      const current = getStoredCreativeDossier();
      const next: CreativeProjectDossier = {
        ...current,
        color_palette: current.color_palette.map((col) =>
          col.id === id ? { ...col, ...patch } : col
        ),
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const addBudgetPriorityItem = useCallback(
    (item: Omit<CreativeBudgetPriorityItem, 'id'>) => {
      const current = getStoredCreativeDossier();
      const newItem: CreativeBudgetPriorityItem = {
        ...item,
        id: `prio-${Date.now()}`,
      };
      const next: CreativeProjectDossier = {
        ...current,
        budget_priorities: [...current.budget_priorities, newItem],
      };
      setDossier(next);
      setStoredCreativeDossier(next);
    },
    []
  );

  const resetCreativeDossier = useCallback(() => {
    setDossier(INITIAL_CREATIVE_DOSSIER);
    setStoredCreativeDossier(INITIAL_CREATIVE_DOSSIER);
  }, []);

  return {
    isLoaded,
    dossier,
    stats,
    updateConcept,
    updateSpaceProposalStatus,
    updateSpaceProposal,
    updateCornerStatus,
    updateSpecialCorner,
    updateStationeryStatus,
    addStationeryPiece,
    updateColorSwatch,
    addBudgetPriorityItem,
    resetCreativeDossier,
  };
}
