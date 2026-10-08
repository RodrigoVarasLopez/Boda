'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Plus,
  Trash2,
  Copy,
  Check,
  MessageCircle,
  Eye,
  Sparkles,
  Calendar,
  Utensils,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import { INITIAL_EVENTS, INITIAL_WEDDING } from '@/lib/mock-data';
import { buildWhatsAppLink } from '@/lib/utils';
import { GuestGroup } from '@/lib/types';

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: GuestGroup) => void;
  createGroupAction: (input: any) => Promise<{ success: boolean; group?: GuestGroup; token?: string; error?: string }>;
}

interface GuestItemForm {
  first_name: string;
  last_name: string;
  guest_type: 'adult' | 'child';
  is_plus_one_allowed: boolean;
  dietary_restrictions: string;
  allergies: string;
  phone: string;
  email: string;
}

const DEFAULT_EVENTS = ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'];

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
  createGroupAction,
}) => {
  const [groupName, setGroupName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [allowedEvents, setAllowedEvents] = useState<string[]>(DEFAULT_EVENTS);
  const [guests, setGuests] = useState<GuestItemForm[]>([
    {
      first_name: '',
      last_name: '',
      guest_type: 'adult',
      is_plus_one_allowed: false,
      dietary_restrictions: 'standard',
      allergies: '',
      phone: '',
      email: '',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{ group: GuestGroup; token: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleAddGuestRow = () => {
    setGuests((prev) => [
      ...prev,
      {
        first_name: '',
        last_name: '',
        guest_type: 'adult',
        is_plus_one_allowed: false,
        dietary_restrictions: 'standard',
        allergies: '',
        phone: '',
        email: '',
      },
    ]);
  };

  const handleRemoveGuestRow = (index: number) => {
    if (guests.length <= 1) return;
    setGuests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuestChange = (index: number, field: keyof GuestItemForm, value: any) => {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
  };

  const handleToggleEvent = (eventId: string) => {
    setAllowedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setErrorMessage('Por favor introduce un nombre para el grupo o familia.');
      return;
    }

    const validGuests = guests.filter((g) => g.first_name.trim().length > 0);
    if (validGuests.length === 0) {
      setErrorMessage('Debes añadir al menos un invitado con su nombre.');
      return;
    }

    if (allowedEvents.length === 0) {
      setErrorMessage('Selecciona al menos un evento para la invitación.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        custom_message: customMessage.trim() || undefined,
        allowed_event_ids: allowedEvents,
        guests: validGuests.map((g) => ({
          first_name: g.first_name.trim(),
          last_name: g.last_name.trim(),
          is_child: g.guest_type === 'child',
          is_plus_one_allowed: g.is_plus_one_allowed,
          dietary_restrictions: g.dietary_restrictions || 'standard',
          allergies: g.allergies.trim() || undefined,
          phone: g.phone.trim() || undefined,
          email: g.email.trim() || undefined,
        })),
      };

      const result = await createGroupAction(payload);
      if (result.success && result.group) {
        onGroupCreated(result.group);
        setCreatedResult({
          group: result.group,
          token: result.token || result.group.token,
        });
      } else {
        setErrorMessage(result.error || 'No se pudo guardar la invitación en la base de datos.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error inesperado al guardar la invitación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setGroupName('');
    setCustomMessage('');
    setAllowedEvents(DEFAULT_EVENTS);
    setGuests([
      {
        first_name: '',
        last_name: '',
        guest_type: 'adult',
        is_plus_one_allowed: false,
        dietary_restrictions: 'standard',
        allergies: '',
        phone: '',
        email: '',
      },
    ]);
    setCreatedResult(null);
    setErrorMessage(null);
  };

  const invitationUrl = createdResult
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://stephanieyrodrigo.com'}/i/${createdResult.token}`
    : '';

  const handleCopyLink = () => {
    if (!invitationUrl) return;
    navigator.clipboard.writeText(invitationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsApp = () => {
    if (!createdResult) return;
    const phone = createdResult.group.guests[0]?.phone || '';
    const wa = buildWhatsAppLink(
      phone,
      createdResult.group.name,
      INITIAL_WEDDING.couple_names,
      INITIAL_WEDDING.wedding_date,
      invitationUrl,
      createdResult.group.custom_message
    );
    window.open(wa, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-bg-card rounded-2xl border border-border-subtle shadow-card flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-subtle flex justify-between items-center bg-bg-card/95 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-olive/15 text-brand-olive flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-accent block">
                Nuevo Registro
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-text-primary">
                {createdResult ? '¡Invitación Creada!' : 'Añadir Invitados / Familia'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-bg-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {createdResult ? (
            /* SUCCESS STATE */
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-brand-olive/15 text-brand-olive flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-serif text-2xl text-text-primary">
                  {createdResult.group.name}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Se ha generado su enlace único y se ha sincronizado con Supabase.
                </p>
              </div>

              {/* Link Box */}
              <div className="p-4 rounded-xl bg-bg-secondary/60 border border-border-subtle text-left space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted block">
                  Enlace exclusivo de invitación
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={invitationUrl}
                    className="flex-1 px-3 py-2 rounded-lg bg-bg-card border border-border-subtle text-xs font-mono text-text-primary truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      copiedLink
                        ? 'bg-brand-olive text-white'
                        : 'bg-primary text-primary-text hover:bg-primary-hover'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-soft"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
                <a
                  href={`/i/${createdResult.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl border border-border-subtle text-text-primary hover:bg-bg-secondary font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4 text-text-accent" />
                  <span>Ver cómo lo ve el invitado</span>
                </a>
              </div>

              <div className="flex justify-center gap-3 pt-4 border-t border-border-subtle">
                <button
                  onClick={handleReset}
                  className="py-2.5 px-4 rounded-xl border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-secondary cursor-pointer"
                >
                  + Añadir otro grupo
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {errorMessage}
                </div>
              )}

              {/* 1. Group info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Nombre del grupo o familia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Familia García, Sofía & Alberto, Tía Carmen..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Es el nombre visible en la cabecera de la invitación digital.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Mensaje o nota personalizada (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. ¡Tenemos muchísimas ganas de celebrar con vosotros en Valladolid!"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {/* 2. Allowed Events */}
              <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border-subtle space-y-2.5">
                <span className="text-xs font-semibold text-text-primary block flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-olive" />
                  Eventos a los que están invitados
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {INITIAL_EVENTS.map((evt) => {
                    const isChecked = allowedEvents.includes(evt.id);
                    return (
                      <label
                        key={evt.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-bg-card border-brand-olive/40 text-text-primary'
                            : 'bg-transparent border-border-subtle text-text-muted hover:border-text-muted/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEvent(evt.id)}
                          className="mt-0.5 rounded text-brand-olive focus:ring-brand-olive"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{evt.title}</p>
                          <p className="text-[10px] text-text-muted">{evt.day_label}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Guests List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-olive" />
                    Miembros del grupo ({guests.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddGuestRow}
                    className="text-xs font-medium text-brand-olive hover:text-brand-olive/80 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir acompañante</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {guests.map((guest, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-soft"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-text-accent">
                          Invitado #{idx + 1} {idx === 0 && '· Contacto Principal'}
                        </span>
                        {guests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveGuestRow(idx)}
                            className="p-1 rounded-md text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar invitado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Name row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-text-muted mb-1">
                            Nombre <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nombre de pila"
                            value={guest.first_name}
                            onChange={(e) => handleGuestChange(idx, 'first_name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-text-muted mb-1">
                            Apellidos (opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Apellidos"
                            value={guest.last_name}
                            onChange={(e) => handleGuestChange(idx, 'last_name', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Guest Type & Plus One */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] text-text-muted mb-1">
                            Tipo de comensal (Menú)
                          </label>
                          <div className="flex gap-1.5 p-1 rounded-lg bg-bg-secondary/60 border border-border-subtle text-xs">
                            <button
                              type="button"
                              onClick={() => handleGuestChange(idx, 'guest_type', 'adult')}
                              className={`flex-1 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                                guest.guest_type === 'adult'
                                  ? 'bg-bg-card text-text-primary shadow-xs font-semibold'
                                  : 'text-text-muted hover:text-text-primary'
                              }`}
                            >
                              Adulto
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGuestChange(idx, 'guest_type', 'child')}
                              className={`flex-1 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                                guest.guest_type === 'child'
                                  ? 'bg-brand-sand/50 text-brand-dark shadow-xs font-semibold'
                                  : 'text-text-muted hover:text-text-primary'
                              }`}
                            >
                              Niño (Menú infantil)
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
                            <input
                              type="checkbox"
                              checked={guest.is_plus_one_allowed}
                              onChange={(e) =>
                                handleGuestChange(idx, 'is_plus_one_allowed', e.target.checked)
                              }
                              className="rounded text-brand-olive focus:ring-brand-olive"
                            />
                            <span>Permitir acompañante (+1 libre)</span>
                          </label>
                        </div>
                      </div>

                      {/* Contact row (Phone / Email) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] text-text-muted mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-text-muted" /> Teléfono / WhatsApp
                          </label>
                          <input
                            type="tel"
                            placeholder="+34 600 000 000"
                            value={guest.phone}
                            onChange={(e) => handleGuestChange(idx, 'phone', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-text-muted mb-1 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-text-muted" /> Email (opcional)
                          </label>
                          <input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={guest.email}
                            onChange={(e) => handleGuestChange(idx, 'email', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border-subtle flex flex-col sm:flex-row justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl border border-border-subtle text-xs font-medium text-text-secondary hover:bg-bg-secondary cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Crear Invitación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
