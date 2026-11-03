'use client';

import React, { useState, useEffect } from 'react';
import { useWeddingPlanner } from '@/lib/weddings-store';
import {
  Contract,
  ContractServiceItem,
  ContractPaymentSchedule,
  DEFAULT_CONTRACT_CLAUSES,
} from '@/lib/contracts-data';
import {
  X,
  FileSignature,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Euro,
  Building2,
  CheckCircle2,
  Sparkles,
  Receipt,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (contractData: Partial<Contract>) => Contract;
}

export function CreateContractModal({
  isOpen,
  onClose,
  onCreate,
}: CreateContractModalProps) {
  const { weddings, activeWedding } = useWeddingPlanner();

  // Wizard tab
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(activeWedding.id);
  const [contractTitle, setContractTitle] = useState<string>('');

  // Provider
  const [providerBusinessName, setProviderBusinessName] = useState('RITMOS · Wedding & Event Studio');
  const [providerName, setProviderName] = useState('Sara Vara Lobón');
  const [providerDni, setProviderDni] = useState('45688606A');
  const [providerAddress, setProviderAddress] = useState('Ronda Rancha, 1, Benavente (Zamora)');
  const [providerPhone, setProviderPhone] = useState('634 162 084');
  const [providerEmail, setProviderEmail] = useState('ritmos.eventsv@gmail.com');
  const [providerIban, setProviderIban] = useState('ES57 0182 2754 2202 0159 0988');
  const [providerBank, setProviderBank] = useState('BBVA');

  // Clients
  const [client1Name, setClient1Name] = useState(activeWedding.groom_name || 'Rodrigo Varas López');
  const [client1Dni, setClient1Dni] = useState('71944951P');
  const [client1Email, setClient1Email] = useState(activeWedding.owner_email || 'rodrigovaraslopez@gmail.com');
  const [client1Phone, setClient1Phone] = useState('615 559 110');

  const [client2Name, setClient2Name] = useState(activeWedding.bride_name || 'Stephanie Lizbeth Mendoza');
  const [client2Dni, setClient2Dni] = useState('61555911E');
  const [client2Email, setClient2Email] = useState('stephan1em@hotmail.com');
  const [client2Phone, setClient2Phone] = useState('630 123 456');

  const [clientAddress, setClientAddress] = useState('Calle Canalillo 4, 2 B, 28028 Madrid, Madrid, España');

  // Event
  const [weddingDateDisplay, setWeddingDateDisplay] = useState(activeWedding.wedding_date || '28 de agosto de 2027');
  const [guestsCount, setGuestsCount] = useState<number>(activeWedding.guest_target_count || 168);
  const [ceremonyVenue, setCeremonyVenue] = useState('Villamuriel de Cerrato (Palencia)');
  const [banquetVenue, setBanquetVenue] = useState(activeWedding.location_summary || 'Concejo Bodegas, Valoria la Buena (Valladolid)');

  // Services
  const [services, setServices] = useState<ContractServiceItem[]>([
    {
      id: 'srv-1',
      name: 'Coordinación del día de la boda',
      description: 'Presencia de 2 profesionales (12h de cobertura), timing y coordinación.',
      amount: 980,
    },
    {
      id: 'srv-2',
      name: 'Planificación parcial y acompañamiento organizativo',
      description: 'Reuniones de seguimiento, calendario de preparativos y búsqueda de proveedores.',
      amount: 275,
    },
    {
      id: 'srv-3',
      name: 'Diseño Creativo Integral (precio especial por contratación conjunta)',
      description: 'Concepto visual, paleta cromática, diseño de espacios, rincones y papelería.',
      amount: 295,
    },
  ]);

  const [mileageRate, setMileageRate] = useState(0.40);
  const [mileageOrigin, setMileageOrigin] = useState('Benavente (Zamora)');
  const [coordinationHours, setCoordinationHours] = useState(12);

  // Success dialog after creation
  const [createdResult, setCreatedResult] = useState<Contract | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-calculate total
  const totalAmount = services.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  // When selected wedding changes, prefill
  const handleSelectWeddingChange = (wId: string) => {
    setSelectedWeddingId(wId);
    const target = weddings.find((w) => w.id === wId);
    if (target) {
      setClient1Name(target.groom_name || target.couple_names.split('&')[0]?.trim() || '');
      setClient2Name(target.bride_name || target.couple_names.split('&')[1]?.trim() || '');
      if (target.wedding_date) setWeddingDateDisplay(target.wedding_date);
      if (target.location_summary) setBanquetVenue(target.location_summary);
      if (target.guest_target_count) setGuestsCount(target.guest_target_count);
      setContractTitle(`CONTRATO WP ${target.couple_names.toUpperCase()}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCreatedResult(null);
      setActiveStep(1);
      setContractTitle(`CONTRATO WP ${client1Name} Y ${client2Name}`.toUpperCase());
    }
  }, [isOpen, client1Name, client2Name]);

  const handleAddService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}`,
        name: 'Nuevo Servicio Adicional',
        description: 'Descripción del alcance',
        amount: 150,
      },
    ]);
  };

  const handleRemoveService = (id: string) => {
    if (services.length <= 1) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleServiceChange = (id: string, field: keyof ContractServiceItem, value: any) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleFinishCreate = () => {
    // Generate payments: 30%, 40%, 30%
    const depositAmount = Math.round(totalAmount * 0.3);
    const secondPayment = Math.round(totalAmount * 0.4);
    const finalPayment = totalAmount - depositAmount - secondPayment;

    const paymentSchedule: ContractPaymentSchedule[] = [
      {
        id: 'pay-1',
        concept: 'Reserva de fecha (30 %)',
        percentage: 30,
        amount: depositAmount,
        due_date: 'Al formalizar el contrato',
        status: 'pending',
      },
      {
        id: 'pay-2',
        concept: 'Segundo pago (40 %)',
        percentage: 40,
        amount: secondPayment,
        due_date: '3 meses antes de la boda',
        status: 'pending',
      },
      {
        id: 'pay-3',
        concept: 'Pago final (30 %)',
        percentage: 30,
        amount: finalPayment,
        due_date: '15 días antes de la boda',
        status: 'pending',
      },
    ];

    const payload: Partial<Contract> = {
      wedding_id: selectedWeddingId,
      title: contractTitle || `CONTRATO WP ${client1Name} Y ${client2Name}`.toUpperCase(),
      document_title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
      type: 'simple_signature',
      type_label: 'Firma simple',
      status: 'sent',
      provider: {
        business_name: providerBusinessName,
        name: providerName,
        dni: providerDni,
        address: providerAddress,
        role_label: 'LA PROFESIONAL',
        phone: providerPhone,
        email: providerEmail,
        slogan: 'Si puedes soñarlo, podemos conseguirlo.',
      },
      clients: [
        {
          name: client1Name,
          dni: client1Dni,
          email: client1Email,
          phone: client1Phone,
        },
        {
          name: client2Name,
          dni: client2Dni,
          email: client2Email,
          phone: client2Phone,
        },
      ],
      client_address: clientAddress,
      client_role_label: 'LA PAREJA o LOS CONTRATANTES',
      event: {
        wedding_date_display: weddingDateDisplay,
        wedding_date_iso: '2027-08-28',
        guest_count_min: Math.max(50, guestsCount - 20),
        guest_count_max: guestsCount + 20,
        guest_count_final: guestsCount,
        ceremony_venue: ceremonyVenue,
        ceremony_city: 'Palencia',
        banquet_venue: banquetVenue,
        banquet_city: 'Valladolid',
        scope_summary: 'Coordinación, planificación y diseño creativo.',
      },
      services,
      total_amount: totalAmount,
      currency: 'EUR',
      payment_schedule: paymentSchedule,
      bank_details: {
        account_holder: providerName,
        bank_name: providerBank,
        iban: providerIban,
        concept: `Reserva boda ${client1Name.split(' ')[0]} y ${client2Name.split(' ')[0]}`,
        deposit_amount: depositAmount,
      },
      mileage_rate: mileageRate,
      mileage_origin: mileageOrigin,
      coordination_hours: coordinationHours,
      team_members_count: 2,
      clauses: DEFAULT_CONTRACT_CLAUSES,
      primary_signer: {
        name: client2Name,
        email: client2Email,
        dni: client2Dni,
        role: 'LA PAREJA',
      },
    };

    const created = onCreate(payload);
    setCreatedResult(created);
  };

  const getSigningUrl = (c: Contract) => {
    if (typeof window === 'undefined') return `/firmar/${c.signing_token}?f=${c.signer_token}`;
    return `${window.location.origin}/firmar/${c.signing_token}?f=${c.signer_token}`;
  };

  const handleCopyLink = () => {
    if (!createdResult) return;
    const url = getSigningUrl(createdResult);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-50">
                Nuevo Contrato de Prestación de Servicios
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Configura los datos del Wedding Planner, la pareja, honorarios y condiciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {createdResult ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-serif text-2xl font-bold text-gray-900 dark:text-zinc-50">
                ¡Contrato Generado con Éxito!
              </h4>
              <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-md mx-auto">
                El contrato <span className="font-mono font-bold text-gray-900 dark:text-zinc-200">{createdResult.code}</span> está listo para ser firmado por la pareja con plena validez eIDAS.
              </p>
            </div>

            {/* Link Box */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-left space-y-2 max-w-lg mx-auto">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                Enlace Oficial de Firma para la Pareja:
              </span>
              <p className="font-mono text-xs text-primary dark:text-primary-text break-all bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700">
                {getSigningUrl(createdResult)}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary text-primary-text text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                </button>
                <a
                  href={`/firmar/${createdResult.signing_token}?f=${createdResult.signer_token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-300 dark:border-zinc-600 text-xs font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir para Firmar</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300 underline"
            >
              Volver al panel de contratos
            </button>
          </div>
        ) : (
          <>
            {/* Step Tabs */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 text-xs font-medium">
              {[
                { step: 1, label: '1. Wedding Planner' },
                { step: 2, label: '2. Pareja & Evento' },
                { step: 3, label: '3. Servicios & Precios' },
                { step: 4, label: '4. Cláusulas Legales' },
              ].map((t) => (
                <button
                  key={t.step}
                  type="button"
                  onClick={() => setActiveStep(t.step as any)}
                  className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                    activeStep === t.step
                      ? 'border-primary text-primary font-bold bg-white dark:bg-zinc-900'
                      : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* STEP 1: WEDDING PLANNER / PROVEEDOR */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                    <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      Datos de la Wedding Planner o Agencia Profesional
                    </span>
                    <p className="text-xs text-gray-600 dark:text-zinc-400">
                      Identificación del profesional que prestará los servicios y cuenta receptora de honorarios.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Nombre Comercial / Estudio
                      </label>
                      <input
                        type="text"
                        value={providerBusinessName}
                        onChange={(e) => setProviderBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Titular / Profesional Autónomo
                      </label>
                      <input
                        type="text"
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        DNI / CIF Profesional
                      </label>
                      <input
                        type="text"
                        value={providerDni}
                        onChange={(e) => setProviderDni(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        value={providerPhone}
                        onChange={(e) => setProviderPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Domicilio Profesional para Notificaciones
                      </label>
                      <input
                        type="text"
                        value={providerAddress}
                        onChange={(e) => setProviderAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Email para Ejercicio de Derechos (RGPD)
                      </label>
                      <input
                        type="email"
                        value={providerEmail}
                        onChange={(e) => setProviderEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Entidad Bancaria
                      </label>
                      <input
                        type="text"
                        value={providerBank}
                        onChange={(e) => setProviderBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        IBAN para Transferencia de la Reserva y Pagos
                      </label>
                      <input
                        type="text"
                        value={providerIban}
                        onChange={(e) => setProviderIban(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-primary outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PAREJA & EVENTO */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700">
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      Asociar a Boda Registrada:
                    </span>
                    <select
                      value={selectedWeddingId}
                      onChange={(e) => handleSelectWeddingChange(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                    >
                      {weddings.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.couple_names} ({w.wedding_date})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contratante 1 */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                      <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                        Contratante 1 (Novio / Cónyuge)
                      </span>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={client1Name}
                        onChange={(e) => setClient1Name(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="DNI / NIE"
                        value={client1Dni}
                        onChange={(e) => setClient1Dni(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={client1Email}
                        onChange={(e) => setClient1Email(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    {/* Contratante 2 */}
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-3">
                      <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">
                        Contratante 2 (Novia / Cónyuge / Firmante)
                      </span>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={client2Name}
                        onChange={(e) => setClient2Name(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="DNI / NIE"
                        value={client2Dni}
                        onChange={(e) => setClient2Dni(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={client2Email}
                        onChange={(e) => setClient2Email(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Domicilio de la Pareja para Notificaciones
                      </label>
                      <input
                        type="text"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Fecha Prevista de la Boda
                      </label>
                      <input
                        type="text"
                        value={weddingDateDisplay}
                        onChange={(e) => setWeddingDateDisplay(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Estimación de Invitados
                      </label>
                      <input
                        type="number"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Lugar de Ceremonia
                      </label>
                      <input
                        type="text"
                        value={ceremonyVenue}
                        onChange={(e) => setCeremonyVenue(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Lugar de Celebración / Banquete
                      </label>
                      <input
                        type="text"
                        value={banquetVenue}
                        onChange={(e) => setBanquetVenue(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SERVICIOS & PRECIOS */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Desglose de Servicios Contratados
                    </span>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Servicio</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {services.map((srv, idx) => (
                      <div
                        key={srv.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                      >
                        <div className="flex-1 space-y-1 w-full">
                          <input
                            type="text"
                            value={srv.name}
                            onChange={(e) => handleServiceChange(srv.id, 'name', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                            placeholder="Nombre del servicio"
                          />
                          <input
                            type="text"
                            value={srv.description || ''}
                            onChange={(e) =>
                              handleServiceChange(srv.id, 'description', e.target.value)
                            }
                            className="w-full px-2.5 py-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] text-gray-500"
                            placeholder="Descripción o alcance"
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <div className="relative w-28">
                            <input
                              type="number"
                              value={srv.amount}
                              onChange={(e) =>
                                handleServiceChange(srv.id, 'amount', Number(e.target.value))
                              }
                              className="w-full pr-7 pl-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-right"
                            />
                            <span className="absolute right-2.5 top-1.5 text-xs text-gray-400">
                              €
                            </span>
                          </div>
                          {services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveService(srv.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Total */}
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block">
                        TOTAL CONTRATADO (IVA incluido)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Reserva 30% ({Math.round(totalAmount * 0.3)} €) + 40% ({Math.round(totalAmount * 0.4)} €) + 30% ({totalAmount - Math.round(totalAmount * 0.3) - Math.round(totalAmount * 0.4)} €)
                      </span>
                    </div>
                    <span className="font-serif text-2xl font-bold text-primary">
                      {totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Horas Presenciales de Cobertura
                      </label>
                      <input
                        type="number"
                        value={coordinationHours}
                        onChange={(e) => setCoordinationHours(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        Tarifa de Desplazamiento (€/km)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={mileageRate}
                        onChange={(e) => setMileageRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CLÁUSULAS */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Marco Jurídico eIDAS con 26 Cláusulas Especializadas
                    </span>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      El contrato incorpora automáticamente todas las cláusulas requeridas: Objeto, Coordinación 12h, Planificación parcial, Diseño Creativo, Desistimiento legal e inicio anticipado, Manutención de 2 personas, RGPD y Sello de Tiempo.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
                    {DEFAULT_CONTRACT_CLAUSES.slice(0, 10).map((cl) => (
                      <div key={cl.id} className="p-2 border-b border-gray-200/50 dark:border-zinc-700/50 last:border-none">
                        <strong className="text-gray-900 dark:text-zinc-200 block">
                          Cláusula {cl.number}. {cl.title}
                        </strong>
                        <p className="line-clamp-2 text-[11px] mt-0.5">{cl.content}</p>
                      </div>
                    ))}
                    <p className="text-center text-[11px] font-medium text-primary pt-2">
                      + 16 cláusulas adicionales incluidas en la formalización oficial.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    ← Anterior
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                {activeStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                    className="bg-primary text-primary-text font-semibold text-xs py-2.5 px-6 rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishCreate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Crear y Generar Enlace de Firma</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
