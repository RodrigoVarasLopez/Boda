'use client';

import React, { useEffect, useState } from 'react';

export function ShareButton() {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const copyToClipboard = async (url: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3200);
    } catch {
      // Ignore clipboard errors silently
    }
  };

  const handleShare = async () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/save-the-date`
        : 'https://stephanieyrodrigo.com/save-the-date';

    const shareData = {
      title: 'Rodrigo & Stephanie — Save the Date',
      text: 'Rodrigo & Stephanie se casan el 28 de agosto de 2027 en Villamuriel de Cerrato, Palencia. Guarda la fecha.',
      url: shareUrl,
    };

    if (canNativeShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // If user cancelled native share sheet, don't force clipboard copy; otherwise fallback
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    await copyToClipboard(shareUrl);
  };

  return (
    <div className="inline-flex flex-col items-center">
      <button
        type="button"
        onClick={handleShare}
        aria-label={
          copied
            ? 'Enlace copiado al portapapeles'
            : canNativeShare
            ? 'Compartir Save the Date'
            : 'Copiar enlace del Save the Date'
        }
        className="w-full sm:w-auto min-w-[240px] min-h-[50px] px-8 py-3.5 border border-[#FAF8F5]/35 bg-transparent text-[#FAF8F5] hover:bg-[#FAF8F5]/10 hover:border-[#FAF8F5] transition-all duration-400 text-[11px] uppercase tracking-[0.32em] font-sans flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF8F5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1B19]"
      >
        {copied ? (
          <>
            <span>Enlace copiado</span>
            <span aria-hidden="true">✓</span>
          </>
        ) : (
          <span>{canNativeShare ? 'Compartir' : 'Copiar enlace'}</span>
        )}
      </button>

      {/* Secondary discreet copy fallback when native share is primary */}
      {canNativeShare && !copied && (
        <button
          type="button"
          onClick={() => {
            const shareUrl =
              typeof window !== 'undefined'
                ? `${window.location.origin}/save-the-date`
                : 'https://stephanieyrodrigo.com/save-the-date';
            copyToClipboard(shareUrl);
          }}
          className="mt-3 text-[10px] uppercase tracking-[0.28em] text-[#E6DDCF]/70 hover:text-[#FAF8F5] transition-colors duration-300 py-1 focus-visible:outline-none focus-visible:underline"
        >
          Copiar enlace
        </button>
      )}
    </div>
  );
}
