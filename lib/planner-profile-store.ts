'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from './supabase/client';

export interface PlannerProfile {
  business_name: string;        // Nombre comercial / Marca (ej: "RV Event Studio", "BodaLab")
  legal_name: string;           // Nombre y apellidos / Titular legal (ej: "Rodrigo Varas López")
  nif_cif: string;              // NIF / CIF / DNI (ej: "71944951P")
  address: string;              // Domicilio profesional / fiscal (calle, número, CP, ciudad, provincia)
  phone: string;                // Teléfono profesional
  email: string;                // Email profesional de contacto y facturación
  slogan: string;               // Slogan o lema comercial
  // Default Bank details for contracts
  bank_name: string;            // Entidad bancaria (ej: "BBVA", "Banco Santander")
  iban: string;                 // Código IBAN completo
  account_holder: string;       // Titular de la cuenta bancaria
  // Operational defaults
  mileage_rate: number;         // Tarifa por km (ej: 0.40 €)
  mileage_origin: string;       // Localidad de origen para desplazamientos
}

export const EMPTY_PLANNER_PROFILE: PlannerProfile = {
  business_name: '',
  legal_name: '',
  nif_cif: '',
  address: '',
  phone: '',
  email: '',
  slogan: '',
  bank_name: '',
  iban: '',
  account_holder: '',
  mileage_rate: 0.4,
  mileage_origin: '',
};

export const STORAGE_KEY_PLANNER_PROFILE = 'boda_planner_fiscal_profile_v1';
export const PLANNER_PROFILE_UPDATE_EVENT = 'boda_planner_profile_updated';

export function getStoredPlannerProfile(): PlannerProfile {
  if (typeof window === 'undefined') return EMPTY_PLANNER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANNER_PROFILE);
    if (!raw) return EMPTY_PLANNER_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_PLANNER_PROFILE, ...parsed };
  } catch {
    return EMPTY_PLANNER_PROFILE;
  }
}

export function saveStoredPlannerProfile(profile: PlannerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PLANNER_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(
      new CustomEvent(PLANNER_PROFILE_UPDATE_EVENT, { detail: profile })
    );
  } catch (e) {
    console.error('Error saving planner profile to localStorage:', e);
  }
}

export function usePlannerProfile() {
  const [profile, setProfile] = useState<PlannerProfile>(() => getStoredPlannerProfile());
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);

  const reloadProfile = useCallback(() => {
    setProfile(getStoredPlannerProfile());
  }, []);

  useEffect(() => {
    reloadProfile();
    setIsLoaded(true);

    // Read active session to pre-suggest email or name if profile is currently completely empty
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (data?.user) {
          const email = data.user.email || null;
          const metaName = data.user.user_metadata?.full_name || null;
          setSessionEmail(email);
          setSessionName(metaName);
        }
      })
      .catch(() => {});

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PLANNER_PROFILE || !e.key) {
        reloadProfile();
      }
    };

    const handleCustom = () => {
      reloadProfile();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PLANNER_PROFILE_UPDATE_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PLANNER_PROFILE_UPDATE_EVENT, handleCustom);
    };
  }, [reloadProfile]);

  const updateProfile = useCallback((updates: Partial<PlannerProfile>) => {
    const current = getStoredPlannerProfile();
    const merged: PlannerProfile = { ...current, ...updates };
    saveStoredPlannerProfile(merged);
    setProfile(merged);
    return merged;
  }, []);

  const resetProfile = useCallback(() => {
    saveStoredPlannerProfile(EMPTY_PLANNER_PROFILE);
    setProfile(EMPTY_PLANNER_PROFILE);
  }, []);

  // Profile is considered complete if both legal identity or business name AND tax id (NIF/CIF) are entered
  const isComplete = Boolean(
    (profile.legal_name.trim() || profile.business_name.trim()) &&
    profile.nif_cif.trim() &&
    profile.address.trim() &&
    profile.email.trim()
  );

  const hasAnyData = Boolean(
    profile.legal_name.trim() ||
    profile.business_name.trim() ||
    profile.nif_cif.trim() ||
    profile.address.trim() ||
    profile.phone.trim() ||
    profile.email.trim() ||
    profile.iban.trim()
  );

  return {
    profile,
    isLoaded,
    isComplete,
    hasAnyData,
    sessionEmail,
    sessionName,
    updateProfile,
    resetProfile,
    reloadProfile,
  };
}
