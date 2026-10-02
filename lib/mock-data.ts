import { Wedding, GuestGroup, Event, CMSBlock, GuestBookEntry, MediaPhoto, GroupRSVPSubmission } from './types';

export const INITIAL_WEDDING: Wedding = {
  id: 'w-laura-rodrigo-2026',
  slug: 'laura-y-rodrigo',
  couple_names: 'Laura & Rodrigo',
  bride_name: 'Laura',
  groom_name: 'Rodrigo',
  wedding_date: '2026-06-20T17:30:00.000Z',
  location_summary: 'Finca El Olivar, Madrid',
  theme: 'editorial',
  privacy_mode: false,
  rsvp_deadline: '2026-05-15T23:59:59.000Z',
  hero_message: 'Nos casamos y no nos imaginaríamos este día sin ti',
  welcome_quote: 'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas en un entorno único.',
  iban_details: {
    account_holder: 'Laura Mateo & Rodrigo Gómez',
    iban: 'ES91 2100 0418 4502 0005 1234',
    bank_name: 'CaixaBank',
    bic_swift: 'CAIXESBBXXX'
  }
};

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-welcome-dinner',
    wedding_id: 'w-laura-rodrigo-2026',
    title: 'Cena de Bienvenida',
    description: 'Una velada íntima de bienvenida para familia directa y testigos antes del gran día.',
    start_time: '2026-06-19T20:30:00.000Z',
    end_time: '2026-06-19T23:30:00.000Z',
    location_name: 'Restaurante El Jardín Secreto',
    address: 'Calle Mayor 14, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Restaurante+El+Jardin+Secreto+Madrid',
    dress_code: 'Smart Casual / Elegante desenfadado',
    visibility: 'selected_groups',
    display_order: 1
  },
  {
    id: 'evt-ceremony',
    wedding_id: 'w-laura-rodrigo-2026',
    title: 'Ceremonia',
    description: 'Intercambio de votos al aire libre rodeados de los olivos centenarios.',
    start_time: '2026-06-20T17:30:00.000Z',
    end_time: '2026-06-20T18:30:00.000Z',
    location_name: 'Finca El Olivar - Los Olivos',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Finca+El+Olivar+Colmenar',
    dress_code: 'Formal / Traje de chaqueta y vestido de cóctel o largo',
    visibility: 'everyone',
    display_order: 2
  },
  {
    id: 'evt-cocktail-banquet',
    wedding_id: 'w-laura-rodrigo-2026',
    title: 'Cóctel & Banquete',
    description: 'Aperitivos gourmet en el claustro y cena gastronómica bajo las estrellas.',
    start_time: '2026-06-20T18:30:00.000Z',
    end_time: '2026-06-20T22:30:00.000Z',
    location_name: 'Finca El Olivar - Claustro Principal',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Finca+El+Olivar+Colmenar',
    dress_code: 'Formal',
    visibility: 'everyone',
    display_order: 3
  },
  {
    id: 'evt-party',
    wedding_id: 'w-laura-rodrigo-2026',
    title: 'Fiesta & Barra Libre',
    description: 'Música en directo, DJ y barra libre hasta el amanecer.',
    start_time: '2026-06-20T22:30:00.000Z',
    end_time: '2026-06-21T05:00:00.000Z',
    location_name: 'Finca El Olivar - Pabellón de Cristal',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Finca+El+Olivar+Colmenar',
    dress_code: '¡Prepárate para bailar!',
    visibility: 'everyone',
    display_order: 4
  },
  {
    id: 'evt-brunch',
    wedding_id: 'w-laura-rodrigo-2026',
    title: 'Brunch de Recarga',
    description: 'Desayuno relajado en la piscina para comentar los mejores momentos de la boda.',
    start_time: '2026-06-21T12:00:00.000Z',
    end_time: '2026-06-21T16:00:00.000Z',
    location_name: 'Piscina de la Finca El Olivar',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Finca+El+Olivar+Colmenar',
    dress_code: 'Resort Wear / Traje de baño',
    visibility: 'selected_groups',
    display_order: 5
  }
];

