'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AugustCalendar } from './AugustCalendar';
import { Countdown } from './Countdown';
import { useSaveTheDateConfig } from '@/lib/save-the-date-store';

export function DateSection() {
  const { config } = useSaveTheDateConfig();
  const dateHorizon = config.images?.date_horizon || '/save-the-date/date-horizon.jpg';
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="la-fecha"
      ref={sectionRef}
      aria-label="La Fecha — 28 de Agosto de 2027"
      className="relative w-full bg-[#EFE8DB] text-[#1C1B19] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-[#D9CCBA]/60"
    >
      {/* Subtle Top Editorial Index */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mb-14 sm:mb-20 flex items-center justify-between border-b border-[#D9CCBA] pb-5">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#7E7971] font-sans">
          02 · La Fecha
        </span>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#7E7971] font-sans">
          28 · 08 · 2027
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Monumental Date Composition + Interactive Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-center">
          {/* Monumental Typographic Block */}
          <div
            className={`lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-1000 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.42em] text-[#68715C] font-sans mb-4 sm:mb-6">
              Reserva el día
            </p>

            {/* Giant 28 / AGOSTO / 2027 */}
            <div className="flex flex-col items-center lg:items-start">
              <span className="font-serif font-light text-[6.5rem] xs:text-[7.5rem] sm:text-[9rem] lg:text-[10.5rem] leading-[0.86] tracking-[-0.03em] text-[#1C1B19] select-none">
                28
              </span>
              <span className="font-serif uppercase text-4xl xs:text-5xl sm:text-6xl lg:text-[4.25rem] tracking-[0.22em] text-[#1C1B19] font-normal mt-2 sm:mt-3">
                Agosto
              </span>
              <span className="font-serif font-light text-3xl xs:text-4xl sm:text-5xl tracking-[0.34em] text-[#4D4943] mt-1.5 sm:mt-2">
                2027
              </span>
            </div>

            {/* Hairline Divider */}
            <div
              aria-hidden="true"
              className="w-16 h-[1px] bg-[#A99B8A] my-8 sm:my-10"
            />

            {/* Location Subtitle */}
            <div className="space-y-1.5">
              <p className="font-serif text-xl sm:text-2xl uppercase tracking-[0.22em] text-[#1C1B19]">
                Villamuriel de Cerrato
              </p>
              <p className="text-xs sm:text-sm uppercase tracking-[0.38em] text-[#7E7971] font-sans">
                Palencia
              </p>
            </div>
          </div>

          {/* Interactive Editorial Calendar */}
          <div
            className={`lg:col-span-6 transition-all duration-1000 delay-200 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <AugustCalendar />
          </div>
        </div>

        {/* Countdown Block */}
        <div
          className={`mt-20 sm:mt-24 lg:mt-28 pt-14 sm:pt-16 border-t border-[#D9CCBA] transition-all duration-1000 delay-300 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Countdown />
        </div>

        {/* Cinematic Horizon Strip Interlude */}
        <div
          className={`mt-20 sm:mt-24 relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-[#D9CCBA] shadow-soft transition-all duration-1000 delay-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Image
            src={dateHorizon}
            alt={`${config.couple_names} contemplando el horizonte juntos`}
            fill
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover object-[50%_46%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B19]/35 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
