'use client';

import React, { useEffect, useRef, useState } from 'react';

export function LocationSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ubicacion"
      ref={sectionRef}
      aria-label="Ubicación — Villamuriel de Cerrato, Palencia"
      className="relative w-full bg-[#FAF8F5] text-[#1C1B19] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-[#E6DDCF]"
    >
      {/* Top Editorial Index */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mb-14 sm:mb-20 flex items-center justify-between border-b border-[#E6DDCF] pb-5">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#7E7971] font-sans">
          03 · El Lugar
        </span>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#7E7971] font-sans">
          41° 57&prime; N · 04° 31&prime; O
        </span>
      </div>

      <div
        className={`max-w-4xl mx-auto px-6 sm:px-10 text-center transition-all duration-1000 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Minimalist Architectural / Cartographic Meridian Emblem */}
        <div className="mx-auto mb-8 sm:mb-10 w-16 h-16 flex items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-14 h-14 text-[#68715C]"
          >
            <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 3" />
            <circle cx="32" cy="32" r="16" stroke="#A99B8A" strokeWidth="0.8" />
            <line x1="32" y1="2" x2="32" y2="62" stroke="currentColor" strokeWidth="0.8" />
            <line x1="2" y1="32" x2="62" y2="32" stroke="currentColor" strokeWidth="0.8" />
            <circle cx="32" cy="32" r="2.5" fill="#1C1B19" />
          </svg>
        </div>

        <p className="text-[11px] uppercase tracking-[0.42em] text-[#7E7971] font-sans mb-4">
          Destino de Celebración
        </p>

        {/* Primary Location Heading */}
        <h2 className="font-serif uppercase font-normal text-3xl xs:text-4xl sm:text-5xl lg:text-6xl tracking-[0.14em] sm:tracking-[0.18em] text-[#1C1B19] leading-[1.15]">
          Villamuriel de Cerrato
        </h2>

        <p className="mt-3 sm:mt-4 font-serif uppercase text-xl sm:text-2xl lg:text-3xl tracking-[0.32em] text-[#4D4943] font-light">
          Palencia
        </p>

        {/* Hairline Divider */}
        <div
          aria-hidden="true"
          className="w-12 h-[1px] bg-[#D9CCBA] mx-auto my-7 sm:my-9"
        />

        {/* Date Echo */}
        <p className="font-serif text-lg sm:text-xl tracking-[0.28em] text-[#1C1B19]">
          28 · 08 · 2027
        </p>

        {/* Minimalist Map Actions */}
        <div className="mt-9 sm:mt-11 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            aria-expanded={showMap}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 border border-[#1C1B19]/25 bg-transparent text-[11px] uppercase tracking-[0.28em] text-[#1C1B19] hover:border-[#1C1B19] hover:bg-[#1C1B19] hover:text-[#FAF8F5] transition-all duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1B19] focus-visible:ring-offset-2"
          >
            {showMap ? 'Ocultar mapa' : 'Ver ubicación en mapa'}
          </button>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Villamuriel+de+Cerrato,+Palencia,+Espa%C3%B1a"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-[#D9CCBA] bg-[#EFE8DB]/60 text-[11px] uppercase tracking-[0.28em] text-[#4D4943] hover:text-[#1C1B19] hover:border-[#A99B8A] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1B19] focus-visible:ring-offset-2"
          >
            <span>Abrir en Google Maps</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        {/* Collapsible Real Minimalist Map of Villamuriel de Cerrato, Palencia */}
        {showMap && (
          <div className="mt-8 sm:mt-10 animate-fade-in border border-[#D9CCBA] bg-[#EFE8DB] p-2 sm:p-3 shadow-editorial">
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] overflow-hidden bg-[#E6DDCF]">
              <iframe
                title="Mapa de Villamuriel de Cerrato, Palencia"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-4.565%2C41.925%2C-4.475%2C41.975&layer=mapnik&marker=41.95%2C-4.5167"
                className="w-full h-full border-0 filter grayscale contrast-[0.95] sepia-[0.12] brightness-[0.98]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-2.5 text-[10px] uppercase tracking-[0.28em] text-[#7E7971] font-sans">
              Villamuriel de Cerrato · Provincia de Palencia · España
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
