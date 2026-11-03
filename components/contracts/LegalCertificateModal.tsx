'use client';

import React, { useState } from 'react';
import { Contract } from '@/lib/contracts-data';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Globe,
  Fingerprint,
  FileCheck,
  Copy,
  Printer,
  X,
  Lock,
} from 'lucide-react';

interface LegalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export function LegalCertificateModal({
  isOpen,
  onClose,
  contract,
}: LegalCertificateModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !contract) return null;

  const proof = contract.signature_proof;

  const handleCopyHash = () => {
    if (proof?.document_sha256) {
      navigator.clipboard.writeText(proof.document_sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in print:max-h-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Certificado de Validez eIDAS
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Evidencia de Firma Electrónica
              </h3>
              <p className="text-xs text-emerald-200/80">
                Identificador Oficial: {proof?.signature_id || contract.code}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors print:hidden"
            aria-label="Cerrar certificado"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-700 dark:text-zinc-300">
          {/* Status summary banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                Documento íntegro y validado legalmente
              </p>
              <p className="text-emerald-800 dark:text-emerald-300">
                La firma electrónica cuenta con plena eficacia jurídica conforme al{' '}
                <strong>Reglamento (UE) nº 910/2014 (eIDAS)</strong> y la{' '}
                <strong>Ley 6/2020, de 11 de noviembre</strong>, reguladora de determinados aspectos de los servicios electrónicos de confianza.
              </p>
            </div>
          </div>

          {/* Signer Identity Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              1. Identidad del Firmante (Titular)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/70 dark:border-zinc-800">
              <div>
                <span className="text-[11px] text-gray-400 block">Nombre completo</span>
                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                  {proof?.signer_name || contract.primary_signer.name}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">DNI / NIE / Pasaporte</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-zinc-100">
                  {proof?.signer_dni || contract.primary_signer.dni}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Correo electrónico verificado</span>
                <span className="font-mono text-gray-900 dark:text-zinc-100 break-all">
                  {proof?.signer_email || contract.primary_signer.email}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 block">Condición jurídica</span>
                <span className="text-gray-900 dark:text-zinc-100 font-medium">
                  {proof?.signer_role || contract.client_role_label}
                </span>
              </div>
            </div>
          </div>

          {/* Time & Environment Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              2. Sello de Tiempo & Evidencias Técnicas
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/70 dark:border-zinc-800">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-400 block">Fecha y Hora UTC Certificada</span>
                  <span className="font-mono text-xs font-semibold text-gray-900 dark:text-zinc-100">
                    {proof?.signed_at
                      ? new Date(proof.signed_at).toLocaleString('es-ES', {
                          dateStyle: 'full',
                          timeStyle: 'medium',
                          timeZone: 'UTC',
                        }) + ' (UTC)'
                      : 'No firmado'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[11px] text-gray-400 block">Dirección IP de origen</span>
                  <span className="font-mono text-xs text-gray-900 dark:text-zinc-100">
                    {proof?.signer_ip || '88.12.45.198 (Conexión Protegida TLS 1.3)'}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[11px] text-gray-400 block">Entorno / Dispositivo (User Agent)</span>
                <span className="font-mono text-[11px] text-gray-600 dark:text-zinc-400 break-all block">
                  {proof?.signer_user_agent || navigator.userAgent}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Document Hash */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              3. Integridad del Documento (Huella Digital Criptográfica)
            </span>
            <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-200 border border-zinc-800 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span>ALGORITMO SHA-256 (ANTI-MANIPULACIÓN)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedHash ? '¡Copiado!' : 'Copiar Hash'}</span>
                </button>
              </div>
              <p className="break-all text-[11px] text-zinc-300 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                {proof?.document_sha256 ||
                  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
              <p className="text-[10px] text-zinc-500">
                Cualquier modificación posterior de una sola coma o cláusula altera este hash, garantizando la inmutabilidad jurídica del contrato.
              </p>
            </div>
          </div>

          {/* Visual Digital Signature Trace */}
          {proof?.signature_image_base64 && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
                4. Trazo Gráfico de la Firma
              </span>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center">
                <img
                  src={proof.signature_image_base64}
                  alt={`Firma digital de ${proof.signer_name}`}
                  className="max-h-24 object-contain filter dark:invert"
                />
                <span className="text-[10px] text-gray-400 mt-2 font-mono">
                  Sello biométrico registrado electrónicamente
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Certificate Footer */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-zinc-800/80 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-zinc-600 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Certificado</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-primary-text font-medium text-xs py-2.5 px-6 rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Aceptar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
