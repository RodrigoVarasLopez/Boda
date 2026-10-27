'use client';

import React, { useEffect, useState } from 'react';
import { useSaveTheDateConfig } from '@/lib/save-the-date-store';

interface ShareButtonProps {
  customMessage?: string;
  shareUrl?: string;
}

export function ShareButton({ customMessage, shareUrl }: ShareButtonProps) {
  const { config } = useSaveTheDateConfig();
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  const getResolvedUrl = () => {
    if (shareUrl) return shareUrl;
    return typeof window !== 'undefined'
      ? `${window.location.origin}/save-the-date`
      : 'https://stephanieyrodrigo.com/save-the-date';
  };

  const getWhatsAppText = () => {
    const url = getResolvedUrl();
    const baseMessage = customMessage || config.whatsapp_message;
    if (baseMessage.includes('http://') || baseMessage.includes('https://')) {
      return baseMessage;
    }
    return `${baseMessage}\n\n${url}`;
  };

  const copyToClipboard = async (text: string, type: 'whatsapp' | 'link') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      if (type === 'whatsapp') {
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 3500);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3200);
      }
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleCopyWhatsApp = async () => {
    const text = getWhatsAppText();
    await copyToClipboard(text, 'whatsapp');
  };

  const handleOpenWhatsApp = () => {
    const text = getWhatsAppText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyLink = async () => {
    const url = getResolvedUrl();
    await copyToClipboard(url, 'link');
  };

  const handleNativeShare = async () => {
    const url = getResolvedUrl();
    const text = getWhatsAppText();
    const shareData = {
      title: `${config.couple_names} — Save the Date`,
      text: text,
      url: url,
    };

    if (canNativeShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
      }
    }

    await handleCopyWhatsApp();
  };

  return (
    <div className="flex flex-col items-center sm:items-start lg:items-center xl:items-start gap-3 w-full">
      {/* Botones Principales de WhatsApp */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        {/* Botón Principal: Copiar Texto Prediseñado para WhatsApp */}
        <button
          type="button"
          onClick={handleCopyWhatsApp}
          aria-label={
            copiedWhatsApp
              ? 'Texto para WhatsApp copiado al portapapeles'
              : 'Copiar texto predefinido para WhatsApp'
          }
          className={`min-h-[52px] px-6 py-3.5 border transition-all duration-300 text-[11px] uppercase tracking-[0.26em] font-sans flex items-center justify-center gap-2.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] cursor-pointer ${
            copiedWhatsApp
              ? 'bg-[#25D366]/25 border-[#25D366] text-[#25D366]'
              : 'bg-[#25D366]/15 hover:bg-[#25D366]/25 border-[#25D366]/40 text-[#FAF8F5]'
          }`}
        >
          {/* WhatsApp SVG Icon */}
          <svg
            className={`w-4 h-4 fill-current ${copiedWhatsApp ? 'text-[#25D366]' : 'text-[#25D366]'}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          {copiedWhatsApp ? (
            <span className="font-semibold text-emerald-400">¡Texto copiado para WhatsApp!</span>
          ) : (
            <span>Copiar para WhatsApp</span>
          )}
        </button>

        {/* Abrir WhatsApp Directamente */}
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          aria-label="Abrir WhatsApp con el texto predefinido listo para enviar"
          className="min-h-[52px] px-5 py-3.5 border border-[#FAF8F5]/30 bg-transparent text-[#FAF8F5] hover:bg-[#FAF8F5]/10 hover:border-[#FAF8F5] transition-all duration-300 text-[11px] uppercase tracking-[0.24em] font-sans flex items-center justify-center gap-2 cursor-pointer"
          title="Abrir WhatsApp directamente"
        >
          <span>Abrir WhatsApp ↗</span>
        </button>
      </div>

      {/* Acciones Secundarias: Copiar sólo enlace o Compartir Nativo */}
      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.26em] text-[#E6DDCF]/75 pt-1">
        <button
          type="button"
          onClick={handleCopyLink}
          className="hover:text-[#FAF8F5] transition-colors duration-200 py-1 underline underline-offset-4 cursor-pointer"
        >
          {copiedLink ? '✓ Enlace copiado' : 'Copiar sólo enlace'}
        </button>

        {canNativeShare && (
          <>
            <span className="text-[#FAF8F5]/20">·</span>
            <button
              type="button"
              onClick={handleNativeShare}
              className="hover:text-[#FAF8F5] transition-colors duration-200 py-1 underline underline-offset-4 cursor-pointer"
            >
              Más opciones de compartir
            </button>
          </>
        )}
      </div>
    </div>
  );
}
