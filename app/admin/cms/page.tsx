'use client';

import React, { useState } from 'react';
import { INITIAL_CMS_BLOCKS } from '@/lib/mock-data';
import { CMSBlock } from '@/lib/types';
import { Eye, EyeOff, Edit3, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminCMSPage() {
  const [blocks, setBlocks] = useState<CMSBlock[]>(INITIAL_CMS_BLOCKS);

  const toggleBlockActive = (id: string) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setBlocks(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-text-accent block">
            Gestor de Contenidos por Bloques
          </span>
          <h1 className="font-serif text-3xl font-normal text-text-primary">
            CMS & Narrativa de la Boda
          </h1>
          <p className="text-xs text-text-muted">
            Reordena, activa o personaliza cada sección visual de la web de Stephanie & Rodrigo.
          </p>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`p-5 rounded-3xl bg-bg-card border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
              block.is_active ? 'border-border-subtle shadow-card' : 'border-border-subtle/40 opacity-60 bg-bg-secondary/20'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider bg-bg-secondary text-text-accent border border-border-subtle">
                  {block.type}
                </span>
                <h3 className="font-serif text-xl font-normal text-text-primary">
                  {block.title}
                </h3>
              </div>
              {block.subtitle && (
                <p className="text-xs text-text-muted">{block.subtitle}</p>
              )}
            </div>

            {/* Actions: Reorder, Active Toggle, Edit */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
                className="p-2 rounded-xl text-text-muted hover:bg-bg-secondary hover:text-text-primary disabled:opacity-20 cursor-pointer transition-colors"
                title="Mover arriba"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
                className="p-2 rounded-xl text-text-muted hover:bg-bg-secondary hover:text-text-primary disabled:opacity-20 cursor-pointer transition-colors"
                title="Mover abajo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleBlockActive(block.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  block.is_active
                    ? 'bg-brand-olive/15 text-brand-olive font-semibold'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {block.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{block.is_active ? 'Activo' : 'Oculto'}</span>
              </button>

              <button
                onClick={() => alert(`Editar bloque: ${block.title}`)}
                className="py-2 px-3 rounded-xl border border-border-strong text-text-primary text-xs font-medium hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
