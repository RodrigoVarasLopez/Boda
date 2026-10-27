'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Wedding, WeddingStatus, ThemeType } from './types';
import { INITIAL_WEDDING } from './mock-data';

export const INITIAL_PLANNER_WEDDINGS: Wedding[] = [
  {
    ...INITIAL_WEDDING,
    status: 'confirmed',
    planner_name: 'Wedding Planner Pro',
    guest_target_count: 180,
    budget_target: 35000,
  },
  {
    id: 'w-alejandro-carmen-2027',
    slug: 'alejandro-y-carmen',
    couple_names: 'Alejandro & Carmen',
    bride_name: 'Carmen',
    groom_name: 'Alejandro',
    wedding_date: '2027-06-19T18:30:00.000Z',
    location_summary: 'Finca Las Encinas · Pozuelo de Alarcón (Madrid)',
    theme: 'editorial',
    privacy_mode: false,
    rsvp_deadline: '2027-05-15T23:59:59.000Z',
    hero_message: 'El amor se celebra compartiéndolo con las personas que hacen nuestra vida inolvidable',
    welcome_quote: 'Nos hace una ilusión inmensa dar este paso y reunirnos en Madrid para brindar juntos.',
    status: 'planning',
    planner_name: 'Wedding Planner Pro',
    guest_target_count: 150,
    budget_target: 28500,
    iban_details: {
      account_holder: 'Alejandro & Carmen',
      iban: 'ES76 0049 1500 0512 3456 7890',
      bank_name: 'Banco Santander',
    },
  },
  {
    id: 'w-mateo-lucia-2027',
    slug: 'mateo-y-lucia',
    couple_names: 'Mateo & Lucía',
    bride_name: 'Lucía',
    groom_name: 'Mateo',
    wedding_date: '2027-09-18T17:00:00.000Z',
    location_summary: 'Hacienda San Rafael · Las Cabezas de San Juan (Sevilla)',
    theme: 'cinematic',
    privacy_mode: false,
    rsvp_deadline: '2027-08-10T23:59:59.000Z',
    hero_message: 'Bajo el atardecer andaluz, prometemos escribir juntos el capítulo más bonito',
    welcome_quote: 'Una boda entre olivos, luz dorada y música en directo para celebrar nuestro día.',
    status: 'planning',
    planner_name: 'Wedding Planner Pro',
    guest_target_count: 220,
    budget_target: 44000,
    iban_details: {
      account_holder: 'Mateo & Lucía',
      iban: 'ES21 0182 2300 4502 0155 9876',
      bank_name: 'BBVA',
    },
  },
];

const STORAGE_KEY_WEDDINGS = 'boda_planner_weddings_v3';
const STORAGE_KEY_ACTIVE_WEDDING = 'boda_planner_active_wedding_id_v3';
const PLANNER_UPDATE_EVENT = 'boda_planner_updated';

export function getStoredWeddings(): Wedding[] {
  if (typeof window === 'undefined') return INITIAL_PLANNER_WEDDINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEDDINGS);
    if (!raw) return INITIAL_PLANNER_WEDDINGS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return INITIAL_PLANNER_WEDDINGS;
}

export function saveStoredWeddings(weddings: Wedding[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WEDDINGS, JSON.stringify(weddings));
    window.dispatchEvent(new CustomEvent(PLANNER_UPDATE_EVENT));
  } catch (e) {
    console.error('Error saving weddings to storage:', e);
  }
}

export function getActiveWeddingId(): string {
  if (typeof window === 'undefined') return INITIAL_PLANNER_WEDDINGS[0].id;
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_WEDDING);
    if (active) return active;
  } catch {}
  return INITIAL_PLANNER_WEDDINGS[0].id;
}

export function setActiveWeddingId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_WEDDING, id);
    window.dispatchEvent(new CustomEvent(PLANNER_UPDATE_EVENT));
  } catch (e) {
    console.error('Error saving active wedding id:', e);
  }
}

