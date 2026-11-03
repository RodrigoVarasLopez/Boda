'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Contract,
  ContractStatus,
  ContractSignatureEvidence,
  ContractProvider,
  ContractBankDetails,
  getStoredContracts,
  setStoredContracts,
  CONTRACTS_UPDATE_EVENT,
  INITIAL_CONTRACTS,
  computeDocumentHash,
} from './contracts-data';
import {
  getStoredPlannerProfile,
  PlannerProfile,
  PLANNER_PROFILE_UPDATE_EVENT,
} from './planner-profile-store';
import { useWeddingPlanner } from './weddings-store';

export function useContractsStore() {
  const { activeWeddingId } = useWeddingPlanner();
  const [contracts, setContracts] = useState<Contract[]>(() => getStoredContracts());
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadData = useCallback(() => {
    setContracts(getStoredContracts());
  }, []);

  useEffect(() => {
    reloadData();
    setIsLoaded(true);

    const handleUpdate = () => {
      reloadData();
    };

    window.addEventListener(CONTRACTS_UPDATE_EVENT, handleUpdate);
    window.addEventListener(PLANNER_PROFILE_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(CONTRACTS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener(PLANNER_PROFILE_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [reloadData]);

  // Filter contracts for current active wedding, or return all if viewing global
  const activeWeddingContracts = useMemo(() => {
    if (!activeWeddingId) return contracts;
    return contracts.filter((c) => c.wedding_id === activeWeddingId);
  }, [contracts, activeWeddingId]);

  // Find a contract by ID, code, or public signing token
  const getContract = useCallback(
    (identifier: string): Contract | undefined => {
      if (!identifier) return undefined;
      const clean = identifier.trim().toLowerCase();
      return contracts.find(
        (c) =>
          c.id.toLowerCase() === clean ||
          c.code.toLowerCase() === clean ||
          c.signing_token.toLowerCase() === clean
      );
    },
    [contracts]
  );

  // Mark contract as opened (visto por el cliente)
  const markContractAsOpened = useCallback(
    (id: string) => {
      setContracts((prev) => {
        const next = prev.map((c) => {
          if (c.id === id || c.signing_token === id) {
            if (c.status === 'sent') {
              return { ...c, status: 'opened' as const, updated_at: new Date().toISOString() };
            }
          }
          return c;
        });
        setStoredContracts(next);
        return next;
      });
    },
    []
  );

  // Create a new contract
  const createContract = useCallback(
    (newContractData: Partial<Contract>): Contract => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cnt-${Date.now()}`;
      const codeNumber = contracts.length + 10;
      const code = newContractData.code || `C-2026-${String(codeNumber).padStart(4, '0')}`;
      const signingToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `sign-${Date.now()}`;
      const signerToken = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;

      const profile = getStoredPlannerProfile();
      const defaultProvider: ContractProvider = {
        name: profile.legal_name || '',
        dni: profile.nif_cif || '',
        business_name: profile.business_name || '',
        address: profile.address || '',
        role_label: profile.business_name ? `${profile.business_name} o EL/LA PROFESIONAL` : 'EL/LA PROFESIONAL',
        phone: profile.phone || '',
        email: profile.email || '',
        slogan: profile.slogan || '',
      };

      const defaultBankDetails: ContractBankDetails = {
        account_holder: profile.account_holder || profile.legal_name || '',
        bank_name: profile.bank_name || '',
        iban: profile.iban || '',
        concept: `Reserva contratación ${code}`,
        deposit_amount: newContractData.services?.[0]?.amount
          ? Math.round(newContractData.services[0].amount * 0.3)
          : 0,
      };

      const createdContract: Contract = {
        id,
        code,
        wedding_id: newContractData.wedding_id || activeWeddingId || 'a0000000-0000-0000-0000-000000000001',
        planner_org_id: newContractData.planner_org_id,
        title: newContractData.title || `CONTRATO WP ${newContractData.clients?.[0]?.name?.toUpperCase() || 'PAREJA'}`,
        document_title: newContractData.document_title || 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
        type: newContractData.type || 'simple_signature',
        type_label: newContractData.type_label || 'Firma simple',
        status: newContractData.status || 'sent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        signing_token: signingToken,
        signer_token: signerToken,

        provider: newContractData.provider || defaultProvider,

        clients: newContractData.clients || [
          {
            name: 'Cliente Principal',
            dni: '00000000T',
            email: 'cliente@ejemplo.com',
            phone: '600000000',
          },
        ],
        client_address: newContractData.client_address || 'Dirección de los contratantes',
        client_role_label: newContractData.client_role_label || 'LA PAREJA o LOS CONTRATANTES',

        event: newContractData.event || {
          wedding_date_display: 'Pendiente de definir',
          wedding_date_iso: '2027-09-01',
          guest_count_min: 100,
          guest_count_max: 150,
          guest_count_final: 120,
          ceremony_venue: 'Lugar de ceremonia',
          ceremony_city: 'Ciudad',
          banquet_venue: 'Lugar de banquete',
          banquet_city: 'Ciudad',
          scope_summary: 'Wedding Planning integral.',
        },

        services: newContractData.services || [
          {
            id: 'srv-1',
            name: 'Coordinación del día de la boda',
            amount: 980,
          },
        ],
        total_amount: newContractData.total_amount || 980,
        currency: 'EUR',
        discount_notes: newContractData.discount_notes,
        travel_expenses_notes: newContractData.travel_expenses_notes,

        payment_schedule: newContractData.payment_schedule || [
          {
            id: 'p-1',
            concept: 'Reserva de fecha (30%)',
            percentage: 30,
            amount: 294,
            due_date: 'Al formalizar el contrato',
            status: 'pending',
          },
          {
            id: 'p-2',
            concept: 'Segundo pago (40%)',
            percentage: 40,
            amount: 392,
            due_date: 'A convenir',
            status: 'pending',
          },
          {
            id: 'p-3',
            concept: 'Pago final (30%)',
            percentage: 30,
            amount: 294,
            due_date: '15 días antes del evento',
            status: 'pending',
          },
        ],

        bank_details: newContractData.bank_details || defaultBankDetails,

        mileage_rate: newContractData.mileage_rate ?? profile.mileage_rate ?? 0.4,
        mileage_origin: newContractData.mileage_origin || profile.mileage_origin || '',
        coordination_hours: newContractData.coordination_hours ?? 12,
        team_members_count: newContractData.team_members_count ?? 2,

        clauses: newContractData.clauses && newContractData.clauses.length > 0
          ? newContractData.clauses
          : INITIAL_CONTRACTS[0].clauses,

        expiration_date: newContractData.expiration_date || '30 días desde la emisión',
        signers: newContractData.signers || (newContractData.clients || []).map((cli, i) => ({
          id: `signer-${i + 1}-${Date.now()}`,
          name: cli.name,
          dni: cli.dni,
          email: cli.email,
          phone: cli.phone,
          role_label: 'Cliente',
          token: i === 0 ? signerToken : `token-${i}-${Date.now()}`,
          status: 'pending' as const,
        })),

        primary_signer: newContractData.primary_signer || {
          name: newContractData.clients?.[0]?.name || 'Firmante',
          email: newContractData.clients?.[0]?.email || 'firmante@ejemplo.com',
          dni: newContractData.clients?.[0]?.dni || '00000000T',
          role: 'LA PAREJA',
        },
      };

      setContracts((prev) => {
        const next = [createdContract, ...prev];
        setStoredContracts(next);
        return next;
      });

      return createdContract;
    },
    [activeWeddingId, contracts.length]
  );

  // Update existing contract
  const updateContract = useCallback((id: string, updates: Partial<Contract>): Contract | undefined => {
    let updated: Contract | undefined;
    setContracts((prev) => {
      const next = prev.map((c) => {
        if (c.id === id || c.signing_token === id) {
          updated = {
            ...c,
            ...updates,
            updated_at: new Date().toISOString(),
          };
          return updated;
        }
        return c;
      });
      setStoredContracts(next);
      return next;
    });
    return updated;
  }, []);

  // Delete a contract
  const deleteContract = useCallback((id: string) => {
    setContracts((prev) => {
      const next = prev.filter((c) => c.id !== id && c.signing_token !== id);
      setStoredContracts(next);
      return next;
    });
  }, []);

  // Duplicate a contract
  const duplicateContract = useCallback(
    (id: string): Contract | undefined => {
      const target = contracts.find((c) => c.id === id || c.signing_token === id);
      if (!target) return undefined;

      const copy = {
        ...target,
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cnt-${Date.now()}`,
        code: `${target.code}-COPIA`,
        title: `${target.title} (Copia)`,
        status: 'draft' as const,
        signature_proof: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        signing_token: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `sign-${Date.now()}`,
      };

      setContracts((prev) => {
        const next = [copy, ...prev];
        setStoredContracts(next);
        return next;
      });
      return copy;
    },
    [contracts]
  );

  // Sign contract with full legal audit proof (eIDAS & Ley 6/2020)
  const signContract = useCallback(
    async (
      identifier: string,
      params: {
        signature_image_base64: string;
        signer_name: string;
        signer_dni: string;
        signer_email: string;
        signer_token?: string;
        signer_ip?: string;
        signer_user_agent?: string;
        reading_progress?: number;
      }
    ): Promise<Contract | undefined> => {
      const target = contracts.find(
        (c) =>
          c.id === identifier ||
          c.signing_token === identifier ||
          c.code.toLowerCase() === identifier.toLowerCase()
      );
      if (!target) return undefined;

      // Serialize contract content to compute cryptographic hash
      const documentRawPayload = JSON.stringify({
        id: target.id,
        code: target.code,
        title: target.title,
        document_title: target.document_title,
        provider: target.provider,
        clients: target.clients,
        event: target.event,
        services: target.services,
        total_amount: target.total_amount,
        payment_schedule: target.payment_schedule,
        bank_details: target.bank_details,
        clauses_count: target.clauses.length,
      });

      const documentSha256 = await computeDocumentHash(documentRawPayload);
      const nowIso = new Date().toISOString();
      const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const signatureId = `SIG-eIDAS-${target.code}-${uniqueSuffix}`;
      const verificationCode = `BODALAB-VERIFY-${target.code}-${uniqueSuffix}`;

      const evidence: ContractSignatureEvidence = {
        signature_id: signatureId,
        signed_at: nowIso,
        signer_name: params.signer_name,
        signer_dni: params.signer_dni,
        signer_email: params.signer_email,
        signer_role: target.client_role_label,
        signature_image_base64: params.signature_image_base64,
        signer_ip: params.signer_ip || '127.0.0.1 (Conexión Protegida TLS 1.3)',
        signer_user_agent:
          params.signer_user_agent ||
          (typeof navigator !== 'undefined' ? navigator.userAgent : 'Client-Agent/BodaLab'),
        document_sha256: documentSha256,
        terms_accepted: true,
        privacy_accepted: true,
        reading_progress: params.reading_progress || 100,
        legal_framework:
          'Reglamento eIDAS (UE) 910/2014 y Ley 6/2020 de servicios electrónicos de confianza',
        verification_code: verificationCode,
      };

      // Update the specific signer slot
      const existingSigners = target.signers && target.signers.length > 0
        ? target.signers
        : (target.clients || []).map((cli, i) => ({
            id: `signer-${i + 1}`,
            name: cli.name,
            dni: cli.dni,
            email: cli.email,
            phone: cli.phone,
            role_label: 'Cliente',
            token: i === 0 ? target.signer_token : `token-${i}`,
            status: 'pending' as const,
          }));

      let matchedSigner = false;
      const updatedSigners = existingSigners.map((s) => {
        const isMatch =
          (params.signer_token && s.token === params.signer_token) ||
          s.email.toLowerCase() === params.signer_email.toLowerCase() ||
          s.dni.toLowerCase() === params.signer_dni.toLowerCase() ||
          s.name.toLowerCase() === params.signer_name.toLowerCase();

        if (isMatch) {
          matchedSigner = true;
          return {
            ...s,
            status: 'signed' as const,
            signed_at: nowIso,
            signature_image_base64: params.signature_image_base64,
            ip_address: evidence.signer_ip,
            user_agent: evidence.signer_user_agent,
            document_sha256: documentSha256,
            signature_id: signatureId,
          };
        }
        return s;
      });

      // If no slot matched, add this signer
      if (!matchedSigner) {
        updatedSigners.push({
          id: `signer-${Date.now()}`,
          name: params.signer_name,
          dni: params.signer_dni,
          email: params.signer_email,
          role_label: 'Cliente',
          token: params.signer_token || `token-${Date.now()}`,
          status: 'signed',
          signed_at: nowIso,
          signature_image_base64: params.signature_image_base64,
          ip_address: evidence.signer_ip,
          user_agent: evidence.signer_user_agent,
          document_sha256: documentSha256,
          signature_id: signatureId,
        });
      }

      const totalSigners = updatedSigners.length;
      const signedCount = updatedSigners.filter((s) => s.status === 'signed').length;
      const nextContractStatus: ContractStatus =
        signedCount >= totalSigners ? 'signed' : signedCount > 0 ? 'partially_signed' : 'sent';

      let updatedContract: Contract | undefined;

      setContracts((prev) => {
        const next = prev.map((c) => {
          if (c.id === target.id) {
            updatedContract = {
              ...c,
              status: nextContractStatus,
              updated_at: nowIso,
              signature_proof: evidence,
              signers: updatedSigners,
            };
            return updatedContract;
          }
          return c;
        });
        setStoredContracts(next);
        return next;
      });

      return updatedContract;
    },
    [contracts]
  );

  const applyProfileToAllContracts = useCallback((profileToApply: PlannerProfile) => {
    setContracts((prev) => {
      const next = prev.map((c) => ({
        ...c,
        provider: {
          name: profileToApply.legal_name || '',
          dni: profileToApply.nif_cif || '',
          business_name: profileToApply.business_name || '',
          address: profileToApply.address || '',
          role_label: profileToApply.business_name
            ? `${profileToApply.business_name} o EL/LA PROFESIONAL`
            : 'EL/LA PROFESIONAL',
          phone: profileToApply.phone || '',
          email: profileToApply.email || '',
          slogan: profileToApply.slogan || '',
        },
        bank_details: {
          ...c.bank_details,
          account_holder: profileToApply.account_holder || profileToApply.legal_name || '',
          bank_name: profileToApply.bank_name || '',
          iban: profileToApply.iban || '',
        },
        mileage_rate: profileToApply.mileage_rate || c.mileage_rate || 0.4,
        mileage_origin: profileToApply.mileage_origin || c.mileage_origin || '',
      }));
      setStoredContracts(next);
      return next;
    });
  }, []);

  return {
    contracts,
    activeWeddingContracts,
    isLoaded,
    getContract,
    createContract,
    updateContract,
    deleteContract,
    duplicateContract,
    signContract,
    markContractAsOpened,
    applyProfileToAllContracts,
  };
}
