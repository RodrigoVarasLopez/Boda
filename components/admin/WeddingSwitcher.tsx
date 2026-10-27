'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWeddingPlanner } from '@/lib/weddings-store';
import {
  ChevronDown,
  Check,
  Plus,
  Briefcase,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CreateWeddingModal } from './CreateWeddingModal';

export function WeddingSwitcher() {
  const router = useRouter();
  const { weddings, activeWedding, selectWedding } = useWeddingPlanner();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Active Wedding Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-strong bg-bg-card hover:bg-bg-secondary transition-all shadow-xs text-left group cursor-pointer"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-accent font-bold leading-none">
              Boda Activa · Planner
            </span>
            <span className="font-serif text-sm sm:text-base font-bold text-text-primary tracking-tight leading-tight group-hover:text-text-accent transition-colors">
              {activeWedding.couple_names}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ml-0.5 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-3xl bg-bg-card border border-border-strong shadow-card p-2 z-50 animate-fade-in space-y-1">
            {/* Header info */}
            <div className="px-3 py-2 border-b border-border-subtle flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted font-bold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-text-accent" />
                Cartera de Bodas ({weddings.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary font-medium">
                Wedding Planner Pro
              </span>
            </div>

            {/* List of weddings */}
            <div className="max-h-64 overflow-y-auto space-y-1 py-1">
              {weddings.map((w) => {
                const isActive = w.id === activeWedding.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      selectWedding(w.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-primary/10 border border-primary/30 text-text-primary'
                        : 'hover:bg-bg-secondary border border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-text-primary truncate block">
                          {w.couple_names}
                        </span>
                        {isActive && (
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-primary text-primary-text shrink-0">
                            Activa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3 text-text-accent" />
                          {formatDate(w.wedding_date)}
                        </span>
                        <span className="truncate max-w-[140px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-olive" />
                          {w.location_summary.split('·')[0]}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-text flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Actions at bottom of dropdown */}
            <div className="pt-2 border-t border-border-subtle space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-hover transition-colors cursor-pointer shadow-soft"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Nueva Boda</span>
              </button>

              <Link
                href="/admin/weddings"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-3 rounded-xl hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-text-accent" />
                <span>Ver Panel Global de Wedding Planner →</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateWeddingModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}
