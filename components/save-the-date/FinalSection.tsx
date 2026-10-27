'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ShareButton } from './ShareButton';
import { useSaveTheDateConfig } from '@/lib/save-the-date-store';

function downloadAllDayIcs() {
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rodrigo & Stephanie//Save the Date//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:boda-rodrigo-stephanie-20270828@stephanieyrodrigo.com',
    'DTSTAMP:20261019T120000Z',
    'DTSTART;VALUE=DATE:20270828',
    'DTEND;VALUE=DATE:20270829',
    'SUMMARY:Boda de Rodrigo & Stephanie',
    'DESCRIPTION:Rodrigo & Stephanie se casan el 28 de agosto de 2027 en Villamuriel de Cerrato\\, Palencia. Guarda la fecha.',
    'LOCATION:Villamuriel de Cerrato\\, Palencia\\, España',
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'boda-rodrigo-y-stephanie-28-08-2027.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const GOOGLE_CALENDAR_ALL_DAY_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=' +
  encodeURIComponent('Boda de Rodrigo & Stephanie') +
  '&dates=20270828/20270829' +
  '&details=' +
  encodeURIComponent(
    'Rodrigo & Stephanie se casan el 28 de agosto de 2027 en Villamuriel de Cerrato, Palencia. Guarda la fecha.'
  ) +
  '&location=' +
  encodeURIComponent('Villamuriel de Cerrato, Palencia, España');

export function FinalSection() {
  const { config } = useSaveTheDateConfig();
  const finalPortrait = config.images?.final_portrait || '/save-the-date/final-portrait.jpg';
  const finalWide = config.images?.final_wide || '/save-the-date/final-wide.jpg';
  const [name1, name2] = (config.couple_names || 'Rodrigo & Stephanie').split('&').map((s) => s.trim());

  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

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

  const handleAddToCalendar = () => {
    downloadAllDayIcs();
    setCalendarAdded(true);
  };

  return (
    <section
      id="guardar-fecha"
      ref={sectionRef}
      aria-label="Nos casamos — Rodrigo y Stephanie"
      className="relative w-full bg-[#1C1B19] text-[#FAF8F5] py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      {/* Top Editorial Index */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mb-14 sm:mb-20 flex items-center justify-between border-b border-[#FAF8F5]/15 pb-5">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#E6DDCF]/70 font-sans">
          04 · Guarda la Fecha
        </span>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-[#E6DDCF]/70 font-sans">
          28 · 08 · 2027
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center transition-all duration-1000 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Featured Couple Photography */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#292825] shadow-2xl">
              <Image
                src={finalPortrait}
                alt={`Retrato de ${config.couple_names}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover object-[50%_24%] transition-transform duration-[2600ms] ease-out ${
                  visible ? 'scale-100' : 'scale-[1.05]'
                }`}
              />
            </div>

            {/* Secondary Cinematic Wide Frame on Desktop */}
            <div className="hidden sm:block relative aspect-[16/10] w-full overflow-hidden bg-[#292825] shadow-xl">
              <Image
                src={finalWide}
                alt={`${config.couple_names} celebrando`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-cover object-[50%_38%] transition-transform duration-[2800ms] delay-200 ease-out ${
                  visible ? 'scale-100' : 'scale-[1.04]'
                }`}
              />
            </div>
          </div>

          {/* Final Editorial Copy & Actions */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* NOS CASAMOS. */}
            <p className="text-xs sm:text-sm uppercase tracking-[0.42em] text-[#E6DDCF] font-sans mb-5 sm:mb-6">
              Nos casamos.
            </p>

            {/* RODRIGO & STEPHANIE */}
            <h2 className="font-serif uppercase font-normal text-4xl xs:text-5xl sm:text-6xl lg:text-[4.25rem] tracking-[0.14em] text-[#FAF8F5] leading-[1.06]">
              <span className="block">{name1 || 'Rodrigo'}</span>
              <span className="block font-serif italic font-light text-2xl sm:text-3xl text-[#E6DDCF] my-1.5 tracking-normal">
                &amp;
              </span>
              <span className="block">{name2 || 'Stephanie'}</span>
            </h2>

            {/* Hairline */}
            <div
              aria-hidden="true"
              className="w-14 h-[1px] bg-[#E6DDCF]/35 my-7 sm:my-9"
            />

            {/* 28 · 08 · 2027 */}
            <p className="font-serif text-2xl sm:text-3xl tracking-[0.28em] text-[#FAF8F5] font-light">
              {config.wedding_date_display || '28 · 08 · 2027'}
            </p>

            {/* VILLAMURIEL DE CERRATO · PALENCIA */}
            <p className="mt-2.5 text-xs sm:text-sm uppercase tracking-[0.32em] text-[#E6DDCF]/85 font-sans font-light">
              {config.wedding_location || 'Villamuriel de Cerrato · Palencia'}
            </p>

            {/* Narrative Closing */}
            <div className="mt-8 sm:mt-10 space-y-2 max-w-md">
              <p className="font-serif italic text-2xl sm:text-3xl text-[#FAF8F5]">
                Guarda la fecha.
              </p>
              <p className="font-serif text-lg sm:text-xl text-[#E6DDCF]/85 font-light leading-relaxed">
                Estamos deseando celebrarlo contigo.
              </p>
            </div>

            {/* Action Buttons: + AÑADIR AL CALENDARIO & COMPARTIR */}
            <div className="mt-10 sm:mt-12 w-full max-w-sm sm:max-w-none flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-4">
              <button
                type="button"
                onClick={handleAddToCalendar}
                className="min-h-[52px] px-8 py-4 bg-[#FAF8F5] text-[#1C1B19] hover:bg-[#EFE8DB] transition-all duration-300 text-[11px] uppercase tracking-[0.3em] font-sans font-medium flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1B19]"
              >
                <span aria-hidden="true" className="text-sm leading-none">
                  ＋
                </span>
                <span>Añadir al calendario</span>
              </button>

              <ShareButton />
            </div>

            {/* Optional Calendar Links when clicked (Google Calendar + .ics confirmation) */}
            {calendarAdded && (
              <div
                role="status"
                aria-live="polite"
                className="mt-5 p-4 border border-[#FAF8F5]/20 bg-[#FAF8F5]/5 text-left w-full max-w-md animate-fade-in"
              >
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#E6DDCF] mb-2">
                  Evento de día completo · 28/08/2027
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#FAF8F5]/90">
                  <a
                    href={GOOGLE_CALENDAR_ALL_DAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-[#E6DDCF] transition-colors py-1"
                  >
                    Abrir en Google Calendar ↗
                  </a>
                  <button
                    type="button"
                    onClick={downloadAllDayIcs}
                    className="underline underline-offset-4 hover:text-[#E6DDCF] transition-colors py-1"
                  >
                    Descargar archivo .ICS (Apple / Outlook)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimalist Colophon Footer */}
        <footer className="mt-24 sm:mt-32 pt-8 border-t border-[#FAF8F5]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="font-serif text-sm tracking-[0.28em] uppercase text-[#E6DDCF]/80">
            {config.couple_names || 'Rodrigo & Stephanie'}
          </p>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#E6DDCF]/60 font-sans">
            {config.wedding_date_display || '28 · 08 · 2027'} · {config.wedding_location || 'Villamuriel de Cerrato, Palencia'}
          </p>
        </footer>
      </div>
    </section>
  );
}
