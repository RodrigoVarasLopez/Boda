import { Wedding, GuestGroup, Event, CMSBlock, GuestBookEntry, MediaPhoto, GroupRSVPSubmission } from './types';

export const INITIAL_WEDDING: Wedding = {
  id: 'w-stephanie-rodrigo-2027',
  slug: 'stephanie-y-rodrigo',
  couple_names: 'Stephanie & Rodrigo',
  bride_name: 'Stephanie',
  groom_name: 'Rodrigo',
  wedding_date: '2027-08-25T17:30:00.000Z',
  location_summary: 'Finca La Alquería · Madrid, España',
  theme: 'mediterranean',
  privacy_mode: false,
  rsvp_deadline: '2027-07-15T23:59:59.000Z',
  hero_message: 'Nos casamos y no nos imaginaríamos este día sin vosotros',
  welcome_quote: 'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas en un entorno mediterráneo inolvidable.',
  iban_details: {
    account_holder: 'Stephanie & Rodrigo',
    iban: 'ES91 2100 0418 4502 0005 1234',
    bank_name: 'CaixaBank',
    bic_swift: 'CAIXESBBXXX'
  }
};

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-welcome-dinner',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Cena de Bienvenida',
    description: 'Una velada íntima de bienvenida bajo las parras para familia directa y testigos antes del gran día.',
    start_time: '2027-08-24T20:30:00.000Z',
    end_time: '2027-08-24T23:30:00.000Z',
    location_name: 'El Patio de los Olivos',
    address: 'Camino del Valle 12, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Madrid+España',
    dress_code: 'Smart Casual / Elegante desenfadado',
    visibility: 'selected_groups',
    display_order: 1
  },
  {
    id: 'evt-ceremony',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Ceremonia',
    description: 'Intercambio de votos al atardecer rodeados de piedra caliza y olivos centenarios.',
    start_time: '2027-08-25T17:30:00.000Z',
    end_time: '2027-08-25T18:30:00.000Z',
    location_name: 'Claustro de la Finca La Alquería',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Madrid+España',
    dress_code: 'Formal / Traje de lino o chaqueta y vestido midi o largo',
    visibility: 'everyone',
    display_order: 2
  },
  {
    id: 'evt-cocktail-banquet',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Cóctel & Banquete',
    description: 'Aperitivos mediterráneos y cena a la luz de las velas con gastronomía de autor.',
    start_time: '2027-08-25T18:30:00.000Z',
    end_time: '2027-08-25T23:00:00.000Z',
    location_name: 'El Jardín de las Bouganvillas',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Madrid+España',
    dress_code: 'Formal',
    visibility: 'everyone',
    display_order: 3
  },
  {
    id: 'evt-party',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Fiesta & Barra Libre',
    description: 'Música en directo, baile y celebración bajo las estrellas hasta el amanecer.',
    start_time: '2027-08-25T23:00:00.000Z',
    end_time: '2027-08-26T05:00:00.000Z',
    location_name: 'Pabellón de Cristal & Pérgola',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Madrid+España',
    dress_code: '¡Prepárate para bailar!',
    visibility: 'everyone',
    display_order: 4
  },
  {
    id: 'evt-brunch',
    wedding_id: 'w-stephanie-rodrigo-2027',
    title: 'Brunch Mediterráneo',
    description: 'Desayuno relajado en la piscina para recordar los mejores momentos de la boda.',
    start_time: '2027-08-26T12:00:00.000Z',
    end_time: '2027-08-26T16:00:00.000Z',
    location_name: 'Piscina de la Alquería',
    address: 'Carretera de Colmenar Km 22, Madrid',
    google_maps_url: 'https://maps.google.com/?q=Madrid+España',
    dress_code: 'Resort Wear / Traje de baño',
    visibility: 'selected_groups',
    display_order: 5
  }
];

