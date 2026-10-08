import { Wedding, GuestGroup, Event, CMSBlock, GuestBookEntry, MediaPhoto, GroupRSVPSubmission } from './types';

export const INITIAL_WEDDING: Wedding = {
  id: 'w-stephanie-rodrigo-2027',
  slug: 'stephanie-y-rodrigo',
  couple_names: 'Stephanie & Rodrigo',
  bride_name: 'Stephanie',
  groom_name: 'Rodrigo',
  wedding_date: '2027-08-28T18:00:00.000Z',
  location_summary: 'Bodega Concejo · Valoria la Buena (Valladolid)',
  theme: 'mediterranean',
  privacy_mode: false,
  rsvp_deadline: '2027-07-20T23:59:59.000Z',
  hero_message: 'Nos casamos y no nos imaginaríamos este día sin vosotros',
  welcome_quote: 'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas entre viñedos, música en directo y los mejores vinos de nuestra tierra.',
  iban_details: {
    account_holder: 'Stephanie & Rodrigo',
    iban: 'ES91 2100 0418 4502 0005 1234',
    bank_name: 'CaixaBank',
    bic_swift: 'CAIXESBBXXX'
  }
};

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-preboda-cata',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Preboda & Cata Privada de Vinos',
    description: 'Una velada íntima de bienvenida en la bodega de Rodrigo. Paseo entre viñedos, visita guiada a la sala de barricas y cata de vinos con maridaje para nuestros amigos más cercanos.',
    start_time: '2027-08-27T19:30:00.000Z',
    end_time: '2027-08-27T23:30:00.000Z',
    location_name: 'Bodega de Rodrigo',
    address: 'Ctra. Valoria, 47200 Valoria La Buena (Valladolid)',
    google_maps_url: 'https://maps.google.com/?q=Valoria+La+Buena+Valladolid',
    dress_code: 'Casual Chic / Elegante desenfadado entre viñedos',
    visibility: 'selected_groups',
    display_order: 1,
    day: 'friday',
    day_label: 'Viernes · Preboda & Cata Privada',
    image_url: '/images/bodega/cata-vino-burro-loco.png'
  },
  {
    id: 'evt-ceremonia',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Ceremonia',
    description: 'El "sí, quiero" civil al aire libre rodeados de viñedos y arquitectura vinícola tradicional de Bodega Concejo.',
    start_time: '2027-08-28T18:00:00.000Z',
    end_time: '2027-08-28T19:00:00.000Z',
    location_name: 'Bodega Concejo · Jardín de Viñedos',
    address: 'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
    google_maps_url: 'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
    dress_code: 'Formal / Traje o chaqueta y vestido midi o largo',
    visibility: 'everyone',
    display_order: 2,
    day: 'saturday',
    day_label: 'Sábado · El Gran Día',
    image_url: '/images/bodega/vinedos-valoria-barrica.png'
  },
  {
    id: 'evt-banquete',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Banquete al Aire Libre con Música',
    description: 'Cóctel y cena al aire libre en la terraza de la bodega con vistas a los viñedos, música en directo y maridaje con los vinos de autor de la bodega.',
    start_time: '2027-08-28T19:30:00.000Z',
    end_time: '2027-08-28T23:30:00.000Z',
    location_name: 'Bodega Concejo · Terraza Exterior & Viñedos',
    address: 'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
    google_maps_url: 'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
    dress_code: 'Formal',
    visibility: 'everyone',
    display_order: 3,
    day: 'saturday',
    day_label: 'Sábado · El Gran Día',
    image_url: '/images/bodega/bodega-concejo-banquete-noche.png'
  },
  {
    id: 'evt-fiesta-dj',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Fiesta, DJ & Barra Libre',
    description: 'Sesión con DJ en directo, barra libre de cócteles y vinos de Bodega Concejo, recena y fiesta bajo las estrellas.',
    start_time: '2027-08-28T23:30:00.000Z',
    end_time: '2027-08-29T05:00:00.000Z',
    location_name: 'Bodega Concejo · Pabellón Acristalado & Terraza',
    address: 'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
    google_maps_url: 'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
    dress_code: '¡Prepárate para bailar hasta el amanecer!',
    visibility: 'everyone',
    display_order: 4,
    day: 'saturday',
    day_label: 'Sábado · El Gran Día',
    image_url: '/images/bodega/bodega-concejo-fachada-logo.png'
  }
];

