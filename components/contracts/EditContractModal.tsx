'use client';

import React, { useState, useEffect } from 'react';
import { usePlannerProfile } from '@/lib/planner-profile-store';
import {
  Contract,
  ContractServiceItem,
  ContractPaymentSchedule,
  ContractClause,
  DEFAULT_CONTRACT_CLAUSES,
} from '@/lib/contracts-data';
import {
  X,
  FileSignature,
  Building2,
  Users,
  Euro,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSave: (id: string, updates: Partial<Contract>) => void;
}

export function EditContractModal({
  isOpen,
  onClose,
  contract,
  onSave,
}: EditContractModalProps) {
  const [activeTab, setActiveTab] = useState<'planner' | 'couple' | 'services' | 'clauses'>('services');
  const { profile, hasAnyData } = usePlannerProfile();

  // Form states
  const [title, setTitle] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerDni, setProviderDni] = useState('');
  const [providerAddress, setProviderAddress] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerIban, setProviderIban] = useState('');
  const [providerBank, setProviderBank] = useState('');
  const [providerSlogan, setProviderSlogan] = useState('');

  // Clients
  const [client1Name, setClient1Name] = useState('');
  const [client1Dni, setClient1Dni] = useState('');
  const [client1Email, setClient1Email] = useState('');
  const [client1Phone, setClient1Phone] = useState('');

  const [client2Name, setClient2Name] = useState('');
  const [client2Dni, setClient2Dni] = useState('');
  const [client2Email, setClient2Email] = useState('');
  const [client2Phone, setClient2Phone] = useState('');

  const [clientAddress, setClientAddress] = useState('');

  // Event
  const [weddingDate, setWeddingDate] = useState('');
  const [guestCount, setGuestCount] = useState(168);
  const [ceremonyVenue, setCeremonyVenue] = useState('');
  const [banquetVenue, setBanquetVenue] = useState('');

  // Services
  const [services, setServices] = useState<ContractServiceItem[]>([]);
  const [coordinationHours, setCoordinationHours] = useState(12);
  const [teamCount, setTeamCount] = useState(2);
  const [mileageRate, setMileageRate] = useState(0.4);
  const [mileageOrigin, setMileageOrigin] = useState('Benavente');

  // Clauses
  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(null);

  // Sync state when contract opens
  useEffect(() => {
    if (contract && isOpen) {
      setTitle(contract.title);
      setBusinessName(contract.provider.business_name);
      setProviderName(contract.provider.name);
      setProviderDni(contract.provider.dni);
      setProviderAddress(contract.provider.address);
      setProviderPhone(contract.provider.phone);
      setProviderEmail(contract.provider.email);
      setProviderIban(contract.bank_details.iban);
      setProviderBank(contract.bank_details.bank_name);
      setProviderSlogan(contract.provider.slogan || '');

      setClient1Name(contract.clients[0]?.name || '');
      setClient1Dni(contract.clients[0]?.dni || '');
      setClient1Email(contract.clients[0]?.email || '');
      setClient1Phone(contract.clients[0]?.phone || '');

      setClient2Name(contract.clients[1]?.name || '');
      setClient2Dni(contract.clients[1]?.dni || '');
      setClient2Email(contract.clients[1]?.email || '');
      setClient2Phone(contract.clients[1]?.phone || '');

      setClientAddress(contract.client_address);

      setWeddingDate(contract.event.wedding_date_display);
      setGuestCount(contract.event.guest_count_final);
      setCeremonyVenue(contract.event.ceremony_venue);
      setBanquetVenue(contract.event.banquet_venue);

      setServices(contract.services || []);
      setCoordinationHours(contract.coordination_hours || 12);
      setTeamCount(contract.team_members_count || 2);
      setMileageRate(contract.mileage_rate || 0.4);
      setMileageOrigin(contract.mileage_origin || 'Benavente');

      setClauses(contract.clauses || DEFAULT_CONTRACT_CLAUSES);
    }
  }, [contract, isOpen]);

  if (!isOpen || !contract) return null;

  const totalAmount = services.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  const handleAddService = () => {
    setServices((prev) => [
      ...prev,
      {
        id: `srv-${Date.now()}`,
        name: 'Nuevo Servicio Personalizado',
        description: 'Detalle del alcance y responsabilidades',
        amount: 200,
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

  const handleClauseChange = (clauseId: string, field: 'title' | 'content', value: string) => {
    setClauses((prev) =>
      prev.map((cl) => (cl.id === clauseId ? { ...cl, [field]: value } : cl))
    );
  };

  const handleAddClause = () => {
    const nextNumber = clauses.length + 1;
    const newClause: ContractClause = {
      id: `cl-custom-${Date.now()}`,
      number: nextNumber,
      title: `NUEVA CONDICIÓN O ANEXO ${nextNumber}`,
      content: 'Escribe aquí las condiciones particulares o anexos específicos acordados.',
    };
    setClauses((prev) => [...prev, newClause]);
    setExpandedClauseId(newClause.id);
  };

  const handleDeleteClause = (clauseId: string) => {
    setClauses((prev) => prev.filter((cl) => cl.id !== clauseId));
  };

  const handleSave = () => {
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
        status: contract.payment_schedule[0]?.status || 'pending',
      },
      {
        id: 'pay-2',
        concept: 'Segundo pago (40 %)',
        percentage: 40,
        amount: secondPayment,
        due_date: contract.payment_schedule[1]?.due_date || 'A convenir',
        status: contract.payment_schedule[1]?.status || 'pending',
      },
      {
        id: 'pay-3',
        concept: 'Pago final (30 %)',
        percentage: 30,
        amount: finalPayment,
        due_date: contract.payment_schedule[2]?.due_date || '15 días antes de la boda',
        status: contract.payment_schedule[2]?.status || 'pending',
      },
    ];

    const updates: Partial<Contract> = {
      title,
      provider: {
        business_name: businessName,
        name: providerName,
        dni: providerDni,
        address: providerAddress,
        role_label: 'LA PROFESIONAL',
        phone: providerPhone,
        email: providerEmail,
        slogan: providerSlogan,
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
      event: {
        ...contract.event,
        wedding_date_display: weddingDate,
        guest_count_final: guestCount,
        ceremony_venue: ceremonyVenue,
        banquet_venue: banquetVenue,
      },
      services,
      total_amount: totalAmount,
      payment_schedule: paymentSchedule,
      bank_details: {
        account_holder: providerName,
        bank_name: providerBank,
        iban: providerIban,
        concept: `Reserva boda ${client1Name.split(' ')[0]} y ${client2Name.split(' ')[0]} – ${weddingDate}`,
        deposit_amount: depositAmount,
      },
      coordination_hours: coordinationHours,
      team_members_count: teamCount,
      mileage_rate: mileageRate,
      mileage_origin: mileageOrigin,
      clauses,
      primary_signer: {
        name: client2Name,
        email: client2Email,
        dni: client2Dni,
        role: 'LA PAREJA',
      },
    };

    onSave(contract.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-50">
                  Adaptar Contrato a tus Servicios
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {contract.code}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Personaliza tarifas, desglose de servicios contratados, cláusulas legales y datos bancarios
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

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 text-xs font-medium">
          {[
            { id: 'services', label: '1. Servicios & Honorarios', icon: Euro },
            { id: 'clauses', label: '2. Cláusulas (26 estándar)', icon: FileText },
            { id: 'planner', label: '3. Datos del Wedding Planner', icon: Building2 },
            { id: 'couple', label: '4. Pareja & Evento', icon: Users },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-3 px-3 text-center transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === t.id
                    ? 'border-primary text-primary font-bold bg-white dark:bg-zinc-900'
                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split('.')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB: SERVICIOS */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-gray-900 dark:text-zinc-100">
                    Desglose de Servicios Contratados
                  </h4>
                  <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                    Adapta las partidas de Wedding Planning, Coordinación, Diseño y extras según tu propuesta
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Servicio</span>
                </button>
              </div>

              {/* Service Rows */}
              <div className="space-y-3">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    <div className="flex-1 space-y-1.5 w-full">
                      <input
                        type="text"
                        value={srv.name}
                        onChange={(e) => handleServiceChange(srv.id, 'name', e.target.value)}
                        placeholder="Nombre del servicio (Ej: Coordinación del día de la boda)"
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold"
                      />
                      <textarea
                        rows={2}
                        value={srv.description || ''}
                        onChange={(e) => handleServiceChange(srv.id, 'description', e.target.value)}
                        placeholder="Alcance detallado del servicio..."
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] text-gray-600 dark:text-zinc-300 resize-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <div className="relative w-32">
                        <input
                          type="number"
                          value={srv.amount}
                          onChange={(e) => handleServiceChange(srv.id, 'amount', Number(e.target.value))}
                          className="w-full pr-8 pl-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-right"
                        />
                        <span className="absolute right-3 top-2 text-xs text-gray-400 font-bold">€</span>
                      </div>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(srv.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-primary block uppercase tracking-wider">
                    Total Final Contratado (Impuestos incluidos)
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Reserva 30% ({Math.round(totalAmount * 0.3)} €) + 40% ({Math.round(totalAmount * 0.4)} €) + 30% ({totalAmount - Math.round(totalAmount * 0.3) - Math.round(totalAmount * 0.4)} €)
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-primary">
                  {totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
                </span>
              </div>

              {/* Parámetros Operativos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Cobertura Presencial
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={coordinationHours}
                      onChange={(e) => setCoordinationHours(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-gray-400">horas</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Equipo Presencial
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={teamCount}
                      onChange={(e) => setTeamCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-gray-400">profesionales</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Tarifa Desplazamiento
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={mileageRate}
                      onChange={(e) => setMileageRate(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-gray-400">€/km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLÁUSULAS */}
          {activeTab === 'clauses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-gray-900 dark:text-zinc-100">
                    Cláusulas del Contrato ({clauses.length})
                  </h4>
                  <p className="text-gray-500 dark:text-zinc-400 text-[11px]">
                    Puedes modificar el texto de cualquier cláusula para adaptarla a tus servicios o añadir anexos específicos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddClause}
                  className="inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Cláusula</span>
                </button>
              </div>

              <div className="space-y-2">
                {clauses.map((cl) => {
                  const isExpanded = expandedClauseId === cl.id;
                  return (
                    <div
                      key={cl.id}
                      className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs"
                    >
                      <div
                        className="p-3.5 flex items-center justify-between bg-gray-50 dark:bg-zinc-800/40 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition-colors"
                        onClick={() => setExpandedClauseId(isExpanded ? null : cl.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary text-xs">
                            {cl.number}.
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100 text-xs">
                            {cl.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClause(cl.id);
                            }}
                            className="p-1 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                            title="Eliminar cláusula"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-3 border-t border-gray-100 dark:border-zinc-800 animate-fade-in">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">
                              Título de la cláusula
                            </label>
                            <input
                              type="text"
                              value={cl.title}
                              onChange={(e) => handleClauseChange(cl.id, 'title', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400">
                              Texto legal de la cláusula
                            </label>
                            <textarea
                              rows={5}
                              value={cl.content}
                              onChange={(e) => handleClauseChange(cl.id, 'content', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PLANNER */}
          {activeTab === 'planner' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <h4 className="font-serif text-base font-bold text-gray-900 dark:text-zinc-100">
                  Datos del Wedding Planner o Agencia
                </h4>
                {hasAnyData && (
                  <button
                    type="button"
                    onClick={() => {
                      if (profile.business_name) setBusinessName(profile.business_name);
                      if (profile.legal_name) setProviderName(profile.legal_name);
                      if (profile.nif_cif) setProviderDni(profile.nif_cif);
                      if (profile.address) setProviderAddress(profile.address);
                      if (profile.phone) setProviderPhone(profile.phone);
                      if (profile.email) setProviderEmail(profile.email);
                      if (profile.iban) setProviderIban(profile.iban);
                      if (profile.bank_name) setProviderBank(profile.bank_name);
                      if (profile.slogan) setProviderSlogan(profile.slogan);
                    }}
                    className="py-1 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer w-fit"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cargar datos desde mi perfil de cuenta</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Nombre Comercial / Estudio
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Profesional Titular / Autónomo
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    NIF / CIF Profesional
                  </label>
                  <input
                    type="text"
                    value={providerDni}
                    onChange={(e) => setProviderDni(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={providerPhone}
                    onChange={(e) => setProviderPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Domicilio Profesional
                  </label>
                  <input
                    type="text"
                    value={providerAddress}
                    onChange={(e) => setProviderAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Email de Notificaciones
                  </label>
                  <input
                    type="email"
                    value={providerEmail}
                    onChange={(e) => setProviderEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Entidad Bancaria
                  </label>
                  <input
                    type="text"
                    value={providerBank}
                    onChange={(e) => setProviderBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    IBAN Bancario para la Reserva y Pagos
                  </label>
                  <input
                    type="text"
                    value={providerIban}
                    onChange={(e) => setProviderIban(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: COUPLE */}
          {activeTab === 'couple' && (
            <div className="space-y-4">
              <h4 className="font-serif text-base font-bold text-gray-900 dark:text-zinc-100">
                Datos de la Pareja & Evento
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-2">
                  <strong className="block text-xs text-gray-900 dark:text-zinc-100">
                    Contratante 1
                  </strong>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={client1Name}
                    onChange={(e) => setClient1Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="DNI / NIE"
                    value={client1Dni}
                    onChange={(e) => setClient1Dni(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={client1Email}
                    onChange={(e) => setClient1Email(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200 dark:border-zinc-800 space-y-2">
                  <strong className="block text-xs text-gray-900 dark:text-zinc-100">
                    Contratante 2
                  </strong>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={client2Name}
                    onChange={(e) => setClient2Name(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="DNI / NIE"
                    value={client2Dni}
                    onChange={(e) => setClient2Dni(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={client2Email}
                    onChange={(e) => setClient2Email(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Domicilio para Notificaciones
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Fecha de la Boda
                  </label>
                  <input
                    type="text"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Estimación de Invitados
                  </label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Lugar de Ceremonia
                  </label>
                  <input
                    type="text"
                    value={ceremonyVenue}
                    onChange={(e) => setCeremonyVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    Lugar de Banquete / Celebración
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
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200 px-4 py-2 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary text-primary-text font-semibold text-xs py-2.5 px-6 rounded-xl hover:bg-primary-hover shadow-soft transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar y Actualizar Contrato</span>
          </button>
        </div>
      </div>
    </div>
  );
}
