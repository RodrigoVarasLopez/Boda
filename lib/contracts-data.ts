import { getStoredPlannerProfile, PlannerProfile } from './planner-profile-store';

// Types, default clauses, and initial contract data for Wedding Planner contracts

export type ContractStatus = 'draft' | 'sent' | 'opened' | 'partially_signed' | 'signed' | 'cancelled';
export type ContractType = 'simple_signature' | 'advanced_biometric';

export interface ContractSigner {
  id: string;
  name: string;
  dni: string;
  email: string;
  phone?: string;
  role_label: string;
  token: string;
  status: 'pending' | 'signed';
  signed_at?: string;
  signature_image_base64?: string;
  ip_address?: string;
  user_agent?: string;
  document_sha256?: string;
  signature_id?: string;
}

export interface ContractServiceItem {
  id: string;
  name: string;
  description?: string;
  amount: number;
}

export interface ContractPaymentSchedule {
  id: string;
  concept: string;
  percentage: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
}

export interface ContractBankDetails {
  account_holder: string;
  bank_name: string;
  iban: string;
  concept: string;
  deposit_amount: number;
}

export interface ContractPartyClient {
  name: string;
  dni: string;
  email: string;
  phone?: string;
}

export interface ContractProvider {
  name: string;
  dni: string;
  business_name: string;
  address: string;
  role_label: string;
  phone: string;
  email: string;
  slogan?: string;
}

export interface ContractEventDetails {
  wedding_date_display: string;
  wedding_date_iso: string;
  guest_count_min: number;
  guest_count_max: number;
  guest_count_final: number;
  ceremony_venue: string;
  ceremony_city: string;
  banquet_venue: string;
  banquet_city: string;
  scope_summary: string;
}

export interface ContractClause {
  id: string;
  number: number;
  title: string;
  content: string;
  subclauses?: {
    number: string;
    title: string;
    content: string;
  }[];
}

export interface ContractSignatureEvidence {
  signature_id: string;
  signed_at: string; // ISO 8601
  signer_name: string;
  signer_dni: string;
  signer_email: string;
  signer_role: string;
  signature_image_base64: string;
  signer_ip: string;
  signer_user_agent: string;
  document_sha256: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  reading_progress: number;
  legal_framework: string;
  verification_code: string;
}

export interface Contract {
  id: string; // Internal UUID or token
  code: string; // e.g. C-2026-0009
  wedding_id: string;
  planner_org_id?: string;
  title: string; // "CONTRATO WP RODRIGO Y STEPHANIE"
  document_title: string; // "CONTRATO DE PRESTACIÓN DE SERVICIOS"
  type: ContractType;
  type_label: string; // "Firma simple"
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  signing_token: string;
  signer_token: string;

  provider: ContractProvider;
  clients: ContractPartyClient[];
  client_address: string;
  client_role_label: string;

  event: ContractEventDetails;
  services: ContractServiceItem[];
  total_amount: number;
  currency: string;
  discount_notes?: string;
  travel_expenses_notes?: string;

  payment_schedule: ContractPaymentSchedule[];
  bank_details: ContractBankDetails;

  mileage_rate: number;
  mileage_origin: string;
  coordination_hours: number;
  team_members_count: number;

  clauses: ContractClause[];

  signers: ContractSigner[];
  expiration_date?: string;

  primary_signer: {
    name: string;
    email: string;
    dni: string;
    role: string;
  };

  signature_proof?: ContractSignatureEvidence;
}

export const STORAGE_KEY_CONTRACTS = 'boda_planner_contracts_v3';
export const CONTRACTS_UPDATE_EVENT = 'boda_contracts_updated';

