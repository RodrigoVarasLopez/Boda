'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BudgetCategory,
  BudgetSupplier,
  SUPPLIER_STATUS_LABELS,
} from '@/lib/types';
import { formatCurrency, getEffectiveSupplierPrice } from '@/lib/budget-data';
import {
  X,
  Star,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Globe,
  Instagram,
  ArrowUpDown,
  Filter,
  CreditCard,
  MessageSquare,
  FileText,
  User,
} from 'lucide-react';

interface SupplierComparatorDrawerProps {
  isOpen: boolean;
  category: BudgetCategory | null;
  suppliers: BudgetSupplier[];
  onClose: () => void;
  onSelectSupplier: (supplierId: string, categoryId: string) => Promise<void>;
  onEditSupplier: (supplier: BudgetSupplier) => void;
  onDeleteSupplier: (supplierId: string) => Promise<void>;
  onAddSupplier: (category: BudgetCategory) => void;
  onAddPayment: (supplier: BudgetSupplier) => void;
}

export const SupplierComparatorDrawer: React.FC<SupplierComparatorDrawerProps> = ({
  isOpen,
  category,
  suppliers,
  onClose,
  onSelectSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onAddSupplier,
  onAddPayment,
}) => {
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'status'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !category || !mounted) return null;

  // Filter suppliers belonging to this category
  const categorySuppliers = suppliers.filter((s) => s.category_id === category.id);

  // Sorting logic
  const sortedSuppliers = [...categorySuppliers].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = getEffectiveSupplierPrice(a);
      const priceB = getEffectiveSupplierPrice(b);
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    }
    if (sortBy === 'rating') {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
    }
    if (sortBy === 'status') {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const handleSelect = async (supplierId: string) => {
    setSelectingId(supplierId);
    try {
      await onSelectSupplier(supplierId, category.id);
    } finally {
      setSelectingId(null);
    }
  };

  const renderStars = (rating?: number | null) => {
    if (!rating) return <span className="text-[11px] text-text-muted">Sin valorar</span>;
    const fullStars = Math.round(rating / 2);
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex text-amber-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${s <= fullStars ? 'fill-amber-500' : 'text-border-subtle'}`}
            />
          ))}
        </div>
        <span className="text-xs font-mono font-bold text-text-primary">
          {rating}/10
        </span>
      </div>
    );
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl h-full bg-bg-card border-l border-border-subtle shadow-card flex flex-col justify-between overflow-hidden animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-subtle flex justify-between items-center bg-bg-card sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-primary">
                Comparador: {category.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-bg-secondary text-text-accent border border-border-subtle">
                {categorySuppliers.length} opciones
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Compara precios, presupuestos, notas y selecciona el proveedor definitivo
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer"
            aria-label="Cerrar comparador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Sorting & Add Supplier */}
        <div className="px-5 py-3 bg-bg-secondary/30 border-b border-border-subtle flex flex-wrap justify-between items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-text-muted flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Ordenar por:
            </span>
            <button
              onClick={() => {
                if (sortBy === 'price') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('price'); setSortOrder('asc'); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'price'
                  ? 'bg-primary text-primary-text border-primary'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              Precio {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'rating') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('rating'); setSortOrder('desc'); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'rating'
                  ? 'bg-primary text-primary-text border-primary'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'status') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                else { setSortBy('status'); setSortOrder('asc'); }
              }}
              className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                sortBy === 'status'
                  ? 'bg-primary text-primary-text border-primary'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              Estado {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <button
            onClick={() => onAddSupplier(category)}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1 cursor-pointer shadow-soft"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir proveedor</span>
          </button>
        </div>

        {/* Suppliers List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {sortedSuppliers.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center mx-auto text-text-muted">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-text-primary">
                No hay proveedores registrados
              </h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Añade los presupuestos que vayas recibiendo para compararlos lado a lado y elegir la mejor opción.
              </p>
              <button
                onClick={() => onAddSupplier(category)}
                className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir primer proveedor</span>
              </button>
            </div>
          ) : (
            sortedSuppliers.map((supplier) => {
              const effectivePrice = getEffectiveSupplierPrice(supplier);
              return (
                <div
                  key={supplier.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                    supplier.is_selected
                      ? 'bg-emerald-50/30 border-emerald-500 shadow-soft ring-1 ring-emerald-500/30'
                      : 'bg-bg-card border-border-subtle hover:border-border-strong shadow-card'
                  }`}
                >
                  {/* Top Line: Name, Status, Selection */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-text-primary">
                          {supplier.name}
                        </h4>
                        {supplier.is_selected && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Seleccionado
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-text-secondary bg-bg-secondary px-2 py-0.5 rounded-md border border-border-subtle">
                          {SUPPLIER_STATUS_LABELS[supplier.status]}
                        </span>
                      </div>

                      {supplier.contact_name && (
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          <User className="w-3 h-3 text-text-accent" />
                          <span>Contacto: {supplier.contact_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Price and Rating */}
                    <div className="sm:text-right space-y-1">
                      <div className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                        {formatCurrency(effectivePrice)}
                      </div>
                      <div>{renderStars(supplier.rating)}</div>
                    </div>
                  </div>

                  {/* Price Breakdown Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-bg-secondary/40 border border-border-subtle/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted block">Estimado</span>
                      <span className="font-semibold text-text-primary font-mono text-[11px]">
                        {supplier.estimated_price != null ? formatCurrency(Number(supplier.estimated_price)) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Presupuesto</span>
                      <span className="font-semibold text-text-primary font-mono text-[11px]">
                        {supplier.quoted_price != null ? formatCurrency(Number(supplier.quoted_price)) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Final</span>
                      <span className="font-semibold text-emerald-700 font-mono text-[11px]">
                        {supplier.final_price != null ? formatCurrency(Number(supplier.final_price)) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Comments and Notes */}
                  {(supplier.comments || supplier.notes) && (
                    <div className="space-y-2 text-xs pt-1 border-t border-border-subtle/60">
                      {supplier.comments && (
                        <div className="flex items-start gap-1.5 text-text-secondary">
                          <MessageSquare className="w-3.5 h-3.5 text-text-accent shrink-0 mt-0.5" />
                          <span className="italic">&ldquo;{supplier.comments}&rdquo;</span>
                        </div>
                      )}
                      {supplier.notes && (
                        <div className="flex items-start gap-1.5 text-text-muted bg-bg-secondary/30 p-2 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                          <span>{supplier.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contact Links */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted pt-1">
                    {supplier.phone && (
                      <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        <Phone className="w-3 h-3 text-text-accent" />
                        <span>{supplier.phone}</span>
                      </a>
                    )}
                    {supplier.email && (
                      <a href={`mailto:${supplier.email}`} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        <Mail className="w-3 h-3 text-text-accent" />
                        <span>{supplier.email}</span>
                      </a>
                    )}
                    {supplier.website && (
                      <a href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-text-primary transition-colors">
                        <Globe className="w-3 h-3 text-text-accent" />
                        <span>Web</span>
                      </a>
                    )}
                    {supplier.instagram && (
                      <span className="flex items-center gap-1">
                        <Instagram className="w-3 h-3 text-brand-terracotta" />
                        <span>{supplier.instagram}</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-border-subtle flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditSupplier(supplier)}
                        className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-text-primary text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => onDeleteSupplier(supplier.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:bg-rose-50 hover:text-rose-600 text-text-muted text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Eliminar</span>
                      </button>

                      {supplier.is_selected && (
                        <button
                          onClick={() => onAddPayment(supplier)}
                          className="px-2.5 py-1.5 rounded-lg border border-border-subtle hover:border-border-strong text-text-primary text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3 h-3 text-text-accent" />
                          <span>Registrar pago</span>
                        </button>
                      )}
                    </div>

                    {!supplier.is_selected ? (
                      <button
                        onClick={() => handleSelect(supplier.id)}
                        disabled={selectingId === supplier.id}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-soft"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{selectingId === supplier.id ? 'Seleccionando...' : 'Elegir como proveedor'}</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Proveedor contratado</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
