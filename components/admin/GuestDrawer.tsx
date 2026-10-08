'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildWhatsAppLink, formatDateEs } from '@/lib/utils';
import { regenerateInvitationTokenAction, revokeInvitationAction, updateGuestTypeAction } from '@/app/actions';
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

  if (!group) return null;

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
    if (onUpdateGuestType) {
      onUpdateGuestType(guestId, type);
    }
    if (group && onUpdateGroup) {
      const updatedGuests = group.guests.map((g) =>
        g.id === guestId ? { ...g, guest_type: type, is_child: type === 'child' } : g
      );
      onUpdateGroup({ ...group, guests: updatedGuests });
    }
    try {
      await updateGuestTypeAction({ guest_id: guestId, guest_type: type });
    } catch (e) {
      console.warn('Error updating guest type:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-bg-card border-l border-border-subtle shadow-card flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex justify-between items-center sticky top-0 bg-bg-card/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-text-accent block">
              Detalle de Invitación
            </span>
            <h3 className="font-serif text-2xl font-normal text-text-primary">
              {group.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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

          {/* INVITADOS SECTION */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-text-accent" />
              INVITADOS EN EL GRUPO ({group.guests.length})
            </span>
            <div className="space-y-2">
              {group.guests.map((gst) => (
                <div key={gst.id} className="p-3.5 rounded-xl bg-bg-secondary/30 border border-border-subtle space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-text-primary">
                    <span>{gst.first_name} {gst.last_name}</span>
                    {gst.is_plus_one_allowed && (
                      <span className="text-[10px] text-brand-terracotta font-semibold bg-bg-card px-2 py-0.5 rounded-full border border-border-subtle">
                        +1 Permitido
                      </span>
                    )}
                  </div>
                  {gst.dietary_restrictions && (
                    <p className="text-[11px] text-text-muted">Dieta: {gst.dietary_restrictions}</p>
                  )}
                  {gst.allergies && (
                    <p className="text-[11px] text-brand-terracotta font-medium">Alergia: {gst.allergies}</p>
                  )}
                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-border-subtle/50">
                    <span className="text-[10px] text-text-muted">Tipo comensal:</span>
                    <div className="inline-flex rounded-lg bg-bg-secondary p-0.5 border border-border-subtle">
                      <button
                        type="button"
                        onClick={() => handleToggleGuestType(gst.id, 'adult')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                          gst.guest_type !== 'child' && !gst.is_child
                            ? 'bg-primary text-primary-text shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Adulto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleGuestType(gst.id, 'child')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                          gst.guest_type === 'child' || gst.is_child
                            ? 'bg-primary text-primary-text shadow-xs'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        Niño
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EVENTOS VISIBLES SECTION */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-text-accent" />
              EVENTOS ASIGNADOS
            </span>
            <div className="space-y-1.5">
              {events.map((evt) => {
                const isAllowed = evt.visibility === 'everyone' || group.allowed_event_ids.includes(evt.id);
                return (
                  <div
                    key={evt.id}
                    className={`p-2.5 rounded-xl border flex justify-between items-center text-xs ${
                      isAllowed
                        ? 'bg-bg-secondary/40 border-border-subtle text-text-primary'
                        : 'bg-bg-secondary/10 border-border-subtle/30 text-text-muted opacity-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={isAllowed ? 'text-brand-olive font-bold' : 'text-text-muted'}>
                        {isAllowed ? '✓' : '✕'}
                      </span>
                      <span>{evt.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {isAllowed ? 'Visible' : 'Oculto'}
                    </span>
                  </div>
                );
              })}
            </div>
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
          // Optional callback
        }}
      />
    </div>
  );
};