export function applyProfileToContract(c: Contract, profile: PlannerProfile): Contract {
  return {
    ...c,
    provider: {
      name: profile.legal_name || '',
      dni: profile.nif_cif || '',
      business_name: profile.business_name || '',
      address: profile.address || '',
      role_label: profile.business_name ? `${profile.business_name} o EL/LA PROFESIONAL` : 'EL/LA PROFESIONAL',
      phone: profile.phone || '',
      email: profile.email || '',
      slogan: profile.slogan || '',
    },
    bank_details: {
      ...c.bank_details,
      account_holder: profile.account_holder || profile.legal_name || '',
      bank_name: profile.bank_name || '',
      iban: profile.iban || '',
    },
    mileage_rate: profile.mileage_rate || c.mileage_rate || 0.4,
    mileage_origin: profile.mileage_origin || c.mileage_origin || '',
  };
}

export function applyProfileToContractIfEmpty(c: Contract, profile: PlannerProfile): Contract {
  const isProviderEmpty = !c.provider?.name && !c.provider?.business_name && !c.provider?.dni;
  if (isProviderEmpty && (profile.legal_name || profile.business_name || profile.nif_cif)) {
    return applyProfileToContract(c, profile);
  }
  return c;
}

// 26 Comprehensive Legal Clauses based on standard Spanish Wedding Planning Law (eIDAS & Ley 6/2020)
export const DEFAULT_CONTRACT_CLAUSES: ContractClause[] = [
  {
    id: 'cl-1',
    number: 1,
    title: 'OBJETO DEL CONTRATO',
    content:
      'El objeto del presente contrato es la prestación por EL/LA PROFESIONAL de los servicios profesionales de Wedding Planning y diseño creativo contratados por LA PAREJA para la celebración de su boda.\n\nLos importes indicados son precios finales de los servicios contratados, con los impuestos legalmente aplicables incluidos.\n\nLos desplazamientos y cualquier servicio adicional no contemplados expresamente en este contrato se regularán mediante los correspondientes anexos o presupuestos aceptados por escrito.',
  },
  {
    id: 'cl-2',
    number: 2,
    title: 'COORDINACIÓN DEL DÍA DE LA BODA',
    content:
      'El servicio de coordinación garantiza el correcto desarrollo organizativo de la jornada y la sincronización de todos los proveedores contratados.',
    subclauses: [
      {
        number: '2.1',
        title: 'Preparación previa',
        content:
          'El servicio de coordinación comenzará entre dos y tres semanas antes de la boda. Durante este periodo, el equipo profesional realizará las siguientes funciones:\n• Reunión final de organización con LA PAREJA.\n• Recopilación de información sobre los proveedores contratados.\n• Contacto con los profesionales implicados para confirmar horarios, necesidades técnicas, accesos y responsabilidades.\n• Elaboración de un timing personalizado de la jornada.\n• Organización de la secuencia de la ceremonia religiosa o civil, respetando las indicaciones del espacio.\n• Planificación de las transiciones entre los diferentes espacios.\n• Organización de horarios e intervenciones de los proveedores.\n• Revisión de los momentos especiales, actuaciones y sorpresas.\n• Preparación de las indicaciones organizativas que resulten necesarias.\n\nDurante esta etapa, el equipo organizador actuará como interlocutor de los proveedores en las cuestiones relacionadas con la coordinación contratada.',
      },
      {
        number: '2.2',
        title: 'Coordinación de momentos especiales',
        content:
          'El servicio incluirá la coordinación de los momentos especiales comunicados por LA PAREJA e incorporados al timing definitivo. Entre ellos:\n• Grabación temática o preparativos: Coordinación de horarios y necesidades organizativas.\n• Fotografías al atardecer: Coordinación con el equipo de fotografía y vídeo para integrar la sesión en el timing.\n• Música y actuaciones: Organización de horarios y transiciones de los profesionales musicales.\n• Experiencias y sorpresas: Integración en el timing de fotomatón, cámaras analógicas, hora loca y sorpresas.\n• Banquete y celebración: Coordinación de momentos especiales, discursos, corte de tarta y baile.',
      },
      {
        number: '2.3',
        title: 'Equipo y cobertura presencial',
        content:
          'El servicio incluye la cobertura presencial por el equipo profesional acordado. La cobertura máxima presencial durante el día de la boda se refleja en este contrato. El horario concreto de inicio y finalización se acordará entre las partes y quedará reflejado en el timing definitivo. Las horas presenciales comenzarán con la llegada del equipo al primer espacio de trabajo acordado.',
      },
      {
        number: '2.4',
        title: 'Límites del servicio',
        content:
          'La coordinación no incluye: montaje ni desmontaje de decoración, fabricación o instalación de elementos, transporte de materiales de otros proveedores, labores propias del personal de hostelería o animación, ni presencia fuera de las horas acordadas.',
      },
    ],
  },
  {
    id: 'cl-3',
    number: 3,
    title: 'PLANIFICACIÓN PARCIAL Y ACOMPAÑAMIENTO ORGANIZATIVO',
    content:
      'Este servicio permitirá a LA PAREJA contar con asesoramiento profesional durante los meses anteriores a la celebración, complementando la coordinación final.',
    subclauses: [
      {
        number: '3.1',
        title: 'Organización de los preparativos',
        content:
          'El equipo profesional realizará: reunión inicial de revisión, identificación de tareas pendientes, elaboración de calendario de preparativos, asesoramiento sobre decisiones organizativas, apoyo en momentos especiales, reuniones de seguimiento acordadas y documento resumen de tareas.',
      },
      {
        number: '3.2',
        title: 'Planificación de experiencias',
        content:
          'Asesoramiento sobre viabilidad y organización de experiencias (grabación temática, animación, sorpresas, tiempos de fotografía). Comprende asesoramiento previo sin incluir producción ni medios técnicos directos.',
      },
      {
        number: '3.3',
        title: 'Búsqueda de proveedores pendientes',
        content:
          'Búsqueda en hasta tres categorías profesionales, contacto inicial para consultar disponibilidad y solicitud de hasta tres propuestas por categoría. La elección, contratación y pago de los proveedores corresponderán exclusivamente a LA PAREJA.',
      },
      {
        number: '3.4',
        title: 'Diferencia respecto a la coordinación',
        content:
          'La planificación parcial comprende el acompañamiento previo; la coordinación del día comprende el contacto organizativo final y la dirección operativa de la jornada. Son servicios complementarios sin duplicidad.',
      },
    ],
  },
  {
    id: 'cl-4',
    number: 4,
    title: 'DISEÑO CREATIVO INTEGRAL',
    content:
      'El Diseño Creativo Integral tiene como finalidad desarrollar un proyecto visual personalizado y coherente con la identidad, preferencias y estilo de LA PAREJA.',
    subclauses: [
      {
        number: '4.1',
        title: 'Conceptualización del proyecto',
        content:
          'Cuestionario creativo, reunión de diseño, concepto creativo, moodboard, paleta cromática, referencias florales y materiales, propuesta de estilo e identidad gráfica común, partiendo de la estética clásica y elegante (calas, velas, blancos, beiges y verdes).',
      },
      {
        number: '4.2',
        title: 'Diseño conceptual de espacios',
        content:
          'Propuestas decorativas individualizadas para la ceremonia religiosa, espacios de bienvenida y cóctel, y espacio del banquete.',
      },
      {
        number: '4.3',
        title: 'Diseño de rincones y experiencias',
        content:
          'Diseño conceptual de hasta tres rincones o experiencias especiales seleccionados conjuntamente.',
      },
      {
        number: '4.4',
        title: 'Diseño de papelería personalizada',
        content:
          'Diseño gráfico personalizado de minutas, meseros, seating plan, carteles de bienvenida, misales, etc. Entrega en archivos digitales listos para imprenta.',
      },
      {
        number: '4.5',
        title: 'Presentación del proyecto',
        content:
          'Dossier creativo digital con hasta dos rondas de ajustes sobre el diseño acordado.',
      },
      {
        number: '4.6',
        title: 'Producción y montaje',
        content:
          'Es un servicio de creación y diseño. No incluye compras físicas, impresión, alquiler ni floristería, que podrán contratarse por presupuestos independientes.',
      },
      {
        number: '4.7',
        title: 'Uso de los diseños',
        content:
          'LA PAREJA podrá utilizar los diseños para su boda. RITMOS conservará los derechos de autor que legalmente correspondan sobre sus creaciones originales.',
      },
    ],
  },
  {
    id: 'cl-5',
    number: 5,
    title: 'OBLIGACIONES DE LA PAREJA',
    content:
      'LA PAREJA se compromete a: facilitar información veraz y actualizada; comunicar los datos de contacto de todos los proveedores; informar de horarios y restricciones de los espacios; facilitar las aprobaciones necesarias; abonar los importes en los plazos fijados y facilitar el acceso del equipo a los espacios de trabajo.',
  },
  {
    id: 'cl-6',
    number: 6,
    title: 'PROVEEDORES EXTERNOS',
    content:
      'Los proveedores contratados por LA PAREJA mantendrán una relación contractual independiente. RITMOS no asume las obligaciones de terceros pero actuará con diligencia para coordinar y solucionar incidencias organizativas.',
  },
  {
    id: 'cl-7',
    number: 7,
    title: 'PRECIO TOTAL DEL CONTRATO',
    content:
      'El importe total de los servicios contratados asciende a MIL QUINIENTOS CINCUENTA EUROS (1.550,00 €), impuestos incluidos. No incluye desplazamientos, alojamientos ni horas extras no presupuestadas.',
  },
  {
    id: 'cl-8',
    number: 8,
    title: 'RESERVA DE FECHA Y FORMA DE PAGO',
    content:
      'Para formalizar la contratación y reservar la fecha del 28 de agosto de 2027, LA PAREJA deberá aceptar electrónicamente el presente contrato y efectuar el primer pago según el calendario estipulado: 30% a la formalización, 40% el 28 de abril de 2027 y 30% el 13 de agosto de 2027.',
  },
  {
    id: 'cl-9',
    number: 9,
    title: 'NATURALEZA DE LA RESERVA DE FECHA Y DATOS BANCARIOS',
    content:
      'El primer pago tiene la consideración de reserva de fecha y anticipo no reembolsable en la medida legalmente admisible, bloqueando en exclusiva la fecha en la agenda del profesional. El abono se efectuará mediante transferencia bancaria a la cuenta estipulada por el profesional.',
  },
  {
    id: 'cl-10',
    number: 10,
    title: 'DESPLAZAMIENTOS Y GASTOS ADICIONALES',
    content:
      'Los desplazamientos del equipo profesional se facturarán según la tarifa estipulada por kilómetro desde la localidad de origen acordada hasta los espacios del evento y su regreso, previa aceptación del anexo correspondiente.',
  },
  {
    id: 'cl-11',
    number: 11,
    title: 'MANUTENCIÓN OBLIGATORIA DEL EQUIPO PROFESIONAL',
    content:
      'Dado que la coordinación presencial abarca una jornada continuada, LA PAREJA garantizará manutención adecuada (menú de proveedores) y agua potable para las personas del equipo organizador presentes durante el servicio.',
  },
  {
    id: 'cl-12',
    number: 12,
    title: 'MODIFICACIONES Y SERVICIOS EXTRAORDINARIOS',
    content:
      'Cualquier ampliación de horario (más de 12 horas), personal extra o piezas no presupuestadas requerirá presupuesto previo y aceptación expresa por escrito.',
  },
  {
    id: 'cl-13',
    number: 13,
    title: 'CAMBIOS EN EL NÚMERO DE INVITADOS O EN LA CELEBRACIÓN',
    content:
      'El contrato se suscribe sobre una previsión de 150 a 170 invitados. Variaciones sustanciales que alteren gravemente la carga de coordinación podrán requerir revisión presupuestaria consensuada.',
  },
  {
    id: 'cl-14',
    number: 14,
    title: 'TIMING Y DESARROLLO DEL EVENTO',
    content:
      'RITMOS elaborará el timing en base a los proveedores. Las partes reconocen que pueden surgir ligeros desfases derivados de la meteorología, parroquia o desarrollo del banquete, actuando RITMOS con flexibilidad.',
  },
  {
    id: 'cl-15',
    number: 15,
    title: 'CANCELACIÓN POR PARTE DE LA PAREJA',
    content:
      'En caso de cancelación voluntaria por LA PAREJA, RITMOS retendrá el importe de reserva (30%) por el bloqueo de agenda y liquidará los trabajos y gastos devengados hasta la fecha.',
  },
  {
    id: 'cl-16',
    number: 16,
    title: 'CAMBIO DE FECHA',
    content:
      'El traslado a una nueva fecha estará condicionado a la disponibilidad de agenda de RITMOS. Si no hubiera disponibilidad, se aplicará el régimen de cancelación y liquidación.',
  },
  {
    id: 'cl-17',
    number: 17,
    title: 'IMPOSIBILIDAD DE PRESTACIÓN POR PARTE DE RITMOS',
    content:
      'Si sobreviniera imposibilidad justificada de prestación por parte de RITMOS, se propondrá sustitución por otra profesional cualificada o la devolución íntegra de importes no devengados.',
  },
  {
    id: 'cl-18',
    number: 18,
    title: 'FUERZA MAYOR Y CIRCUNSTANCIAS EXTRAORDINARIAS',
    content:
      'Ninguna parte responderá por causas de fuerza mayor imprevisibles o inevitables (emergencias, catástrofes, restricciones oficiales), actuando de buena fe para reorganizar los servicios.',
  },
  {
    id: 'cl-19',
    number: 19,
    title: 'RESPONSABILIDAD PROFESIONAL',
    content:
      'RITMOS responderá de sus propios actos u omisiones conforme a la diligencia debida, sin asumir las responsabilidades directas de proveedores externos independientes.',
  },
  {
    id: 'cl-20',
    number: 20,
    title: 'APROBACIÓN DE DISEÑOS Y ENTREGAS',
    content:
      'LA PAREJA deberá validar las propuestas dentro de plazos razonables. RITMOS facilitará artes finales digitales para imprenta, no respondiendo de errores de imprentas externas ajenas.',
  },
  {
    id: 'cl-21',
    number: 21,
    title: 'PROTECCIÓN DE DATOS PERSONALES (RGPD)',
    content:
      'Los datos personales facilitados serán tratados por EL/LA PROFESIONAL para la ejecución contractual y cumplimiento legal. Podrán comunicarse a proveedores implicados. Ejercicio de derechos en el correo electrónico oficial facilitado en este contrato.',
  },
  {
    id: 'cl-22',
    number: 22,
    title: 'IMÁGENES DEL EVENTO',
    content:
      'EL/LA PROFESIONAL podrá solicitar autorización expresa e independiente para la difusión de fotografías del evento en portfolio o redes sociales con fines estrictamente profesionales.',
  },
  {
    id: 'cl-23',
    number: 23,
    title: 'CONTRATACIÓN ELECTRÓNICA, SOLICITUD DE INICIO INMEDIATO Y DESISTIMIENTO',
    content:
      'El contrato se formaliza electrónicamente con plenas garantías. Mediante la firma, LA PAREJA formula solicitud expresa de inicio anticipado de los servicios conforme a la legislación de consumidores.',
  },
  {
    id: 'cl-24',
    number: 24,
    title: 'COMUNICACIONES Y ANEXOS',
    content:
      'Las comunicaciones formales y anexos se efectuarán por escrito (correo electrónico o plataforma BodaLab) gozando de plena validez contractual.',
  },
  {
    id: 'cl-25',
    number: 25,
    title: 'LEGISLACIÓN APLICABLE Y RESOLUCIÓN DE CONFLICTOS',
    content:
      'El contrato se rige por la legislación española. Para cualquier controversia, las partes se someterán a los juzgados y tribunales competentes conforme a la normativa de consumidores y usuarios.',
  },
  {
    id: 'cl-26',
    number: 26,
    title: 'ACEPTACIÓN DEL CONTRATO',
    content:
      'Mediante la aceptación electrónica en BodaLab, las partes manifiestan haber leído y comprendido íntegramente las condiciones, reconociendo el precio total de 1.550,00 € y su calendario de pagos.',
  },
];

