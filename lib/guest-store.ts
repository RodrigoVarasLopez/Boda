import { useState, useEffect, useCallback } from 'react';
import { INITIAL_GROUPS, INITIAL_RSVPS, INITIAL_EVENTS, INITIAL_WEDDING } from './mock-data';
import { GuestGroup, GroupRSVPSubmission, GuestRSVPResponse, DietaryOption, RSVPStatus } from './types';
import {
  recordManualRSVPAction,
  getGuestsDataAction,
  createGuestGroupAction,
  deleteGuestGroupAction,
  syncAllLocalGuestsToSupabaseAction,
  updateGuestTypeAction,
  updateGroupNameAction,
  updateGuestDetailsAction,
  addGuestToGroupAction,
  removeGuestFromGroupAction,
  toggleGroupEventAction,
  setGroupStageEventsAction,
} from '@/app/actions';

const STORAGE_KEY_GROUPS = 'boda_groups_store_v3';
const STORAGE_KEY_RSVPS = 'boda_rsvps_store_v3';
const STORAGE_KEY_DELETED = 'boda_deleted_groups_v3';
const UPDATE_EVENT_NAME = 'boda_store_updated';

function getDeletedGroupIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function addDeletedGroupId(groupId: string, groupName?: string) {
  if (typeof window === 'undefined') return;
  try {
    const current = new Set(getDeletedGroupIds());
    current.add(groupId);
    if (groupName) current.add(`name:${groupName.trim().toLowerCase()}`);
    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(Array.from(current)));
  } catch {}
}

// Helper to get initial groups (always returns fresh copy, never mutates INITIAL_GROUPS in place)
export function getStoredGroups(): GuestGroup[] {
  if (typeof window === 'undefined') return INITIAL_GROUPS;
  const deletedSet = new Set(getDeletedGroupIds());
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (g: GuestGroup) =>
            !deletedSet.has(g.id) && !deletedSet.has(`name:${(g.name || '').trim().toLowerCase()}`)
        );
      }
    }
  } catch (e) {
    console.warn('Error reading stored groups:', e);
  }
  const cloned: GuestGroup[] = JSON.parse(JSON.stringify(INITIAL_GROUPS));
  return cloned.filter(
    (g) => !deletedSet.has(g.id) && !deletedSet.has(`name:${(g.name || '').trim().toLowerCase()}`)
  );
}

// Helper to get initial RSVPs
export function getStoredRSVPS(): GroupRSVPSubmission[] {
  if (typeof window === 'undefined') return INITIAL_RSVPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RSVPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored RSVPs:', e);
  }
  return JSON.parse(JSON.stringify(INITIAL_RSVPS));
}

