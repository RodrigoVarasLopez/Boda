'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSaveTheDateConfig } from '@/lib/save-the-date-store';

interface SaveTheDateHeroProps {
  onDiscoverClick?: () => void;
}

export function SaveTheDateHero({ onDiscoverClick }: SaveTheDateHeroProps) {
  const { config } = useSaveTheDateConfig();
  const [isLoaded, setIsLoaded] = useState(false);

  const heroMobile = config.images?.hero_mobile || '/save-the-date/hero-mobile.jpg';
  const heroDesktop = config.images?.hero_desktop || '/save-the-date/hero-desktop.jpg';
  const [name1, name2] = (config.couple_names || 'Rodrigo & Stephanie').split('&').map((s) => s.trim());

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsLoaded(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleDiscover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onDiscoverClick) {
      onDiscoverClick();
      return;
    }
    const target = document.getElementById('nuestra-historia');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      aria-label="Save the Date — Rodrigo y Stephanie"
      className="relative w-full min-h-[100svh] flex flex-col justify-between overflow-hidden bg-[#1C1B19] text-[#FAF8F5] select-none"
    >
      {/* Background Photography — Mobile vs Desktop Art Direction */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Mobile & Portrait Tablet Photograph */}
        <div className="block lg:hidden relative w-full h-full">
          <Image
            src={heroMobile}
            alt={`${config.couple_names} en cubierta durante su compromiso al atardecer`}
            fill
            priority
            sizes="100vw"
            quality={88}
            className={`object-cover object-[50%_32%] transition-transform duration-[2800ms] ease-out will-change-transform ${
              isLoaded ? 'scale-100' : 'scale-[1.06]'
            }`}
          />
        </div>

        {/* Desktop & Wide Viewport Photograph */}
        <div className="hidden lg:block relative w-full h-full">
          <Image
            src={heroDesktop}
            alt={`${config.couple_names} al atardecer frente al mar`}
            fill
            priority
            sizes="100vw"
            quality={90}
            className={`object-cover object-[50%_38%] transition-transform duration-[3200ms] ease-out will-change-transform ${
              isLoaded ? 'scale-100' : 'scale-[1.05]'
            }`}
          />
        </div>

        {/* Subtle Cinematic Multi-Stop Overlay for Legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(24, 22, 19, 0.38) 0%, rgba(24, 22, 19, 0.10) 32%, rgba(24, 22, 19, 0.22) 56%, rgba(20, 18, 15, 0.78) 86%, rgba(18, 16, 14, 0.92) 100%)',
          }}
        />
        {/* Subtle Warm Film Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-transparent to-black/30" />
      </div>

      {/* Top Editorial Header Bar */}
      <header
        className={`relative z-10 w-full px-6 sm:px-10 lg:px-16 pt-7 sm:pt-9 flex items-center justify-between transition-all duration-1000 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.38em] text-[#FAF8F5]/85 font-sans font-light">
          Save the Date
        </span>
        <span
          aria-hidden="true"
          className="hidden sm:inline-block h-[1px] flex-1 max-w-[120px] mx-6 bg-[#FAF8F5]/25"
        />
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#FAF8F5]/85 font-sans font-light">
          {config.wedding_date_display || '28 · 08 · 2027'}
        </span>
      </header>

      {/* Spacer so the couple's faces stay completely clear in the upper-middle frame */}
      <div className="relative z-10 flex-1 min-h-[28vh] sm:min-h-[32vh]" />

      {/* Progressive Editorial Typography Block */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 pb-9 sm:pb-12 lg:pb-14 flex flex-col items-center text-center">
        {/* Step 1: SAVE THE DATE */}
        <p
          className={`text-[11px] sm:text-xs uppercase tracking-[0.42em] text-[#E6DDCF] font-sans font-normal mb-4 sm:mb-5 transition-all duration-1000 delay-150 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Save the Date
        </p>

        {/* Step 2: RODRIGO & STEPHANIE */}
        <h1
          className={`font-serif font-normal text-[#FAF8F5] uppercase tracking-[0.14em] sm:tracking-[0.18em] leading-[1.02] transition-all duration-1000 delay-300 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <span className="block text-[2.5rem] xs:text-[2.85rem] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            {name1 || 'Rodrigo'}
          </span>
          <span className="block font-serif italic font-light text-2xl sm:text-3xl md:text-4xl text-[#E6DDCF] my-1 sm:my-1.5 tracking-normal">
            &amp;
          </span>
          <span className="block text-[2.5rem] xs:text-[2.85rem] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            {name2 || 'Stephanie'}
          </span>
        </h1>

        {/* Hairline Divider */}
        <div
          aria-hidden="true"
          className={`w-12 h-[1px] bg-[#E6DDCF]/45 my-5 sm:my-6 transition-all duration-1000 delay-500 ease-out ${
            isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        />

        {/* Step 3: 28 · 08 · 2027 */}
        <p
          className={`font-serif text-xl sm:text-2xl md:text-[1.65rem] tracking-[0.28em] text-[#FAF8F5] font-light transition-all duration-1000 delay-[650ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {config.wedding_date_display || '28 · 08 · 2027'}
        </p>

        {/* Step 4: VILLAMURIEL DE CERRATO · PALENCIA */}
        <p
          className={`mt-2 sm:mt-2.5 text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#E6DDCF]/90 font-sans font-light transition-all duration-1000 delay-[800ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {config.wedding_location || 'Villamuriel de Cerrato · Palencia'}
        </p>

        {/* Step 5: CTA DESCUBRIR → */}
        <div
          className={`mt-7 sm:mt-9 transition-all duration-1000 delay-[1000ms] ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <a
            href="#nuestra-historia"
            onClick={handleDiscover}
            aria-label="Descubrir nuestra historia y guardar la fecha"
            className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-[#FAF8F5]/35 bg-[#1C1B19]/35 backdrop-blur-md text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#FAF8F5] hover:bg-[#FAF8F5] hover:text-[#1C1B19] hover:border-[#FAF8F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1B19] transition-all duration-500 min-h-[48px]"
          >
            <span>Descubrir</span>
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-500 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
