'use client';

import React, { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Target date: August 28, 2027 at 00:00:00 CEST (UTC+2, Spain summer time)
const TARGET_TIMESTAMP = new Date('2027-08-28T00:00:00+02:00').getTime();

function calculateTimeLeft(now: number): TimeLeft {
  const diff = Math.max(0, TARGET_TIMESTAMP - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function formatNumber(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft(Date.now()));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const units = [
    { value: mounted ? formatNumber(timeLeft.days) : '—', label: 'Días' },
    { value: mounted ? formatNumber(timeLeft.hours) : '—', label: 'Horas' },
    { value: mounted ? formatNumber(timeLeft.minutes) : '—', label: 'Minutos' },
    { value: mounted ? formatNumber(timeLeft.seconds) : '—', label: 'Segundos' },
  ];

  return (
    <div
      aria-label="Cuenta atrás hasta el 28 de agosto de 2027"
      className="w-full max-w-2xl mx-auto text-center"
    >
      <p className="text-[11px] sm:text-xs uppercase tracking-[0.42em] text-[#7E7971] font-sans mb-6 sm:mb-8">
        Faltan
      </p>

      <div className="grid grid-cols-4 gap-2 sm:gap-6 px-2 sm:px-4">
        {units.map((unit, index) => (
          <div
            key={unit.label}
            className="relative flex flex-col items-center justify-center py-3 sm:py-5"
          >
            {/* Subtle vertical divider between units */}
            {index > 0 && (
              <span
                aria-hidden="true"
                className=" absolute left-0 top-1/2 -translate-y-1/2 h-8 sm:h-12 w-[1px] bg-[#D9CCBA]/70"
              />
            )}
            <span
              suppressHydrationWarning
              className="font-serif font-light text-3xl xs:text-4xl sm:text-5xl md:text-6xl text-[#1C1B19] tracking-[0.04em] tabular-nums leading-none transition-all duration-300"
            >
              {unit.value}
            </span>
            <span className="mt-2.5 sm:mt-3 text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-[0.26em] sm:tracking-[0.32em] text-[#7E7971] font-sans">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
