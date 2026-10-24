'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GuestGroup, Event, Wedding, GuestRSVPResponse } from '@/lib/types';
import { INVITATION_STATUS_LABELS } from '@/lib/types';
import {
  X,
  Copy,
  MessageCircle,
  QrCode,
  Eye,
  Check,
  Calendar,
  Users,
  RefreshCw,
  Ban,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  PhoneCall,
  Trash2,
  Pencil,
  Plus,
  Baby,
  Wine,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildWhatsAppLink, formatDateEs } from '@/lib/utils';
import {
  regenerateInvitationTokenAction,
  revokeInvitationAction,
  updateGuestTypeAction,
  updateGroupNameAction,
  updateGuestDetailsAction,
  addGuestToGroupAction,
  removeGuestFromGroupAction,
  setGroupStageEventsAction,
} from '@/app/actions';
import { getStoredGroups, setStoredGroups } from '@/lib/guest-store';
import { ManualRSVPModal } from './ManualRSVPModal';

interface GuestDrawerProps {
  group: GuestGroup | null;
  wedding: Wedding;
  events: Event[];
  existingRSVP?: GuestRSVPResponse[];
  onClose: () => void;
  onUpdateGroup?: (updatedGroup: GuestGroup) => void;
  onUpdateGuestType?: (guestId: string, guestType: 'adult' | 'child') => void;
  onDeleteGroup?: (groupId: string) => void | Promise<any>;
}

