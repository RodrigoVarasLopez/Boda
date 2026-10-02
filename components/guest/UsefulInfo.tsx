'use client';

import React, { useState } from 'react';
import { Wedding, CMSBlock } from '@/lib/types';
import { Hotel, Bus, Gift, HelpCircle, Copy, Check, ChevronDown, Sparkles } from 'lucide-react';

interface UsefulInfoProps {
  wedding: Wedding;
  blocks: CMSBlock[];
}

export const UsefulInfo: React.FC<UsefulInfoProps> = ({ wedding, blocks }) => {
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);

  const registryBlock = blocks.find((b) => b.type === 'registry');
  const travelBlock = blocks.find((b) => b.type === 'travel');
  const faqBlock = blocks.find((b) => b.type === 'faq');

  const handleCopyIBAN = () => {
    const iban = wedding.iban_details?.iban || registryBlock?.content?.iban || 'ES91 2100 0418 4502 0005 1234';
    navigator.clipboard.writeText(iban);
    setCopiedIBAN(true);
    setTimeout(() => setCopiedIBAN(false), 2500);
  };

  return (
    <section className="py-10 px-4 max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Información Práctica</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-semibold pt-1">
          Guía del Invitado
        </h2>
        <p className="text-xs text-text-muted">
          Todo lo que necesitas saber para disfrutar del fin de semana sin preocupaciones.
        </p>
      </div>

      {/* Travel & Accommodation Module */}
      {travelBlock && (
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Hotel className="w-4 h-4" />
            <span>Alojamiento & Autobuses</span>
          </div>

          <div className="space-y-3 pt-1 text-xs text-text-secondary">
            {travelBlock.content?.hotels?.map((h: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-bg-secondary/50 border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary block text-sm">{h.name}</span>
                <span className="text-text-accent block">{h.discount}</span>
                <span className="text-text-muted block text-[11px]">{h.distance}</span>
              </div>
            ))}

            {travelBlock.content?.bus_info && (
              <div className="p-3.5 rounded-xl bg-bg-secondary/50 border border-border-subtle flex gap-2.5 items-start">
                <Bus className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />
                <p className="text-text-secondary leading-relaxed">
                  {travelBlock.content.bus_info}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Registry Module (Lista de Bodas) */}
      <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-secondary text-text-accent border border-border-subtle">
          <Gift className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif text-2xl font-semibold text-text-primary">
            Lista de Bodas
          </h3>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            El mejor regalo es vuestra presencia. Si aun así queréis tener un detalle para nuestro viaje de novios:
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-bg-secondary/70 border border-border-subtle space-y-3 text-left">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
            Titular: {wedding.iban_details?.account_holder || registryBlock?.content?.account_holder}
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border-strong">
            <span className="font-mono text-sm font-bold text-text-primary tracking-wide">
              {wedding.iban_details?.iban || registryBlock?.content?.iban || 'ES91 2100 0418 4502 0005 1234'}
            </span>
            <button
              onClick={handleCopyIBAN}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer shrink-0 ml-2"
            >
              {copiedIBAN ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Module */}
      {faqBlock && faqBlock.content?.faqs && (
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-soft space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Preguntas Frecuentes</span>
          </div>

          <div className="space-y-2 pt-1">
            {faqBlock.content.faqs.map((item: any, index: number) => {
              const isOpen = openFAQIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border-subtle overflow-hidden bg-bg-secondary/30"
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                    className="w-full p-3.5 text-left flex justify-between items-center text-xs font-semibold text-text-primary hover:bg-bg-secondary/60 transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-3.5 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-subtle/50">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
