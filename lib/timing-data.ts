import {
  TimingMilestone,
  TimingPhase,
  TimingDay,
  ProfessionalRole,
} from './types';

export const STORAGE_KEY_TIMING_MILESTONES = 'boda_timing_milestones_v1';
export const TIMING_UPDATE_EVENT = 'boda_timing_updated';
export const DEFAULT_WEDDING_UUID = 'a0000000-0000-0000-0000-000000000001';

// Helper to convert HH:mm into minutes from 06:00 AM (so 00:00 - 05:59 count as next day / night of party)
export function parseOperationalMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const adjustedHours = h < 6 ? h + 24 : h;
  return adjustedHours * 60 + m;
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function shiftTimeStr(timeStr: string, deltaMinutes: number): string {
  if (!deltaMinutes) return timeStr;
  const mins = parseOperationalMinutes(timeStr);
  return formatMinutesToHHMM(mins + deltaMinutes);
}

export function getDurationMinutes(startTime: string, endTime: string): number {
  const start = parseOperationalMinutes(startTime);
  const end = parseOperationalMinutes(endTime);
  return Math.max(0, end - start);
}

export function formatDurationEs(minutes: number): string {
  if (minutes <= 0) return '0 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

// ==========================================
// INITIAL DETAILED RUN-OF-SHOW (CRONOGRAMA)
// ==========================================

export const INITIAL_TIMING_MILESTONES: TimingMilestone[] = [
  // VIERNES: PREBODA
  {
    id: 'tm-fri-01',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'friday',
    phase: 'preboda',
    start_time: '20:00',
    end_time: '23:30',
    buffer_minutes: 15,
    title: 'Cobertura Preboda & Bienvenida en Bodega El Corro',
    location: 'Bodega El Corro · Villamuriel de Cerrato (junto a la esclusa del Canal de Castilla)',
    status: 'ready',
    is_critical_moment: false,
    what_happens:
      'Llegada progresiva de familiares y amigos cercanos. Cobertura documental natural de abrazos, reencuentros, descorche de los primeros vinos y picoteo tradicional en la cueva-bodega. Breves palabras de bienvenida de Rodrigo y Stephanie hacia las 21:30 h.',
    coverage_notes:
      'Luz cálida de interior de bodega + luz de atardecer en el exterior junto al Canal de Castilla (20:30 - 21:15 h ideal para fotos informales de pareja y grupos de amigos).',
    professionals: [
      {
        id: 'prof-fri-1',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Reportaje documental de bienvenida, fotos espontáneas y retrato de pareja al atardecer en la esclusa.',
      },
      {
        id: 'prof-fri-2',
        role: 'catering_finca',
        name: 'Responsable Bodega El Corro',
        action: 'Apertura de bodega, estaciones de vino y picoteo castellano.',
      },
    ],
    checklist: [
      {
        id: 'chk-fri-1',
        task: 'Confirmar número final de asistentes a Preboda y mesas de apoyo',
        responsible: 'Rodrigo & Stephanie',
        completed: true,
      },
      {
        id: 'chk-fri-2',
        task: 'Lista de reproducción de música ambiente en altavoz portátil preparada',
        responsible: 'Rodrigo',
        completed: true,
      },
      {
        id: 'chk-fri-3',
        task: 'Cierre puntual a las 23:30 h para descansar cara al gran día',
        responsible: 'Padrinos / Testigos',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'Citar a los proveedores 20 minutos antes (19:40 h) y realizar las fotos de pareja con luz natural nada más llegar (20:15 h) antes de que la bodega esté al completo.',
    common_risks:
      'Alargar en exceso la noche del viernes afectando el descanso y los horarios de maquillaje del sábado por la mañana.',
    lead_coordinator: 'Rodrigo & Stephanie',
    sort_order: 1,
  },

  // SÁBADO: GRAN DÍA
  {
    id: 'tm-sat-01',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'preparativos_novio',
    start_time: '10:15',
    end_time: '11:00',
    buffer_minutes: 10,
    title: 'Preparativos del Novio (Rodrigo) & Detalles',
    location: 'Domicilio / Suite del Novio (Palencia / Villamuriel)',
    status: 'ready',
    is_critical_moment: false,
    what_happens:
      'Fotografía y vídeo de los detalles del novio (traje/chaqué, gemelos, reloj, zapatos, perfume y solapa floral). A continuación, Rodrigo se viste acompañado de su madre/padrino y hermanos. Brindis rápido y salida hacia la iglesia.',
    coverage_notes:
      'Habitación principal despejada, con máxima luz natural entrando por la ventana. El novio debe estar en camisa y pantalón o listo para empezar a vestirse cuando entra el equipo.',
    professionals: [
      {
        id: 'prof-sat-1a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Bodegón de complementos (10 min), puesta de chaqueta/corbata/gemelos con familiares (25 min) y retratos individuales (10 min).',
      },
      {
        id: 'prof-sat-1b',
        role: 'floristeria',
        name: 'Floristería Oficial',
        action: 'Entrega previa de prendidos (boutonnières) del novio y padrino.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-1a',
        task: 'Traje planchado en percha de madera (sin fundas de plástico)',
        responsible: 'Rodrigo',
        completed: true,
      },
      {
        id: 'chk-sat-1b',
        task: 'Reloj, gemelos, cinturón, zapatos, calcetines y perfume agrupados en una bandeja',
        responsible: 'Rodrigo',
        completed: true,
      },
      {
        id: 'chk-sat-1c',
        task: 'Alianzas y arras verificadas y guardadas en el bolsillo del responsable',
        responsible: 'Madrina / Testigo',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'Los familiares que ayudan a vestir al novio deben estar YA vestidos y listos a las 10:15 h (nunca vestirse después del novio). Habitación recogida sin maletas ni bolsas a la vista.',
    common_risks:
      'No saber hacer el nudo de la corbata o colocar el prendido en el último minuto (dejar corbata pre-anudada o practicar el día anterior).',
    lead_coordinator: 'Madrina / Hermano',
    sort_order: 2,
  },
  {
    id: 'tm-sat-02',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'preparativos_novia',
    start_time: '11:15',
    end_time: '12:20',
    buffer_minutes: 15,
    title: 'Preparativos de la Novia (Stephanie), Ramo y Vestido',
    location: 'Suite / Domicilio de la Novia',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '11:15 h: Bodegón de detalles (vestido colgado, zapatos, pendientes, perfume, invitación y ramo). 11:30 h: Últimos retoques de maquillaje y peluquería en bata. 11:45 h: Colocación del vestido con madre y damas/hermanas. 12:05 h: First look con padre/familiares, colocación del velo y retratos finales antes de salir.',
    coverage_notes:
      'Momento de altísima carga emocional. Mantener en la habitación únicamente a las personas que ayudan a vestir a Stephanie para garantizar calma, orden y planos limpios.',
    professionals: [
      {
        id: 'prof-sat-2a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Cobertura de detalles, retoques finales de maquillaje, puesta del vestido, reacción familiar y retratos de novia.',
      },
      {
        id: 'prof-sat-2b',
        role: 'maquillaje_peluqueria',
        name: 'Estilismo, Maquillaje & Peluquería',
        action: 'Finalizar maquillaje a las 11:35 h (hacer último toque de labial y fijador para cámara) y ayudar con colocación del velo.',
      },
      {
        id: 'prof-sat-2c',
        role: 'floristeria',
        name: 'Floristería Oficial',
        action: 'Entrega del ramo de novia y réplicas antes de las 11:00 h con tallos secados.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-2a',
        task: 'Vestido de novia fuera de la funda en percha estética + bata de preparativos lista',
        responsible: 'Stephanie',
        completed: true,
      },
      {
        id: 'chk-sat-2b',
        task: 'Zapatos (sin pegatinas en la suela), joyas, tocado, perfume e invitación juntos',
        responsible: 'Stephanie',
        completed: true,
      },
      {
        id: 'chk-sat-2c',
        task: 'Aguja, hilo blanco, imperdibles, pañuelos y kit de retoque en bolso de mano',
        responsible: 'Madre / Dama de honor',
        completed: false,
      },
      {
        id: 'chk-sat-2d',
        task: 'Madre y personas que abrochan el vestido vestidas ANTES de las 11:30 h',
        responsible: 'Familia Novia',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'REGLA DE ORO: Maquillaje y peluquería deben pactarse para terminar 15 minutos antes de vestirse (11:35 h). La madre/hermana que abrocha el vestido debe estar completamente vestida y maquillada antes de que Stephanie se quite la bata. Si el vestido lleva botonadura larga, tener un ganchillo a mano.',
    common_risks:
      'Retraso acumulado en peluquería de invitadas en la misma casa (el estilista debe priorizar a la novia y a su madre) o visitas imprevistas a la habitación.',
    lead_coordinator: 'Madre de la Novia / Wedding Planner',
    sort_order: 3,
  },
  {
    id: 'tm-sat-03',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'traslados_llegadas',
    start_time: '12:20',
    end_time: '12:55',
    buffer_minutes: 10,
    title: 'Recepción de Invitados, Llegada del Novio y Entrada a la Iglesia',
    location: 'Iglesia de Santa María la Mayor · Villamuriel de Cerrato',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '12:20 h: Llegada de autobuses de invitados y recepción en el pórtico por parte de Rodrigo y la madrina. 12:45 h: Todos los invitados toman asiento dentro del templo; Rodrigo y la madrina se colocan junto al altar. 12:55 h: Llegada del coche nupcial con Stephanie y el padrino.',
    coverage_notes:
      'El equipo de foto y vídeo necesita que el pasillo central quede completamente despejado a las 12:50 h para captar la reacción de Rodrigo en el altar y la entrada de Stephanie sin móviles invadiendo el pasillo.',
    professionals: [
      {
        id: 'prof-sat-3a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Saludos del novio en el exterior, planos generales del templo decorado y posicionamiento en altar + puerta para la entrada.',
      },
      {
        id: 'prof-sat-3b',
        role: 'transporte',
        name: 'Autocares Oficiales & Coche Nupcial',
        action: 'Descarga de invitados en parada de Villamuriel (12:20 h) y llegada del coche de novia a la puerta del templo (12:55 h).',
      },
      {
        id: 'prof-sat-3c',
        role: 'musica_ceremonia',
        name: 'Música de Ceremonia / Cuerda',
        action: 'Música ambiental durante la entrada de invitados y pieza solemne para el cortejo del novio y entrada de la novia.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-3a',
        task: 'Bancos de las 2 primeras filas reservados para padres, hermanos y testigos',
        responsible: 'Testigos / Coordinador',
        completed: true,
      },
      {
        id: 'chk-sat-3b',
        task: 'Lecturas impresas colocadas en el atril con letra grande',
        responsible: 'Lectores',
        completed: false,
      },
      {
        id: 'chk-sat-3c',
        task: 'Encargado de pedir a los invitados que entren al templo a las 12:45 h',
        responsible: 'Hermano / Testigo',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'Nombrar a 2 amigos/familiares ("acomodadores") que a las 12:42 h inviten amablemente a todo el mundo a entrar en la iglesia para que la fachada quede despejada antes de que llegue el coche de Stephanie.',
    common_risks:
      'Invitados esperando en la puerta exterior bloqueando la bajada del coche de la novia o entrando detrás de ella.',
    lead_coordinator: 'Coordinador de Ceremonia / Testigos',
    sort_order: 4,
  },
  {
    id: 'tm-sat-04',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'ceremonia',
    start_time: '13:00',
    end_time: '13:55',
    buffer_minutes: 5,
    title: 'Ceremonia Religiosa, Intercambio de Alianzas y Firmas',
    location: 'Iglesia de Santa María la Mayor · Villamuriel de Cerrato',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      'Entrada de Stephanie del brazo del padrino, encuentro en el altar, liturgia de la palabra (2 lecturas), consentimiento, intercambio de alianzas y arras, bendición nupcial y firmas del acta matrimonial con los testigos.',
    coverage_notes:
      'Caminar despacio hacia el altar mirando al frente (no al suelo). Durante el intercambio de anillos, colocar las manos ligeramente de perfil hacia el altar/cámaras para no tapar el gesto.',
    professionals: [
      {
        id: 'prof-sat-4a',
        role: 'oficiante',
        name: 'Párroco / Sacerdote Oficiante',
        action: 'Dirección de la ceremonia religiosa y acta matrimonial.',
      },
      {
        id: 'prof-sat-4b',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Cobertura multicámara discreta de entrada, lecturas, votos/alianzas, comunión y firmas.',
      },
      {
        id: 'prof-sat-4c',
        role: 'musica_ceremonia',
        name: 'Música de Ceremonia',
        action: 'Interpretación de repertorio acordado en entrada, aleluya, anillos, comunión y firmas.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-4a',
        task: 'DNIs de los novios y testigos de firma listos si los requiere la parroquia',
        responsible: 'Testigos',
        completed: true,
      },
      {
        id: 'chk-sat-4b',
        task: 'Alianzas sueltas (sin nudos duros en el bastidor/porta-alianzas)',
        responsible: 'Padrino / Portador de anillos',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'Llamar a los testigos de firma en un orden preestablecido justo al terminar la bendición para que la firma dure 5 minutos en lugar de 15.',
    common_risks:
      'Anillos atados con doble nudo en el bastidor (dejar una lazada simple o cajita abierta) o testigos dispersos por los bancos traseros en el momento de firmar.',
    lead_coordinator: 'Sacerdote & Testigo Principal',
    sort_order: 5,
  },
  {
    id: 'tm-sat-05',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'salida_reportaje',
    start_time: '13:55',
    end_time: '14:30',
    buffer_minutes: 10,
    title: 'Gran Salida de los Novios (Arroz y Pétalos) + Fotos de Familia',
    location: 'Pórtico de la Iglesia de Villamuriel de Cerrato & Traslado',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '13:55 h: Los invitados salen primero formando un pasillo en la puerta de la iglesia mientras los novios esperan 3 minutos dentro. 14:00 h: Salida triunfal bajo lluvia de arroz y pétalos (con parada y beso a mitad del pasillo). 14:10 h: Fotos rápidas organizadas por lista con familia directa antes de subir a los autobuses.',
    coverage_notes:
      '¡Momento icónico! Al salir por el arco de la iglesia, caminar despacio, disfrutar de la lluvia de pétalos/arroz y detenerse a mitad del pasillo para un beso largo.',
    professionals: [
      {
        id: 'prof-sat-5a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Ráfaga de salida de novios, abrazos espontáneos y ejecución ágil del listado de fotos de familia.',
      },
      {
        id: 'prof-sat-5b',
        role: 'transporte',
        name: 'Autocares Oficiales',
        action: 'Puertas abiertas desde las 14:15 h para subida progresiva de invitados rumbo a Bodega Concejo (Valoria la Buena).',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-5a',
        task: 'Cestas de arroz, pétalos naturales y cañones de confeti en la puerta de salida',
        responsible: 'Amigos encargados de salida',
        completed: true,
      },
      {
        id: 'chk-sat-5b',
        task: 'Lista numerada de 8-10 fotos de familia impresa en mano del coordinador familiar',
        responsible: 'Coordinador Familiar (1 de cada familia)',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'Los novios NO salen inmediatamente detrás del último invitado: esperan 3 minutos dentro del templo hasta que el fotógrafo confirme que todo el pasillo exterior está formado con el arroz en la mano. Para las fotos de grupo, usar lista cerrada (máx. 8-10 grupos) llamada por un familiar con voz potente.',
    common_risks:
      'Embotellamiento de saludos individuales en la puerta de la iglesia que retrasa 30 minutos la salida de los autobuses hacia Bodega Concejo.',
    lead_coordinator: 'Encargados de Arroz & Coordinador Familiar',
    sort_order: 6,
  },
  {
    id: 'tm-sat-06',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'salida_reportaje',
    start_time: '14:30',
    end_time: '15:15',
    buffer_minutes: 10,
    title: 'Traslado a Bodega Concejo & Sesión de Pareja (1ª Parte)',
    location: 'Trayecto Villamuriel → Valoria la Buena & Viñedos Bodega Concejo',
    status: 'ready',
    is_critical_moment: false,
    what_happens:
      '14:30 - 14:55 h: Traslado por carretera (~25 min) de autobuses y coche nupcial hacia Bodega Concejo. Mientras los invitados son recibidos con copa de bienvenida en los jardines, Rodrigo y Stephanie realizan un primer bloque ágil de 20 minutos de fotos y vídeo de pareja en los viñedos y sala de barricas antes de entrar al cóctel.',
    coverage_notes:
      'Dividir el reportaje de pareja en dos bloques cortos (20 min ahora + 15 min al atardecer/Golden Hour) permite que los novios disfruten casi todo el cóctel con sus invitados.',
    professionals: [
      {
        id: 'prof-sat-6a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Sesión natural de pareja en entorno de bodega y viñedos sin restar tiempo al cóctel.',
      },
      {
        id: 'prof-sat-6b',
        role: 'catering_finca',
        name: 'Dirección de Eventos Bodega Concejo',
        action: 'Recepción de autobuses, guardarropa y estación de bebidas de bienvenida para los invitados.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-6a',
        task: 'Agua fría y zapatos planos de apoyo en el coche de los novios para caminar por viñedo',
        responsible: 'Conductor / Novios',
        completed: false,
      },
      {
        id: 'chk-sat-6b',
        task: 'Bandeja de aperitivos y bebida reservada por el maître para los novios antes de entrar',
        responsible: 'Maître Bodega Concejo',
        completed: true,
      },
    ],
    anti_delay_protocol:
      'Los autobuses salen de Villamuriel como máximo a las 14:35 h con un responsable por autobús verificando plazas. Sesión de pareja cronometrada a 20 minutos exactos.',
    common_risks:
      'Alargar la sesión de fotos exterior dejando a los novios sin disfrutar del cóctel ni probar los aperitivos.',
    lead_coordinator: 'Maître Bodega Concejo & Fotógrafo Principal',
    sort_order: 7,
  },
  {
    id: 'tm-sat-07',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'coctel',
    start_time: '15:15',
    end_time: '16:45',
    buffer_minutes: 10,
    title: 'Entrada Triunfal al Cóctel, Aperitivos y Fotos con Amigos',
    location: 'Jardines y Patio de Bodega Concejo · Valoria la Buena',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '15:15 h: Entrada animada de Rodrigo y Stephanie al cóctel con canción elegida y brindis inaugural. Degustación de estaciones gastronómicas y vinos de la bodega, música en directo/ambiente, saludos relajados y fotos espontáneas con grupos de amigos.',
    coverage_notes:
      'El equipo captura el ambiente gastronómico, la decoración floral del cóctel, el seating plan y las reacciones de los invitados.',
    professionals: [
      {
        id: 'prof-sat-7a',
        role: 'catering_finca',
        name: 'Catering & Equipo Bodega Concejo',
        action: 'Pase de aperitivos fríos/calientes, estaciones en vivo y camarero asignado en exclusiva a los novios.',
      },
      {
        id: 'prof-sat-7b',
        role: 'dj_sonido',
        name: 'DJ / Música Cóctel',
        action: 'Sonorización de la entrada al cóctel y sesión musical durante los aperitivos.',
      },
      {
        id: 'prof-sat-7c',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Fotografía del salón vacío montado (antes de que entren invitados) y reportaje social del cóctel.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-7a',
        task: 'Canción de entrada al cóctel validada con el DJ y Maître',
        responsible: 'Rodrigo & Stephanie',
        completed: true,
      },
      {
        id: 'chk-sat-7b',
        task: 'Salón del banquete 100% montado a las 16:15 h para fotografiar decoración limpia',
        responsible: 'Decoración & Maître',
        completed: true,
      },
    ],
    anti_delay_protocol:
      'A las 16:30 h (15 minutos antes del final del cóctel) el maître y la música bajan volumen e invitan a los comensales a consultar el Seating Plan e ir pasando al salón principal, dejando a los novios fuera para su gran entrada.',
    common_risks:
      'El paso del cóctel al salón suele demorarse 20-25 minutos si no se avisa por megafonía suave con antelación.',
    lead_coordinator: 'Maître Bodega Concejo',
    sort_order: 8,
  },
  {
    id: 'tm-sat-08',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'banquete_entregas',
    start_time: '16:45',
    end_time: '19:45',
    buffer_minutes: 15,
    title: 'Gran Entrada al Salón, Banquete, Brindis y Entregas Especiales',
    location: 'Salón Principal · Bodega Concejo',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '16:45 h: Todos los invitados en pie con servilletas al aire para la entrada de Rodrigo y Stephanie al salón. 17:00 h: Servicio de entrante y plato principal. 18:30 h: Postre y bloque coordinado de entregas (ramos a madres/abuelas, detalle a amigos/próximos novios y corte de tarta / brindis). 19:30 h: Café, licores y discursos breves.',
    coverage_notes:
      'Agrupar las entregas en 1 o 2 bloques (por ejemplo, entre plato principal y postre, y tras el postre) con las canciones preparadas en orden evita parones constantes de cocina y mantiene la energía altísima.',
    professionals: [
      {
        id: 'prof-sat-8a',
        role: 'catering_finca',
        name: 'Maître & Cocina Bodega Concejo',
        action: 'Sincronización de tiempos de cocina con los cortes musicales de entradas y entregas.',
      },
      {
        id: 'prof-sat-8b',
        role: 'dj_sonido',
        name: 'DJ & Técnico de Sonido',
        action: 'Disparo de canciones exactas (entrada salón, cada entrega y corte de tarta) y micrófonos inalámbricos para discursos.',
      },
      {
        id: 'prof-sat-8c',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Cobertura de entrada, reacciones en entregas y discursos con grabación de audio directo de mesa.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-8a',
        task: 'Todos los regalos y ramos de entrega etiquetados con nombre y orden junto al DJ/Maître',
        responsible: 'Maître / Wedding Planner',
        completed: true,
      },
      {
        id: 'chk-sat-8b',
        task: 'Escaleta de canciones de entregas en pendrive de respaldo y probada con DJ',
        responsible: 'Rodrigo',
        completed: false,
      },
      {
        id: 'chk-sat-8c',
        task: 'Menús especiales (alergias, veganos, celíacos, infantiles) y mesa de proveedores confirmados',
        responsible: 'Maître Bodega Concejo',
        completed: true,
      },
    ],
    anti_delay_protocol:
      'CRÍTICO: No iniciar ninguna entrega ni discurso sorpresa sin avisar 2 minutos antes al fotógrafo/videógrafo y al técnico de sonido (que están coordinados con cocina). Limitar los discursos a 3-4 minutos por persona con micrófono siempre encendido.',
    common_risks:
      'Invitados que se levantan a fumar justo antes de las entregas o entregas improvisadas cuando el equipo técnico está cambiando baterías.',
    lead_coordinator: 'Maître & DJ',
    sort_order: 9,
  },
  {
    id: 'tm-sat-09',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'salida_reportaje',
    start_time: '19:45',
    end_time: '20:05',
    buffer_minutes: 5,
    title: 'Escapada Golden Hour (15 min de Luz Dorada en Viñedos)',
    location: 'Viñedos Exteriores · Bodega Concejo',
    status: 'pending',
    is_critical_moment: true,
    what_happens:
      'Aprovechando el momento del café/sobremesa mientras los invitados pasan a la zona de baile, Rodrigo y Stephanie salen 15 minutos con el equipo de foto y vídeo para capturar las fotos más espectaculares del día con el sol cayendo sobre los viñedos de Valoria la Buena.',
    coverage_notes:
      'A finales de agosto el sol cae sobre las 20:45 h, por lo que el tramo 19:45 - 20:15 h ofrece una luz dorada cinematográfica irrepetible.',
    professionals: [
      {
        id: 'prof-sat-9a',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Sesión rápida de 15 minutos en Golden Hour (retratos editoriales y planos de dron/movimiento).',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-9a',
        task: 'Retoque rápido de labial y brillo facial antes de salir al viñedo',
        responsible: 'Stephanie / Dama de honor',
        completed: false,
      },
    ],
    anti_delay_protocol:
      'El fotógrafo avisa a los novios en el momento exacto en que la luz está en su punto óptimo; al durar solo 15 minutos, los invitados ni siquiera notan la ausencia durante el café.',
    common_risks:
      'Si el banquete acumula retraso, este bloque puede moverse 15 minutos incluso entre dos platos antes del postre para no perder la puesta de sol.',
    lead_coordinator: 'Fotógrafo Principal',
    sort_order: 10,
  },
  {
    id: 'tm-sat-10',
    wedding_id: DEFAULT_WEDDING_UUID,
    day: 'saturday',
    phase: 'baile_fiesta',
    start_time: '20:10',
    end_time: '23:30',
    buffer_minutes: 15,
    title: 'Baile Nupcial, Bengalas / Pirotecnia, Fiesta y Fin de Cobertura',
    location: 'Zona de Baile & Terraza · Bodega Concejo',
    status: 'ready',
    is_critical_moment: true,
    what_happens:
      '20:10 h: Pasillo o corro de invitados con bengalas alrededor de la pista. Primer baile de Rodrigo y Stephanie (y baile con padrinos). 20:20 h: Apertura oficial de la barra libre, cabina DJ a máxima potencia, hora loca / recena y cobertura de los primeros 45-60 minutos de fiesta desatada hasta el cierre de nuestra cobertura profesional. Autobuses de regreso escalonados hacia Villamuriel y Palencia.',
    coverage_notes:
      'Durante los primeros 45 minutos de barra libre se consiguen las mejores fotos de fiesta (la gente está con toda la energía, el maquillaje intacto y la pista llena).',
    professionals: [
      {
        id: 'prof-sat-10a',
        role: 'dj_sonido',
        name: 'DJ Principal & Estación DJ',
        action: 'Iluminación de pista, humo bajo/efectos para el baile nupcial y sesión de fiesta.',
      },
      {
        id: 'prof-sat-10b',
        role: 'pirotecnia_efectos',
        name: 'Efectos Especiales / Pirotecnia',
        action: 'Coordinación de fuego frío / bengalas o espectáculo exterior autorizado.',
      },
      {
        id: 'prof-sat-10c',
        role: 'foto_video',
        name: 'Equipo Fotografía & Vídeo',
        action: 'Cobertura del baile nupcial con iluminación externa, apertura de pista, hora loca y despedida final del equipo.',
      },
      {
        id: 'prof-sat-10d',
        role: 'transporte',
        name: 'Autocares de Regreso',
        action: 'Salidas programadas de vuelta a Villamuriel de Cerrato y Palencia.',
      },
    ],
    checklist: [
      {
        id: 'chk-sat-10a',
        task: 'Bengalas largas y mecheros de soplete repartidos entre 6 amigos para encender rápido',
        responsible: 'Amigos encargados',
        completed: false,
      },
      {
        id: 'chk-sat-10b',
        task: 'Alpargatas, accesorios de fiesta / hora loca y recena listos para salir a pista',
        responsible: 'Personal Bodega Concejo',
        completed: true,
      },
      {
        id: 'chk-sat-10c',
        task: 'Horarios de los autobuses de vuelta anunciados por el DJ 15 min antes de cada salida',
        responsible: 'DJ & Coordinador de Autobuses',
        completed: true,
      },
    ],
    anti_delay_protocol:
      'Para las bengalas del primer baile, usar mecheros tipo soplete y que 6 amigos enciendan las bengalas desde varios puntos a la vez (si se encienden una a una con un mechero normal, las primeras se apagan antes de que empiece la canción).',
    common_risks:
      'Demorar la apertura de la barra libre tras el postre: el baile debe arrancar en cuanto los invitados salgan del salón para mantener el ritmo alto.',
    lead_coordinator: 'DJ, Maître & Equipo Foto/Vídeo',
    sort_order: 11,
  },
];

// ==========================================
// METRICS & SMART CONFLICT DETECTOR
// ==========================================

export interface TimingConflictAlert {
  id: string;
  severity: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  milestoneId?: string;
}

export interface TimingMetrics {
  totalMilestones: number;
  saturdayCount: number;
  fridayCount: number;
  criticalMomentsCount: number;
  totalChecklistItems: number;
  completedChecklistItems: number;
  checklistCompletionPercent: number;
  totalBufferMinutes: number;
  uniqueProfessionalsCount: number;
  coverageSpanLabel: string;
  totalCoverageHoursLabel: string;
  alerts: TimingConflictAlert[];
}

export function calculateTimingMetrics(
  milestones: TimingMilestone[],
  timeShiftMinutes: number = 0
): TimingMetrics {
  const totalMilestones = milestones.length;
  const fridayList = milestones
    .filter((m) => m.day === 'friday')
    .sort((a, b) => parseOperationalMinutes(a.start_time) - parseOperationalMinutes(b.start_time));
  const saturdayList = milestones
    .filter((m) => m.day === 'saturday')
    .sort((a, b) => parseOperationalMinutes(a.start_time) - parseOperationalMinutes(b.start_time));

  const criticalMomentsCount = milestones.filter((m) => m.is_critical_moment).length;

  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  let totalBufferMinutes = 0;
  const profRolesAndNames = new Set<string>();

  for (const m of milestones) {
    totalBufferMinutes += Number(m.buffer_minutes) || 0;
    for (const c of m.checklist || []) {
      totalChecklistItems += 1;
      if (c.completed) completedChecklistItems += 1;
    }
    for (const p of m.professionals || []) {
      profRolesAndNames.add(`${p.role}:${p.name.toLowerCase().trim()}`);
    }
  }

  const checklistCompletionPercent =
    totalChecklistItems > 0
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
      : 100;

  let coverageSpanLabel = '10:15 h — 23:30 h';
  let totalCoverageHoursLabel = '13h 15m';

  if (saturdayList.length > 0) {
    const firstStart = shiftTimeStr(saturdayList[0].start_time, timeShiftMinutes);
    const lastEnd = shiftTimeStr(
      saturdayList[saturdayList.length - 1].end_time,
      timeShiftMinutes
    );
    coverageSpanLabel = `${firstStart} h — ${lastEnd} h`;
    const spanMins = Math.max(
      0,
      parseOperationalMinutes(lastEnd) - parseOperationalMinutes(firstStart)
    );
    totalCoverageHoursLabel = formatDurationEs(spanMins);
  }

  // Generate smart operational alerts
  const alerts: TimingConflictAlert[] = [];

  // 1. Check Saturday overlaps or zero-buffer tight transitions
  for (let i = 0; i < saturdayList.length - 1; i++) {
    const curr = saturdayList[i];
    const next = saturdayList[i + 1];
    const currEnd = parseOperationalMinutes(curr.end_time);
    const nextStart = parseOperationalMinutes(next.start_time);

    if (currEnd > nextStart) {
      alerts.push({
        id: `overlap-${curr.id}-${next.id}`,
        severity: 'warning',
        title: `Solapamiento horario detectado (${curr.end_time} vs ${next.start_time})`,
        description: `El bloque "${curr.title}" termina a las ${curr.end_time} h, pero "${next.title}" comienza a las ${next.start_time} h. Ajusta los horarios o utiliza el margen de seguridad.`,
        milestoneId: next.id,
      });
    }
  }

  // 2. Check critical moments with pending checklist items
  const criticalWithPending = milestones.filter(
    (m) => m.is_critical_moment && m.checklist.some((c) => !c.completed)
  );
  if (criticalWithPending.length > 0) {
    const pendingTasksCount = criticalWithPending.reduce(
      (acc, m) => acc + m.checklist.filter((c) => !c.completed).length,
      0
    );
    alerts.push({
      id: 'critical-checklist-pending',
      severity: 'info',
      title: `${pendingTasksCount} preparativos pendientes en momentos clave`,
      description: `Hay detalles por verificar en ${criticalWithPending.length} momentos críticos (ej. ${criticalWithPending[0].title}). Revisa las casillas de preparación para evitar imprevistos.`,
      milestoneId: criticalWithPending[0].id,
    });
  }

  // 3. Buffer health summary
  if (totalBufferMinutes >= 60) {
    alerts.push({
      id: 'buffer-healthy',
      severity: 'success',
      title: `Colchón anti-retrasos blindado (+${totalBufferMinutes} min acumulados)`,
      description:
        'Vuestro cronograma cuenta con márgenes de absorción entre bloques para absorber pequeños imprevistos sin afectar la luz del reportaje ni el inicio del banquete.',
    });
  } else {
    alerts.push({
      id: 'buffer-low',
      severity: 'warning',
      title: `Margen de absorción ajustado (${totalBufferMinutes} min en total)`,
      description:
        'Recomendamos mantener al menos 10-15 minutos de colchón en los preparativos de la novia y en la salida de la iglesia.',
    });
  }

  return {
    totalMilestones,
    saturdayCount: saturdayList.length,
    fridayCount: fridayList.length,
    criticalMomentsCount,
    totalChecklistItems,
    completedChecklistItems,
    checklistCompletionPercent,
    totalBufferMinutes,
    uniqueProfessionalsCount: profRolesAndNames.size,
    coverageSpanLabel,
    totalCoverageHoursLabel,
    alerts,
  };
}

// ==========================================
// LOCAL STORAGE MULTI-WEDDING PERSISTENCE
// ==========================================

function getCurrentTimingWeddingId(): string {
  if (typeof window === 'undefined') return DEFAULT_WEDDING_UUID;
  try {
    return localStorage.getItem('boda_planner_active_wedding_id_v3') || DEFAULT_WEDDING_UUID;
  } catch {
    return DEFAULT_WEDDING_UUID;
  }
}

function getScopedTimingKey(): string {
  const wid = getCurrentTimingWeddingId();
  return wid === DEFAULT_WEDDING_UUID
    ? STORAGE_KEY_TIMING_MILESTONES
    : `${STORAGE_KEY_TIMING_MILESTONES}__${wid}`;
}

export function getStoredTimingMilestones(): TimingMilestone[] {
  if (typeof window === 'undefined') return INITIAL_TIMING_MILESTONES;
  try {
    const raw = localStorage.getItem(getScopedTimingKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored timing milestones:', e);
  }
  return INITIAL_TIMING_MILESTONES;
}

export function setStoredTimingMilestones(milestones: TimingMilestone[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getScopedTimingKey(), JSON.stringify(milestones));
    window.dispatchEvent(new CustomEvent(TIMING_UPDATE_EVENT));
  } catch (e) {
    console.warn('Error saving stored timing milestones:', e);
  }
}
