'use client';

import { useState, useEffect, useCallback } from 'react';
import { MediaPhoto, GuestBookEntry, MediaPhotoStatus, GuestBookEntryStatus } from './types';
import {
  getStoredPhotos,
  setStoredPhotos,
  getStoredGuestbook,
  setStoredGuestbook,
  MEDIA_UPDATE_EVENT,
  STORAGE_KEY_PHOTOS,
  STORAGE_KEY_GUESTBOOK,
  generateFixturePhotos,
  generateFixtureGuestbook,
} from './media-data';

export {
  getStoredPhotos,
  setStoredPhotos,
  getStoredGuestbook,
  setStoredGuestbook,
  generateFixturePhotos,
  generateFixtureGuestbook,
  MEDIA_UPDATE_EVENT,
};

/**
 * React Hook for Media & Guestbook with live synchronization
 */
export function useMediaStore() {
  const [photos, setPhotos] = useState<MediaPhoto[]>(() => getStoredPhotos());
  const [guestbook, setGuestbook] = useState<GuestBookEntry[]>(() => getStoredGuestbook());
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setPhotos(getStoredPhotos());
    setGuestbook(getStoredGuestbook());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);

    const handleUpdate = () => {
      refresh();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PHOTOS || e.key === STORAGE_KEY_GUESTBOOK) {
        refresh();
      }
    };

    window.addEventListener(MEDIA_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(MEDIA_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  // Photo actions
  const addPhoto = useCallback((newPhoto: MediaPhoto) => {
    const current = getStoredPhotos();
    const updated = [newPhoto, ...current];
    setStoredPhotos(updated);
  }, []);

  const approvePhoto = useCallback((id: string) => {
    const current = getStoredPhotos();
    const updated = current.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'approved' as MediaPhotoStatus,
            is_approved: true,
            is_visible: true,
            updated_at: new Date().toISOString(),
          }
        : p
    );
    setStoredPhotos(updated);
  }, []);

  const hidePhoto = useCallback((id: string) => {
    const current = getStoredPhotos();
    const updated = current.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'hidden' as MediaPhotoStatus,
            is_approved: false,
            is_visible: false,
            updated_at: new Date().toISOString(),
          }
        : p
    );
    setStoredPhotos(updated);
  }, []);

  const deletePhoto = useCallback((id: string) => {
    const current = getStoredPhotos();
    const updated = current.filter((p) => p.id !== id);
    setStoredPhotos(updated);
  }, []);

  const updatePhotoCaption = useCallback((id: string, caption: string) => {
    const current = getStoredPhotos();
    const updated = current.map((p) =>
      p.id === id ? { ...p, caption, updated_at: new Date().toISOString() } : p
    );
    setStoredPhotos(updated);
  }, []);

  const bulkModeratePhotos = useCallback((ids: string[], action: 'approve' | 'hide' | 'delete') => {
    const current = getStoredPhotos();
    let updated: MediaPhoto[];

    if (action === 'delete') {
      const setIds = new Set(ids);
      updated = current.filter((p) => !setIds.has(p.id));
    } else {
      const setIds = new Set(ids);
      const isApprove = action === 'approve';
      updated = current.map((p) => {
        if (setIds.has(p.id)) {
          return {
            ...p,
            status: isApprove ? ('approved' as MediaPhotoStatus) : ('hidden' as MediaPhotoStatus),
            is_approved: isApprove,
            is_visible: isApprove,
            updated_at: new Date().toISOString(),
          };
        }
        return p;
      });
    }

    setStoredPhotos(updated);
  }, []);

  // Guestbook actions
  const addGuestbookEntry = useCallback((entry: GuestBookEntry) => {
    const current = getStoredGuestbook();
    const updated = [entry, ...current];
    setStoredGuestbook(updated);
  }, []);

  const approveGuestbookEntry = useCallback((id: string) => {
    const current = getStoredGuestbook();
    const updated = current.map((e) =>
      e.id === id
        ? {
            ...e,
            status: 'approved' as GuestBookEntryStatus,
            approved_at: new Date().toISOString(),
          }
        : e
    );
    setStoredGuestbook(updated);
  }, []);

  const hideGuestbookEntry = useCallback((id: string) => {
    const current = getStoredGuestbook();
    const updated = current.map((e) =>
      e.id === id ? { ...e, status: 'hidden' as GuestBookEntryStatus } : e
    );
    setStoredGuestbook(updated);
  }, []);

  const deleteGuestbookEntry = useCallback((id: string) => {
    const current = getStoredGuestbook();
    const updated = current.filter((e) => e.id !== id);
    setStoredGuestbook(updated);
  }, []);

  return {
    photos,
    guestbook,
    isLoaded,
    addPhoto,
    approvePhoto,
    hidePhoto,
    deletePhoto,
    updatePhotoCaption,
    bulkModeratePhotos,
    addGuestbookEntry,
    approveGuestbookEntry,
    hideGuestbookEntry,
    deleteGuestbookEntry,
    refresh,
  };
}
