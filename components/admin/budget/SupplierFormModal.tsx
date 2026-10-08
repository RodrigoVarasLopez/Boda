'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetCategory, BudgetSupplier, SupplierStatus } from '@/lib/types';
import { X, Star, Check, Sparkles, Building, Phone, Mail, Globe, Instagram, DollarSign } from 'lucide-react';

interface SupplierFormModalProps {
  isOpen: boolean;
  categories: BudgetCategory[];
  initialCategory?: BudgetCategory | null;
  supplierToEdit?: BudgetSupplier | null;
  onClose: () => void;
  onSubmit: (data: {
    id?: string;
    category_id: string;
    name: string;
    contact_name?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    instagram?: string | null;
    estimated_price?: number | null;
    quoted_price?: number | null;
    final_price?: number | null;
    rating?: number | null;
    status: SupplierStatus;
    comments?: string | null;
    notes?: string | null;
    is_selected: boolean;
  }) => Promise<void>;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  categories,
  initialCategory,
  supplierToEdit,
  onClose,
  onSubmit,
}) => {
  const [mounted, setMounted] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [status, setStatus] = useState<SupplierStatus>('pending');
  const [comments, setComments] = useState('');
  const [notes, setNotes] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (supplierToEdit) {
      setCategoryId(supplierToEdit.category_id);
      setName(supplierToEdit.name);
      setContactName(supplierToEdit.contact_name || '');
      setEmail(supplierToEdit.email || '');
      setPhone(supplierToEdit.phone || '');
      setWebsite(supplierToEdit.website || '');
      setInstagram(supplierToEdit.instagram || '');
      setEstimatedPrice(supplierToEdit.estimated_price != null ? String(supplierToEdit.estimated_price) : '');
      setQuotedPrice(supplierToEdit.quoted_price != null ? String(supplierToEdit.quoted_price) : '');
      setFinalPrice(supplierToEdit.final_price != null ? String(supplierToEdit.final_price) : '');
      setRating(supplierToEdit.rating != null ? supplierToEdit.rating : '');
      setStatus(supplierToEdit.status);
      setComments(supplierToEdit.comments || '');
      setNotes(supplierToEdit.notes || '');
      setIsSelected(supplierToEdit.is_selected);
    } else {
      setCategoryId(initialCategory?.id || (categories[0]?.id || ''));
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setInstagram('');
      setEstimatedPrice('');
      setQuotedPrice('');
      setFinalPrice('');
      setRating('');
      setStatus('pending');
      setComments('');
      setNotes('');
      setIsSelected(false);
    }
  }, [supplierToEdit, initialCategory, categories, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    setLoading(true);
    try {
      await onSubmit({
        id: supplierToEdit?.id,
        category_id: categoryId,
        name: name.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        instagram: instagram.trim() || null,
        estimated_price: estimatedPrice ? Number(estimatedPrice) : null,
        quoted_price: quotedPrice ? Number(quotedPrice) : null,
        final_price: finalPrice ? Number(finalPrice) : null,
        rating: rating !== '' ? Number(rating) : null,
        status,
        comments: comments.trim() || null,
        notes: notes.trim() || null,
        is_selected: isSelected,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-bg-card border border-border-subtle rounded-3xl shadow-card overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-bg-card sticky top-0 z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-text-primary">
              {supplierToEdit ? 'Editar Proveedor' : 'Añadir Proveedor'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Registra los datos, precios cotizados y valoraciones para comparar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Categoría & Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Categoría *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Nombre de la Empresa o Profesional *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Floristería El Laurel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          {/* Contacto & Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Persona de Contacto
              </label>
              <input
                type="text"
                placeholder="Ej: Beatriz Gómez"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+34 600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          {/* Email & Web */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Email
              </label>
              <input
                type="email"
                placeholder="contacto@proveedor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Página Web o Instagram
              </label>
              <input
                type="text"
                placeholder="https://... o @instagram"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              />
            </div>
          </div>

          {/* Precios: Estimado, Presupuesto recibido, Precio Final */}
          <div className="p-3.5 rounded-2xl bg-bg-secondary/30 border border-border-subtle space-y-3">
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
              ESTRUCTURA DE PRECIOS (€)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-secondary block">
                  Precio Estimado
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-text-secondary block">
                  Presupuesto Recibido
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-emerald-800 block">
                  Precio Final Contratado
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-xs text-emerald-700 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
              </div>
            </div>
            <p className="text-[10px] text-text-muted">
              * El sistema utilizará: Precio final &gt; Presupuesto recibido &gt; Precio estimado
            </p>
          </div>

          {/* Rating & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Valoración / Rating (1–10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1-10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}
                  className="w-24 px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-text-accent"
                />
                {rating !== '' && (
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold text-text-primary">{rating}/10</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary block">
                Estado del Proveedor
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SupplierStatus)}
                className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
              >
                <option value="pending">Pendiente</option>
                <option value="contacted">Contactado</option>
                <option value="quoted">Presupuesto recibido</option>
                <option value="finalist">Finalista</option>
                <option value="selected">Seleccionado</option>
                <option value="discarded">Descartado</option>
              </select>
            </div>
          </div>

          {/* Comentarios & Notas */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block">
              Comentarios (Opinión rápida sobre estilo, atención, etc.)
            </label>
            <input
              type="text"
              placeholder="Ej: Muy buena atención y estilo exactamente como buscamos."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary block">
              Notas Internas (Desplazamiento, condiciones, señales, etc.)
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Incluye desplazamiento. Pide 30% de señal. Pendiente confirmar segundo fotógrafo."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-secondary/40 border border-border-subtle text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-text-accent"
            />
          </div>

          {/* Checkbox Proveedor Seleccionado */}
          <div className="p-3 rounded-xl bg-bg-secondary/20 border border-border-subtle flex items-center gap-3">
            <input
              type="checkbox"
              id="is_selected"
              checked={isSelected}
              onChange={(e) => setIsSelected(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <label htmlFor="is_selected" className="text-xs font-medium text-text-primary cursor-pointer">
              Marcar como <strong>proveedor seleccionado</strong> de esta categoría
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-border-subtle flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-subtle text-text-muted hover:text-text-primary text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-soft"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : supplierToEdit ? 'Actualizar Proveedor' : 'Guardar Proveedor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
