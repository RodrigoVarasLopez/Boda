'use client';

import React from 'react';
import { Check, Shield, Download, FileText, ExternalLink, Printer } from 'lucide-react';

interface ContractConfirmationCardProps {
  signatureImageBase64: string;
  missingSignaturesCount: number;
  contractCode?: string;
  onDownload: () => void;
  onViewDocument?: () => void;
  onViewCertificate?: () => void;
}

export function ContractConfirmationCard({
  signatureImageBase64,
  missingSignaturesCount,
  contractCode,
  onDownload,
  onViewDocument,
  onViewCertificate,
}: ContractConfirmationCardProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl border border-gray-100 dark:border-zinc-800 p-8 sm:p-10 text-center animate-scale-in">
      {/* Green circular checkmark (matching user screenshot) */}
      <div className="w-16 h-16 rounded-full bg-[#D7F5E4] dark:bg-emerald-950/60 text-[#12A150] dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-8 h-8 stroke-[3]" />
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-50 mt-5 mb-2">
        Contrato firmado con éxito
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
        Tu firma ha sido registrada correctamente con validez legal completa.
      </p>

      {/* Missing signatures warning (matching user screenshot) */}
      {missingSignaturesCount > 0 ? (
        <p className="text-xs font-semibold text-[#D97706] dark:text-amber-400 mt-2.5">
          Falta {missingSignaturesCount} firma{missingSignaturesCount > 1 ? 's' : ''} para completar el contrato.
        </p>
      ) : (
        <p className="text-xs font-semibold text-[#12A150] dark:text-emerald-400 mt-2.5">
          ¡Todas las firmas han sido completadas con éxito!
        </p>
      )}

      {/* Signature Preview Card (matching user screenshot) */}
      <div className="p-4 rounded-2xl bg-[#F9F9F9] dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 mt-6 text-left">
        <span className="text-xs text-gray-400 dark:text-zinc-400 font-medium block mb-2">
          Tu firma:
        </span>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-gray-200/70 dark:border-zinc-700/80 flex items-center justify-center min-h-[85px]">
          {signatureImageBase64 ? (
            <img
              src={signatureImageBase64}
              alt="Tu firma"
              className="max-h-16 object-contain filter dark:invert"
            />
          ) : (
            <span className="text-xs text-gray-400 italic">Firma estampada</span>
          )}
        </div>
      </div>

      {/* Legal Guarantee Banner (matching user screenshot) */}
      <div className="p-4 rounded-2xl bg-[#EFFDF5] dark:bg-emerald-950/30 border border-[#BFF1D4] dark:border-emerald-800/40 mt-4 text-left flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#12A150] dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <strong className="font-semibold block text-[#0D6836] dark:text-emerald-300">
            Validez legal garantizada
          </strong>
          <p className="text-[11px] text-[#137A40] dark:text-emerald-400/90 leading-relaxed">
            Firma electrónica simple conforme al Reglamento eIDAS (UE) 910/2014 y la Ley 6/2020 de servicios electrónicos de confianza.
          </p>
        </div>
      </div>

      {/* Terracotta Download Button (matching user screenshot) */}
      <button
        type="button"
        onClick={onDownload}
        className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-[#C4704F] hover:bg-[#B36242] active:bg-[#A25537] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4 stroke-[2.2]" />
        <span>Descargar contrato firmado</span>
      </button>

      {/* Secondary Helper Actions */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs">
        {onViewDocument && (
          <button
            type="button"
            onClick={onViewDocument}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver documento</span>
          </button>
        )}
        {onViewCertificate && (
          <button
            type="button"
            onClick={onViewCertificate}
            className="text-emerald-700 dark:text-emerald-400 hover:underline transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Certificado eIDAS</span>
          </button>
        )}
      </div>
    </div>
  );
}