export const INITIAL_GROUPS: GuestGroup[] = [];

export const INITIAL_RSVPS: GroupRSVPSubmission[] = [];

export const INITIAL_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'block-hero',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'hero',
    title: 'Stephanie & Rodrigo',
    subtitle: '28 · 08 · 2027 · Bodega Concejo, Valladolid',
    content: {
      location: 'Bodega Concejo',
      date: '28 · 08 · 2027',
      image: '/images/bodega/bodega-concejo-banquete-noche.png'
    },
    display_order: 1,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-story',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'story',
    title: 'Nuestra Historia',
    subtitle: '01 · NOSOTROS',
    content: {
      paragraphs: [
        'Nuestra historia comenzó entre risas, complicidad y una pasión compartida por nuestra tierra, la gastronomía y el buen vino.',
        'Nos hace una ilusión inmensa dar el "sí, quiero" rodeados de nuestra gente en un entorno tan mágico y personal como los viñedos de Bodega Concejo.'
      ],
      image: '/images/bodega/vinedos-valoria-barrica.png'
    },
    display_order: 2,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-venue',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'venue',
    title: 'El Lugar',
    subtitle: 'Bodega Concejo',
    content: {
      description: 'Enclavada en Valoria la Buena (Valladolid), Bodega Concejo es una bodega familiar rodeada de viñedos centenarios donde celebraremos la ceremonia civil al aire libre, el banquete con música en directo y la fiesta nocturna.',
      address: 'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
      google_maps_url: 'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
      image: '/images/bodega/bodega-concejo-banquete-noche.png'
    },
    display_order: 3,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-travel',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'travel',
    title: 'Alojamiento & Transporte',
    subtitle: 'Para vuestra mayor comodidad',
    content: {
      hotels: [
        { name: 'Posada Real Concejo', discount: 'Alojamiento boutique en la propia bodega / Valoria', distance: 'En el propio complejo' },
        { name: 'Hoteles en Valladolid Capital (AC Palacio de Santa Ana / Olid)', discount: 'Tarifa especial invitados: STEPHANIE&RODRIGO', distance: 'A 25 min en autobús' }
      ],
      bus_info: 'Habrá servicio de autobuses de ida y vuelta desde Valladolid centro (Plaza de Zorrilla) hasta Bodega Concejo para la boda y con varios turnos de regreso tras la fiesta.'
    },
    display_order: 4,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-registry',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'registry',
    title: 'Lista de Bodas',
    subtitle: 'Vuestra presencia es nuestro mayor regalo',
    content: {
      message: 'Vuestra compañía es lo más importante para nosotros. Si deseáis hacernos un detalle para nuestra luna de miel:',
      iban: 'ES91 2100 0418 4502 0005 1234',
      account_holder: 'Stephanie & Rodrigo'
    },
    display_order: 5,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-faq',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'faq',
    title: 'Preguntas Frecuentes',
    subtitle: 'Detalles prácticos para el fin de semana',
    content: {
      faqs: [
        { question: '¿Cuál es el dress code recomendado?', answer: 'Viernes (preboda): Casual Chic entre viñedos. Sábado (boda): Formal / traje o vestido midi o largo.' },
        { question: '¿Habrá opciones para alergias y dietas especiales?', answer: 'Por supuesto. En el formulario RSVP de tu invitación puedes indicar cualquier alergia o dieta (vegetariana, celíaca, etc.) y adaptaremos tu menú.' },
        { question: '¿Hay aparcamiento en la bodega?', answer: 'Sí, Bodega Concejo cuenta con amplio aparcamiento privado gratuito para los invitados que vengan en coche.' }
      ]
    },
    display_order: 6,
    is_active: true,
    visibility: 'everyone'
  }
];

export const INITIAL_GUESTBOOK: GuestBookEntry[] = [];

export const INITIAL_MEDIA: MediaPhoto[] = [];

