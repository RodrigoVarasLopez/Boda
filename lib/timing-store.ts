'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TimingMilestone,
  TimingStatus,
  TimingChecklistItem,
  TimingProfessional,
  TimingDay,
} from './types';
import {
  getStoredTimingMilestones,
  setStoredTimingMilestones,
  INITIAL_TIMING_MILESTONES,
  calculateTimingMetrics,
  parseOperationalMinutes,
  shiftTimeStr,
  TIMING_UPDATE_EVENT,
  STORAGE_KEY_TIMING_MILESTONES,
  DEFAULT_WEDDING_UUID,
} from './timing-data';
import { getStoredBudgetSuppliers, getStoredBudgetCategories } from './budget-data';

export function useTimingStore() {
  const [milestones, setMilestones] = useState<TimingMilestone[]>(() =>
    getStoredTimingMilestones()
  );
  const [simulatedShiftMinutes, setSimulatedShiftMinutes] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const reloadData = useCallback(() => {
    setMilestones(getStoredTimingMilestones());
  }, []);

  useEffect(() => {
    reloadData();
    setIsLoaded(true);

    const handleUpdate = () => reloadData();
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith(STORAGE_KEY_TIMING_MILESTONES)) {
        reloadData();
      }
    };

    window.addEventListener(TIMING_UPDATE_EVENT, handleUpdate);
    window.addEventListener('boda_planner_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(TIMING_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('boda_planner_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reloadData]);

  // Sort milestones chronologically by day (friday first, then saturday) and operational time
  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      if (a.day !== b.day) {
        return a.day === 'friday' ? -1 : 1;
      }
      const timeDiff =
        parseOperationalMinutes(a.start_time) - parseOperationalMinutes(b.start_time);
      if (timeDiff !== 0) return timeDiff;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  }, [milestones]);

  const metrics = useMemo(
    () => calculateTimingMetrics(sortedMilestones, simulatedShiftMinutes),
    [sortedMilestones, simulatedShiftMinutes]
  );

  const createMilestone = useCallback(
    (data: Omit<TimingMilestone, 'id' | 'wedding_id' | 'sort_order'>) => {
      const current = getStoredTimingMilestones();
      const newMilestone: TimingMilestone = {
        ...data,
        id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        wedding_id: DEFAULT_WEDDING_UUID,
        sort_order: current.length + 1,
      };
      const updated = [...current, newMilestone];
      setMilestones(updated);
      setStoredTimingMilestones(updated);
      return newMilestone;
    },
    []
  );

  const updateMilestone = useCallback(
    (id: string, patch: Partial<TimingMilestone>) => {
      const current = getStoredTimingMilestones();
      const updated = current.map((m) => (m.id === id ? { ...m, ...patch } : m));
      setMilestones(updated);
      setStoredTimingMilestones(updated);
    },
    []
  );

  const deleteMilestone = useCallback((id: string) => {
    const current = getStoredTimingMilestones();
    const updated = current.filter((m) => m.id !== id);
    setMilestones(updated);
    setStoredTimingMilestones(updated);
  }, []);

  const duplicateMilestone = useCallback((id: string) => {
    const current = getStoredTimingMilestones();
    const source = current.find((m) => m.id === id);
    if (!source) return;
    const copy: TimingMilestone = {
      ...source,
      id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${source.title} (Copia)`,
      start_time: shiftTimeStr(source.start_time, 15),
      end_time: shiftTimeStr(source.end_time, 15),
      checklist: source.checklist.map((c) => ({
        ...c,
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      professionals: source.professionals.map((p) => ({
        ...p,
        id: `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      })),
      sort_order: current.length + 1,
    };
    const updated = [...current, copy];
    setMilestones(updated);
    setStoredTimingMilestones(updated);
  }, []);

  const updateMilestoneStatus = useCallback((id: string, status: TimingStatus) => {
    const current = getStoredTimingMilestones();
    const updated = current.map((m) => (m.id === id ? { ...m, status } : m));
    setMilestones(updated);
    setStoredTimingMilestones(updated);
  }, []);

  const toggleChecklistItem = useCallback((milestoneId: string, itemId: string) => {
    const current = getStoredTimingMilestones();
    const updated = current.map((m) => {
      if (m.id !== milestoneId) return m;
      const nextChecklist = m.checklist.map((c) =>
        c.id === itemId ? { ...c, completed: !c.completed } : c
      );
      return { ...m, checklist: nextChecklist };
    });
    setMilestones(updated);
    setStoredTimingMilestones(updated);
  }, []);

  const addChecklistItem = useCallback(
    (milestoneId: string, task: string, responsible: string = 'Pareja / Coordinación') => {
      if (!task.trim()) return;
      const current = getStoredTimingMilestones();
      const newItem: TimingChecklistItem = {
        id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        task: task.trim(),
        responsible: responsible.trim() || 'Pareja / Coordinación',
        completed: false,
      };
      const updated = current.map((m) =>
        m.id === milestoneId ? { ...m, checklist: [...m.checklist, newItem] } : m
      );
      setMilestones(updated);
      setStoredTimingMilestones(updated);
    },
    []
  );

  const removeChecklistItem = useCallback((milestoneId: string, itemId: string) => {
    const current = getStoredTimingMilestones();
    const updated = current.map((m) =>
      m.id === milestoneId
        ? { ...m, checklist: m.checklist.filter((c) => c.id !== itemId) }
        : m
    );
    setMilestones(updated);
    setStoredTimingMilestones(updated);
  }, []);

  const applyPermanentTimeShift = useCallback(
    (deltaMinutes: number, dayFilter: TimingDay | 'all' = 'saturday', fromMilestoneId?: string) => {
      if (!deltaMinutes) return;
      const current = getStoredTimingMilestones();
      let fromMinutes: number | null = null;
      if (fromMilestoneId) {
        const ref = current.find((m) => m.id === fromMilestoneId);
        if (ref) fromMinutes = parseOperationalMinutes(ref.start_time);
      }

      const updated = current.map((m) => {
        if (dayFilter !== 'all' && m.day !== dayFilter) return m;
        if (fromMinutes !== null && parseOperationalMinutes(m.start_time) < fromMinutes) {
          return m;
        }
        return {
          ...m,
          start_time: shiftTimeStr(m.start_time, deltaMinutes),
          end_time: shiftTimeStr(m.end_time, deltaMinutes),
        };
      });

      setMilestones(updated);
      setStoredTimingMilestones(updated);
      setSimulatedShiftMinutes(0);
    },
    []
  );

  // Sync supplier names & phones from the Budget & Suppliers module into Timing professionals
  const syncProfessionalsFromBudget = useCallback(() => {
    const suppliers = getStoredBudgetSuppliers();
    const categories = getStoredBudgetCategories();
    const selectedSuppliers = suppliers.filter((s) => s.is_selected);

    if (selectedSuppliers.length === 0) return 0;

    let updatedCount = 0;
    const current = getStoredTimingMilestones();

    const findSelectedByKeyword = (keywords: string[]) => {
      for (const sup of selectedSuppliers) {
        const cat = categories.find((c) => c.id === sup.category_id);
        const haystack = `${cat?.name || ''} ${sup.name} ${sup.comments || ''}`.toLowerCase();
        if (keywords.some((kw) => haystack.includes(kw))) {
          return sup;
        }
      }
      return null;
    };

    const photoSup = findSelectedByKeyword(['fotógraf', 'fotograf', 'foto', 'video', 'vídeo']);
    const djSup = findSelectedByKeyword(['dj', 'sonido', 'estación dj']);
    const flowerSup = findSelectedByKeyword(['flor', 'decoración', 'decoracion']);
    const musicSup = findSelectedByKeyword(['música', 'musica', 'coro', 'cuerda']);
    const pyroSup = findSelectedByKeyword(['pirotecnia', 'fuego']);
    const banquetSup = findSelectedByKeyword(['menú', 'menu', 'banquete', 'concejo', 'catering']);

    const updated = current.map((m) => {
      const nextProfs: TimingProfessional[] = m.professionals.map((p) => {
        let matched = null;
        if (p.role === 'foto_video' && photoSup) matched = photoSup;
        else if (p.role === 'dj_sonido' && djSup) matched = djSup;
        else if (p.role === 'floristeria' && flowerSup) matched = flowerSup;
        else if (p.role === 'musica_ceremonia' && musicSup) matched = musicSup;
        else if (p.role === 'pirotecnia_efectos' && pyroSup) matched = pyroSup;
        else if (p.role === 'catering_finca' && banquetSup && m.day === 'saturday') matched = banquetSup;

        if (matched) {
          updatedCount++;
          return {
            ...p,
            name: matched.name,
            contact_phone: matched.phone || p.contact_phone,
          };
        }
        return p;
      });
      return { ...m, professionals: nextProfs };
    });

    setMilestones(updated);
    setStoredTimingMilestones(updated);
    return updatedCount;
  }, []);

  const resetToDefaultTiming = useCallback(() => {
    setMilestones(INITIAL_TIMING_MILESTONES);
    setStoredTimingMilestones(INITIAL_TIMING_MILESTONES);
    setSimulatedShiftMinutes(0);
  }, []);

  return {
    isLoaded,
    milestones: sortedMilestones,
    metrics,
    simulatedShiftMinutes,
    setSimulatedShiftMinutes,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    duplicateMilestone,
    updateMilestoneStatus,
    toggleChecklistItem,
    addChecklistItem,
    removeChecklistItem,
    applyPermanentTimeShift,
    syncProfessionalsFromBudget,
    resetToDefaultTiming,
  };
}
