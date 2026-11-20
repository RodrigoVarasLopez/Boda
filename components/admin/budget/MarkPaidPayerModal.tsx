'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BudgetPayment } from '@/lib/types';
import { formatCurrency, getPayerStyle } from '@/lib/budget-data';
import { X, CheckCircle2, User, UserPlus, Check } from 'lucide-react';

interface MarkPaidPayerModalProps {
  isOpen: boolean;
  payment: BudgetPayment | null;
  supplierName?: string;
  defaultMembers: string[];
  existingThirdParties: string[];
  onClose: () => void;
  onConfirm: (paymentId: string, paidBy: string | null) => Promise<void>;
}

export const MarkPaidPayerModal: React.FC<MarkPaidPayerModalProps> = ({
  isOpen,
  payment,
  supplierName,
  defaultMembers,
  existingThirdParties,
  onClose,
  onConfirm,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState('');
  const [sessionThirdParties, setSessionThirdParties] = useState<string[]>([]);
  const [isAddingThirdParty, setIsAddingThirdParty] = useState(false);
  const [thirdPartyInput, setThirdPartyInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && payment) {
      setSelectedPayer(payment.paid_by || '');
      setIsAddingThirdParty(false);
      setThirdPartyInput('');
      setSubmitting(false);
    }
  }, [isOpen, payment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !mounted || !payment) return null;

  const thirdPartyMap = new Map<string, string>();
  const memberSet = new Set(defaultMembers.map((m) => m.trim().toLowerCase()));
  for (const tp of [...existingThirdParties, ...sessionThirdParties]) {
    const clean = tp.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!memberSet.has(key) && !thirdPartyMap.has(key)) {
      thirdPartyMap.set(key, clean);
    }
  }
  const allThirdParties = Array.from(thirdPartyMap.values());

  const handleAddThirdParty = () => {
    const clean = thirdPartyInput.trim();
    if (!clean) return;
    if (!allThirdParties.some((tp) => tp.toLowerCase() === clean.toLowerCase()) && !memberSet.has(clean.toLowerCase())) {
      setSessionThirdParties((prev) => [...prev, clean]);
    }
    setSelectedPayer(clean);
    setThirdPartyInput('');
    setIsAddingThirdParty(false);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePaidBy =
      isAddingThirdParty && thirdPartyInput.trim()
        ? thirdPartyInput.trim()
        : selectedPayer.trim() || null;

    setSubmitting(true);
    try {
      await onConfirm(payment.id, effectivePaidBy);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !submitting && onClose()}
      />

      <form
        onSubmit={handleConfirm}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-bg-canvas/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-medium text-text-primary">
                Confirmar Pago Realizado
              </h3>
              <p className="text-[11px] text-text-muted">
                Indica quién ha abonado este plazo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {supplierName && (
                <span className="text-xs font-bold text-text-primary block truncate">
                  {supplierName}
                </span>
              )}
              <span className="text-[11px] text-text-muted block truncate">
                {payment.notes || 'Plazo programado'}
              </span>
            </div>
            <span className="font-mono text-base font-bold text-emerald-700 shrink-0">
              {formatCurrency(Number(payment.amount))}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>¿Quién ha realizado este pago?</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {defaultMembers.map((member) => {
                const active = selectedPayer.trim().toLowerCase() === member.trim().toLowerCase();
                const style = getPayerStyle(member, defaultMembers);
                return (
                  <button
                    key={member}
                    type="button"
                    onClick={() => {
                      setSelectedPayer(active ? '' : member);
                      setIsAddingThirdParty(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? `${style.badge} ring-2 ${style.ring}`
                        : 'bg-bg-card border-border-subtle text-text-primary hover:border-border-strong'
                    }`}
                  >
                    <User className="w-3 h-3" />
                    <span>{member}</span>
                  </button>
                );
              })}

              {allThirdParties.map((tp) => {
                const active = selectedPayer.trim().toLowerCase() === tp.trim().toLowerCase();
                const style = getPayerStyle(tp, defaultMembers);
                return (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => {
                      setSelectedPayer(active ? '' : tp);
                      setIsAddingThirdParty(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? `${style.badge} ring-2 ${style.ring}`
                        : 'bg-bg-card border-border-subtle text-text-primary hover:border-border-strong'
                    }`}
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>{tp}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsAddingThirdParty(!isAddingThirdParty)}
                className={`px-3 py-1.5 rounded-xl border border-dashed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isAddingThirdParty
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-strong text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40'
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Añadir tercero</span>
              </button>

              {selectedPayer && (
                <button
                  type="button"
                  onClick={() => setSelectedPayer('')}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] text-text-muted hover:text-text-primary hover:bg-neutral-100 cursor-pointer"
                >
                  Sin especificar
                </button>
              )}
            </div>

            {isAddingThirdParty && (
              <div className="flex items-center gap-2 pt-1 animate-fade-in">
                <input
                  type="text"
                  autoFocus
                  placeholder="Nombre del tercero (ej: Padres de Rodrigo, Madre de Stephanie...)"
                  value={thirdPartyInput}
                  onChange={(e) => setThirdPartyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddThirdParty();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-primary/50 bg-bg-canvas text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleAddThirdParty}
                  disabled={!thirdPartyInput.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Añadir
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-border-subtle bg-bg-canvas/40 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-2 rounded-xl border border-border-subtle text-text-secondary hover:bg-neutral-100 text-xs font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{submitting ? 'Confirmando...' : 'Confirmar pago'}</span>
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};