// Initial real contract as requested in the user prompt:
export const INITIAL_CONTRACT_RODRIGO_STEPHANIE: Contract = {
  id: '8a2dedd2e4de83440d249692af09d9e780da69b234efae0709ba3bf77993582c',
  code: 'C-2026-0009',
  wedding_id: 'a0000000-0000-0000-0000-000000000001',
  planner_org_id: 'org-platform-default',
  title: 'CONTRATO WP RODRIGO Y STEPHANIE',
  document_title: 'CONTRATO DE PRESTACIÓN DE SERVICIOS',
  type: 'simple_signature',
  type_label: 'Firma simple',
  status: 'sent',
  created_at: '2026-04-15T10:00:00Z',
  updated_at: '2026-11-03T11:00:00Z',
  signing_token: '8a2dedd2e4de83440d249692af09d9e780da69b234efae0709ba3bf77993582c',
  signer_token: '5838ac21-c398-4559-9f2b-3eb261072768',

  provider: {
    name: '',
    dni: '',
    business_name: '',
    address: '',
    role_label: 'EL/LA PROFESIONAL',
    phone: '',
    email: '',
    slogan: '',
  },

  clients: [
    {
      name: 'Rodrigo Varas López',
      dni: '71944951P',
      email: 'rodrigovaraslopez@gmail.com',
      phone: '615 559 110',
    },
    {
      name: 'Stephanie Lizbeth Mendoza',
      dni: '61555911E',
      email: 'stephan1em@hotmail.com',
      phone: '630 123 456',
    },
  ],
  client_address: 'Calle Canalillo 4 , 2 B , 28028 Madrid, Madrid, España',
  client_role_label: 'LA PAREJA o LOS CONTRATANTES',

  event: {
    wedding_date_display: '28 de agosto de 2027',
    wedding_date_iso: '2027-08-28',
    guest_count_min: 150,
    guest_count_max: 170,
    guest_count_final: 168,
    ceremony_venue: 'Villamuriel de Cerrato (Palencia)',
    ceremony_city: 'Palencia',
    banquet_venue: 'Concejo Bodegas',
    banquet_city: 'Valoria la Buena, Valladolid',
    scope_summary: 'Coordinación del día de la boda, planificación parcial y diseño creativo integral.',
  },

  services: [
    {
      id: 'srv-1',
      name: 'Coordinación del día de la boda',
      description: 'Presencia de WP principal + asistente (12h de cobertura), timing y coordinación de proveedores.',
      amount: 980.0,
    },
    {
      id: 'srv-2',
      name: 'Planificación parcial y acompañamiento organizativo',
      description: 'Reuniones de seguimiento, calendario de preparativos y búsqueda de proveedores pendientes.',
      amount: 275.0,
    },
    {
      id: 'srv-3',
      name: 'Diseño Creativo Integral (precio especial por contratación conjunta)',
      description: 'Concepto visual, moodboard, paleta cromática, diseño de espacios, rincones y papelería personalizada.',
      amount: 295.0,
    },
  ],

  total_amount: 1550.0,
  currency: 'EUR',
  discount_notes:
    'El precio especial del Diseño Creativo Integral supone una reducción de 100 € respecto a su tarifa habitual de 395 €, concedida como atención comercial por la contratación conjunta de los servicios de Wedding Planning.',
  travel_expenses_notes:
    'Los desplazamientos del equipo profesional se facturarán según la tarifa estipulada por kilómetro desde la localidad de origen.',

  payment_schedule: [
    {
      id: 'pay-1',
      concept: 'Reserva de fecha (30 %)',
      percentage: 30,
      amount: 465.0,
      due_date: 'Al formalizar el contrato',
      status: 'pending',
    },
    {
      id: 'pay-2',
      concept: 'Segundo pago (40 %)',
      percentage: 40,
      amount: 620.0,
      due_date: '28 de abril de 2027',
      status: 'pending',
    },
    {
      id: 'pay-3',
      concept: 'Pago final (30 %)',
      percentage: 30,
      amount: 465.0,
      due_date: '13 de agosto de 2027',
      status: 'pending',
    },
  ],

  bank_details: {
    account_holder: '',
    bank_name: '',
    iban: '',
    concept: 'Reserva boda Rodrigo y Stephanie – 28/08/2027',
    deposit_amount: 465.0,
  },

  mileage_rate: 0.4,
  mileage_origin: '',
  coordination_hours: 12,
  team_members_count: 2,

  clauses: DEFAULT_CONTRACT_CLAUSES,

  expiration_date: '2 de diciembre de 2026',
  signers: [
    {
      id: 'signer-rodrigo',
      name: 'Rodrigo Varas López',
      dni: '71944951P',
      email: 'rodrigovaraslopez@gmail.com',
      phone: '615 559 110',
      role_label: 'Cliente',
      token: 'rodrigo-varas-token-2026',
      status: 'pending',
    },
    {
      id: 'signer-stephanie',
      name: 'Stephanie Lizbeth Mendoza',
      dni: '61555911E',
      email: 'stephan1em@hotmail.com',
      phone: '630 123 456',
      role_label: 'Cliente',
      token: '5838ac21-c398-4559-9f2b-3eb261072768',
      status: 'pending',
    },
  ],

  primary_signer: {
    name: 'Stephanie Lizbeth Mendoza',
    email: 'stephan1em@hotmail.com',
    dni: '61555911E',
    role: 'LA PAREJA',
  },
};

