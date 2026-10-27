'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wedding,
  ThemeType,
  PlannerOrganization,
  PlatformUser,
  PlatformUserRole,
} from './types';
import { INITIAL_WEDDING } from './mock-data';
import {
  getPlatformSaaSDataAction,
  setActiveWeddingCookieAction,
  createWeddingInDbAction,
  deleteWeddingFromDbAction,
  createPlatformUserAction,
  updatePlatformUserAction,
  deletePlatformUserAction,
} from '@/app/actions';

export const MAIN_WEDDING_ID = 'a0000000-0000-0000-0000-000000000001';
export const DEFAULT_PLATFORM_ORG_ID = 'org-platform-default';

export const INITIAL_PLANNER_WEDDINGS: Wedding[] = [
  {
    ...INITIAL_WEDDING,
    status: 'confirmed',
    planner_org_id: DEFAULT_PLATFORM_ORG_ID,
    planner_name: 'Administración Oficial · Cartera Directa B2C',
    owner_email: 'stephanie2112mendoza@gmail.com',
    guest_target_count: 180,
    budget_target: 35000,
  },
];

export const INITIAL_ORGANIZATIONS: PlannerOrganization[] = [
  {
    id: DEFAULT_PLATFORM_ORG_ID,
    name: 'Administración Oficial · Cartera Directa B2C',
    slug: 'administracion-oficial-b2c',
    owner_email: 'rodrigovaraslopez@gmail.com',
    is_platform_default: true,
    plan_tier: 'b2c_default',
    max_weddings: 9999,
  },
];

const STORAGE_KEY_WEDDINGS = 'boda_planner_weddings_v4';
const STORAGE_KEY_ACTIVE_WEDDING = 'boda_planner_active_wedding_id_v3';
export const PLANNER_UPDATE_EVENT = 'boda_planner_updated';

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
  if (typeof window === 'undefined') return MAIN_WEDDING_ID;
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE_WEDDING);
    if (active) return active;
  } catch {}
  return MAIN_WEDDING_ID;
}

export function setActiveWeddingId(id: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_WEDDING, id);
    document.cookie = `boda_active_wedding_id=${id}; path=/; max-age=31536000; samesite=lax`;
    window.dispatchEvent(new CustomEvent(PLANNER_UPDATE_EVENT));
    window.dispatchEvent(new CustomEvent('boda_store_updated'));
    window.dispatchEvent(new CustomEvent('boda_budget_updated'));
    window.dispatchEvent(new CustomEvent('boda_save_the_date_updated'));
  } catch (e) {
    console.error('Error saving active wedding id:', e);
  }
}

