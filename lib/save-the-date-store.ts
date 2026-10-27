'use client';

import { useState, useEffect, useCallback } from 'react';
import { SaveTheDateConfig, SaveTheDateImages } from './types';

export const DEFAULT_SAVE_THE_DATE_IMAGES: SaveTheDateImages = {
  hero_mobile: '/save-the-date/hero-mobile.jpg',
  hero_desktop: '/save-the-date/hero-desktop.jpg',
  story_1_portrait: '/save-the-date/story-1-portrait.jpg',
  story_1_wide: '/save-the-date/story-1-wide.jpg',
  story_2_detail: '/save-the-date/story-2-detail.jpg',
  story_2_portrait: '/save-the-date/story-2-portrait.jpg',
  story_3_portrait: '/save-the-date/story-3-portrait.jpg',
  story_3_candid: '/save-the-date/story-3-candid.jpg',
  date_horizon: '/save-the-date/date-horizon.jpg',
  final_portrait: '/save-the-date/final-portrait.jpg',
  final_wide: '/save-the-date/final-wide.jpg',
};

export const DEFAULT_SAVE_THE_DATE_WHATSAPP = `✨ ¡Nos casamos! ✨

Rodrigo & Stephanie
28 · 08 · 2027 · Villamuriel de Cerrato (Palencia)

Queremos compartir con vosotros esta gran ilusión. ¡Guarda la fecha en tu calendario! 🗓️🤍

Descubre los primeros detalles y añade el día a tu agenda en nuestro Save the Date:
https://stephanieyrodrigo.com/save-the-date`;

export const DEFAULT_SAVE_THE_DATE_CONFIG: SaveTheDateConfig = {
  couple_names: 'Rodrigo & Stephanie',
  wedding_date: '2027-08-28',
  wedding_date_display: '28 · 08 · 2027',
  wedding_location: 'Villamuriel de Cerrato · Palencia',
  whatsapp_message: DEFAULT_SAVE_THE_DATE_WHATSAPP,
  audio_url: undefined,
  images: DEFAULT_SAVE_THE_DATE_IMAGES,
};

const STD_STORAGE_KEY = 'boda_save_the_date_config_v3';
const STD_UPDATE_EVENT = 'boda-std-updated';

export function getStoredSaveTheDateConfig(): SaveTheDateConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_SAVE_THE_DATE_CONFIG;
  }
  try {
    const raw = localStorage.getItem(STD_STORAGE_KEY);
    if (!raw) return DEFAULT_SAVE_THE_DATE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SAVE_THE_DATE_CONFIG,
      ...parsed,
      images: {
        ...DEFAULT_SAVE_THE_DATE_IMAGES,
        ...(parsed.images || {}),
      },
    };
  } catch {
    return DEFAULT_SAVE_THE_DATE_CONFIG;
  }
}

export function saveSaveTheDateConfig(config: SaveTheDateConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STD_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(STD_UPDATE_EVENT));
  } catch (e) {
    console.error('Error saving Save the Date config:', e);
  }
}

export function useSaveTheDateConfig() {
  const [config, setConfig] = useState<SaveTheDateConfig>(() => getStoredSaveTheDateConfig());
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setConfig(getStoredSaveTheDateConfig());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STD_STORAGE_KEY) {
        refresh();
      }
    };
    const handleCustom = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(STD_UPDATE_EVENT, handleCustom);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STD_UPDATE_EVENT, handleCustom);
    };
  }, [refresh]);

  const updateConfig = useCallback((updater: (prev: SaveTheDateConfig) => SaveTheDateConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveSaveTheDateConfig(next);
      return next;
    });
  }, []);

  const updateImage = useCallback((key: keyof SaveTheDateImages, newUrl: string) => {
    updateConfig((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: newUrl,
      },
    }));
  }, [updateConfig]);

  const resetToDefaults = useCallback(() => {
    saveSaveTheDateConfig(DEFAULT_SAVE_THE_DATE_CONFIG);
    setConfig(DEFAULT_SAVE_THE_DATE_CONFIG);
  }, []);

  return {
    config,
    updateConfig,
    updateImage,
    resetToDefaults,
    isLoaded,
  };
}
