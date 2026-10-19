'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

function useRevealOnScroll<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
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
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

export function StorySection() {
  const beat1 = useRevealOnScroll<HTMLDivElement>(0.15);
  const beat2 = useRevealOnScroll<HTMLDivElement>(0.15);
  const beat3 = useRevealOnScroll<HTMLDivElement>(0.15);

  return (
    <section
      id="nuestra-historia"
      aria-label="Nuestra historia"
      className="relative w-full bg-[#FAF8F5] text-[#1C1B19] py-20 sm:py-28 lg:py-36 overflow-hidden"
    >
      {/* Subtle Top Editorial Index */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mb-14 sm:mb-20 lg:mb-24 flex items-center justify-between border-b border-[#E6DDCF] pb-5">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#7E7971] font-sans">
          01 · Nuestra Historia
        </span>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#7E7971] font-sans">
          R &amp; S
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 space-y-24 sm:space-y-32 lg:space-y-40">
        {/* CHAPTER I: "Hay historias que empiezan sin saber hasta dónde van a llegar." */}
        <div
          ref={beat1.ref}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-1000 ease-out ${
            beat1.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Primary Vertical Portrait */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFE8DB] shadow-editorial">
              <Image
                src="/save-the-date/story-1-portrait.jpg"
                alt="Rodrigo mirando a Stephanie con cariño en la proa del barco"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover object-[50%_28%] transition-transform duration-[2200ms] ease-out ${
                  beat1.visible ? 'scale-100' : 'scale-[1.04]'
                }`}
              />
            </div>
          </div>

          {/* Editorial Quote + Secondary Wide Frame on Desktop */}
          <div className="lg:col-span-6 lg:pl-6 flex flex-col justify-between space-y-8 lg:space-y-12">
            <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left py-2 sm:py-4">
              <span
                aria-hidden="true"
                className="inline-block w-8 h-[1px] bg-[#A99B8A] mb-6"
              />
              <p className="font-serif text-[1.75rem] sm:text-4xl lg:text-[2.5rem] leading-[1.22] font-normal text-[#1C1B19] tracking-[-0.01em]">
                Hay historias que empiezan sin saber hasta dónde van a llegar.
              </p>
            </div>

            <div className="relative aspect-[3/2] w-full lg:w-[92%] lg:ml-auto overflow-hidden bg-[#EFE8DB] shadow-soft">
              <Image
                src="/save-the-date/story-1-wide.jpg"
                alt="Rodrigo y Stephanie riendo juntos y mirándose con complicidad"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={`object-cover object-[50%_35%] transition-transform duration-[2400ms] delay-150 ease-out ${
                  beat1.visible ? 'scale-100' : 'scale-[1.04]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* CHAPTER II: "La nuestra nos ha traído hasta aquí." */}
        <div
          ref={beat2.ref}
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-1000 ease-out ${
            beat2.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Left Column on Desktop: Quote + Ring Detail */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-between space-y-8 lg:space-y-12">
            <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left py-2 sm:py-4">
              <span
                aria-hidden="true"
                className="inline-block w-8 h-[1px] bg-[#A99B8A] mb-6"
              />
              <p className="font-serif italic text-[1.85rem] sm:text-4xl lg:text-[2.65rem] leading-[1.2] font-normal text-[#1C1B19]">
                La nuestra nos ha traído hasta aquí.
              </p>
            </div>

            <div className="relative aspect-[4/5] w-4/5 sm:w-3/4 mx-auto lg:mx-0 overflow-hidden bg-[#EFE8DB] shadow-soft">
              <Image
                src="/save-the-date/story-2-detail.jpg"
                alt="Detalle de las manos de Rodrigo y Stephanie con el anillo de compromiso frente al mar"
                fill
                sizes="(max-width: 1024px) 75vw, 35vw"
                className={`object-cover object-center transition-transform duration-[2400ms] delay-150 ease-out ${
                  beat2.visible ? 'scale-100' : 'scale-[1.05]'
                }`}
              />
            </div>
          </div>

          {/* Right Column on Desktop: Primary Romantic Kiss Portrait */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#EFE8DB] shadow-editorial">
              <Image
                src="/save-the-date/story-2-portrait.jpg"
                alt="Rodrigo y Stephanie besándose al atardecer con dos copas de champán"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className={`object-cover object-[50%_32%] transition-transform duration-[2200ms] ease-out ${
                  beat2.visible ? 'scale-100' : 'scale-[1.04]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* CHAPTER III: "Y ahora queremos celebrarlo contigo." */}
        <div
          ref={beat3.ref}
          className={`pt-4 sm:pt-8 transition-all duration-1000 ease-out ${
            beat3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-[#EFE8DB] shadow-editorial">
                <Image
                  src="/save-the-date/story-3-portrait.jpg"
                  alt="Rodrigo y Stephanie brindando con champán durante la hora dorada"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className={`object-cover object-[50%_26%] transition-transform duration-[2200ms] ease-out ${
                    beat3.visible ? 'scale-100' : 'scale-[1.04]'
                  }`}
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:space-y-10 lg:pl-4">
              <div className="hidden lg:block relative aspect-[4/5] w-3/4 overflow-hidden bg-[#EFE8DB] shadow-soft">
                <Image
                  src="/save-the-date/story-3-candid.jpg"
                  alt="Rodrigo y Stephanie sirviendo champán juntos con una sonrisa"
                  fill
                  sizes="30vw"
                  className={`object-cover object-[50%_30%] transition-transform duration-[2400ms] delay-150 ease-out ${
                    beat3.visible ? 'scale-100' : 'scale-[1.04]'
                  }`}
                />
              </div>

              <div className="py-4 sm:py-6">
                <span
                  aria-hidden="true"
                  className="inline-block w-10 h-[1px] bg-[#68715C] mb-6"
                />
                <p className="font-serif text-[2rem] sm:text-4xl lg:text-[2.75rem] leading-[1.18] font-normal text-[#1C1B19]">
                  Y ahora queremos celebrarlo contigo.
                </p>
                <p className="mt-5 text-[11px] uppercase tracking-[0.34em] text-[#7E7971] font-sans">
                  Rodrigo &amp; Stephanie
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