// Initial collection of contracts
export const INITIAL_CONTRACTS: Contract[] = [INITIAL_CONTRACT_RODRIGO_STEPHANIE];

// Helpers for reading/writing stored contracts
export function getStoredContracts(): Contract[] {
  if (typeof window === 'undefined') return INITIAL_CONTRACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTRACTS);
    const profile = getStoredPlannerProfile();
    if (!raw) {
      // First load: apply profile if planner has entered one in Account Settings, else it remains empty
      return INITIAL_CONTRACTS.map((c) => applyProfileToContractIfEmpty(c, profile));
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c: Contract) => {
        // Sanitize legacy mock data if previously stored in localStorage
        if (c.provider?.dni === '45688606A' || c.provider?.name?.includes('Sara Vara')) {
          return applyProfileToContract(c, profile);
        }
        return applyProfileToContractIfEmpty(c, profile);
      });
    }
  } catch (e) {
    console.error('Error reading contracts from localStorage:', e);
  }
  return INITIAL_CONTRACTS;
}

export function setStoredContracts(contracts: Contract[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONTRACTS, JSON.stringify(contracts));
    window.dispatchEvent(new CustomEvent(CONTRACTS_UPDATE_EVENT));
  } catch (e) {
    console.error('Error saving contracts to localStorage:', e);
  }
}

// Generate a deterministic or cryptographic SHA-256 string for legal audit
export async function computeDocumentHash(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback pseudo-hash if crypto is unavailable
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return 'sha256-mock-' + Math.abs(hash).toString(16).padStart(64, '0');
}