// Save groups to localStorage and memory
export function setStoredGroups(groups: GuestGroup[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
    } catch (e) {
      console.warn('Error saving groups to localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME));
  }
}

// Save RSVPs to localStorage and memory
export function setStoredRSVPs(rsvps: GroupRSVPSubmission[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(rsvps));
    } catch (e) {
      console.warn('Error saving RSVPs to localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME));
  }
}

/**
 * Record manual RSVP for a group
 */
export async function saveManualGroupRSVP(
  groupId: string,
  responses: Array<{
    guestId: string;
    status: RSVPStatus;
    dietaryChoice: DietaryOption;
    allergies?: string;
    plusOneAttending?: boolean;
    plusOneName?: string;
    plusOneDietary?: DietaryOption;
    message?: string;
  }>
): Promise<{ success: boolean; message: string }> {
  const currentGroups = getStoredGroups();
  const currentRSVPs = getStoredRSVPS();

  const groupIndex = currentGroups.findIndex((g) => g.id === groupId);
  if (groupIndex === -1) {
    return { success: false, message: 'Grupo no encontrado' };
  }

  const group = currentGroups[groupIndex];
  const now = new Date().toISOString();

  // Determine group status based on responses
  const hasAttending = responses.some((r) => r.status === 'attending');
  const hasDeclined = responses.some((r) => r.status === 'declined');
  const allPending = responses.every((r) => r.status === 'pending');
  const groupStatus =
    hasAttending || hasDeclined
      ? 'responded'
      : allPending
      ? group.invitation_status === 'responded'
        ? 'sent'
        : group.invitation_status
      : 'responded';

  // Update group in list
  const updatedGroup: GuestGroup = {
    ...group,
    invitation_status: groupStatus,
    responded_at: now,
  };
  currentGroups[groupIndex] = updatedGroup;

  // Map to GuestRSVPResponse
  const mappedResponses: GuestRSVPResponse[] = responses.map((r) => {
    const guestObj = group.guests.find((g) => g.id === r.guestId);
    const guestName = guestObj ? `${guestObj.first_name} ${guestObj.last_name}`.trim() : 'Invitado';
    return {
      guest_id: r.guestId,
      guest_name: guestName,
      status: r.status,
      attending_event_ids: r.status === 'attending' ? group.allowed_event_ids : [],
      dietary_choice: r.dietaryChoice,
      allergies: r.allergies || undefined,
      plus_one_attending: r.plusOneAttending,
      plus_one_name: r.plusOneName || undefined,
      plus_one_dietary: r.plusOneDietary || 'standard',
      message: r.message || undefined,
    };
  });

  // Update or insert into RSVPs
  const rsvpIndex = currentRSVPs.findIndex((r) => r.group_id === groupId);
  if (rsvpIndex >= 0) {
    currentRSVPs[rsvpIndex] = {
      ...currentRSVPs[rsvpIndex],
      responses: mappedResponses,
      submitted_at: now,
    };
  } else {
    currentRSVPs.push({
      group_id: groupId,
      token: group.token,
      responses: mappedResponses,
      submitted_at: now,
    });
  }

  // Also update in-memory INITIAL_* fixtures for server-rendered consistency
  const memGroup = INITIAL_GROUPS.find((g) => g.id === groupId);
  if (memGroup) {
    memGroup.invitation_status = groupStatus;
    memGroup.responded_at = now;
  }
  const memRsvpIndex = INITIAL_RSVPS.findIndex((r) => r.group_id === groupId);
  if (memRsvpIndex >= 0) {
    INITIAL_RSVPS[memRsvpIndex].responses = mappedResponses;
    INITIAL_RSVPS[memRsvpIndex].submitted_at = now;
  } else {
    INITIAL_RSVPS.push({
      group_id: groupId,
      token: group.token,
      responses: mappedResponses,
      submitted_at: now,
    });
  }

  // Persist locally
  setStoredGroups(currentGroups);
  setStoredRSVPs(currentRSVPs);

  // Call Server Action asynchronously to sync database if configured
  try {
    await recordManualRSVPAction({
      groupId,
      responses: responses.map((r) => ({
        guestId: r.guestId,
        status: r.status,
        dietaryChoice: r.dietaryChoice,
        allergies: r.allergies,
        plusOneAttending: r.plusOneAttending,
        plusOneName: r.plusOneName,
        message: r.message,
      })),
    });
  } catch (err) {
    console.warn('Server sync warning (local store saved):', err);
  }

  return { success: true, message: `Asistencia para ${group.name} guardada correctamente.` };
}

/**
 * 1-Click Quick Confirm for entire group
 */
export async function quickConfirmGroupAttendance(groupId: string) {
  const currentGroups = getStoredGroups();
  const group = currentGroups.find((g) => g.id === groupId);
  if (!group) return { success: false, message: 'Grupo no encontrado' };

  const responses = group.guests.map((g) => ({
    guestId: g.id,
    status: 'attending' as RSVPStatus,
    dietaryChoice: 'standard' as DietaryOption,
    allergies: g.allergies || '',
    plusOneAttending: g.is_plus_one_allowed,
    message: 'Confirmado manualmente por los novios',
  }));

  return await saveManualGroupRSVP(groupId, responses);
}

/**
 * React Hook for real-time synchronized wedding data across all admin views
 */
export function useWeddingData() {
  const [groups, setGroups] = useState<GuestGroup[]>(INITIAL_GROUPS);
  const [rsvps, setRsvps] = useState<GroupRSVPSubmission[]>(INITIAL_RSVPS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(false);

  const reloadData = useCallback(() => {
    setGroups(getStoredGroups());
    setRsvps(getStoredRSVPS());
  }, []);

  // Hydrate from Supabase and sync with localStorage while respecting local deletions & edits
  const fetchSupabaseData = useCallback(async () => {
    setIsLoadingSupabase(true);
    try {
      const res = await getGuestsDataAction();
      if (res && res.success && res.source === 'supabase') {
        setIsSupabaseOnline(true);
        if (res.groups && res.groups.length > 0) {
          const hasLocalStore =
            typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_GROUPS) !== null;
          if (!hasLocalStore) {
            const deletedSet = new Set(getDeletedGroupIds());
            const filtered = res.groups.filter(
              (g: GuestGroup) =>
                !deletedSet.has(g.id) &&
                !deletedSet.has(`name:${(g.name || '').trim().toLowerCase()}`)
            );
            setGroups(filtered);
            setRsvps(res.rsvps || []);
            setStoredGroups(filtered);
            setStoredRSVPs(res.rsvps || []);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching guests from Supabase:', err);
    } finally {
      setIsLoadingSupabase(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial fast local load
    reloadData();
    setIsLoaded(true);

    // 2. Network hydration from Supabase
    fetchSupabaseData();

    // 3. Event listeners for cross-tab or cross-component state updates
    const handleUpdate = () => reloadData();
    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reloadData, fetchSupabaseData]);

  // Create Guest Group
  const createGroup = async (input: unknown) => {
    setIsSyncing(true);
    try {
      const res = await createGuestGroupAction(input);
      if (res.success && res.group) {
        const current = getStoredGroups();
        const updated = [res.group, ...current.filter((g) => g.id !== res.group.id)];
        setStoredGroups(updated);
        setGroups(updated);
        return res;
      }
      return res;
    } catch (err: any) {
      console.error('Failed to create guest group:', err);
      return { success: false, error: err?.message || 'Error al crear grupo' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete Guest Group
  const deleteGroup = async (groupId: string) => {
    setIsSyncing(true);
    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const target = base.find((g) => g.id === groupId);
      addDeletedGroupId(groupId, target?.name);
      const updated = base.filter((g) => g.id !== groupId);
      setStoredGroups(updated);
      return updated;
    });
    setRsvps((prev) => {
      const base = prev.length > 0 ? prev : getStoredRSVPS();
      const updated = base.filter((r) => r.group_id !== groupId);
      setStoredRSVPs(updated);
      return updated;
    });
    try {
      const res = await deleteGuestGroupAction(groupId);
      return res;
    } catch (err: any) {
      console.error('Failed to delete guest group:', err);
      return { success: false, error: err?.message || 'Error al eliminar grupo' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync all local guests to Supabase
  const syncLocalGuestsToSupabase = async () => {
    setIsSyncing(true);
    try {
      const current = getStoredGroups();
      const res = await syncAllLocalGuestsToSupabaseAction(current);
      if (res.success) {
        await fetchSupabaseData();
      }
      return res;
    } catch (err: any) {
      console.error('Failed to sync guests to Supabase:', err);
      return { success: false, error: err?.message || 'Error al sincronizar con Supabase' };
    } finally {
      setIsSyncing(false);
    }
  };

  // Compute Headcount & Analytics
  const totalGuests = groups.reduce((acc, g) => acc + g.guests.length, 0);
  const totalGroups = groups.length;
  const totalBodaGuests = totalGuests;
  const totalBodaGroups = totalGroups;

  const prebodaGroups = groups.filter((g) =>
    Array.isArray(g.allowed_event_ids) && g.allowed_event_ids.includes('evt-preboda-cata')
  );
  const totalPrebodaGroups = prebodaGroups.length;
  const totalPrebodaGuests = prebodaGroups.reduce((acc, g) => acc + g.guests.length, 0);
  const prebodaGuestIds = new Set(
    prebodaGroups.flatMap((g) => g.guests.map((gst) => gst.id))
  );

  const openedInvitations = groups.filter(
    (g) => g.invitation_status === 'opened' || g.invitation_status === 'responded'
  ).length;

  const allResponses = rsvps.flatMap((r) => r.responses);
  const confirmedAttendingGuests = allResponses.filter((r) => r.status === 'attending').length;
  const confirmedPlusOnes = allResponses.filter(
    (r) => r.status === 'attending' && r.plus_one_attending
  ).length;
  const totalConfirmedHeadcount = confirmedAttendingGuests + confirmedPlusOnes;
  const confirmedDeclined = allResponses.filter((r) => r.status === 'declined').length;
  const pendingCount = Math.max(0, totalGuests - (confirmedAttendingGuests + confirmedDeclined));
  const rsvpCompletionRate =
    totalGuests > 0
      ? Math.round(((confirmedAttendingGuests + confirmedDeclined) / totalGuests) * 100)
      : 0;

  const prebodaConfirmedGuests = allResponses.filter(
    (r) =>
      r.status === 'attending' &&
      (prebodaGuestIds.has(r.guest_id) ||
        (Array.isArray(r.attending_event_ids) &&
          r.attending_event_ids.includes('evt-preboda-cata')))
  ).length;
  const prebodaConfirmedPlusOnes = allResponses.filter(
    (r) =>
      r.status === 'attending' &&
      r.plus_one_attending &&
      (prebodaGuestIds.has(r.guest_id) ||
        (Array.isArray(r.attending_event_ids) &&
          r.attending_event_ids.includes('evt-preboda-cata')))
  ).length;
  const prebodaConfirmedHeadcount = prebodaConfirmedGuests + prebodaConfirmedPlusOnes;

  // Only 2 events in Event Attendance: Preboda and Boda
  const eventAttendance = [
    {
      eventId: 'evt-preboda-cata',
      eventTitle: 'Preboda · Bodega El Corro (Villamuriel)',
      invited: totalPrebodaGuests,
      attendees: prebodaConfirmedHeadcount,
    },
    {
      eventId: 'evt-boda',
      eventTitle: 'Boda · Iglesia de Villamuriel & Bodega Concejo',
      invited: totalBodaGuests,
      attendees: totalConfirmedHeadcount,
    },
  ];

  // Adult vs Child headcount
  const allGuests = groups.flatMap((g) => g.guests);
  const totalChildren = allGuests.filter((g) => g.guest_type === 'child' || g.is_child === true).length;
  const totalAdults = Math.max(0, totalGuests - totalChildren);
  const guestMap = new Map(allGuests.map((g) => [g.id, g]));
  const responseByGuestId = new Map(allResponses.map((r) => [r.guest_id, r]));

  let attendingAdults = 0;
  let attendingChildren = 0;
  let banquetAdults = 0;
  let banquetChildren = 0;

  // Compute banquet headcount from groups invited to Boda (everyone except confirmed 'declined' guests)
  for (const grp of groups) {
    const isInvitedToBoda =
      grp.allowed_event_ids.includes('evt-banquete') ||
      grp.allowed_event_ids.includes('evt-ceremonia');
    if (!isInvitedToBoda) continue;

    for (const guest of grp.guests) {
      const isChild = guest.guest_type === 'child' || guest.is_child === true;
      const resp = responseByGuestId.get(guest.id);
      if (resp?.status !== 'declined') {
        if (isChild) {
          banquetChildren++;
        } else {
          banquetAdults++;
        }
      }
    }
  }

  for (const resp of allResponses) {
    if (resp.status === 'attending') {
      const guest = guestMap.get(resp.guest_id);
      const isChild = guest?.guest_type === 'child' || guest?.is_child === true;
      if (isChild) {
        attendingChildren++;
      } else {
        attendingAdults++;
      }
      if (resp.plus_one_attending) {
        attendingAdults++;
        banquetAdults++;
      }
    }
  }

  // Quick 1-click attendance status change for a single guest in a group (supports 'attending', 'declined', and 'pending' to reset/uncheck)
  const setSingleGuestAttendance = async (
    groupId: string,
    guestId: string,
    newStatus: 'attending' | 'declined' | 'pending'
  ) => {
    const currentGroups = getStoredGroups();
    const currentRSVPs = getStoredRSVPS();
    const grp = currentGroups.find((g) => g.id === groupId);
    if (!grp) return;

    const existingSub = currentRSVPs.find((r) => r.group_id === groupId);
    const updatedResponses = grp.guests.map((g) => {
      const prev = existingSub?.responses.find((r) => r.guest_id === g.id);
      const isChild = g.guest_type === 'child' || g.is_child === true;
      const statusToUse: RSVPStatus =
        g.id === guestId ? newStatus : prev?.status || 'pending';
      return {
        guestId: g.id,
        status: statusToUse,
        dietaryChoice: (prev?.dietary_choice || (isChild ? 'child' : 'standard')) as DietaryOption,
        allergies: prev?.allergies || g.allergies || '',
        plusOneAttending: prev?.plus_one_attending || false,
        plusOneName: prev?.plus_one_name,
        message: prev?.message || 'Actualizado desde la lista de invitados',
      };
    });

    await saveManualGroupRSVP(groupId, updatedResponses);
  };

  // Cycle or set group invitation status ('draft' = Sin enviar, 'sent' = Enviada, 'responded' = Aceptada)
  const updateGroupInvitationStatus = async (
    groupId: string,
    nextStatus: 'draft' | 'sent' | 'responded'
  ) => {
    const currentGroups = getStoredGroups();
    const currentRSVPs = getStoredRSVPS();
    const grp = currentGroups.find((g) => g.id === groupId);
    if (!grp) return;

    if (nextStatus === 'responded') {
      // If set to Aceptada, confirm all guests in the group who aren't already declined
      const existingSub = currentRSVPs.find((r) => r.group_id === groupId);
      const updatedResponses = grp.guests.map((g) => {
        const prev = existingSub?.responses.find((r) => r.guest_id === g.id);
        const isChild = g.guest_type === 'child' || g.is_child === true;
        return {
          guestId: g.id,
          status: (prev?.status === 'declined' ? 'declined' : 'attending') as RSVPStatus,
          dietaryChoice: (prev?.dietary_choice || (isChild ? 'child' : 'standard')) as DietaryOption,
          allergies: prev?.allergies || g.allergies || '',
          plusOneAttending: prev?.plus_one_attending || false,
          plusOneName: prev?.plus_one_name,
          message: prev?.message || 'Invitación marcada como Aceptada',
        };
      });
      await saveManualGroupRSVP(groupId, updatedResponses);
    } else {
      // If set to 'draft' (Sin enviar) or 'sent' (Enviada), also reset pending if it was responded
      const updatedGroups = currentGroups.map((g) =>
        g.id === groupId ? { ...g, invitation_status: nextStatus } : g
      );
      setStoredGroups(updatedGroups);
      setGroups(updatedGroups);

      // If resetting from responded to Sin enviar / Enviada, reset guests to pending (sin marcar)
      if (grp.invitation_status === 'responded') {
        const updatedRSVPs = currentRSVPs.filter((r) => r.group_id !== groupId);
        setStoredRSVPs(updatedRSVPs);
        setRsvps(updatedRSVPs);
      }
    }
  };

  // Update Guest Type function
  const updateGuestType = (guestId: string, guestType: 'adult' | 'child') => {
    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) => ({
        ...grp,
        guests: grp.guests.map((g) =>
          g.id === guestId
            ? { ...g, guest_type: guestType, is_child: guestType === 'child' }
            : g
        ),
      }));
      setStoredGroups(updated);
      return updated;
    });

    // Call server action to persist in Supabase as well
    updateGuestTypeAction({ guest_id: guestId, guest_type: guestType }).catch((e) =>
      console.warn('Error syncing guest_type to server:', e)
    );
  };

  // Update Group / Family Name
  const updateGroupName = async (groupId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return { success: false, error: 'El nombre no puede estar vacío' };

    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) =>
        grp.id === groupId ? { ...grp, name: cleanName } : grp
      );
      setStoredGroups(updated);
      return updated;
    });

    return await updateGroupNameAction({ groupId, name: cleanName });
  };

  // Update Individual Guest Name & Surname
  const updateGuestDetails = async (
    guestId: string,
    first_name: string,
    last_name: string,
    guest_type?: 'adult' | 'child'
  ) => {
    const cleanFirst = first_name.trim();
    const cleanLast = last_name.trim();
    if (!cleanFirst) return { success: false, error: 'El nombre no puede estar vacío' };

    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) => ({
        ...grp,
        guests: grp.guests.map((g) =>
          g.id === guestId
            ? {
                ...g,
                first_name: cleanFirst,
                last_name: cleanLast,
                ...(guest_type
                  ? { guest_type, is_child: guest_type === 'child' }
                  : {}),
              }
            : g
        ),
      }));
      setStoredGroups(updated);
      return updated;
    });

    return await updateGuestDetailsAction({
      guestId,
      first_name: cleanFirst,
      last_name: cleanLast,
      guest_type,
    });
  };

  // Add Guest to Existing Group
  const addGuestToGroup = async (
    groupId: string,
    first_name: string,
    last_name?: string,
    guest_type?: 'adult' | 'child'
  ) => {
    const res = await addGuestToGroupAction({ groupId, first_name, last_name, guest_type });
    if (res.success && res.guest) {
      setGroups((prev) => {
        const base = prev.length > 0 ? prev : getStoredGroups();
        const updated = base.map((grp) =>
          grp.id === groupId
            ? { ...grp, guests: [...grp.guests, res.guest as any] }
            : grp
        );
        setStoredGroups(updated);
        return updated;
      });
    }
    return res;
  };

  // Remove Guest from Group
  const removeGuestFromGroup = async (groupId: string, guestId: string) => {
    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) =>
        grp.id === groupId
          ? { ...grp, guests: grp.guests.filter((g) => g.id !== guestId) }
          : grp
      );
      setStoredGroups(updated);
      return updated;
    });
    return await removeGuestFromGroupAction({ groupId, guestId });
  };

  // Toggle Group Event (e.g. Preboda)
  const toggleGroupEvent = async (groupId: string, eventId: string, allowed: boolean) => {
    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) => {
        if (grp.id !== groupId) return grp;
        const currentIds = Array.isArray(grp.allowed_event_ids) ? grp.allowed_event_ids : [];
        const has = currentIds.includes(eventId);
        const nextIds =
          allowed && !has
            ? [...currentIds, eventId]
            : !allowed && has
            ? currentIds.filter((id) => id !== eventId)
            : currentIds;
        return { ...grp, allowed_event_ids: nextIds };
      });
      setStoredGroups(updated);
      return updated;
    });
    return await toggleGroupEventAction({ groupId, eventId, allowed });
  };

  // Set Preboda & Boda (2-Option Stage Toggle) for a Group
  const setGroupStageEvents = async (groupId: string, preboda: boolean, boda: boolean) => {
    const nextAllowed: string[] = [];
    if (preboda) nextAllowed.push('evt-preboda-cata');
    if (boda) nextAllowed.push('evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj');

    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const updated = base.map((grp) =>
        grp.id === groupId ? { ...grp, allowed_event_ids: nextAllowed } : grp
      );
      setStoredGroups(updated);
      return updated;
    });
    return await setGroupStageEventsAction({ groupId, preboda, boda });
  };

  // Reorder Groups (e.g. via drag-and-drop or batch reordering)
  const reorderGroups = (newGroups: GuestGroup[]) => {
    setGroups(newGroups);
    setStoredGroups(newGroups);
  };

  // Move a group Up or Down by 1 position
  const moveGroup = (groupId: string, direction: 'up' | 'down') => {
    setGroups((prev) => {
      const base = prev.length > 0 ? prev : getStoredGroups();
      const list = [...base];
      const index = list.findIndex((g) => g.id === groupId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.splice(targetIndex, 0, moved);
      setStoredGroups(list);
      return list;
    });
  };

  return {
    isLoaded,
    isLoadingSupabase,
    isSyncing,
    isSupabaseOnline,
    groups,
    rsvps,
    allResponses,
    stats: {
      totalGuests,
      totalGroups,
      totalBodaGuests,
      totalBodaGroups,
      totalPrebodaGuests,
      totalPrebodaGroups,
      prebodaConfirmed: prebodaConfirmedHeadcount,
      totalAdults,
      totalChildren,
      openedInvitations,
      confirmedAttending: confirmedAttendingGuests,
      confirmedPlusOnes,
      totalConfirmedHeadcount,
      confirmedDeclined,
      pendingCount,
      rsvpCompletionRate,
      eventAttendance,
      attendingAdults,
      attendingChildren,
      banquetAdults,
      banquetChildren,
    },
    saveManualRSVP: saveManualGroupRSVP,
    quickConfirmGroup: quickConfirmGroupAttendance,
    setSingleGuestAttendance,
    updateGroupInvitationStatus,
    updateGuestType,
    updateGroupName,
    updateGuestDetails,
    addGuestToGroup,
    removeGuestFromGroup,
    toggleGroupEvent,
    setGroupStageEvents,
    reorderGroups,
    moveGroup,
    createGroup,
    deleteGroup,
    syncLocalGuestsToSupabase,
    refresh: reloadData,
    refreshSupabase: fetchSupabaseData,
  };
}