export const INITIAL_GROUPS: GuestGroup[] = [
  {
    id: 'grp-familia-garcia',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Familia García',
    token: 'token-garcia-772',
    invitation_status: 'opened',
    opened_at: '2027-06-28T10:15:00.000Z',
    custom_message: 'Nos hace una ilusión inmensa teneros con nosotros en la primera fila de nuestro gran día.',
    allowed_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-carlos-garcia',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-garcia',
        first_name: 'Carlos',
        last_name: 'García',
        is_plus_one_allowed: false,
        dietary_restrictions: 'sin gluten',
        allergies: 'Celíaco'
      },
      {
        id: 'gst-marta-mateo',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-garcia',
        first_name: 'Marta',
        last_name: 'García',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-sofia-martin',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Sofía Martín',
    token: 'token-sofia-409',
    invitation_status: 'responded',
    opened_at: '2027-06-25T14:20:00.000Z',
    responded_at: '2027-06-25T14:35:00.000Z',
    custom_message: 'Sofi, tu alegría en la pista de baile y a nuestro lado es imprescindible.',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-sofia-martin',
        wedding_id: 'w-stephanie-rodrigo-2027',
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
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Javier & Alejandro',
    token: 'token-univ-881',
    invitation_status: 'sent',
    custom_message: '¡Chicos! Preparad las pajaritas y las ganas de celebrar hasta el amanecer.',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
    guests: [
      {
        id: 'gst-javier-lopez',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-amigos-universidad',
        first_name: 'Javier',
        last_name: 'López',
        is_plus_one_allowed: false
      },
      {
        id: 'gst-alejandro-ruiz',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-amigos-universidad',
        first_name: 'Alejandro',
        last_name: 'Ruiz',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-familia-perez',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Familia Pérez',
    token: 'token-perez-105',
    invitation_status: 'responded',
    opened_at: '2027-06-20T09:00:00.000Z',
    responded_at: '2027-06-20T09:40:00.000Z',
    custom_message: 'Os esperamos con los brazos abiertos para un fin de semana lleno de amor y recuerdos.',
    allowed_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
    guests: [
      {
        id: 'gst-antonio-perez',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-perez',
        first_name: 'Antonio',
        last_name: 'Pérez',
        is_plus_one_allowed: false
      },
      {
        id: 'gst-lucia-perez',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-perez',
        first_name: 'Lucía',
        last_name: 'Pérez',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-familia-gomez',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Familia Gómez Peláez',
    token: 'token-gomez-551',
    invitation_status: 'responded',
    opened_at: '2027-06-22T11:00:00.000Z',
    responded_at: '2027-06-22T11:20:00.000Z',
    custom_message: 'Querida familia, nos hace muchísima ilusión poder compartir este gran día con vosotros.',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
    guests: [
      {
        id: 'gst-roberto-gomez',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-gomez',
        first_name: 'Roberto',
        last_name: 'Gómez',
        is_plus_one_allowed: false
      },
      {
        id: 'gst-carmen-pelaez',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-familia-gomez',
        first_name: 'Carmen',
        last_name: 'Peláez',
        is_plus_one_allowed: false
      }
    ]
  },
  {
    id: 'grp-elena-torres',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Elena Torres',
    token: 'token-elena-312',
    invitation_status: 'draft',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet', 'evt-party'],
    guests: [
      {
        id: 'gst-elena-torres',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-elena-torres',
        first_name: 'Elena',
        last_name: 'Torres',
        is_plus_one_allowed: true
      }
    ]
  },
  {
    id: 'grp-invitation-revoked',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Tomás Morales (Revocada)',
    token: 'token-revoked-999',
    invitation_status: 'revoked',
    allowed_event_ids: ['evt-ceremony', 'evt-cocktail-banquet'],
    guests: [
      {
        id: 'gst-tomas-morales',
        wedding_id: 'w-stephanie-rodrigo-2027',
        group_id: 'grp-invitation-revoked',
        first_name: 'Tomás',
        last_name: 'Morales',
        is_plus_one_allowed: false
      }
    ]
  }
];

export const INITIAL_RSVPS: GroupRSVPSubmission[] = [
  {
    group_id: 'grp-sofia-martin',
    token: 'token-sofia-409',
    submitted_at: '2027-06-25T14:35:00.000Z',
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
        message: '¡Contando los días! No sabéis las ganas que tengo de veros radiantes en el altar.'
      }
    ]
  },
  {
    group_id: 'grp-familia-perez',
    token: 'token-perez-105',
    submitted_at: '2027-06-20T09:40:00.000Z',
    responses: [
      {
        guest_id: 'gst-antonio-perez',
        guest_name: 'Antonio Pérez',
        status: 'attending',
        attending_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
        dietary_choice: 'standard',
        message: 'Será un auténtico placer acompañaros en este fin de semana tan especial.'
      },
      {
        guest_id: 'gst-lucia-perez',
        guest_name: 'Lucía Pérez',
        status: 'attending',
        attending_event_ids: ['evt-welcome-dinner', 'evt-ceremony', 'evt-cocktail-banquet', 'evt-party', 'evt-brunch'],
        dietary_choice: 'standard'
      }
    ]
  },
  {
    group_id: 'grp-familia-gomez',
    token: 'token-gomez-551',
    submitted_at: '2027-06-22T11:20:00.000Z',
    responses: [
      {
        guest_id: 'gst-roberto-gomez',
        guest_name: 'Roberto Gómez',
        status: 'declined',
        attending_event_ids: [],
        dietary_choice: 'standard',
        message: 'Nos apena enormemente no poder acompañaros por coincidir con un viaje programado. ¡Os deseamos toda la felicidad del mundo!'
      },
      {
        guest_id: 'gst-carmen-pelaez',
        guest_name: 'Carmen Peláez',
        status: 'declined',
        attending_event_ids: [],
        dietary_choice: 'standard'
      }
    ]
  }
];

export const INITIAL_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'block-hero',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'hero',
    title: 'Stephanie & Rodrigo',
    subtitle: '25 · 08 · 2027 · Madrid, España',
    content: {
      location: 'Finca La Alquería',
      date: '25 · 08 · 2027',
      image: '/wedding/hero-mediterranean.jpg'
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
        'Nos conocimos en una tarde de verano en Madrid, en una conversación espontánea que se transformó en horas de complicidad, risas y proyectos compartidos.',
        'Siete años después, habiendo recorrido caminos juntos y construido nuestro propio hogar, estamos listos para celebrar el siguiente gran capítulo con las personas que más queremos.'
      ],
      image: '/wedding/table-setting.jpg'
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
    subtitle: 'Finca La Alquería',
    content: {
      description: 'Un enclave rodeado de piedra caliza, arquitectura mediterránea y olivos centenarios a tan solo 20 minutos de Madrid.',
      address: 'Carretera de Colmenar Viejo, Km 22, 28770 Madrid',
      google_maps_url: 'https://maps.google.com/?q=Madrid+España',
      image: '/wedding/venue-editorial.jpg'
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
        { name: 'Hotel Eurostars Madrid Tower', discount: 'Tarifa especial invitados: STEPHANIE&RODRIGO', distance: '15 min de la finca' },
        { name: 'Eurostars Gran Madrid', discount: 'Descuento con enlace de boda', distance: '12 min de la finca' }
      ],
      bus_info: 'Habrá servicio privado de autobuses de ida y vuelta con paradas centrales en Plaza de Castilla y Moncloa.'
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
        { question: '¿Cuál es el dress code recomendado?', answer: 'Traje formal para ellos (los tonos lino o azul marino son ideales) y vestido de cóctel, midi o largo en tonos mediterráneos para ellas.' },
        { question: '¿Habrá opciones para alergias y dietas especiales?', answer: 'Por supuesto. En el formulario RSVP de tu invitación puedes indicar cualquier alergia o dieta (vegetariana, celíaca, etc.) y adaptaremos tu menú.' },
        { question: '¿Hay aparcamiento en la finca?', answer: 'Sí, la finca cuenta con parking privado vigilado gratuito para todos los invitados que decidan acudir en su propio vehículo.' }
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
    wedding_id: 'w-stephanie-rodrigo-2027',
    guest_name: 'Sofía Martín',
    message: '¡Va a ser una boda absolutamente mágica! No veo la hora de veros brindar juntos.',
    status: 'approved',
    created_at: '2027-06-25T14:36:00.000Z'
  },
  {
    id: 'gb-2',
    wedding_id: 'w-stephanie-rodrigo-2027',
    guest_name: 'Familia Pérez',
    message: 'Muchísimas felicidades parejaza. Allá estaremos para celebrar vuestro amor con todo el cariño.',
    status: 'approved',
    created_at: '2027-06-20T09:42:00.000Z'
  }
];

export const INITIAL_MEDIA: MediaPhoto[] = [
  {
    id: 'm-1',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/wedding/hero-mediterranean.jpg',
    caption: 'Finca La Alquería al atardecer',
    created_at: '2027-01-10T12:00:00.000Z'
  },
  {
    id: 'm-2',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/wedding/table-setting.jpg',
    caption: 'Mesas imperiales bajo los olivos',
    created_at: '2027-02-15T15:30:00.000Z'
  },
  {
    id: 'm-3',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/wedding/venue-editorial.jpg',
    caption: 'Claustro de piedra caliza',
    created_at: '2027-03-15T15:30:00.000Z'
  },
  {
    id: 'm-4',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/wedding/floral-detail.jpg',
    caption: 'Detalles florales y cerámica artesanal',
    created_at: '2027-04-10T12:00:00.000Z'
  }
];
