'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wedding, CMSBlock } from '@/lib/types';
import { Hotel, Bus, Gift, HelpCircle, Copy, Check, ChevronDown, Sparkles, MapPin, Navigation } from 'lucide-react';

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
    <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] bg-bg-secondary text-text-accent border border-border-subtle shadow-xs">
          <Sparkles className="w-3 h-3" />
          <span>Información Práctica</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-text-primary font-normal tracking-tight">
          Guía del Invitado
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
          Todo lo que necesitas saber sobre traslados, alojamiento, enclave y detalles para disfrutar al máximo.
        </p>
      </div>

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Venue & Transportation */}
        <div className="space-y-6">
          {/* Venue Showcase Card */}
          {venueBlock && (
            <div className="rounded-3xl bg-bg-card border border-border-subtle shadow-card overflow-hidden space-y-4">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={venueBlock.content?.image || '/images/bodega/bodega-concejo-banquete-noche.png'}
                  alt={venueBlock.subtitle || 'Bodega Concejo'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 550px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-sand block">El Enclave</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight">{venueBlock.subtitle || 'Bodega Concejo'}</h3>
                </div>
              </div>
              <div className="p-6 pt-2 space-y-4 text-xs text-text-secondary leading-relaxed">
                <p>{venueBlock.content?.description}</p>
                <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                  <span className="text-text-muted flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-brand-olive shrink-0" />
                    <span>{venueBlock.content?.address}</span>
                  </span>
                  <a
                    href={venueBlock.content?.google_maps_url || 'https://maps.google.com/?q=Bodega+Concejo+Valoria+la+Buena'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 rounded-xl bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-brand-olive" />
                    <span>Cómo llegar</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Travel & Accommodation Module */}
          {travelBlock && (
            <div className="p-6 sm:p-7 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
              <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
                <Hotel className="w-4 h-4" />
                <span>Alojamiento &amp; Autobuses de Traslado</span>
              </div>

              <div className="space-y-3 pt-1 text-xs text-text-secondary">
                {travelBlock.content?.hotels?.map((h: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-subtle space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-text-primary block text-sm">{h.name}</span>
                      <span className="text-brand-terracotta text-[11px] font-semibold bg-brand-sand/30 px-2 py-0.5 rounded-full">{h.discount}</span>
                    </div>
                    <span className="text-text-muted block text-[11px]">{h.distance}</span>
                  </div>
                ))}

                {travelBlock.content?.bus_info && (
                  <div className="p-4 rounded-2xl bg-brand-cream/50 border border-brand-sand/60 flex gap-3 items-start">
                    <Bus className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                    <p className="text-text-secondary leading-relaxed text-xs">
                      {travelBlock.content.bus_info}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gift Registry & FAQs */}
        <div className="space-y-6">
          {/* Gift Registry Module (Lista de Bodas) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-cream/60 text-brand-terracotta border border-border-subtle">
              <Gift className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-text-primary">
                Lista de Bodas
              </h3>
              <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
                Vuestra presencia y compañía en este día tan especial es nuestro mayor regalo. Si además deseáis colaborar en nuestra luna de miel y nueva etapa:
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-bg-secondary/60 border border-border-subtle space-y-3 text-left">
              <div className="flex justify-between items-center text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                <span>Titular: {wedding.iban_details?.account_holder || 'Stephanie & Rodrigo'}</span>
                <span>{wedding.iban_details?.bank_name || 'CaixaBank'}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-bg-card border border-border-strong/70">
                <span className="font-mono text-xs sm:text-sm font-semibold text-text-primary tracking-wider break-all">
                  {wedding.iban_details?.iban || 'ES91 2100 0418 4502 0005 1234'}
                </span>
                <button
                  onClick={handleCopyIBAN}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-primary text-primary-text text-xs font-medium hover:bg-primary-hover transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  {copiedIBAN ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-sand" />
                      <span>IBAN Copiado</span>
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
            <div className="p-6 sm:p-8 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-4">
              <div className="flex items-center gap-2 text-text-accent font-semibold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Preguntas Frecuentes</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {faqBlock.content.faqs.map((item: any, index: number) => {
                  const isOpen = openFAQIndex === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-border-subtle overflow-hidden bg-bg-secondary/20 transition-colors"
                    >
                      <button
                        onClick={() => setOpenFAQIndex(isOpen ? null : index)}
                        className="w-full p-4 text-left flex justify-between items-center text-xs font-medium text-text-primary hover:bg-bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <span className="pr-3 font-serif text-sm">{item.question}</span>
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
        </div>
      </div>
    </section>
  );
};
