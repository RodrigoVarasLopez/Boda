'use client';

import React, { useEffect, useRef, useState } from 'react';

export function AmbientAudioButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {
        // Ignore close errors
      }
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const playWarmChordSequence = () => {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Warm cinematic chord voicings (Fmaj7 -> Cmaj7/E -> Dm9 -> Am7)
    const chords = [
      [174.61, 261.63, 329.63, 440.0],
      [164.81, 261.63, 329.63, 392.0],
      [146.83, 220.0, 261.63, 329.63],
      [220.0, 261.63, 329.63, 392.0],
    ];
    let step = 0;

    const triggerChord = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
      const now = ctx.currentTime;
      const freqs = chords[step % chords.length];
      step += 1;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(620, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.018 / (idx + 1), now + 1.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4.5);
      });
    };

    triggerChord();
    intervalRef.current = setInterval(triggerChord, 4200);
    setIsPlaying(true);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playWarmChordSequence();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleAudio}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Pausar música ambiental' : 'Activar música ambiental'}
      title={isPlaying ? 'Pausar sonido' : 'Activar sonido ambiental'}
      className="fixed bottom-5 right-5 z-40 w-10 h-10 rounded-full border border-[#D9CCBA]/60 bg-[#1C1B19]/70 backdrop-blur-md text-[#FAF8F5] flex items-center justify-center shadow-soft hover:bg-[#1C1B19] hover:border-[#FAF8F5]/60 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5]"
    >
      {isPlaying ? (
        <span className="flex items-end gap-[2.5px] h-3" aria-hidden="true">
          <span className="w-[1.5px] h-3 bg-[#E6DDCF] animate-pulse" />
          <span className="w-[1.5px] h-2 bg-[#E6DDCF] animate-pulse [animation-delay:200ms]" />
          <span className="w-[1.5px] h-3 bg-[#E6DDCF] animate-pulse [animation-delay:400ms]" />
        </span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
          className="w-4 h-4 text-[#E6DDCF]/85"
        >
          <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </button>
  );
}
