import { useState, useEffect, useCallback } from 'react';
import { INITIAL_GROUPS, INITIAL_RSVPS, INITIAL_EVENTS, INITIAL_WEDDING } from './mock-data';
import { GuestGroup, GroupRSVPSubmission, GuestRSVPResponse, DietaryOption, RSVPStatus } from './types';
import { recordManualRSVPAction } from '@/app/actions';

const STORAGE_KEY_GROUPS = 'boda_groups_store_v2';
const STORAGE_KEY_RSVPS = 'boda_rsvps_store_v2';
const UPDATE_EVENT_NAME = 'boda_store_updated';

// Helper to get initial groups
export function getStoredGroups(): GuestGroup[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored groups:', e);
  }
  return [];
}

// Helper to get initial RSVPs
export function getStoredRSVPS(): GroupRSVPSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RSVPS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored RSVPs:', e);
  }
  return [];
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
  const allDeclined = responses.every((r) => r.status === 'declined');
  const groupStatus = hasAttending ? 'responded' : allDeclined ? 'responded' : 'opened';

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

  const reloadData = useCallback(() => {
    setGroups(getStoredGroups());
    setRsvps(getStoredRSVPS());
  }, []);

  useEffect(() => {
    reloadData();
    setIsLoaded(true);

    const handleUpdate = () => reloadData();
    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reloadData]);

  // Compute Headcount & Analytics
  const totalGuests = groups.reduce((acc, g) => acc + g.guests.length, 0);
  const totalGroups = groups.length;
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

  const eventAttendance = INITIAL_EVENTS.map((evt) => {
    const attendees = allResponses.filter(
      (r) => r.status === 'attending' && r.attending_event_ids.includes(evt.id)
    ).length;
    return {
      eventId: evt.id,
      eventTitle: evt.title,
      attendees,
    };
  });

  // Adult vs Child headcount
  const allGuests = groups.flatMap((g) => g.guests);
  const guestMap = new Map(allGuests.map((g) => [g.id, g]));
  let attendingAdults = 0;
  let attendingChildren = 0;

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
      }
    }
  }

  // Update Guest Type function
  const updateGuestType = (guestId: string, guestType: 'adult' | 'child') => {
    const currentGroups = getStoredGroups();
    let updated = false;

    for (const group of currentGroups) {
      const targetGuest = group.guests.find((g) => g.id === guestId);
      if (targetGuest) {
        targetGuest.guest_type = guestType;
        targetGuest.is_child = guestType === 'child';
        updated = true;
        break;
      }
    }

    if (updated) {
      setStoredGroups([...currentGroups]);
    }
  };

  return {
    isLoaded,
    groups,
    rsvps,
    allResponses,
    stats: {
      totalGuests,
      totalGroups,
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
    },
    saveManualRSVP: saveManualGroupRSVP,
    quickConfirmGroup: quickConfirmGroupAttendance,
    updateGuestType,
    refresh: reloadData,
  };
}