export const INITIAL_GROUPS: GuestGroup[] = [
  {
    id: 'grp-familia-garcia',
    wedding_id: 'w-laura-rodrigo-2026',
    name: 'Familia García Mateo',
    token: 'token-garcia-772',
    invitation_status: 'opened',
    opened_at: '2026-09-28T10:15:00.000Z',
    custom_message: '¡Tíos querida! Nos hace una ilusión inmensa teneros con nosotros en la primera fila.',
    allowed_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-carlos-garcia',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-familia-garcia',
        first_name: 'Carlos',
        last_name: 'García',
        is_plus_one_allowed: false,
        dietary_restrictions: 'sin gluten',
        allergies: 'Celiaco'
      },
      {
        id: 'gst-marta-mateo',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-familia-garcia',
        first_name: 'Marta',
        last_name: 'Mateo',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-sofia-martin',
    wedding_id: 'w-laura-rodrigo-2026',
    name: 'Sofía Martín',
    token: 'token-sofia-409',
    invitation_status: 'responded',
    opened_at: '2026-09-25T14:20:00.000Z',
    responded_at: '2026-09-25T14:35:00.000Z',
    custom_message: 'Sofi, tu lugar en la pista de baile está garantizado.',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-sofia-martin',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-sofia-martin',
        first_name: 'Sofía',
        last_name: 'Martín',
        is_plus_one_allowed: true,
        notes: 'Acompañante confirmado: Daniel'
      }
    ]
  },
  {
    id: 'grp-amigos-universidad',
    wedding_id: 'w-laura-rodrigo-2026',
    name: 'Javier & Alejandro (Univ)',
    token: 'token-univ-881',
    invitation_status: 'sent',
    custom_message: '¡Chicos! Preparad las pajaritas y las ganas de darlo todo.',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
    guests: [
      {
        id: 'gst-javier-lopez',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-amigos-universidad',
        first_name: 'Javier',
        last_name: 'López',
        is_plus_one_allowed: false
      },
      {
        id: 'gst-alejandro-ruiz',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-amigos-universidad',
        first_name: 'Alejandro',
        last_name: 'Ruiz',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-familia-gomez',
    wedding_id: 'w-laura-rodrigo-2026',
    name: 'Familia Gómez Peláez',
    token: 'token-gomez-105',
    invitation_status: 'responded',
    opened_at: '2026-09-20T09:00:00.000Z',
    responded_at: '2026-09-20T09:40:00.000Z',
    custom_message: 'Os esperamos con los brazos abiertos para un fin de semana inolvidable.',
    allowed_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-antonio-gomez',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-familia-gomez',
        first_name: 'Antonio',
        last_name: 'Gómez',
        is_plus_one_allowed: false
      },
      {
        id: 'gst-lucia-pelaez',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-familia-gomez',
        first_name: 'Lucía',
        last_name: 'Peláez',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-elena-torres',
    wedding_id: 'w-laura-rodrigo-2026',
    name: 'Elena Torres',
    token: 'token-elena-312',
    invitation_status: 'draft',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
    guests: [
      {
        id: 'gst-elena-torres',
        wedding_id: 'w-laura-rodrigo-2026',
        group_id: 'grp-elena-torres',
        first_name: 'Elena',
        last_name: 'Torres',
        is_plus_one_allowed: true
      }
    ]
  }
];

export const INITIAL_RSVPS: GroupRSVPSubmission[] = [
  {
    group_id: 'grp-sofia-martin',
    token: 'token-sofia-409',
    submitted_at: '2026-09-25T14:35:00.000Z',
    responses: [
      {
        guest_id: 'gst-sofia-martin',
        guest_name: 'Sofía Martín',
        status: 'attending',
        attending_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
        dietary_choice: 'vegetarian',
        allergies: 'Frutos secos',
        plus_one_attending: true,
        plus_one_name: 'Daniel Rivas',
        plus_one_dietary: 'standard',
        message: '¡Contando los días! No sabéis las ganas que tengo de veros radiantes.'
      }
    ]
  },
  {
    group_id: 'grp-familia-gomez',
    token: 'token-gomez-105',
    submitted_at: '2026-09-20T09:40:00.000Z',
    responses: [
      {
        guest_id: 'gst-antonio-gomez',
        guest_name: 'Antonio Gómez',
        status: 'attending',
        attending_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
        dietary_choice: 'standard',
        message: 'Será un placer acompañaros todo el fin de semana.'
      },
      {
        guest_id: 'gst-lucia-pelaez',
        guest_name: 'Lucía Peláez',
        status: 'attending',
        attending_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
        dietary_choice: 'standard'
      }
    ]
  }
];

export const INITIAL_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'block-hero',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'hero',
    title: 'Laura & Rodrigo',
    subtitle: '20 de Junio de 2026 • Madrid',
    content: {
      location: 'Finca El Olivar',
      date: '20.06.2026'
    },
    display_order: 1,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-story',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'story',
    title: 'Nuestra Historia',
    subtitle: 'Cómo empezó todo',
    content: {
      paragraphs: [
        'Nos conocimos hace 7 años en Madrid durante un café improvisado que duró más de cuatro horas.',
        'Desde entonces hemos compartido viajes, mudanzas, risas y la convicción absoluta de que queríamos caminar juntos.'
      ],
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'
    },
    display_order: 2,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-venue',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'venue',
    title: 'El Lugar',
    subtitle: 'Finca El Olivar',
    content: {
      description: 'Un espacio rodeado de naturaleza y olivos centenarios a tan solo 20 minutos del centro de Madrid.',
      address: 'Carretera de Colmenar Viejo, Km 22, 28770 Madrid',
      google_maps_url: 'https://maps.google.com/?q=Finca+El+Olivar+Colmenar'
    },
    display_order: 3,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-travel',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'travel',
    title: 'Alojamiento & Transporte',
    subtitle: 'Para tu mayor comodidad',
    content: {
      hotels: [
        { name: 'Hotel Eurostars Madrid Tower', discount: 'Código novios: LAURARODRI2026', distance: '15 min de la finca' },
        { name: 'Eurostars Gran Madrid', discount: 'Descuento 15% con enlace directo', distance: '12 min de la finca' }
      ],
      bus_info: 'Habrá servicio de autobuses de ida y vuelta con paradas en Plaza de Castilla y Moncloa.'
    },
    display_order: 4,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-registry',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'registry',
    title: 'Lista de Bodas',
    subtitle: 'El mejor regalo es tu presencia',
    content: {
      message: 'Si además deseas hacernos un regalo para nuestro viaje de novios a Japón y Nueva Zelanda, os dejamos nuestra cuenta bancaria:',
      iban: 'ES91 2100 0418 4502 0005 1234',
      account_holder: 'Laura Mateo & Rodrigo Gómez'
    },
    display_order: 5,
    is_active: true,
    visibility: 'everyone'
  },
  {
    id: 'block-faq',
    wedding_id: 'w-laura-rodrigo-2026',
    type: 'faq',
    title: 'Preguntas Frecuentes',
    subtitle: 'Todo lo que necesitas saber',
    content: {
      faqs: [
        { question: '¿Cuál es el dress code recomendación?', answer: 'Traje de chaqueta para ellos y vestido largo o de cóctel para ellas.' },
        { question: '¿Puedo llevar niños?', answer: 'Queremos que sea una jornada de desconexión para los padres, por lo que será un evento orientado a adultos salvo excepciones ya indicadas en la invitación.' },
        { question: '¿Hay aparcamiento en la finca?', answer: 'Sí, la finca cuenta con parking privado vigilado gratuito para todos los asistentes.' }
      ]
    },
    display_order: 6,
    is_active: true,
    visibility: 'everyone'
  }
];

