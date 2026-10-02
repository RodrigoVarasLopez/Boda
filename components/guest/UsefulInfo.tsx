'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wedding, CMSBlock } from '@/lib/types';
import { Hotel, Bus, Gift, HelpCircle, Copy, Check, ChevronDown, Sparkles, MapPin } from 'lucide-react';

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
  const venueBlock = blocks.find((b) => b.type === 'venue');

  const handleCopyIBAN = () => {
    const iban = wedding.iban_details?.iban || registryBlock?.content?.iban || 'ES91 2100 0418 4502 0005 1234';
    navigator.clipboard.writeText(iban);
    setCopiedIBAN(true);
    setTimeout(() => setCopiedIBAN(false), 2500);
  };

  return (
    <section className="py-12 px-5 max-w-lg mx-auto space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle">
          <Sparkles className="w-3 h-3" />
          <span>Información Práctica</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-text-primary font-normal">
          Guía del Invitado
        </h2>
        <p className="text-xs text-text-muted max-w-xs mx-auto">
          Todo lo que necesitas saber para disfrutar del fin de semana sin preocupaciones.
        </p>
      </div>

      {/* Venue Showcase Card */}
      {venueBlock && (
        <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden space-y-4">
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={venueBlock.content?.image || '/images/bodega/bodega-concejo-banquete-noche.png'}
              alt={venueBlock.subtitle || 'Bodega Concejo'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-sand block">El Enclave</span>
              <h3 className="font-serif text-2xl font-normal leading-tight">{venueBlock.subtitle || 'Bodega Concejo'}</h3>
            </div>
          </div>
          <div className="p-6 pt-2 space-y-3 text-xs text-text-secondary leading-relaxed">
            <p>{venueBlock.content?.description}</p>
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-text-muted flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-text-accent" />
                {venueBlock.content?.address}
              </span>
              <a
                href={venueBlock.content?.google_maps_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-lg bg-bg-secondary text-text-primary font-medium text-[11px] hover:bg-bg-accent transition-colors"
              >
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Travel & Accommodation Module */}
      {travelBlock && (
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
            <Hotel className="w-4 h-4" />
            <span>Alojamiento & Autobuses</span>
          </div>

          <div className="space-y-3 pt-1 text-xs text-text-secondary">
            {travelBlock.content?.hotels?.map((h: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                <span className="font-semibold text-text-primary block text-sm">{h.name}</span>
                <span className="text-brand-terracotta block font-medium">{h.discount}</span>
                <span className="text-text-muted block text-[11px]">{h.distance}</span>
              </div>
            ))}

            {travelBlock.content?.bus_info && (
              <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border-subtle flex gap-3 items-start">
                <Bus className="w-4 h-4 text-text-accent shrink-0 mt-0.5" />
                <p className="text-text-secondary leading-relaxed text-xs">
                  {travelBlock.content.bus_info}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gift Registry Module (Lista de Bodas) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-cream/60 text-brand-terracotta border border-border-subtle">
          <Gift className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif text-2xl font-normal text-text-primary">
            Lista de Bodas
          </h3>
          <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
            Vuestra presencia y compañía es nuestro mayor regalo. Si además deseáis colaborar en nuestra luna de miel:
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-bg-secondary/60 border border-border-subtle space-y-3 text-left">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
            Titular: {wedding.iban_details?.account_holder || 'Stephanie & Rodrigo'}
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border-strong/70">
            <span className="font-mono text-xs sm:text-sm font-semibold text-text-primary tracking-wider">
              {wedding.iban_details?.iban || 'ES91 2100 0418 4502 0005 1234'}
            </span>
            <button
              onClick={handleCopyIBAN}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
            >
              {copiedIBAN ? (
                <>
                  <Check className="w-3.5 h-3.5 text-brand-sand" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar IBAN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Module */}
      {faqBlock && faqBlock.content?.faqs && (
        <div className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
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
                  className="rounded-xl border border-border-subtle overflow-hidden bg-bg-secondary/20 transition-colors"
                >
                  <button
                    onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                    className="w-full p-4 text-left flex justify-between items-center text-xs font-medium text-text-primary hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <span className="pr-2">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-text-secondary leading-relaxed border-t border-border-subtle/40">
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
