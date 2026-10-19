'use client';

import React, { useState } from 'react';

const WEEKDAYS = [
  { short: 'L', full: 'Lunes' },
  { short: 'M', full: 'Martes' },
  { short: 'X', full: 'Miércoles' },
  { short: 'J', full: 'Jueves' },
  { short: 'V', full: 'Viernes' },
  { short: 'S', full: 'Sábado' },
  { short: 'D', full: 'Domingo' },
];

// August 2027 starts on Sunday (index 6 in Monday-first week) and has 31 days.
// Aug 28, 2027 is Saturday.
const LEADING_EMPTY_DAYS = 6;
const TOTAL_DAYS_IN_AUGUST = 31;
const WEDDING_DAY = 28;

export function AugustCalendar() {
  const [isDaySelected, setIsDaySelected] = useState(false);

  const days = Array.from({ length: TOTAL_DAYS_IN_AUGUST }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: LEADING_EMPTY_DAYS }, (_, i) => i);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-[#FAF8F5] border border-[#D9CCBA]/80 px-6 py-8 sm:px-10 sm:py-10 shadow-editorial">
        {/* Decorative Corner Hairlines */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 bottom-2.5 border border-[#E6DDCF]/60"
        />

        {/* Editorial Calendar Header */}
        <div className="relative z-10 text-center pb-6 mb-6 border-b border-[#E6DDCF]">
          <p className="text-[10px] uppercase tracking-[0.38em] text-[#7E7971] font-sans mb-1.5">
            Calendario
          </p>
          <h3 className="font-serif text-2xl sm:text-3xl tracking-[0.22em] uppercase text-[#1C1B19] font-normal">
            Agosto 2027
          </h3>
        </div>

        {/* Days of Week Header */}
        <div
          role="row"
          className="relative z-10 grid grid-cols-7 gap-1 text-center mb-3"
        >
          {WEEKDAYS.map((day) => (
            <div
              key={day.short}
              role="columnheader"
              aria-label={day.full}
              className="text-[10px] uppercase tracking-[0.2em] text-[#7E7971] font-sans font-medium py-1.5"
            >
              {day.short}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div
          role="grid"
          aria-label="Calendario de Agosto 2027"
          className="relative z-10 grid grid-cols-7 gap-y-2 gap-x-1 text-center items-center"
        >
          {leadingBlanks.map((blank) => (
            <div key={`blank-${blank}`} aria-hidden="true" className="h-10 sm:h-11" />
          ))}

          {days.map((day) => {
            const isWeddingDay = day === WEDDING_DAY;

            if (!isWeddingDay) {
              return (
                <div
                  key={day}
                  role="gridcell"
                  className="h-10 sm:h-11 flex items-center justify-center font-serif text-base sm:text-lg text-[#4D4943]/80 select-none"
                >
                  {day}
                </div>
              );
            }

            return (
              <div
                key={day}
                role="gridcell"
                className="h-10 sm:h-11 flex items-center justify-center relative"
              >
                <button
                  type="button"
                  onClick={() => setIsDaySelected((prev) => !prev)}
                  aria-pressed={isDaySelected}
                  aria-label="28 de agosto de 2027 — Nuestro día, boda de Rodrigo y Stephanie"
                  className={`group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-serif text-lg sm:text-xl transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1B19] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] ${
                    isDaySelected
                      ? 'bg-[#68715C] text-[#FAF8F5] scale-105 shadow-md'
                      : 'bg-[#1C1B19] text-[#FAF8F5] hover:bg-[#44433F] hover:scale-105'
                  }`}
                >
                  {/* Subtle Outer Editorial Ring */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -inset-1 rounded-full border transition-all duration-500 ${
                      isDaySelected
                        ? 'border-[#68715C] scale-105 opacity-100'
                        : 'border-[#1C1B19]/40 group-hover:scale-105 opacity-80'
                    }`}
                  />
                  <span className="relative z-10 font-medium tracking-wider">{day}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Reveal Panel for Day 28 */}
        <div className="relative z-10 mt-6 pt-5 border-t border-[#E6DDCF] text-center">
          {!isDaySelected ? (
            <button
              type="button"
              onClick={() => setIsDaySelected(true)}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#7E7971] hover:text-[#1C1B19] transition-colors duration-300 py-1 focus-visible:outline-none focus-visible:underline"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#68715C]" />
              <span>Selecciona el día 28</span>
            </button>
          ) : (
            <div
              role="status"
              aria-live="polite"
              className="animate-fade-in py-1 space-y-1.5"
            >
              <p className="font-serif italic text-xl sm:text-2xl text-[#68715C]">
                Nuestro día
              </p>
              <p className="font-serif text-lg sm:text-xl tracking-[0.12em] uppercase text-[#1C1B19]">
                28 de agosto de 2027
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#7E7971] font-sans pt-0.5">
                Villamuriel de Cerrato · Palencia
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