export const INITIAL_GUESTBOOK: GuestBookEntry[] = [
  {
    id: 'gb-1',
    wedding_id: 'w-laura-rodrigo-2026',
    guest_name: 'Sofía Martín',
    message: '¡Va a ser la boda del año! No veo la hora de veros en el altar. Os quiero mucho.',
    created_at: '2026-09-25T14:36:00.000Z'
  },
  {
    id: 'gb-2',
    wedding_id: 'w-laura-rodrigo-2026',
    guest_name: 'Familia Gómez Peláez',
    message: 'Muchísimas felicidades parejaza. Allá estaremos para brindar fuerte por vuestra felicidad.',
    created_at: '2026-09-20T09:42:00.000Z'
  }
];

export const INITIAL_MEDIA: MediaPhoto[] = [
  {
    id: 'm-1',
    wedding_id: 'w-laura-rodrigo-2026',
    uploader_name: 'Laura & Rodrigo',
    photo_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    caption: 'Pedida de mano en los Pirineos, 2025',
    created_at: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'm-2',
    wedding_id: 'w-laura-rodrigo-2026',
    uploader_name: 'Laura & Rodrigo',
    photo_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    caption: 'Finca El Olivar al atardecer',
    created_at: '2026-02-15T15:30:00.000Z'
  }
];