export function useWeddingPlanner() {
  const [weddings, setWeddings] = useState<Wedding[]>(() => getStoredWeddings());
  const [organizations, setOrganizations] = useState<PlannerOrganization[]>(INITIAL_ORGANIZATIONS);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [activeWeddingId, setActiveId] = useState<string>(() => getActiveWeddingId());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingSaaS, setIsLoadingSaaS] = useState(false);

  const refreshLocal = useCallback(() => {
    const loadedWeddings = getStoredWeddings();
    setWeddings(loadedWeddings);
    const activeId = getActiveWeddingId();
    if (loadedWeddings.some((w) => w.id === activeId)) {
      setActiveId(activeId);
    } else if (loadedWeddings.length > 0) {
      setActiveId(loadedWeddings[0].id);
    }
  }, []);

  const reloadPlatformData = useCallback(async () => {
    setIsLoadingSaaS(true);
    try {
      const res = await getPlatformSaaSDataAction();
      if (res && res.success) {
        if (res.weddings && res.weddings.length > 0) {
          setWeddings(res.weddings);
          saveStoredWeddings(res.weddings);

          const currentLocalActive = getActiveWeddingId();
          const validActive = res.weddings.some((w) => w.id === currentLocalActive)
            ? currentLocalActive
            : res.activeWeddingId && res.weddings.some((w) => w.id === res.activeWeddingId)
            ? res.activeWeddingId
            : res.weddings[0].id;

          setActiveId(validActive);
          localStorage.setItem(STORAGE_KEY_ACTIVE_WEDDING, validActive);
          document.cookie = `boda_active_wedding_id=${validActive}; path=/; max-age=31536000; samesite=lax`;
        }
        if (res.organizations) {
          setOrganizations(res.organizations);
        }
        if (res.users) {
          setUsers(res.users);
        }
      }
    } catch (err) {
      console.warn('Error hydrating SaaS platform data:', err);
    } finally {
      setIsLoadingSaaS(false);
    }
  }, []);

  useEffect(() => {
    refreshLocal();
    setIsLoaded(true);
    reloadPlatformData();

    const handleStorage = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === STORAGE_KEY_WEDDINGS ||
        e.key === STORAGE_KEY_ACTIVE_WEDDING
      ) {
        refreshLocal();
      }
    };
    const handleCustom = () => refreshLocal();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PLANNER_UPDATE_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PLANNER_UPDATE_EVENT, handleCustom);
    };
  }, [refreshLocal, reloadPlatformData]);

  const activeWedding = useMemo(() => {
    return (
      weddings.find((w) => w.id === activeWeddingId) ||
      weddings[0] ||
      INITIAL_PLANNER_WEDDINGS[0]
    );
  }, [weddings, activeWeddingId]);

  const selectWedding = useCallback(async (id: string) => {
    setActiveId(id);
    setActiveWeddingId(id);
    await setActiveWeddingCookieAction(id);
  }, []);

  const createWedding = useCallback(
    async (newWeddingData: {
      couple_names: string;
      bride_name?: string;
      groom_name?: string;
      wedding_date: string;
      location_summary: string;
      slug?: string;
      theme?: ThemeType;
      guest_target_count?: number;
      budget_target?: number;
      planner_org_id?: string;
      planner_name?: string;
      owner_email?: string;
      create_couple_user?: boolean;
      couple_password?: string;
    }) => {
      const res = await createWeddingInDbAction(newWeddingData);
      if (res && res.success && res.weddingId) {
        await reloadPlatformData();
        await selectWedding(res.weddingId);
        return res;
      }
      return res;
    },
    [reloadPlatformData, selectWedding]
  );

  const updateWedding = useCallback((id: string, updates: Partial<Wedding>) => {
    setWeddings((prev) => {
      const next = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
      saveStoredWeddings(next);
      return next;
    });
  }, []);

  const deleteWedding = useCallback(
    async (id: string) => {
      if (id === MAIN_WEDDING_ID) {
        return {
          success: false,
          error: 'La boda principal de Stephanie & Rodrigo está protegida y no puede eliminarse.',
        };
      }
      const res = await deleteWeddingFromDbAction(id);
      if (res && res.success) {
        await reloadPlatformData();
        if (activeWeddingId === id) {
          await selectWedding(MAIN_WEDDING_ID);
        }
      }
      return res;
    },
    [activeWeddingId, reloadPlatformData, selectWedding]
  );

  const createPlatformUser = useCallback(
    async (payload: {
      email: string;
      password: string;
      full_name: string;
      role: PlatformUserRole;
      planner_org_id?: string;
      planner_org_name?: string;
      assigned_wedding_id?: string;
      create_new_wedding?: boolean;
      new_wedding_couple?: string;
      new_wedding_date?: string;
      new_wedding_location?: string;
    }) => {
      const res = await createPlatformUserAction(payload);
      if (res && res.success) {
        await reloadPlatformData();
      }
      return res;
    },
    [reloadPlatformData]
  );

  const updatePlatformUser = useCallback(
    async (payload: {
      userId: string;
      full_name?: string;
      role: PlatformUserRole;
      planner_org_id: string;
      planner_org_name: string;
      assigned_wedding_ids: string[];
    }) => {
      const res = await updatePlatformUserAction(payload);
      if (res && res.success) {
        await reloadPlatformData();
      }
      return res;
    },
    [reloadPlatformData]
  );

  const deletePlatformUser = useCallback(
    async (userId: string) => {
      const res = await deletePlatformUserAction(userId);
      if (res && res.success) {
        await reloadPlatformData();
      }
      return res;
    },
    [reloadPlatformData]
  );

  const stats = useMemo(() => {
    const totalWeddings = weddings.length;
    const confirmedWeddings = weddings.filter((w) => w.status === 'confirmed').length;
    const planningWeddings = weddings.filter((w) => w.status === 'planning').length;
    const totalTargetGuests = weddings.reduce(
      (acc, w) => acc + (w.real_guest_count || w.guest_target_count || 0),
      0
    );
    const totalBudgetTarget = weddings.reduce(
      (acc, w) => acc + (w.real_budget_contracted || w.budget_target || 0),
      0
    );

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
    organizations,
    users,
    activeWedding,
    activeWeddingId,
    selectWedding,
    createWedding,
    updateWedding,
    deleteWedding,
    createPlatformUser,
    updatePlatformUser,
    deletePlatformUser,
    reloadPlatformData,
    stats,
    isLoaded,
    isLoadingSaaS,
  };
}
