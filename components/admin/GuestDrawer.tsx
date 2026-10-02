'use client';

import React, { useState } from 'react';
import { GuestGroup, Event, Wedding, GuestRSVPResponse } from '@/lib/types';
import { X, Copy, ExternalLink, MessageCircle, QrCode, Eye, Check, Calendar, Users, Clock, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildWhatsAppLink, formatDateEs } from '@/lib/utils';

interface GuestDrawerProps {
  group: GuestGroup | null;
  wedding: Wedding;
  events: Event[];
  existingRSVP?: GuestRSVPResponse[];
  onClose: () => void;
  onUpdateGroup?: (updatedGroup: GuestGroup) => void;
}

export const GuestDrawer: React.FC<GuestDrawerProps> = ({
  group,
  wedding,
  events,
  existingRSVP,
  onClose,
  onUpdateGroup,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [customNote, setCustomNote] = useState(group?.custom_message || '');

  if (!group) return null;

  const fullInvitationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/i/${group.token}`
    : `https://bodaweb.app/i/${group.token}`;

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
      fullInvitationUrl,
      customNote
    );
    window.open(waUrl, '_blank');
  };

  const assignedEvents = events.filter((e) =>
    e.visibility === 'everyone' || group.allowed_event_ids.includes(e.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full bg-bg-card border-l border-border-subtle shadow-card flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex justify-between items-center sticky top-0 bg-bg-card/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-accent block">
              Detalle de Invitación
            </span>
            <h3 className="font-serif text-2xl font-semibold text-text-primary">
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
          <div className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted font-medium">Estado de Invitación</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                  group.invitation_status === 'responded'
                    ? 'bg-emerald-100 text-emerald-800'
                    : group.invitation_status === 'opened'
                    ? 'bg-blue-100 text-blue-800'
                    : group.invitation_status === 'sent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {group.invitation_status}
              </span>
            </div>

            <div className="space-y-1 text-text-secondary text-[11px] pt-1 border-t border-border-subtle/50">
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

          {/* Quick Action Links & WhatsApp Helper */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted block">
              Enlace Seguro OPACO
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={fullInvitationUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-bg-secondary/40 border border-border-subtle font-mono text-xs text-text-secondary truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-primary text-primary-text font-medium text-xs flex items-center gap-1.5 hover:bg-primary-hover shrink-0 cursor-pointer shadow-soft"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Custom WhatsApp Note Helper */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-text-secondary block">
                Mensaje de WhatsApp personalizado
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Añade una frase personal para este invitado..."
                className="w-full p-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppOpen}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors cursor-pointer shadow-soft"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir WhatsApp</span>
                </button>
                <a
                  href={`/i/${group.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl border border-border-strong text-text-primary font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-bg-secondary transition-colors"
                >
                  <Eye className="w-4 h-4 text-text-accent" />
                  <span>Ver como invitado</span>
                </a>
              </div>
            </div>
          </div>

          {/* QR Code Generator */}
          <div className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-text-accent" />
                Código QR de Invitación
              </span>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-xs text-text-accent font-medium hover:underline cursor-pointer"
              >
                {showQR ? 'Ocultar' : 'Mostrar QR'}
              </button>
            </div>

            {showQR && (
              <div className="p-4 rounded-xl bg-white border border-border-subtle flex flex-col items-center justify-center space-y-2 animate-fade-in">
                <QRCodeSVG value={fullInvitationUrl} size={150} level="M" />
                <span className="text-[10px] font-mono text-gray-500">Scan to open invitation</span>
              </div>
            )}
          </div>

          {/* Guests List in this Group */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block flex items-center gap-1.5">
              <Users className="w-4 h-4 text-text-accent" />
              Personas en este Grupo ({group.guests.length})
            </span>
            <div className="space-y-2">
              {group.guests.map((gst) => (
                <div key={gst.id} className="p-3 rounded-xl bg-bg-secondary/50 border border-border-subtle space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-text-primary">
                    <span>{gst.first_name} {gst.last_name}</span>
                    {gst.is_plus_one_allowed && (
                      <span className="text-[10px] text-text-accent font-semibold bg-bg-card px-2 py-0.5 rounded-full border border-border-subtle">
                        +1 Permitido
                      </span>
                    )}
                  </div>
                  {gst.dietary_restrictions && (
                    <p className="text-[11px] text-text-muted">Dieta: {gst.dietary_restrictions}</p>
                  )}
                  {gst.allergies && (
                    <p className="text-[11px] text-rose-700">Alergia: {gst.allergies}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Visibility Matrix for this Group */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-text-accent" />
              Eventos Visibles (&ldquo;Tu boda&rdquo;) ({assignedEvents.length})
            </span>
            <div className="space-y-1.5">
              {assignedEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle flex justify-between items-center text-xs">
                  <span className="font-medium text-text-primary">{evt.title}</span>
                  <span className="text-[10px] text-text-muted font-mono">{formatDateEs(evt.start_time, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
