'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, X } from 'lucide-react';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureBase64: string) => void;
  signerName?: string;
}

export function SignatureCanvasModal({
  isOpen,
  onClose,
  onConfirm,
  signerName,
}: SignatureCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isEmptyError, setIsEmptyError] = useState(false);

  // Initialize and scale canvas for high DPI displays
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual render resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1e293b'; // High-contrast ink color
  }, []);

  useEffect(() => {
    if (isOpen) {
      setHasDrawn(false);
      setIsEmptyError(false);
      // Small timeout to allow the modal element to paint its dimensions
      const timer = setTimeout(() => {
        setupCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setupCanvas]);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer to handle drawing smoothly even if pointer moves slightly outside
    canvas.setPointerCapture(e.pointerId);

    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setIsEmptyError(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    setIsEmptyError(false);
  };

  const handleConfirm = () => {
    if (!hasDrawn) {
      setIsEmptyError(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export signature as PNG Data URL
    const dataUrl = canvas.toDataURL('image/png');
    onConfirm(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-lg overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-zinc-50">
                Dibuja tu firma
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Usa el dedo o el ratón para firmar en el área de abajo
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="px-6 pb-2">
          <div className="relative w-full h-56 rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 overflow-hidden shadow-inner flex flex-col justify-between p-2">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Subtle baseline guide in lower third */}
            <div className="absolute left-6 right-6 bottom-12 border-b border-gray-200 dark:border-zinc-800 pointer-events-none" />
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-2">
            Firma sobre la línea punteada
          </p>

          {isEmptyError && (
            <p className="text-center text-xs font-medium text-rose-500 mt-1">
              Por favor, dibuja tu firma antes de confirmar.
            </p>
          )}

          {signerName && (
            <div className="mt-3 text-center">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider block">
                Firmante reconocido:
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                {signerName}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          {/* Left: Borrar */}
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 py-2 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Eraser className="w-4 h-4 text-gray-400" />
            <span>Borrar</span>
          </button>

          {/* Right: Cancelar + Confirmar */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-gray-600 dark:text-zinc-300 hover:text-gray-900 py-2 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 bg-[#5ce5a3] hover:bg-[#4dd492] active:bg-[#3ec482] text-white font-medium text-sm py-2.5 px-6 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
