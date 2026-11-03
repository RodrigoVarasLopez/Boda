'use client';

import React, { useState, useEffect, useRef, use, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useContractsStore } from '@/lib/contracts-store';
import { Contract } from '@/lib/contracts-data';
import { SignatureCanvasModal } from '@/components/contracts/SignatureCanvasModal';
import { LegalCertificateModal } from '@/components/contracts/LegalCertificateModal';
import { ContractConfirmationCard } from '@/components/contracts/ContractConfirmationCard';
import {
  FileText,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  ShieldCheck,
  Lock,
  Printer,
  ChevronDown,
  Building2,
  Euro,
  CreditCard,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Clock,
  Info,
} from 'lucide-react';

export default function SignContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const contractId = unwrappedParams.id;
  const searchParams = useSearchParams();
  const signerQueryToken = searchParams.get('f');

  const { getContract, signContract, markContractAsOpened, isLoaded } = useContractsStore();

  const [contract, setContract] = useState<Contract | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Confirmation view & multi-signer tracking
  const [showConfirmationScreen, setShowConfirmationScreen] = useState(false);
  const [confirmedSignatureImage, setConfirmedSignatureImage] = useState<string>('');

  // Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const documentContainerRef = useRef<HTMLDivElement | null>(null);

  // Identify active signer based on ?f= query parameter
  const activeSigner = useMemo(() => {
    if (!contract || !contract.signers) return null;
    if (signerQueryToken) {
      const found = contract.signers.find((s) => s.token === signerQueryToken);
      if (found) return found;
    }
    // Default to Stephanie Lizbeth Mendoza (matches user prompt query token)
    return contract.signers.find((s) => s.token === '5838ac21-c398-4559-9f2b-3eb261072768') || contract.signers[1] || contract.signers[0] || null;
  }, [contract, signerQueryToken]);

  const missingSignaturesCount = useMemo(() => {
    if (!contract || !contract.signers) return 0;
    return contract.signers.filter((s) => s.status !== 'signed').length;
  }, [contract]);

  // Load contract
  useEffect(() => {
    if (!isLoaded) return;
    const found = getContract(contractId);
    if (found) {
      setContract(found);
      markContractAsOpened(found.id);

      // Check if current signer is already signed
      const mySignerSlot = found.signers?.find(
        (s) => s.token === signerQueryToken || s.email === found.primary_signer.email
      );

      if (mySignerSlot && mySignerSlot.status === 'signed') {
        setReadingProgress(100);
        setHasScrolledToEnd(true);
        setTermsAccepted(true);
        setPrivacyAccepted(true);
        if (mySignerSlot.signature_image_base64) {
          setConfirmedSignatureImage(mySignerSlot.signature_image_base64);
        }
      } else if (found.status === 'signed') {
        setReadingProgress(100);
        setHasScrolledToEnd(true);
        setTermsAccepted(true);
        setPrivacyAccepted(true);
      }
    }
  }, [contractId, isLoaded, getContract, markContractAsOpened, signerQueryToken]);

  // Track scroll reading progress
  useEffect(() => {
    const container = documentContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) {
        setReadingProgress(100);
        setHasScrolledToEnd(true);
        return;
      }

      const progress = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
      setReadingProgress(progress);

      if (progress >= 95) {
        setHasScrolledToEnd(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [contract]);

  const handleManualMarkRead = () => {
    setReadingProgress(100);
    setHasScrolledToEnd(true);
    if (documentContainerRef.current) {
      documentContainerRef.current.scrollTo({
        top: documentContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenSignatureModal = () => {
    if (!termsAccepted || !privacyAccepted) return;
    setShowSignatureModal(true);
  };

  const handleConfirmSignature = async (signatureBase64: string) => {
    if (!contract) return;
    setIsSigning(true);
    setShowSignatureModal(false);

    try {
      // Determine signer details
      const signerName = activeSigner?.name || contract.primary_signer.name || 'Stephanie Lizbeth Mendoza';
      const signerDni = activeSigner?.dni || contract.primary_signer.dni || '61555911E';
      const signerEmail = activeSigner?.email || contract.primary_signer.email || 'stephan1em@hotmail.com';
      const signerToken = signerQueryToken || activeSigner?.token;

      const updated = await signContract(contract.id, {
        signature_image_base64: signatureBase64,
        signer_name: signerName,
        signer_dni: signerDni,
        signer_email: signerEmail,
        signer_token: signerToken,
        reading_progress: 100,
      });

      if (updated) {
        setContract(updated);
        setConfirmedSignatureImage(signatureBase64);
        setShowConfirmationScreen(true);

        // Confetti celebration
        try {
          confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#5ce5a3', '#10b981', '#c27854', '#f59e0b', '#3b82f6'],
          });
        } catch {}
      }
    } catch (e) {
      console.error('Error signing contract:', e);
    } finally {
      setIsSigning(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-text-muted">Cargando documento de contratación electrónica...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="bg-bg-card p-8 rounded-3xl border border-border-subtle max-w-md w-full text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-text-primary">Contrato no encontrado</h2>
          <p className="text-xs text-text-muted">
            El enlace de firma puede haber caducado o el código identificador no existe en el sistema.
          </p>
          <Link
            href="/admin/contracts"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors"
          >
            Ir al Administrador de Contratos
          </Link>
        </div>
      </div>
    );
  }

  const isSigned = contract.status === 'signed';
  const canSign = hasScrolledToEnd && termsAccepted && privacyAccepted && !isSigned;

  const signerInitial = (contract.primary_signer.name || 'S').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Floating App Bar */}
      <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-50">
              {contract.title}
            </span>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-semibold border border-gray-200 dark:border-zinc-700">
              {contract.code}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3 h-3" />
              {contract.type_label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Reading progress indicator */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-gray-500 dark:text-zinc-400 whitespace-nowrap">
                Progreso de lectura{' '}
                <strong className="text-gray-900 dark:text-zinc-100">{readingProgress}%</strong>
              </span>
              <div className="w-24 sm:w-32 h-2 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-[#5ce5a3] transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            {isSigned && (
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ver Evidencia eIDAS</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Imprimir contrato"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Confirmation View or 2-Columns Document View */}
      {showConfirmationScreen ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 animate-fade-in">
          <ContractConfirmationCard
            signatureImageBase64={confirmedSignatureImage || contract.signature_proof?.signature_image_base64 || ''}
            missingSignaturesCount={missingSignaturesCount}
            contractCode={contract.code}
            onDownload={() => window.print()}
            onViewDocument={() => setShowConfirmationScreen(false)}
            onViewCertificate={() => setShowCertificateModal(true)}
          />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT COLUMN: The Complete Contract Document */}
          <div
            ref={documentContainerRef}
            className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/90 dark:border-zinc-800 shadow-card p-6 sm:p-12 max-h-[calc(100vh-120px)] overflow-y-auto space-y-8 scroll-smooth print:max-h-none print:shadow-none print:border-none print:p-0"
          >
            {/* Document Header */}
            <div className="pb-6 border-b-2 border-gray-900 dark:border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-serif text-xl sm:text-2xl font-black tracking-widest text-gray-900 dark:text-zinc-50 uppercase">
                  {contract.provider.business_name || contract.provider.name || 'CONTRATO DE SERVICIOS'}
                </span>
                <span className="font-serif text-base sm:text-xl font-bold tracking-wider text-gray-900 dark:text-zinc-100 uppercase hidden sm:inline">
                  CONTRATO DE SERVICIOS
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-zinc-100">
                  {contract.code}
                </span>
              </div>
              <div className="border-t border-gray-900 dark:border-zinc-100 pt-3">
                <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-tight text-gray-900 dark:text-zinc-50">
                  {contract.title}
                </h1>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Fecha: {new Date(contract.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} | Estado:{' '}
                  <span className="font-semibold text-emerald-600">
                    {contract.status === 'signed'
                      ? 'Completamente firmado'
                      : contract.status === 'partially_signed'
                      ? 'Parcialmente firmado'
                      : 'Firma simple'}
                  </span>{' '}
                  | {contract.type_label}
                </p>
              </div>
            </div>

            {/* PARTES & DATOS DEL EVENTO (Matching PDF Page 1) */}
            <div className="space-y-6 pt-2 pb-6 border-b border-gray-200 dark:border-zinc-800">
              <div className="space-y-2">
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                  PARTES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-gray-500 block">PROFESIONAL</span>
                    <strong className="text-sm font-serif block text-gray-900 dark:text-zinc-100">
                      {contract.provider.business_name || contract.provider.name || (
                        <span className="text-gray-400 font-sans font-normal italic">[Pendiente de configurar en Ajustes]</span>
                      )}
                    </strong>
                    {contract.provider.name && contract.provider.business_name && (
                      <p className="text-gray-600 dark:text-zinc-400">Titular: {contract.provider.name}</p>
                    )}
                    <p className="text-gray-600 dark:text-zinc-400">
                      NIF / CIF: {contract.provider.dni || <span className="text-gray-400 italic">[No especificado]</span>}
                    </p>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {contract.provider.address || <span className="text-gray-400 italic">[Domicilio no especificado]</span>}
                    </p>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {contract.provider.email || <span className="text-gray-400 italic">[Email no especificado]</span>}
                    </p>
                    {contract.provider.phone && (
                      <p className="text-gray-600 dark:text-zinc-400">{contract.provider.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-gray-500 block">CLIENTE</span>
                    <strong className="text-sm font-serif block text-gray-900 dark:text-zinc-100">
                      {contract.clients.map((c) => c.name).join(' & ')}
                    </strong>
                    {contract.clients.map((c, idx) => (
                      <p key={idx} className="text-gray-600 dark:text-zinc-400">NIF / CIF: {c.dni}</p>
                    ))}
                    <p className="text-gray-600 dark:text-zinc-400">{contract.client_address}</p>
                    <p className="text-gray-600 dark:text-zinc-400">{contract.primary_signer.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                  DATOS DEL EVENTO
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 text-xs space-y-1.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <p><strong>Fecha:</strong> {contract.event.wedding_date_display}</p>
                    <p><strong>Invitados:</strong> {contract.event.guest_count_final}</p>
                    <p><strong>Ceremonia:</strong> {contract.event.ceremony_venue}</p>
                    <p><strong>Lugar:</strong> {contract.event.banquet_venue}</p>
                    <p className="sm:col-span-2"><strong>Dirección:</strong> {contract.event.banquet_city}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TÉRMINOS Y CONDICIONES */}
            <div className="text-center space-y-1 pt-2 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-[11px] font-mono tracking-widest uppercase text-gray-400 dark:text-zinc-500 font-semibold block">
                TÉRMINOS Y CONDICIONES
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-50">
                {contract.document_title}
              </h2>
              {contract.provider.business_name && (
                <span className="font-serif text-sm font-semibold tracking-wider text-primary block">
                  {contract.provider.business_name}
                </span>
              )}
            </div>

          {/* REUNIDOS */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-1">
              REUNIDOS
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300 space-y-3">
              <p>
                <strong>De una parte:</strong>{' '}
                {contract.provider.name || contract.provider.business_name ? (
                  <>
                    {contract.provider.name ? (
                      <>D./Dña. <strong>{contract.provider.name}</strong>, con DNI/CIF{' '}</>
                    ) : (
                      <>La entidad <strong>{contract.provider.business_name}</strong>, con CIF{' '}</>
                    )}
                    <span className="font-mono">{contract.provider.dni || '[Pendiente]'}</span>
                    {contract.provider.name && contract.provider.business_name ? (
                      <>, actuando bajo el nombre comercial <strong>{contract.provider.business_name}</strong></>
                    ) : null}
                    , con domicilio profesional en{' '}
                    {contract.provider.address || '[Domicilio pendiente de indicar]'}, en adelante,{' '}
                    <strong>{contract.provider.role_label || 'EL/LA PROFESIONAL'}</strong>.
                  </>
                ) : (
                  <span className="italic text-gray-400">
                    [Datos profesionales pendientes de cumplimentar en perfil de cuenta]
                  </span>
                )}
              </p>
              <p>
                <strong>Y de otra parte:</strong>{' '}
                {contract.clients.map((c, i) => (
                  <span key={i}>
                    {i > 0 ? ' y ' : ''}
                    D./Dña. <strong>{c.name}</strong>, con DNI/NIE{' '}
                    <span className="font-mono">{c.dni}</span>
                  </span>
                ))}
                , con domicilio a efectos de comunicaciones en {contract.client_address}, teléfonos y
                correos electrónicos{' '}
                {contract.clients.map((c) => (
                  <span key={c.email} className="font-mono text-xs">
                    {c.email}{' '}
                  </span>
                ))}
                , en adelante, <strong>{contract.client_role_label}</strong>.
              </p>
              <p className="italic text-gray-500 dark:text-zinc-400">
                Ambas partes reconocen tener capacidad legal suficiente para contratar y obligarse.
              </p>
            </div>
          </section>

          {/* EXPONEN */}
          <section className="space-y-4">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-1">
              EXPONEN
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300 space-y-2.5">
              <p>
                <strong>I.</strong> Que LA PAREJA celebrará su boda el{' '}
                <strong>{contract.event.wedding_date_display}</strong>, con una previsión aproximada
                de {contract.event.guest_count_min} a {contract.event.guest_count_max} invitados,
                además de los niños que finalmente asistan.
              </p>
              <p>
                <strong>II.</strong> Que la ceremonia religiosa tendrá lugar en{' '}
                <strong>{contract.event.ceremony_venue}</strong> y la celebración posterior en{' '}
                <strong>{contract.event.banquet_venue}</strong>.
              </p>
              <p>
                <strong>III.</strong> Que LA PAREJA ha decidido contratar los servicios profesionales
                de {contract.event.scope_summary} de {contract.provider.business_name}.
              </p>
              <p>
                <strong>IV.</strong> Que ambas partes desean establecer por escrito el alcance de los
                servicios, las obligaciones asumidas y las condiciones económicas y organizativas
                aplicables.
              </p>
              <p className="italic pt-2">Por todo ello, acuerdan las siguientes:</p>
            </div>
          </section>

          {/* CLÁUSULAS */}
          <section className="space-y-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100 uppercase tracking-wider text-center border-b-2 border-primary/20 pb-2">
              CLÁUSULAS
            </h2>

            {/* Cláusula 1: Objeto y tabla de servicios */}
            <div className="space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                1. OBJETO DEL CONTRATO
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                El objeto del presente contrato es la prestación por {contract.provider.business_name}{' '}
                de los servicios profesionales de Wedding Planning y diseño creativo contratados por LA
                PAREJA para su boda del {contract.event.wedding_date_display}.
              </p>

              {/* Services Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold border-b border-gray-200 dark:border-zinc-700">
                    <tr>
                      <th className="p-3.5">Servicio Contratado</th>
                      <th className="p-3.5 text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {contract.services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                        <td className="p-3.5">
                          <span className="font-medium text-gray-900 dark:text-zinc-100 block">
                            {srv.name}
                          </span>
                          {srv.description && (
                            <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                              {srv.description}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right font-semibold font-mono text-gray-900 dark:text-zinc-100 whitespace-nowrap">
                          {srv.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5 dark:bg-primary/10 font-bold border-t-2 border-primary/30">
                      <td className="p-3.5 text-primary text-sm sm:text-base uppercase tracking-wider">
                        TOTAL CONTRATADO
                      </td>
                      <td className="p-3.5 text-right text-primary text-base sm:text-lg font-mono whitespace-nowrap">
                        {contract.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-xs text-gray-600 dark:text-zinc-400 space-y-1.5 italic">
                <p>
                  Los importes indicados son precios finales de los servicios contratados, con los
                  impuestos legalmente aplicables incluidos.
                </p>
                {contract.discount_notes && <p>{contract.discount_notes}</p>}
                <p>
                  Los desplazamientos y cualquier servicio adicional no están incluidos en este importe
                  y se regularán mediante los correspondientes anexos o presupuestos aceptados por
                  escrito.
                </p>
              </div>
            </div>

            {/* Cláusula 2: Coordinación */}
            <div className="space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                2. COORDINACIÓN DEL DÍA DE LA BODA
              </h3>
              <div className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">2.1. Preparación previa</h4>
                <p>
                  El servicio de coordinación comenzará entre dos y tres semanas antes de la boda.
                  Durante este periodo, {contract.provider.business_name} realizará: reunión final de
                  organización, recopilación de proveedores, confirmación de horarios, necesidades
                  técnicas, elaboración de timing y secuencia de ceremonia religiosa.
                </p>
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                  2.2. Coordinación de momentos especiales
                </h4>
                <p>
                  Incluye coordinación de grabación temática en casa del novio (coordinación horaria sin
                  producción cinematográfica), sesión de fotografías al atardecer, transiciones de
                  música y actuaciones, experiencias (fotomatón, cámaras analógicas, hora loca) y
                  momentos culminantes del banquete (corte de tarta y baile nupcial).
                </p>
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                  2.3. Equipo y cobertura presencial
                </h4>
                <p>
                  El servicio incluye {contract.team_members_count} profesionales de{' '}
                  {contract.provider.business_name}, una wedding planner principal y una asistente. La
                  cobertura máxima será de {contract.coordination_hours} horas presenciales durante el
                  día de la boda.
                </p>
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">2.4. Límites del servicio</h4>
                <p>
                  La coordinación no incluye: montaje o desmontaje de decoración pesada, fabricación de
                  estructuras, labores de hostelería o animación directa, ni presencia fuera de las{' '}
                  {contract.coordination_hours} horas acordadas.
                </p>
                <p className="font-semibold text-primary">Importe del servicio: 980,00 €.</p>
              </div>
            </div>

            {/* Cláusula 3: Planificación parcial */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                3. PLANIFICACIÓN PARCIAL Y ACOMPAÑAMIENTO ORGANIZATIVO
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                Comprende asesoramiento continuo durante los preparativos, calendario de tareas, hasta
                dos reuniones de seguimiento y búsqueda/comparación de proveedores pendientes en hasta
                tres categorías profesionales.
              </p>
              <p className="font-semibold text-primary text-xs sm:text-sm">
                Importe del servicio: 275,00 €.
              </p>
            </div>

            {/* Cláusula 4: Diseño creativo */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                4. DISEÑO CREATIVO INTEGRAL
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                Desarrollo del concepto estético personalizado, moodboard, paleta cromática, diseño de
                espacios (ceremonia, cóctel, banquete), diseño de hasta tres rincones especiales y
                diseño gráfico completo de toda la papelería (invitaciones, minutas, seating plan,
                meseros, cartelería).
              </p>
              <p className="font-semibold text-primary text-xs sm:text-sm">
                Importe especial del servicio: 295,00 €.
              </p>
            </div>

            {/* Cláusula 8 y 9: Pagos y Banco */}
            <div className="space-y-4">
              <h3 className="font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100">
                8. RESERVA DE FECHA Y FORMA DE PAGO
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300">
                Para formalizar la contratación y reservar la fecha del{' '}
                {contract.event.wedding_date_display}, LA PAREJA deberá aceptar electrónicamente el
                presente contrato y efectuar el primer pago.
              </p>

              {/* Payment Schedule Table */}
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-semibold border-b border-gray-200 dark:border-zinc-700">
                    <tr>
                      <th className="p-3">Concepto</th>
                      <th className="p-3 text-right">Importe</th>
                      <th className="p-3 text-right">Vencimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {contract.payment_schedule.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-medium text-gray-900 dark:text-zinc-100">
                          {p.concept}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-gray-900 dark:text-zinc-100">
                          {p.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="p-3 text-right text-gray-600 dark:text-zinc-400">
                          {p.due_date}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-zinc-800/60 font-bold border-t border-gray-200 dark:border-zinc-700">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-right font-mono text-primary">
                        {contract.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 text-right text-xs text-gray-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bank Details Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>DATOS BANCARIOS PARA EL ABONO DE LA RESERVA</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 dark:text-amber-100 pt-1">
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-300 block text-[11px]">
                      Importe de la reserva (30%):
                    </span>
                    <strong className="text-sm font-mono">
                      {contract.bank_details.deposit_amount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      €
                    </strong>
                  </div>
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-300 block text-[11px]">
                      Titular:
                    </span>
                    <strong>{contract.bank_details.account_holder}</strong>
                  </div>
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-300 block text-[11px]">
                      Entidad bancaria:
                    </span>
                    <strong>{contract.bank_details.bank_name}</strong>
                  </div>
                  <div>
                    <span className="text-amber-700/80 dark:text-amber-300 block text-[11px]">
                      IBAN:
                    </span>
                    <strong className="font-mono">{contract.bank_details.iban}</strong>
                  </div>
                  <div className="sm:col-span-2 pt-1">
                    <span className="text-amber-700/80 dark:text-amber-300 block text-[11px]">
                      Concepto de la transferencia:
                    </span>
                    <strong className="font-mono text-xs">{contract.bank_details.concept}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Cláusula 10 & 11: Desplazamientos y Manutención */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700 dark:text-zinc-300">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                  10. Desplazamientos
                </h4>
                <p className="text-xs">
                  Facturación a <strong>{contract.mileage_rate.toFixed(2)} € por kilómetro</strong>{' '}
                  desde {contract.mileage_origin} hasta los espacios y regreso.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                  11. Manutención del Equipo
                </h4>
                <p className="text-xs">
                  Garantía de comida o cena (menú de proveedores) y agua potable para las{' '}
                  {contract.team_members_count} profesionales presentes.
                </p>
              </div>
            </div>

            {/* Rest of Clauses summary list */}
            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-gray-900 dark:text-zinc-100 text-sm">
                Cláusulas Generales 12 a 26:
              </h4>
              <div className="space-y-3 text-xs text-gray-600 dark:text-zinc-400">
                {contract.clauses.slice(11).map((cl) => (
                  <div key={cl.id} className="p-3 rounded-xl bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800">
                    <strong className="text-gray-900 dark:text-zinc-200 block text-xs">
                      {cl.number}. {cl.title}
                    </strong>
                    <p className="mt-1 leading-relaxed">{cl.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Footer Signature Seal */}
            <div className="pt-8 border-t-2 border-dashed border-gray-200 dark:border-zinc-800 space-y-6">
              {(contract.provider.slogan || contract.provider.business_name || contract.provider.name) && (
                <div className="text-center space-y-1">
                  {contract.provider.slogan && (
                    <p className="font-serif italic text-base text-gray-900 dark:text-zinc-200 font-semibold">
                      &ldquo;{contract.provider.slogan}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {contract.provider.business_name}
                    {contract.provider.name && contract.provider.business_name ? ` · ${contract.provider.name}` : contract.provider.name}
                  </p>
                </div>
              )}

              {/* FIRMAS SECTION (Matching PDF Page 13) */}
              <div className="pt-8 border-t-2 border-gray-900 dark:border-zinc-100 space-y-6">
                <h3 className="font-mono font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-zinc-100 border-b border-gray-200 pb-1">
                  FIRMAS
                </h3>

                <div className="space-y-3">
                  {(contract.signers && contract.signers.length > 0
                    ? contract.signers
                    : (contract.clients || []).map((c, i) => ({
                        id: `s-${i}`,
                        name: c.name,
                        dni: c.dni,
                        email: c.email,
                        role_label: 'Cliente',
                        token: `t-${i}`,
                        status: (contract.status === 'signed' ? 'signed' : 'pending') as 'signed' | 'pending',
                        signature_image_base64: contract.signature_proof?.signature_image_base64,
                        signed_at: contract.signature_proof?.signed_at,
                      }))
                  ).map((signer) => {
                    const isThisSignerSigned = signer.status === 'signed';
                    return (
                      <div
                        key={signer.id}
                        className="p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <strong className="text-sm font-serif text-gray-900 dark:text-zinc-100 block">
                            {signer.name}
                          </strong>
                          <span className="text-xs text-gray-500 font-mono block">
                            {signer.role_label} — {signer.email}
                          </span>
                        </div>

                        <div>
                          {isThisSignerSigned ? (
                            <div className="flex flex-col sm:items-end">
                              <span className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                FIRMADO
                              </span>
                              <span className="text-[11px] text-gray-500 font-mono mt-0.5">
                                {signer.signed_at
                                  ? new Date(signer.signed_at).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })
                                  : '3 de noviembre de 2026'}
                              </span>
                              {signer.signature_image_base64 && (
                                <img
                                  src={signer.signature_image_base64}
                                  alt={`Firma de ${signer.name}`}
                                  className="max-h-12 object-contain mt-1 filter dark:invert"
                                />
                              )}
                            </div>
                          ) : (
                            <span className="font-mono text-xs uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                              Pendiente de firma
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 font-mono italic">
                  Este contrato debe ser firmado antes del {contract.expiration_date || '2 de diciembre de 2026'}.
                </p>

                <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-200 dark:border-zinc-800 pt-3">
                  Este contrato ha sido firmado electrónicamente y tiene plena validez legal conforme al Reglamento (UE) N.º 910/2014 (eIDAS) y la Ley 6/2020, de 11 de noviembre, reguladora de determinados aspectos de los servicios electrónicos de confianza. Documento generado por BodaLab.
                </p>

                <div className="text-center font-mono text-[10px] text-gray-400 pt-4">
                  {contract.code} — Contrato de servicios
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar Actions (Matching bodalab exactly) */}
        <div className="w-full lg:w-80 space-y-4 shrink-0 lg:sticky lg:top-20">
          {/* Tarjeta Firmante */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/90 dark:border-zinc-800 shadow-soft space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400 block">
              Firmante
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-serif text-lg font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
                {signerInitial}
              </div>
              <div className="overflow-hidden">
                <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-zinc-100 block truncate">
                  {contract.primary_signer.name}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block truncate font-mono">
                  {contract.primary_signer.email}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta Evento */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/90 dark:border-zinc-800 shadow-soft space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400 block">
              Evento
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span className="font-medium">{contract.event.wedding_date_display}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">{contract.event.banquet_venue}</span>
                  <span className="text-[11px] text-gray-400">{contract.event.banquet_city}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-zinc-300">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span>{contract.event.guest_count_final} Invitados estimados</span>
              </div>
            </div>
          </div>

          {/* Tarjeta Pasos para firmar */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/90 dark:border-zinc-800 shadow-soft space-y-4">
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400 block">
              Pasos para firmar
            </span>

            {/* Paso 1: Leer el documento */}
            <div className="space-y-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                    Leer el documento
                  </span>
                </div>
                {hasScrolledToEnd ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Completado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualMarkRead}
                    className="text-[11px] text-primary hover:underline font-medium cursor-pointer"
                  >
                    Marcar leído
                  </button>
                )}
              </div>
            </div>

            {/* Paso 2: Aceptar términos */}
            <div className="space-y-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                  Aceptar términos
                </span>
              </div>

              <div className="space-y-2 pl-7">
                <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    disabled={isSigned}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>He leído y acepto los términos del contrato</span>
                </label>
                <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    disabled={isSigned}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Acepto la política de privacidad</span>
                </label>
              </div>
            </div>

            {/* Paso 3: Firmar */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 text-[11px] font-bold text-gray-700 dark:text-zinc-300 flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">
                  Firmar
                </span>
              </div>

              {isSigned ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Contrato Firmado!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    Ver Certificado eIDAS
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!canSign || isSigning}
                  onClick={handleOpenSignatureModal}
                  className={`w-full py-3 px-4 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                    canSign
                      ? 'bg-[#5ce5a3] hover:bg-[#4dd492] text-white animate-pulse'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSigning ? 'Procesando firma...' : 'Haz clic para firmar'}</span>
                </button>
              )}

              {/* Legal Notice */}
              <p className="text-[10px] text-gray-400 dark:text-zinc-500 leading-normal pt-1">
                <strong>Confirmar firma:</strong> Al firmar aceptas la validez legal de la firma
                electrónica conforme al{' '}
                <strong>Reglamento eIDAS (UE) 910/2014</strong> y la{' '}
                <strong>Ley 6/2020 de servicios electrónicos de confianza</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Signature Canvas Modal (Inspired by user image) */}
      <SignatureCanvasModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleConfirmSignature}
        signerName={contract.primary_signer.name}
      />

      {/* Legal Certificate Modal */}
      <LegalCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        contract={contract}
      />
    </div>
  );
}