export function useWeddingPlanner() {
  const [weddings, setWeddings] = useState<Wedding[]>(() => getStoredWeddings());
  const [activeWeddingId, setActiveId] = useState<string>(() => getActiveWeddingId());
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    const loadedWeddings = getStoredWeddings();
    setWeddings(loadedWeddings);
    const activeId = getActiveWeddingId();
    if (loadedWeddings.some((w) => w.id === activeId)) {
      setActiveId(activeId);
    } else if (loadedWeddings.length > 0) {
      setActiveId(loadedWeddings[0].id);
      setActiveWeddingId(loadedWeddings[0].id);
    }
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === STORAGE_KEY_WEDDINGS ||
        e.key === STORAGE_KEY_ACTIVE_WEDDING
      ) {
        refresh();
      }
    };
    const handleCustom = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PLANNER_UPDATE_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PLANNER_UPDATE_EVENT, handleCustom);
    };
  }, [refresh]);

  const activeWedding = useMemo(() => {
    return weddings.find((w) => w.id === activeWeddingId) || weddings[0] || INITIAL_PLANNER_WEDDINGS[0];
  }, [weddings, activeWeddingId]);

  const selectWedding = useCallback((id: string) => {
    setActiveId(id);
    setActiveWeddingId(id);
  }, []);

  const createWedding = useCallback(
    (newWeddingData: {
      couple_names: string;
      bride_name?: string;
      groom_name?: string;
      wedding_date: string;
      location_summary: string;
      slug?: string;
      theme?: ThemeType;
      guest_target_count?: number;
      budget_target?: number;
      planner_notes?: string;
    }) => {
      const generatedSlug = (
        newWeddingData.slug ||
        newWeddingData.couple_names
          .toLowerCase()
          .replace(/[&]/g, 'y')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );

      const [n1, n2] = newWeddingData.couple_names.split('&').map((s) => s.trim());

      const newWedding: Wedding = {
        id: `w-${Date.now()}`,
        slug: generatedSlug,
        couple_names: newWeddingData.couple_names,
        bride_name: newWeddingData.bride_name || n2 || 'Novia',
        groom_name: newWeddingData.groom_name || n1 || 'Novio',
        wedding_date: newWeddingData.wedding_date,
        location_summary: newWeddingData.location_summary,
        theme: newWeddingData.theme || 'editorial',
        privacy_mode: false,
        rsvp_deadline: new Date(new Date(newWeddingData.wedding_date).getTime() - 30 * 24 * 3600 * 1000).toISOString(),
        hero_message: 'Nos casamos y no nos imaginaríamos este día sin vosotros',
        welcome_quote: 'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas.',
        status: 'planning',
        planner_name: 'Wedding Planner Pro',
        guest_target_count: newWeddingData.guest_target_count || 100,
        budget_target: newWeddingData.budget_target || 25000,
      };

      setWeddings((prev) => {
        const next = [newWedding, ...prev];
        saveStoredWeddings(next);
        return next;
      });

      selectWedding(newWedding.id);
      return newWedding;
    },
    [selectWedding]
  );

  const updateWedding = useCallback(
    (id: string, updates: Partial<Wedding>) => {
      setWeddings((prev) => {
        const next = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
        saveStoredWeddings(next);
        return next;
      });
    },
    []
  );

  const deleteWedding = useCallback(
    (id: string) => {
      setWeddings((prev) => {
        if (prev.length <= 1) return prev; // Preserve at least one wedding
        const next = prev.filter((w) => w.id !== id);
        saveStoredWeddings(next);
        if (activeWeddingId === id) {
          const fallback = next[0];
          setActiveId(fallback.id);
          setActiveWeddingId(fallback.id);
        }
        return next;
      });
    },
    [activeWeddingId]
  );

  const stats = useMemo(() => {
    const totalWeddings = weddings.length;
    const confirmedWeddings = weddings.filter((w) => w.status === 'confirmed').length;
    const planningWeddings = weddings.filter((w) => w.status === 'planning').length;
    const totalTargetGuests = weddings.reduce((acc, w) => acc + (w.guest_target_count || 0), 0);
    const totalBudgetTarget = weddings.reduce((acc, w) => acc + (w.budget_target || 0), 0);

    return {
      totalWeddings,
      confirmedWeddings,
      planningWeddings,
      totalTargetGuests,
      totalBudgetTarget,
    };
  }, [weddings]);

  return {
    weddings,
    activeWedding,
    activeWeddingId,
    selectWedding,
    createWedding,
    updateWedding,
    deleteWedding,
    stats,
    isLoaded,
  };
}
