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
    description: 'Cóctel y cena al aire libre en la terraza de la bodega con vistas a los viñedos, música en directo y maridaje con los vinos de autor de la finca.',
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

export const INITIAL_GROUPS: GuestGroup[] = [
  {
    id: 'grp-familia-garcia',
    wedding_id: 'w-stephanie-rodrigo-2027',
    name: 'Familia García',
    token: 'token-garcia-772',
    invitation_status: 'opened',
    opened_at: '2027-06-28T10:15:00.000Z',
    custom_message: 'Nos hace una ilusión inmensa teneros con nosotros en la primera fila de nuestro gran día en Bodega Concejo.',
    allowed_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    custom_message: 'Sofi, tu presencia es indispensable desde la cata del viernes hasta el cierre de la pista de baile.',
    allowed_event_ids: ['evt-preboda-cata', 'evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    custom_message: '¡Chicos! Os esperamos el viernes para la cata en la bodega y el sábado para darlo todo en Bodega Concejo.',
    allowed_event_ids: ['evt-preboda-cata', 'evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    custom_message: 'Os esperamos con los brazos abiertos para celebrar nuestro amor entre los viñedos de Bodega Concejo.',
    allowed_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    allowed_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    allowed_event_ids: ['evt-preboda-cata', 'evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
    allowed_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
        attending_event_ids: ['evt-preboda-cata', 'evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
        dietary_choice: 'vegetarian',
        allergies: 'Frutos secos',
        plus_one_attending: true,
        plus_one_name: 'Daniel Rivas',
        plus_one_dietary: 'standard',
        message: '¡Contando los días! No sabéis las ganas que tengo de catar esos vinos y veros radiantes en el altar.'
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
        attending_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
        dietary_choice: 'standard',
        message: 'Será un auténtico placer acompañaros en este fin de semana tan especial en Bodega Concejo.'
      },
      {
        guest_id: 'gst-lucia-perez',
        guest_name: 'Lucía Pérez',
        status: 'attending',
        attending_event_ids: ['evt-ceremonia', 'evt-banquete', 'evt-fiesta-dj'],
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
        { name: 'Posada Real Concejo', discount: 'Alojamiento boutique en la propia finca / Valoria', distance: 'En el propio complejo' },
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

export const INITIAL_GUESTBOOK: GuestBookEntry[] = [
  {
    id: 'gb-1',
    wedding_id: 'w-stephanie-rodrigo-2027',
    guest_name: 'Sofía Martín',
    message: '¡Va a ser una boda absolutamente mágica en Bodega Concejo! No veo la hora de brindar juntos.',
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
    photo_url: '/images/bodega/bodega-concejo-banquete-noche.png',
    caption: 'Bodega Concejo iluminada para el banquete al aire libre',
    created_at: '2027-01-10T12:00:00.000Z'
  },
  {
    id: 'm-2',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/images/bodega/bodega-concejo-fachada-logo.png',
    caption: 'Fachada y terraza de Bodega Concejo al atardecer',
    created_at: '2027-02-15T15:30:00.000Z'
  },
  {
    id: 'm-3',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/images/bodega/cata-vino-burro-loco.png',
    caption: 'Cata de vino en barrica para la preboda',
    created_at: '2027-03-15T15:30:00.000Z'
  },
  {
    id: 'm-4',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/images/bodega/sala-barricas-bodega.png',
    caption: 'Sala de crianza y barricas de roble en la bodega',
    created_at: '2027-04-10T12:00:00.000Z'
  },
  {
    id: 'm-5',
    wedding_id: 'w-stephanie-rodrigo-2027',
    uploader_name: 'Stephanie & Rodrigo',
    photo_url: '/images/bodega/vinedos-valoria-barrica.png',
    caption: 'Viñedos de Valoria la Buena bajo el sol castellano',
    created_at: '2027-05-01T12:00:00.000Z'
  }
];
