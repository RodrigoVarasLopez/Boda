'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useContractsStore } from '@/lib/contracts-store';
import { useWeddingPlanner } from '@/lib/weddings-store';
import { Contract, ContractStatus } from '@/lib/contracts-data';
import { CreateContractModal } from '@/components/contracts/CreateContractModal';
import { EditContractModal } from '@/components/contracts/EditContractModal';
import { LegalCertificateModal } from '@/components/contracts/LegalCertificateModal';
import { usePlannerProfile } from '@/lib/planner-profile-store';
import {
  FileSignature,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Copy,
  ExternalLink,
  ShieldCheck,
  Receipt,
  Euro,
  Users,
  Calendar,
  Building2,
  Trash2,
  CopyCheck,
  AlertCircle,
  Sparkles,
  Printer,
  ChevronRight,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminContractsPage() {
  const {
    contracts,
    activeWeddingContracts,
    createContract,
    updateContract,
    deleteContract,
    duplicateContract,
    isLoaded,
  } = useContractsStore();

  const { activeWedding, weddings } = useWeddingPlanner();
  const { profile, isComplete, hasAnyData } = usePlannerProfile();

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all');
  const [weddingFilter, setWeddingFilter] = useState<string>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContractForEdit, setSelectedContractForEdit] = useState<Contract | null>(null);
  const [certificateContract, setCertificateContract] = useState<Contract | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;

      // Wedding filter
      if (weddingFilter !== 'all' && c.wedding_id !== weddingFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchCode = c.code.toLowerCase().includes(q);
        const matchClient = c.clients.some((client) =>
          client.name.toLowerCase().includes(q) || client.email.toLowerCase().includes(q)
        );
        const matchProvider = c.provider.business_name.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchClient && !matchProvider) return false;
      }

      return true;
    });
  }, [contracts, statusFilter, weddingFilter, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = contracts.length;
    const signed = contracts.filter((c) => c.status === 'signed').length;
    const sent = contracts.filter((c) => c.status === 'sent' || c.status === 'opened').length;
    const totalVolume = contracts.reduce((acc, c) => acc + (Number(c.total_amount) || 0), 0);
    const signedVolume = contracts
      .filter((c) => c.status === 'signed')
      .reduce((acc, c) => acc + (Number(c.total_amount) || 0), 0);
    const totalDeposits = contracts
      .filter((c) => c.status === 'signed')
      .reduce((acc, c) => acc + (Number(c.bank_details.deposit_amount) || 0), 0);

    const conversionRate = total > 0 ? Math.round((signed / total) * 100) : 0;

    return {
      total,
      signed,
      sent,
      totalVolume,
      signedVolume,
      totalDeposits,
      conversionRate,
    };
  }, [contracts]);

  const getSigningUrl = (c: Contract) => {
    if (typeof window === 'undefined') return `/firmar/${c.signing_token}?f=${c.signer_token}`;
    return `${window.location.origin}/firmar/${c.signing_token}?f=${c.signer_token}`;
  };

  const handleCopySigningLink = (c: Contract) => {
    const url = getSigningUrl(c);
    navigator.clipboard.writeText(url);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el contrato ${code}?`)) {
      deleteContract(id);
    }
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateContract(id);
    if (copy) {
      alert(`Contrato duplicado con éxito como ${copy.code}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <FileSignature className="w-3.5 h-3.5" />
            <span>Módulo de Contratación Electrónica B2B</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Contratos para Wedding Planners
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Gestión integral de contratos, firma simple con evidencia eIDAS (UE 910/2014) y cobro de reservas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-primary text-primary-text font-semibold text-xs sm:text-sm shadow-soft hover:bg-primary-hover transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Crear Nuevo Contrato</span>
        </button>
      </div>

      {/* Account Fiscal Profile Banner */}
      {!isComplete ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-sm text-amber-900 dark:text-amber-200">
                {hasAnyData
                  ? 'Faltan datos fiscales en tu perfil de Wedding Planner'
                  : 'No has configurado tus datos profesionales y fiscales'}
              </span>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-0.5">
                {hasAnyData
                  ? 'Completa tu NIF, domicilio e IBAN para que tus contratos se emitan con plena validez jurídica.'
                  : 'Los contratos nuevos y enlaces públicos mostrarán los campos del profesional vacíos hasta que introduzcas tus datos en tu cuenta.'}
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings?tab=profile"
            className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Configurar en mi cuenta →</span>
          </Link>
        </div>
      ) : (
        <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Emisor oficial de contratos:</strong> {profile.business_name || profile.legal_name}
              {profile.nif_cif ? ` · NIF/CIF: ${profile.nif_cif}` : ''}
              {profile.iban ? ` · IBAN: ${profile.iban.substring(0, 10)}...` : ''}
            </span>
          </div>
          <Link
            href="/admin/settings?tab=profile"
            className="text-emerald-700 dark:text-emerald-300 font-semibold hover:underline text-[11px] shrink-0"
          >
            Editar datos fiscales de cuenta →
          </Link>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contratos */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Contratos
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <FileSignature className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-text-primary">
              {metrics.total}
            </span>
            <span className="text-xs text-text-muted">expedientes</span>
          </div>
          <p className="text-[11px] text-text-secondary">
            En todas las carteras de bodas
          </p>
        </div>

        {/* Firmados & Vigentes */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Firmados (eIDAS)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600">
              {metrics.signed}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              {metrics.conversionRate}% éxito
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            {metrics.signedVolume.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € contratados
          </p>
        </div>

        {/* Pendientes de Firma */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Pendientes de Firma
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-amber-600">
              {metrics.sent}
            </span>
            <span className="text-xs text-text-muted">en espera de la pareja</span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Enlace activo listo para compartir
          </p>
        </div>

        {/* Reservas Cobradas */}
        <div className="p-5 rounded-3xl bg-bg-card border border-border-subtle shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Reservas Cobradas (30%)
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Euro className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-primary">
              {metrics.totalDeposits.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
            </span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Bloqueo de agenda formalizado
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-bg-card border border-border-subtle shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por pareja, código (C-2026-0009), DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-subtle bg-bg-primary text-xs focus:ring-2 focus:ring-primary outline-hidden"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-bg-primary border border-border-subtle text-xs">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'signed', label: 'Firmados' },
                { id: 'sent', label: 'Pendientes' },
                { id: 'draft', label: 'Borradores' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setStatusFilter(t.id as any)}
                className={`py-1.5 px-3 rounded-xl transition-all cursor-pointer font-medium ${
                  statusFilter === t.id
                    ? 'bg-primary text-primary-text font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Wedding Filter */}
          <select
            value={weddingFilter}
            onChange={(e) => setWeddingFilter(e.target.value)}
            className="py-2 px-3 rounded-2xl border border-border-subtle bg-bg-primary text-xs font-medium cursor-pointer"
          >
            <option value="all">Todas las Bodas ({weddings.length})</option>
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.couple_names}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contracts List / Cards */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-bg-card border border-border-subtle space-y-3">
            <FileSignature className="w-10 h-10 text-text-muted mx-auto" />
            <h3 className="font-serif text-lg font-bold text-text-primary">
              No se encontraron contratos con estos filtros
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Crea un nuevo contrato o ajusta la búsqueda para ver los contratos existentes.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Primer Contrato</span>
            </button>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const isSigned = contract.status === 'signed';
            const isOpened = contract.status === 'opened';
            const signingUrl = getSigningUrl(contract);

            return (
              <div
                key={contract.id}
                className="p-6 rounded-3xl bg-bg-card border border-border-subtle shadow-card hover:border-border-strong transition-all space-y-5"
              >
                {/* Top Row: Code, Title, Status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {contract.code}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-text-primary">
                      {contract.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSigned ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Firmado Electrónicamente (eIDAS)
                      </span>
                    ) : isOpened ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-300">
                        <Eye className="w-3.5 h-3.5" />
                        Visto por la pareja (En lectura)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300">
                        <Clock className="w-3.5 h-3.5" />
                        Pendiente de Firma
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-bg-primary/50 border border-border-subtle text-xs">
                  {/* Wedding Planner */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-text-muted" />
                      Wedding Planner / Estudio
                    </span>
                    <strong className="block text-text-primary font-semibold">
                      {contract.provider.business_name}
                    </strong>
                    <span className="text-[11px] text-text-secondary block">
                      {contract.provider.name} ({contract.provider.dni})
                    </span>
                  </div>

                  {/* Pareja / Contratantes */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      Pareja Contratante
                    </span>
                    <strong className="block text-text-primary font-semibold truncate">
                      {contract.clients.map((c) => c.name).join(' & ')}
                    </strong>
                    <span className="text-[11px] text-text-secondary block truncate font-mono">
                      {contract.primary_signer.email}
                    </span>
                  </div>

                  {/* Fecha y Espacios */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      Fecha & Ubicación
                    </span>
                    <strong className="block text-text-primary font-semibold">
                      {contract.event.wedding_date_display}
                    </strong>
                    <span className="text-[11px] text-text-secondary block truncate">
                      {contract.event.banquet_venue} ({contract.event.guest_count_final} inv.)
                    </span>
                  </div>

                  {/* Importes y Reserva */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <Euro className="w-3.5 h-3.5 text-text-muted" />
                      Honorarios & Reserva
                    </span>
                    <strong className="block font-serif text-sm font-bold text-primary">
                      {contract.total_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </strong>
                    <span className="text-[11px] text-text-secondary block">
                      Reserva 30%: {contract.bank_details.deposit_amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>

                {/* Evidence snippet if signed */}
                {isSigned && contract.signature_proof && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-emerald-950 dark:text-emerald-200 block">
                          Firmado por {contract.signature_proof.signer_name} (DNI: {contract.signature_proof.signer_dni})
                        </span>
                        <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300 font-mono">
                          Sello de Tiempo: {new Date(contract.signature_proof.signed_at).toLocaleString('es-ES')} · Hash: {contract.signature_proof.document_sha256.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertificateContract(contract)}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Ver Certificado Legal</span>
                    </button>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Shareable Link Box */}
                  <div className="flex items-center gap-2 flex-1 max-w-lg">
                    <span className="text-[11px] font-mono text-text-muted shrink-0">
                      Enlace de firma:
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={signingUrl}
                      className="w-full text-[11px] font-mono py-1.5 px-2.5 rounded-xl border border-border-subtle bg-bg-primary text-text-secondary select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopySigningLink(contract)}
                      className="py-1.5 px-3 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === contract.id ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedContractForEdit(contract)}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer"
                      title="Adaptar servicios, honorarios y cláusulas"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Adaptar Servicios</span>
                    </button>

                    <Link
                      href={`/firmar/${contract.signing_token}?f=${contract.signer_token}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-border-strong text-xs font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                      title="Abrir página oficial de firma"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir para Firmar</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(contract.id)}
                      className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                      title="Duplicar contrato"
                    >
                      <CopyCheck className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(contract.id, contract.code)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Eliminar contrato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Strategy Best Practices Section for Wedding Planners */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-900/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-950 dark:text-amber-100">
              Estrategia Jurídica & Operativa para Wedding Planners
            </h3>
            <p className="text-xs text-amber-900/80 dark:text-amber-300">
              Claves contractuales integradas en este generador para blindar tu agencia
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-amber-950/80 dark:text-amber-200/90 pt-1">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-amber-200/50 dark:border-amber-900/30 space-y-1.5">
            <strong className="text-amber-950 dark:text-amber-100 font-bold block">
              1. Reserva No Reembolsable (30%)
            </strong>
            <p>
              Garantiza el bloqueo exclusivo de fecha en tu agenda. En caso de desistimiento de la pareja, cubre el coste de oportunidad y las reuniones iniciales de coordinación.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-amber-200/50 dark:border-amber-900/30 space-y-1.5">
            <strong className="text-amber-950 dark:text-amber-100 font-bold block">
              2. Delimitación de Responsabilidad (12h)
            </strong>
            <p>
              Establece con precisión el límite de 12 horas presenciales, manutención para las dos profesionales del equipo y la exoneración por fallos de proveedores externos independientes.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-amber-200/50 dark:border-amber-900/30 space-y-1.5">
            <strong className="text-amber-950 dark:text-amber-100 font-bold block">
              3. Validez eIDAS y Huella SHA-256
            </strong>
            <p>
              Cada firma almacena el trazo digital, sello de tiempo UTC y hash SHA-256. Plena validez probatoria ante tribunales españoles y de la Unión Europea.
            </p>
          </div>
        </div>
      </div>

      {/* Create Contract Wizard Modal */}
      <CreateContractModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(contractData) => {
          return createContract(contractData);
        }}
      />

      {/* Edit / Adapt Services Modal */}
      <EditContractModal
        isOpen={!!selectedContractForEdit}
        onClose={() => setSelectedContractForEdit(null)}
        contract={selectedContractForEdit}
        onSave={(id, updates) => {
          updateContract(id, updates);
        }}
      />

      {/* Legal Certificate Modal */}
      <LegalCertificateModal
        isOpen={!!certificateContract}
        onClose={() => setCertificateContract(null)}
        contract={certificateContract}
      />
    </div>
  );
}