export const GuestDrawer: React.FC<GuestDrawerProps> = ({
  group,
  wedding,
  events,
  existingRSVP,
  onClose,
  onUpdateGroup,
  onUpdateGuestType,
  onDeleteGroup,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [customNote, setCustomNote] = useState(group?.custom_message || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isManualRSVPOpen, setIsManualRSVPOpen] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Editable Family Name draft synced with current group
  const [groupNameDraft, setGroupNameDraft] = useState(group?.name || '');

  // Editable Guest Drafts keyed by guest.id
  const [guestDrafts, setGuestDrafts] = useState<
    Record<string, { first_name: string; last_name: string }>
  >({});

  // Add new guest to group
  const [newMemberFirst, setNewMemberFirst] = useState('');
  const [newMemberLast, setNewMemberLast] = useState('');
  const [newMemberType, setNewMemberType] = useState<'adult' | 'child'>('adult');

  useEffect(() => {
    if (group) {
      setGroupNameDraft(group.name);
      setCustomNote(group.custom_message || '');
      const initialDrafts: Record<string, { first_name: string; last_name: string }> = {};
      group.guests.forEach((g) => {
        initialDrafts[g.id] = {
          first_name: g.first_name || '',
          last_name: g.last_name || '',
        };
      });
      setGuestDrafts(initialDrafts);
    }
  }, [group?.id, group?.name, group?.guests]);

  useEffect(() => {
    if (!group || typeof window === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isManualRSVPOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [group, isManualRSVPOpen, onClose]);

  if (!group || typeof document === 'undefined') return null;

  const showSavedFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 2500);
  };

  const syncUpdatedGroupToLocalStore = (updatedGroup: GuestGroup) => {
    const current = getStoredGroups();
    const next = current.map((g) => (g.id === updatedGroup.id ? updatedGroup : g));
    setStoredGroups(next);
    if (onUpdateGroup) onUpdateGroup(updatedGroup);
  };

  const handleSaveGroupName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = groupNameDraft.trim();
    if (!clean || clean === group.name) return;

    const updatedGroup: GuestGroup = { ...group, name: clean };
    syncUpdatedGroupToLocalStore(updatedGroup);
    showSavedFeedback('✓ Nombre de familia guardado');
    await updateGroupNameAction({ groupId: group.id, name: clean });
  };

  const handleGuestDraftChange = (
    guestId: string,
    field: 'first_name' | 'last_name',
    value: string
  ) => {
    setGuestDrafts((prev) => ({
      ...prev,
      [guestId]: {
        first_name: prev[guestId]?.first_name ?? '',
        last_name: prev[guestId]?.last_name ?? '',
        [field]: value,
      },
    }));
  };

  const handleSaveGuestDetails = async (guestId: string) => {
    const draft = guestDrafts[guestId];
    if (!draft) return;
    const cleanFirst = draft.first_name.trim();
    const cleanLast = draft.last_name.trim();
    if (!cleanFirst) return;

    const orig = group.guests.find((g) => g.id === guestId);
    if (orig && orig.first_name === cleanFirst && (orig.last_name || '') === cleanLast) {
      return;
    }

    const updatedGuests = group.guests.map((g) =>
      g.id === guestId ? { ...g, first_name: cleanFirst, last_name: cleanLast } : g
    );
    const updatedGroup: GuestGroup = { ...group, guests: updatedGuests };
    syncUpdatedGroupToLocalStore(updatedGroup);
    showSavedFeedback(`✓ Guardado: ${cleanFirst} ${cleanLast}`.trim());
    await updateGuestDetailsAction({ guestId, first_name: cleanFirst, last_name: cleanLast });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirst = newMemberFirst.trim();
    const cleanLast = newMemberLast.trim();
    if (!cleanFirst) return;
    setIsProcessing(true);
    try {
      const res = await addGuestToGroupAction({
        groupId: group.id,
        first_name: cleanFirst,
        last_name: cleanLast,
        guest_type: newMemberType,
      });
      if (res.success && res.guest) {
        const updatedGuests = [...group.guests, res.guest as any];
        const updatedGroup: GuestGroup = { ...group, guests: updatedGuests };
        syncUpdatedGroupToLocalStore(updatedGroup);
        setNewMemberFirst('');
        setNewMemberLast('');
        setNewMemberType('adult');
        showSavedFeedback(`✓ Añadido: ${cleanFirst} ${cleanLast}`.trim());
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (guestId: string, guestName: string) => {
    if (group.guests.length <= 1) {
      alert('El grupo debe tener al menos un invitado. Si quieres borrar toda la familia, usa "Eliminar invitación" abajo.');
      return;
    }
    if (!confirm(`¿Quitar a "${guestName}" de esta familia?`)) return;
    const updatedGuests = group.guests.filter((g) => g.id !== guestId);
    const updatedGroup: GuestGroup = { ...group, guests: updatedGuests };
    syncUpdatedGroupToLocalStore(updatedGroup);
    showSavedFeedback(`✓ Eliminado: ${guestName}`);
    await removeGuestFromGroupAction({ groupId: group.id, guestId });
  };

  // Two-option stage events: Preboda & Boda
  const hasPreboda = group.allowed_event_ids.includes('evt-preboda-cata');
  const hasBoda =
    group.allowed_event_ids.includes('evt-ceremonia') ||
    group.allowed_event_ids.includes('evt-banquete') ||
    group.allowed_event_ids.includes('evt-fiesta-dj');

  const handleToggleStage = async (stage: 'preboda' | 'boda') => {
    const nextPreboda = stage === 'preboda' ? !hasPreboda : hasPreboda;
    const nextBoda = stage === 'boda' ? !hasBoda : hasBoda;

    const nextAllowed: string[] = [];
    if (nextPreboda) nextAllowed.push('evt-preboda-cata');
    if (nextBoda) nextAllowed.push('evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj');

    const updatedGroup: GuestGroup = { ...group, allowed_event_ids: nextAllowed };
    syncUpdatedGroupToLocalStore(updatedGroup);
    showSavedFeedback(
      stage === 'preboda'
        ? nextPreboda
          ? '✓ Preboda activada para esta invitación'
          : '✓ Preboda desactivada para esta invitación'
        : nextBoda
        ? '✓ Boda activada para esta invitación'
        : '✓ Boda desactivada para esta invitación'
    );
    await setGroupStageEventsAction({
      groupId: group.id,
      preboda: nextPreboda,
      boda: nextBoda,
    });
  };

  const isLocalEnv = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.')
  );

  const fullInvitationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/i/${group.token}`
    : `https://stephanieyrodrigo.com/i/${group.token}`;

  const whatsAppInvitationUrl = isLocalEnv
    ? `https://stephanieyrodrigo.com/i/${group.token}`
    : fullInvitationUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullInvitationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppOpen = () => {
    const waUrl = buildWhatsAppLink(
      '',
      group.name,
      wedding.couple_names,
      wedding.wedding_date,
      whatsAppInvitationUrl,
      customNote
    );
    window.open(waUrl, '_blank');
  };

  const handleRegenerate = async () => {
    if (!confirm('¿Regenerar el enlace de invitación? El enlace anterior dejará de funcionar.')) return;
    setIsProcessing(true);
    try {
      const res = await regenerateInvitationTokenAction(group.id);
      if (res.success && res.newToken) {
        group.token = res.newToken;
        alert('Enlace regenerado correctamente.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('¿Revocar el acceso a esta invitación? El invitado verá la pantalla de invitación no disponible.')) return;
    setIsProcessing(true);
    try {
      const res = await revokeInvitationAction(group.id);
      if (res.success) {
        group.invitation_status = 'revoked';
        alert('Invitación revocada.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;
    if (!confirm(`¿Estás seguro de eliminar permanentemente a "${group.name}" y todos sus invitados?`)) return;
    setIsProcessing(true);
    try {
      if (onDeleteGroup) {
        await onDeleteGroup(group.id);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleGuestType = async (guestId: string, type: 'adult' | 'child') => {
    const updatedGuests = group.guests.map((g) =>
      g.id === guestId ? { ...g, guest_type: type, is_child: type === 'child' } : g
    );
    const updatedGroup: GuestGroup = { ...group, guests: updatedGuests };
    syncUpdatedGroupToLocalStore(updatedGroup);
    if (onUpdateGuestType) {
      onUpdateGuestType(guestId, type);
    }
    showSavedFeedback(type === 'child' ? '✓ Marcado como Niño' : '✓ Marcado como Adulto');
    try {
      await updateGuestTypeAction({ guest_id: guestId, guest_type: type });
    } catch (e) {
      console.warn('Error updating guest type:', e);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] w-screen h-[100dvh] max-h-[100dvh] flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-[100dvh] max-h-[100dvh] bg-bg-card border-l border-border-subtle shadow-card flex flex-col justify-between overflow-y-auto"
      >
        {/* Header with Direct Editable Family Name */}
        <div className="p-5 sm:p-6 border-b border-border-subtle sticky top-0 bg-bg-card/95 backdrop-blur-md z-10 space-y-2 shrink-0">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-accent block">
              Nombre de la Familia / Invitación (Editable)
            </span>
            <button
              type="button"
              onClick={onClose}
              className="py-1 px-2.5 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-border-subtle"
              title="Cerrar panel"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver</span>
            </button>
          </div>

          <form onSubmit={handleSaveGroupName} className="flex items-center gap-2">
            <input
              type="text"
              value={groupNameDraft}
              onChange={(e) => setGroupNameDraft(e.target.value)}
              onBlur={() => handleSaveGroupName()}
              placeholder="Nombre de la familia o grupo..."
              className="flex-1 py-2 px-3 rounded-xl bg-bg-secondary/60 border border-border-strong focus:border-primary text-base font-serif text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="py-2 px-3.5 rounded-xl bg-brand-olive text-white text-xs font-medium hover:bg-brand-olive/90 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              title="Guardar nombre de la familia"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          </form>

          {feedbackBanner && (
            <div className="py-1.5 px-3 rounded-lg bg-brand-olive/15 border border-brand-olive/30 text-brand-olive text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status Badge & Timestamps */}
          <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Estado de Invitación:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize inline-flex items-center gap-1.5 ${
                  group.invitation_status === 'responded'
                    ? 'bg-brand-olive/15 text-brand-olive'
                    : group.invitation_status === 'opened'
                    ? 'bg-blue-100 text-blue-800'
                    : group.invitation_status === 'sent'
                    ? 'bg-amber-100 text-amber-800'
                    : group.invitation_status === 'revoked'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {group.invitation_status === 'opened' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {group.invitation_status === 'responded' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                {group.invitation_status === 'sent' && <Clock className="w-3.5 h-3.5" />}
                {group.invitation_status === 'revoked' && <Ban className="w-3.5 h-3.5" />}
                <span>{INVITATION_STATUS_LABELS[group.invitation_status] || group.invitation_status}</span>
              </span>
            </div>

            <div className="space-y-1 text-text-secondary text-[11px] pt-2 border-t border-border-subtle/50">
              {group.opened_at && (
                <div className="flex justify-between">
                  <span>Abierta el:</span>
                  <span className="font-mono">{formatDateEs(group.opened_at, true)}</span>
                </div>
              )}
              {group.responded_at && (
                <div className="flex justify-between">
                  <span>Respondida el:</span>
                  <span className="font-mono">{formatDateEs(group.responded_at, true)}</span>
                </div>
              )}
            </div>
          </div>

          {/* EVENTOS ASIGNADOS: SOLO 2 OPCIONES EDITABLES (PREBODA Y BODA) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-accent" />
                EVENTOS ASIGNADOS (HAZ CLIC PARA PONER O QUITAR)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Opción 1: Preboda */}
              <button
                type="button"
                onClick={() => handleToggleStage('preboda')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  hasPreboda
                    ? 'bg-brand-olive/15 border-brand-olive text-text-primary shadow-xs'
                    : 'bg-bg-secondary/20 border-border-subtle text-text-muted hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="inline-flex items-center gap-1.5 font-serif text-base font-medium text-text-primary">
                    <Wine className={`w-4 h-4 ${hasPreboda ? 'text-brand-olive' : 'text-text-muted'}`} />
                    <span>Preboda</span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      hasPreboda
                        ? 'bg-brand-olive text-white'
                        : 'bg-bg-secondary text-text-muted border border-border-subtle'
                    }`}
                  >
                    {hasPreboda ? '✓' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-[10px]">
                  <span className="text-text-muted">Viernes · Bodega</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md ${
                      hasPreboda ? 'bg-brand-olive text-white' : 'bg-bg-secondary text-text-muted'
                    }`}
                  >
                    {hasPreboda ? 'Incluida' : 'No incluida'}
                  </span>
                </div>
              </button>

              {/* Opción 2: Boda */}
              <button
                type="button"
                onClick={() => handleToggleStage('boda')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  hasBoda
                    ? 'bg-primary/10 border-primary text-text-primary shadow-xs'
                    : 'bg-bg-secondary/20 border-border-subtle text-text-muted hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="inline-flex items-center gap-1.5 font-serif text-base font-medium text-text-primary">
                    <Heart className={`w-4 h-4 ${hasBoda ? 'text-primary' : 'text-text-muted'}`} />
                    <span>Boda</span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      hasBoda
                        ? 'bg-primary text-primary-text'
                        : 'bg-bg-secondary text-text-muted border border-border-subtle'
                    }`}
                  >
                    {hasBoda ? '✓' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-[10px]">
                  <span className="text-text-muted">Sábado · Gran Día</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md ${
                      hasBoda ? 'bg-primary text-primary-text' : 'bg-bg-secondary text-text-muted'
                    }`}
                  >
                    {hasBoda ? 'Incluida' : 'No incluida'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* INVITADOS SECTION — DIRECT EDITABLE INPUTS + ALWAYS VISIBLE ADD PERSON FORM */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-text-accent" />
                PERSONAS EN ESTA FAMILIA ({group.guests.length})
              </span>
              <span className="text-[10px] text-text-muted">
                Edita y pulsa Guardar o Enter
              </span>
            </div>

            <div className="space-y-2.5">
              {group.guests.map((gst, idx) => {
                const isChild = gst.guest_type === 'child' || gst.is_child;
                const draft = guestDrafts[gst.id] || {
                  first_name: gst.first_name || '',
                  last_name: gst.last_name || '',
                };
                const isDirty =
                  draft.first_name.trim() !== gst.first_name ||
                  draft.last_name.trim() !== (gst.last_name || '');

                return (
                  <div
                    key={gst.id}
                    className={`p-3.5 rounded-2xl border space-y-2.5 text-xs transition-colors ${
                      isChild
                        ? 'bg-amber-50/40 border-amber-200/80'
                        : 'bg-bg-secondary/30 border-border-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                        Invitado #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isDirty && (
                          <button
                            type="button"
                            onClick={() => handleSaveGuestDetails(gst.id)}
                            className="px-2.5 py-1 rounded-lg bg-brand-olive text-white text-[10px] font-semibold flex items-center gap-1 hover:bg-brand-olive/90 cursor-pointer shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Guardar</span>
                          </button>
                        )}
                        {group.guests.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(gst.id, `${gst.first_name} ${gst.last_name}`.trim())
                            }
                            className="p-1 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Quitar a esta persona de la familia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Direct Editable Inputs for Nombre & Apellidos */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-text-muted block mb-0.5">Nombre</label>
                        <input
                          type="text"
                          value={draft.first_name}
                          onChange={(e) =>
                            handleGuestDraftChange(gst.id, 'first_name', e.target.value)
                          }
                          onBlur={() => handleSaveGuestDetails(gst.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveGuestDetails(gst.id);
                            }
                          }}
                          placeholder="Nombre"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-bg-card border border-border-strong focus:border-primary text-xs text-text-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-muted block mb-0.5">Apellidos</label>
                        <input
                          type="text"
                          value={draft.last_name}
                          onChange={(e) =>
                            handleGuestDraftChange(gst.id, 'last_name', e.target.value)
                          }
                          onBlur={() => handleSaveGuestDetails(gst.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveGuestDetails(gst.id);
                            }
                          }}
                          placeholder="Apellidos"
                          className="w-full py-1.5 px-2.5 rounded-lg bg-bg-card border border-border-subtle focus:border-primary text-xs text-text-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {gst.dietary_restrictions && (
                      <p className="text-[11px] text-text-muted">Dieta: {gst.dietary_restrictions}</p>
                    )}
                    {gst.allergies && (
                      <p className="text-[11px] text-brand-terracotta font-medium">Alergia: {gst.allergies}</p>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-border-subtle/50">
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        {isChild && <Baby className="w-3.5 h-3.5 text-amber-600" />}
                        <span>Tipo de comensal:</span>
                      </span>
                      <div className="inline-flex rounded-lg bg-bg-secondary p-0.5 border border-border-subtle">
                        <button
                          type="button"
                          onClick={() => handleToggleGuestType(gst.id, 'adult')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                            !isChild
                              ? 'bg-primary text-primary-text shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Adulto
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleGuestType(gst.id, 'child')}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            isChild
                              ? 'bg-amber-500 text-white shadow-xs font-semibold'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Baby className="w-3 h-3" />
                          <span>Niño</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Always-Visible Form to Add Another Guest to this Family */}
            <form
              onSubmit={handleAddMember}
              className="p-4 rounded-2xl bg-brand-olive/5 border border-dashed border-brand-olive/40 space-y-3 text-xs"
            >
              <span className="font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4 text-brand-olive" />
                <span>Añadir otro invitado a esta familia</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre *"
                  value={newMemberFirst}
                  onChange={(e) => setNewMemberFirst(e.target.value)}
                  className="py-2 px-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Apellidos (opcional)"
                  value={newMemberLast}
                  onChange={(e) => setNewMemberLast(e.target.value)}
                  className="py-2 px-2.5 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <div className="inline-flex rounded-xl bg-bg-card p-0.5 border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => setNewMemberType('adult')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer ${
                      newMemberType === 'adult' ? 'bg-primary text-primary-text' : 'text-text-secondary'
                    }`}
                  >
                    Adulto
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemberType('child')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium cursor-pointer flex items-center gap-1 ${
                      newMemberType === 'child' ? 'bg-amber-500 text-white' : 'text-text-secondary'
                    }`}
                  >
                    <Baby className="w-3 h-3" />
                    <span>Niño</span>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="py-2 px-4 rounded-xl bg-brand-olive text-white text-xs font-medium hover:bg-brand-olive/90 flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir a la familia</span>
                </button>
              </div>
            </form>
          </div>

          {/* ASISTENCIA MANUAL / TELEFÓNICA CARD */}
          <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-sand/60 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-brand-olive" />
                <span>Confirmación de Asistencia (RSVP)</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  group.invitation_status === 'responded'
                    ? 'bg-brand-olive/15 text-brand-olive'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {group.invitation_status === 'responded' ? 'Confirmado' : 'Pendiente'}
              </span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Para invitados que confirman por teléfono o WhatsApp y no usan la web. Actualiza su asistencia y el recuento global.
            </p>
            <button
              onClick={() => setIsManualRSVPOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-soft cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>
                {group.invitation_status === 'responded'
                  ? 'Modificar Asistencia / Menús'
                  : 'Marcar como Aceptada (Confirmar)'}
              </span>
            </button>
          </div>

          {/* ACCIONES DE INVITACIÓN */}
          <div className="space-y-3 pt-2 border-t border-border-subtle">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
              GESTIÓN DE ENLACE & WHATSAPP
            </span>

            {/* Custom WhatsApp Note Helper */}
            <div className="space-y-2">
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Frase personalizada para el WhatsApp..."
                className="w-full p-3 rounded-xl bg-bg-secondary/30 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppOpen}
                  className="py-2.5 px-3 rounded-xl bg-brand-olive text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-brand-olive/90 transition-colors cursor-pointer shadow-soft"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-2.5 px-3 rounded-xl border border-border-strong text-text-primary font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-olive" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`/i/${group.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-primary-hover shadow-soft transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver como invitado</span>
                </a>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="py-2.5 px-3 rounded-xl border border-border-subtle text-text-secondary font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-bg-secondary transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-text-accent" />
                  <span>{showQR ? 'Ocultar QR' : 'Mostrar QR'}</span>
                </button>
              </div>

              {/* QR Modal view */}
              {showQR && (
                <div className="p-4 rounded-2xl bg-white border border-border-subtle flex flex-col items-center justify-center space-y-2 animate-fade-in my-2">
                  <QRCodeSVG value={fullInvitationUrl} size={150} level="M" />
                  <span className="text-[10px] font-mono text-gray-500">Escanear para abrir invitación</span>
                </div>
              )}
            </div>

            {/* Danger Actions: Regenerate / Revoke / Delete */}
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 rounded-xl border border-border-subtle text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerar</span>
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-3 rounded-xl border border-rose-200 text-[11px] font-medium text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Revocar</span>
                </button>
              </div>

              {onDeleteGroup && (
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="w-full py-2 px-3 rounded-xl border border-rose-300 text-[11px] font-medium text-rose-700 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Eliminar invitación permanentemente</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual RSVP Modal */}
      <ManualRSVPModal
        group={group}
        isOpen={isManualRSVPOpen}
        onClose={() => setIsManualRSVPOpen(false)}
        onSaved={() => {
          setIsManualRSVPOpen(false);
        }}
      />
    </div>,
    document.body
  );
};
