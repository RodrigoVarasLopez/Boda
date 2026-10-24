import { Wedding, GuestGroup, Event, CMSBlock, GuestBookEntry, MediaPhoto, GroupRSVPSubmission } from './types';

export const INITIAL_WEDDING: Wedding = {
  id: 'w-stephanie-rodrigo-2027',
  slug: 'stephanie-y-rodrigo',
  couple_names: 'Rodrigo & Stephanie',
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
    account_holder: 'Rodrigo & Stephanie',
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

export const INITIAL_GROUPS: GuestGroup[] = [
  {
    "id": "39d23e0a-3e95-4bbd-acb1-f2cb932b7fc7",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Varas López (Ángel y Teresa)",
    "token": "token-familia-varas-lopez-ange-1",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "4a850363-24a7-49ac-a081-d951f913face",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "39d23e0a-3e95-4bbd-acb1-f2cb932b7fc7",
        "first_name": "Ángel",
        "last_name": "Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "0dd79d1d-58a4-40cb-aef3-8d31fdd155c7",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "39d23e0a-3e95-4bbd-acb1-f2cb932b7fc7",
        "first_name": "Teresa",
        "last_name": "López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "23ffb703-1ac4-4d80-a062-05071a09b098",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Castrillo Varas (Laura y Juan)",
    "token": "token-familia-castrillo-varas--2",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "338ca5ca-7e2b-4fac-a635-f398a3550b88",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "23ffb703-1ac4-4d80-a062-05071a09b098",
        "first_name": "Laura",
        "last_name": "Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "6ee05321-3751-43c6-aadf-eb1f13ab59a3",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "23ffb703-1ac4-4d80-a062-05071a09b098",
        "first_name": "Juan",
        "last_name": "Castrillo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "b91edf83-19a8-441a-a5c4-c7738ece6965",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Curieses López (Dativo, Marina, Jacinto y Darío)",
    "token": "token-familia-curieses-lopez-d-3",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "0a82aad3-8be6-4d32-aadb-5f63ea722e0f",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b91edf83-19a8-441a-a5c4-c7738ece6965",
        "first_name": "Dativo",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "3fd136e6-c7f0-4d4e-aa60-696cc957bf89",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b91edf83-19a8-441a-a5c4-c7738ece6965",
        "first_name": "Marina",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "4daf2ad3-6776-460c-a35f-500812b603b8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b91edf83-19a8-441a-a5c4-c7738ece6965",
        "first_name": "Jacinto",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "0e808c9c-2cd3-4636-a4cb-3d4c545e6d73",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b91edf83-19a8-441a-a5c4-c7738ece6965",
        "first_name": "Darío",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "68287117-1f84-45a4-a796-3aef3da629bc",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Curieses López (Elena, Nati, Toño y Juan)",
    "token": "token-familia-curieses-lopez-e-4",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "29795cb6-2ee1-4296-a335-e8f16124ea42",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "68287117-1f84-45a4-a796-3aef3da629bc",
        "first_name": "Elena",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "52589b63-67fe-4e47-a8c4-024a137a3008",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "68287117-1f84-45a4-a796-3aef3da629bc",
        "first_name": "Nati",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "c729581d-0434-4467-ae14-d0f510be6645",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "68287117-1f84-45a4-a796-3aef3da629bc",
        "first_name": "Toño",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "fe83d38f-5251-4597-ac3c-d1471ca28386",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "68287117-1f84-45a4-a796-3aef3da629bc",
        "first_name": "Juan",
        "last_name": "Curieses López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "c43dc330-f83f-425c-a677-fd4fff085f4d",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Vázquez López (Piedad, Chusma, Miguel y Clara)",
    "token": "token-familia-vazquez-lopez-pi-5",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "c72710d1-4cab-4ea4-ac16-3f81216779ef",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "c43dc330-f83f-425c-a677-fd4fff085f4d",
        "first_name": "Piedad",
        "last_name": "Vázquez López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "30b350c5-eb51-4d1f-a4f5-476df590bd84",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "c43dc330-f83f-425c-a677-fd4fff085f4d",
        "first_name": "Chusma",
        "last_name": "Vázquez López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "f937612d-10f2-4c28-a5f8-79646af2b778",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "c43dc330-f83f-425c-a677-fd4fff085f4d",
        "first_name": "Miguel",
        "last_name": "Vázquez López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "6b1fd515-ad8a-4223-a598-e9d441ff1d69",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "c43dc330-f83f-425c-a677-fd4fff085f4d",
        "first_name": "Clara",
        "last_name": "Vázquez López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "15567123-4e9a-40cd-aa5a-5f72e730b335",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia López Meneses (Gerardo, Julio, Gonzalo y Daria)",
    "token": "token-familia-lopez-meneses-ge-6",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "d3ee5629-9b86-4e79-a0f5-27bca21876ae",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "15567123-4e9a-40cd-aa5a-5f72e730b335",
        "first_name": "Gerardo",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "306d4ade-ef80-4837-af10-1bab43abe522",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "15567123-4e9a-40cd-aa5a-5f72e730b335",
        "first_name": "Julio",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "646514fc-3e9c-4127-a8ac-7846dfcb59d5",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "15567123-4e9a-40cd-aa5a-5f72e730b335",
        "first_name": "Gonzalo",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "6050eb00-e1d1-4336-afee-d0a538a33fee",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "15567123-4e9a-40cd-aa5a-5f72e730b335",
        "first_name": "Daria",
        "last_name": "López Meneses",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "8d862125-0cf2-4563-a03c-37c5cae2ee61",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Carmen y Nani López",
    "token": "token-carmen-y-nani-lopez-7",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "1909b301-b8e3-41f8-a503-31a860f9469e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "8d862125-0cf2-4563-a03c-37c5cae2ee61",
        "first_name": "Carmen",
        "last_name": "López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "927883bf-058c-495c-a948-7dbe5f25b650",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "8d862125-0cf2-4563-a03c-37c5cae2ee61",
        "first_name": "Nani",
        "last_name": "López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "7fc7ee34-54db-4084-a837-dc69257b9777",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Vázquez Macho (Ana, Óscar y César)",
    "token": "token-familia-vazquez-macho-an-8",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9dcc34f5-3421-4d3c-a4f3-95f99c1670ee",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "7fc7ee34-54db-4084-a837-dc69257b9777",
        "first_name": "Ana",
        "last_name": "Vázquez Macho",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "b44537d6-9deb-49a9-a9e7-d2632ce54df4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "7fc7ee34-54db-4084-a837-dc69257b9777",
        "first_name": "Óscar",
        "last_name": "Macho López",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "7c233f7a-4b01-49de-aede-02fc5d986fad",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "7fc7ee34-54db-4084-a837-dc69257b9777",
        "first_name": "César",
        "last_name": "Vázquez Macho",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "a9b8ea77-ffbd-467f-affa-bdb692089f65",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Barcelona (Elena, Dativo y Miguel)",
    "token": "token-familia-barcelona-elena--9",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "edd736f5-70e5-42c3-ad99-d267c995b148",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a9b8ea77-ffbd-467f-affa-bdb692089f65",
        "first_name": "Elena Barcelona",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "503e7c5b-39f2-400a-a7f2-dea21d1662b8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a9b8ea77-ffbd-467f-affa-bdb692089f65",
        "first_name": "Dativo Barcelona",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "c002a0ad-cf06-4b51-ac7b-73a57959c52d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a9b8ea77-ffbd-467f-affa-bdb692089f65",
        "first_name": "Miguel Barcelona",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "fbbc6a69-f9d6-4689-a394-e470e555b320",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Pol (Mamá Pol, Pol y Hermana Pol)",
    "token": "token-familia-pol-mama-pol-pol-10",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "2a25e209-2b99-478c-a2f7-0eb3e0ce058b",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fbbc6a69-f9d6-4689-a394-e470e555b320",
        "first_name": "Mamá Pol",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "6f7860b7-c584-472b-a27b-a1aa247d2428",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fbbc6a69-f9d6-4689-a394-e470e555b320",
        "first_name": "Pol",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "1c9ee782-0a21-446c-ab1b-96136fafad4a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fbbc6a69-f9d6-4689-a394-e470e555b320",
        "first_name": "Hermana Pol",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "51428b06-1422-4870-a0ee-140e3760cd20",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Mari Varas Redondo",
    "token": "token-mari-varas-redondo-11",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "81afe41d-7282-4574-a878-35da0ccba322",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "51428b06-1422-4870-a0ee-140e3760cd20",
        "first_name": "Mari",
        "last_name": "Varas Redondo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "bf8ac21b-0013-4627-a729-ecc7f4c60ae5",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Nuria",
    "token": "token-nuria-12",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "1262c19e-912a-4b4a-a01a-160fe9faf439",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "bf8ac21b-0013-4627-a729-ecc7f4c60ae5",
        "first_name": "Nuria",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "5646af10-5bbc-497e-acd5-2ef9df4e7001",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Saturnino",
    "token": "token-saturnino-13",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "be6c6fc9-a7f2-455b-a2eb-bc34ffc1f855",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5646af10-5bbc-497e-acd5-2ef9df4e7001",
        "first_name": "Saturnino",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "a835e6dc-d384-4265-a6fc-4574c1661e9b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Virginia",
    "token": "token-virginia-14",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "ddfad5a2-a06a-4e5c-ad72-4df8602a6fec",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a835e6dc-d384-4265-a6fc-4574c1661e9b",
        "first_name": "Virginia",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "58ecae26-f545-4258-a45f-1459b9c0defc",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Chema",
    "token": "token-chema-15",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "7ffd3cc0-0976-4a3c-aeff-495dbe2b0b48",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "58ecae26-f545-4258-a45f-1459b9c0defc",
        "first_name": "Chema",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "bbf528c9-eba8-431b-a426-6a66835a8dbb",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Bea",
    "token": "token-bea-16",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "949592ad-f2a3-484f-ab57-c6095e271d77",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "bbf528c9-eba8-431b-a426-6a66835a8dbb",
        "first_name": "Bea",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "ea251ef4-c829-4779-a507-584410e718e1",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Jesús",
    "token": "token-jesus-17",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9625fa9d-85ad-41a7-ab67-9342b448de70",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "ea251ef4-c829-4779-a507-584410e718e1",
        "first_name": "Jesús",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "5d0e4dbb-df59-430f-a55b-9d37dbc2f23d",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia González Varas (Yoli y Chuchi)",
    "token": "token-familia-gonzalez-varas-y-18",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "cedbab1b-36c4-4d70-ac9f-61cee897c410",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5d0e4dbb-df59-430f-a55b-9d37dbc2f23d",
        "first_name": "Yoli",
        "last_name": "González Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "2c658c99-b0cc-472e-a459-218caa323243",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5d0e4dbb-df59-430f-a55b-9d37dbc2f23d",
        "first_name": "Chuchi",
        "last_name": "González Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "dc45f65b-5f91-4d3c-a36e-81781ae7c47c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Fidel y Anahí González",
    "token": "token-fidel-y-anahi-gonzalez-19",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "8dee1de7-53ef-47bd-acc2-346f063918dd",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "dc45f65b-5f91-4d3c-a36e-81781ae7c47c",
        "first_name": "Fidel",
        "last_name": "González",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "8dcff876-5041-4e72-ad71-5e74a5b7c579",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "dc45f65b-5f91-4d3c-a36e-81781ae7c47c",
        "first_name": "Anahí",
        "last_name": "González",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "6f087e77-d7ba-44ac-a821-0dde42d182aa",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Raquel, Marido Raquel, Nora y Hermano Nora (Grupo A)",
    "token": "token-raquel-marido-raquel-nor-20",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "eb28c858-f7f3-431a-a370-3007a05b04a1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6f087e77-d7ba-44ac-a821-0dde42d182aa",
        "first_name": "Raquel",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "96ec3f62-58bf-4452-a464-240285f7fb07",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6f087e77-d7ba-44ac-a821-0dde42d182aa",
        "first_name": "Marido Raquel",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "33e8d5f8-048f-44fb-ad2f-5b2cd65adc95",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6f087e77-d7ba-44ac-a821-0dde42d182aa",
        "first_name": "Nora",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "05a07a27-09f9-4996-a8c9-fde08f04b7d7",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6f087e77-d7ba-44ac-a821-0dde42d182aa",
        "first_name": "Hermano Nora",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "33ffd25d-1032-441e-a1ad-6afbfef74248",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Varas Moreno (Benja, Yolan y Marco)",
    "token": "token-familia-varas-moreno-ben-21",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "1545e85d-74ea-4fa6-ab72-04380ba61e7e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "33ffd25d-1032-441e-a1ad-6afbfef74248",
        "first_name": "Benja",
        "last_name": "Varas Moreno",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "ae26d6c1-7676-482e-ad4a-a60846ceba4d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "33ffd25d-1032-441e-a1ad-6afbfef74248",
        "first_name": "Yolan",
        "last_name": "Varas Moreno",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "56559a80-5625-447e-a7dc-c6a32dc57773",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "33ffd25d-1032-441e-a1ad-6afbfef74248",
        "first_name": "Marco",
        "last_name": "Varas Moreno",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "e946398b-941c-44a0-aeed-19fcd4dc4c6d",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Mena Varas (Chusmari y Moñi)",
    "token": "token-familia-mena-varas-chusm-22",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "04d02b45-aae7-4eb7-a9a1-291b8022fe76",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e946398b-941c-44a0-aeed-19fcd4dc4c6d",
        "first_name": "Chusmari",
        "last_name": "Mena Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "e4d879ef-3710-450e-a8b6-f8395b763ded",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e946398b-941c-44a0-aeed-19fcd4dc4c6d",
        "first_name": "Moñi",
        "last_name": "Mena Varas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Mena (María, Fernando y Niños)",
    "token": "token-familia-mena-maria-ferna-23",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "dbf49910-833d-4647-af9d-405ab256e122",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
        "first_name": "María",
        "last_name": "Mena",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "b35f9df1-cccf-4f7f-a478-2741697c32cb",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
        "first_name": "Fernando",
        "last_name": "Mena",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "f922d32d-df86-49a9-a4be-4020f9a344c0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
        "first_name": "Niño 1",
        "last_name": "Mena",
        "is_child": true,
        "guest_type": "child",
        "is_plus_one_allowed": false
      },
      {
        "id": "aa9dd75b-3d2f-4585-a520-a3951165936b",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
        "first_name": "Niño 2",
        "last_name": "Mena",
        "is_child": true,
        "guest_type": "child",
        "is_plus_one_allowed": false
      },
      {
        "id": "173599a5-57e4-422f-ade7-3047803b85e7",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2a4fde75-a49c-4609-ac95-a554cb2eb575",
        "first_name": "Niño 3",
        "last_name": "Mena",
        "is_child": true,
        "guest_type": "child",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "e91c607b-eea6-4ec2-a712-00db50c6af91",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Mena 2 (David y Niños)",
    "token": "token-familia-mena-2-david-y-n-24",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "3f608dd1-89e9-41d3-a0c6-7a5386dcb8a4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e91c607b-eea6-4ec2-a712-00db50c6af91",
        "first_name": "David",
        "last_name": "Mena",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "e2baa781-2e16-4d5d-add7-9586ec0de6f0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e91c607b-eea6-4ec2-a712-00db50c6af91",
        "first_name": "Niño 1",
        "last_name": "Mena",
        "is_child": true,
        "guest_type": "child",
        "is_plus_one_allowed": false
      },
      {
        "id": "3967dc7f-fb5c-4856-a7ce-6579703bc581",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e91c607b-eea6-4ec2-a712-00db50c6af91",
        "first_name": "Niño 2",
        "last_name": "Mena",
        "is_child": true,
        "guest_type": "child",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "51ac2540-32e3-4850-ad3f-bcbbf9077c63",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Álvaro Primo Díez Redondo",
    "token": "token-alvaro-primo-diez-redond-25",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "2d0820e5-18f9-4b01-a266-87aac88652fa",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "51ac2540-32e3-4850-ad3f-bcbbf9077c63",
        "first_name": "Álvaro Primo",
        "last_name": "Díez Redondo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "f0faf9a5-9e32-472b-a564-329a0c51e21f",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Marta Prima y Ruli Díez",
    "token": "token-marta-prima-y-ruli-diez-26",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "46541fba-1d3b-4751-aa97-5eff64e5904f",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f0faf9a5-9e32-472b-a564-329a0c51e21f",
        "first_name": "Marta Prima",
        "last_name": "Díez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "5c9aedee-7c3d-4418-a250-fe4029290f28",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f0faf9a5-9e32-472b-a564-329a0c51e21f",
        "first_name": "Ruli",
        "last_name": "Díez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "5764152f-c70d-43a7-a792-2be81c9d7736",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Abel Gutiérrez García",
    "token": "token-abel-gutierrez-garcia-27",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "66adfba0-f273-4582-ad78-a93025e3b5ee",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5764152f-c70d-43a7-a792-2be81c9d7736",
        "first_name": "Abel",
        "last_name": "Gutiérrez García",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "4b13ccc7-c097-4bf2-a125-ded0d4f31c7c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Poyo Meneses Díez",
    "token": "token-poyo-meneses-diez-28",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "0b11de78-2c01-46a1-a7bf-657d44a2e709",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "4b13ccc7-c097-4bf2-a125-ded0d4f31c7c",
        "first_name": "Poyo",
        "last_name": "Meneses Díez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "a73f82d9-4de9-40a3-ad11-f6beb79d25e9",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Pablo Rodríguez Bernal",
    "token": "token-pablo-rodriguez-bernal-29",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "13f6bea3-83ab-4c14-acc9-4cc89cd0325e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a73f82d9-4de9-40a3-ad11-f6beb79d25e9",
        "first_name": "Pablo",
        "last_name": "Rodríguez Bernal",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "76301354-2702-4a74-a311-2c915bdf7615",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Leo Ponce",
    "token": "token-leo-ponce-30",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "6b01cd35-0075-41b5-a3dc-bee26753440c",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "76301354-2702-4a74-a311-2c915bdf7615",
        "first_name": "Leo",
        "last_name": "Ponce",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "c921e208-7238-42f0-a84a-ff55d69fba44",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Angelillo",
    "token": "token-angelillo-31",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "bca4e938-6f2a-44f2-ab38-57271852deda",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "c921e208-7238-42f0-a84a-ff55d69fba44",
        "first_name": "Angelillo",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "b63f0570-d422-4aba-a80e-eb9fe6c71a77",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Colón y Vero",
    "token": "token-colon-y-vero-32",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "bb2a505f-9382-4eaf-a4ca-bba3650485c8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b63f0570-d422-4aba-a80e-eb9fe6c71a77",
        "first_name": "Colón",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "c300c832-b7d1-483b-a731-3c5584107309",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b63f0570-d422-4aba-a80e-eb9fe6c71a77",
        "first_name": "Vero",
        "last_name": "Colón",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "09054664-3eaa-413a-adc1-6136d298ce2e",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Escu",
    "token": "token-escu-33",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "a5fa4088-080f-4d54-aa40-d3dd53bd4446",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "09054664-3eaa-413a-adc1-6136d298ce2e",
        "first_name": "Escu",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "54e0209c-1d6f-42bb-a059-669e9b1a2a73",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Andrea Losada Zamora",
    "token": "token-andrea-losada-zamora-34",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "74f709ba-ebc0-4ca1-a5c5-de58122921bf",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "54e0209c-1d6f-42bb-a059-669e9b1a2a73",
        "first_name": "Andrea",
        "last_name": "Losada Zamora",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "1c796312-e535-4348-a5c0-e383c931bc58",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Emilín y Eli (Grupo B)",
    "token": "token-emilin-y-eli-grupo-b-35",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "bf6ae8a9-3058-4ca6-a3ee-dcd32b2e5b14",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "1c796312-e535-4348-a5c0-e383c931bc58",
        "first_name": "Emilín",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "83ffc59c-2c48-4926-a752-cd510147f3d8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "1c796312-e535-4348-a5c0-e383c931bc58",
        "first_name": "Eli",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "84de81d0-938c-45d7-a386-70d02d7cd9a0",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Alba y Novio Alba (Kala)",
    "token": "token-alba-y-novio-alba-kala-36",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "8757b68b-792f-4e5b-aa46-ba3e30ed428c",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "84de81d0-938c-45d7-a386-70d02d7cd9a0",
        "first_name": "Novio Alba",
        "last_name": "Kala",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "62c0d559-dcd8-4aff-a964-52bf42586e90",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "84de81d0-938c-45d7-a386-70d02d7cd9a0",
        "first_name": "Alba",
        "last_name": "Kala",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "de4c6542-409b-4785-a1e0-4810a77c0adc",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Joni Manuel",
    "token": "token-joni-manuel-37",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "5ac1a6ba-0091-4414-a8c3-704c53a6f3f9",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "de4c6542-409b-4785-a1e0-4810a77c0adc",
        "first_name": "Joni",
        "last_name": "Manuel",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "1a6bb50f-9063-4c8b-a90a-5922867b2766",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Papeles",
    "token": "token-papeles-38",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fd821267-0bfd-4703-a69d-da0d2b769678",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "1a6bb50f-9063-4c8b-a90a-5922867b2766",
        "first_name": "Papeles",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "94448d6c-3ad4-4398-a089-169a7c23d807",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Purillos y Nuria Arenas",
    "token": "token-purillos-y-nuria-arenas-39",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "a49250e2-860e-467a-af4c-080650399ed3",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "94448d6c-3ad4-4398-a089-169a7c23d807",
        "first_name": "Purillos",
        "last_name": "Arenas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "06ba0e8e-0471-4812-a658-6a54d008bf4e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "94448d6c-3ad4-4398-a089-169a7c23d807",
        "first_name": "Nuria",
        "last_name": "Arenas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "4803dfcc-4886-4acc-aeff-62d2079ef872",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Santos y Novia Santos",
    "token": "token-santos-y-novia-santos-40",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "feea42aa-a9b8-44b5-a9eb-5882a4c27422",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "4803dfcc-4886-4acc-aeff-62d2079ef872",
        "first_name": "Santos",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "b1f1a9b2-6b23-4ab9-ae4c-33dda9be6ef4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "4803dfcc-4886-4acc-aeff-62d2079ef872",
        "first_name": "Novia Santos",
        "last_name": "Santos",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "fd80335d-9d5f-43e1-a888-2fd5d8680107",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Xoxe y Novia Xoxe De la Cruz",
    "token": "token-xoxe-y-novia-xoxe-de-la--41",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "202b255d-f3b3-4fdb-afe5-3bc7f8f4f817",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fd80335d-9d5f-43e1-a888-2fd5d8680107",
        "first_name": "Xoxe",
        "last_name": "De la Cruz",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "170a697e-1f19-496f-adac-3c85d7b44945",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fd80335d-9d5f-43e1-a888-2fd5d8680107",
        "first_name": "Novia Xoxe",
        "last_name": "De la Cruz",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "eb5d3b72-5a36-4cc8-ae28-d9b4023ed4fd",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Pope y Melani López Guantes",
    "token": "token-pope-y-melani-lopez-guan-42",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9b80fc70-4919-458d-a450-0e4639a698f8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "eb5d3b72-5a36-4cc8-ae28-d9b4023ed4fd",
        "first_name": "Pope",
        "last_name": "López Guantes",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "358946f5-b07b-4055-afd3-f672df91a2ad",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "eb5d3b72-5a36-4cc8-ae28-d9b4023ed4fd",
        "first_name": "Melani",
        "last_name": "López Guantes",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "27a97190-9627-4a23-a087-6132f149e2e9",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Crisito y Cristina Redondo Bombín",
    "token": "token-crisito-y-cristina-redon-43",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "4d68969a-3214-4f8b-a78d-0a9a7ae5abbd",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "27a97190-9627-4a23-a087-6132f149e2e9",
        "first_name": "Crisito",
        "last_name": "Redondo Bombín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "ca72713f-b95c-47f7-aae5-6bdd9a188112",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "27a97190-9627-4a23-a087-6132f149e2e9",
        "first_name": "Cristina",
        "last_name": "Redondo Bombín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "d2c24103-886b-45c6-a025-c54162fa135c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Miguel Kala Burrul",
    "token": "token-miguel-kala-burrul-44",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "47eabbc4-b3c1-485b-a91c-61fcb82bf481",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d2c24103-886b-45c6-a025-c54162fa135c",
        "first_name": "Miguel Kala",
        "last_name": "Burrul",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "5b415b13-c5d6-46f8-a2ae-47c7d5c63980",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Cesitar Villán Silva",
    "token": "token-cesitar-villan-silva-45",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "97dbb0d2-765d-4f43-abc1-2a1b01421896",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5b415b13-c5d6-46f8-a2ae-47c7d5c63980",
        "first_name": "Cesitar",
        "last_name": "Villán Silva",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "2e74af2e-6544-4789-a61a-a9fb9ff1b6a3",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Borre Borreguero",
    "token": "token-borre-borreguero-46",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "c4f66579-3e7b-4e5e-ac49-95efdc08efd2",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2e74af2e-6544-4789-a61a-a9fb9ff1b6a3",
        "first_name": "Borre",
        "last_name": "Borreguero",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "917903f5-b84a-4b20-a615-a68b0f345ba7",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Álex Ramírez",
    "token": "token-alex-ramirez-47",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "482b57d5-e206-4f85-a9a7-accaa837e96e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "917903f5-b84a-4b20-a615-a68b0f345ba7",
        "first_name": "Álex",
        "last_name": "Ramírez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "a6b223eb-fde6-46de-a0b5-f9a06ada491b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Rober y Novia Rober Redondo",
    "token": "token-rober-y-novia-rober-redo-48",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "5ad1cc90-eff1-4077-a86a-faa7d85b741b",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a6b223eb-fde6-46de-a0b5-f9a06ada491b",
        "first_name": "Novia Rober",
        "last_name": "Redondo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "5355dd2d-db83-4325-a248-d2a61a58e019",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a6b223eb-fde6-46de-a0b5-f9a06ada491b",
        "first_name": "Rober",
        "last_name": "Redondo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "97174b36-0de3-475d-a6ec-4c3f41076ea8",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Moha Mahandadme",
    "token": "token-moha-mahandadme-49",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "05c7b4e9-096f-44a7-a429-97dac44a9ba9",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "97174b36-0de3-475d-a6ec-4c3f41076ea8",
        "first_name": "Moha",
        "last_name": "Mahandadme",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "b4f54b97-5597-49fc-acea-824661fed11a",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Beto y Patri Caballero",
    "token": "token-beto-y-patri-caballero-50",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "72cb61b6-fdf6-49ad-a1eb-cccd76cab7da",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b4f54b97-5597-49fc-acea-824661fed11a",
        "first_name": "Beto",
        "last_name": "Caballero",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "1a13358a-a5ea-4c51-a507-5922a5acc837",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b4f54b97-5597-49fc-acea-824661fed11a",
        "first_name": "Patri",
        "last_name": "Caballero",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "ae37f6d3-8557-4d8f-a918-2bbf082c8df6",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Inacito",
    "token": "token-inacito-51",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9d77c21a-c7c8-49e8-aa5f-e5aba779d5a5",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "ae37f6d3-8557-4d8f-a918-2bbf082c8df6",
        "first_name": "Inacito",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "d36b3cf2-08a1-4786-ae60-879841d58d8b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Castrillo (Urbano, Mamen y David)",
    "token": "token-familia-castrillo-urbano-52",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "b5a0ad90-e6bd-4c73-a096-a25adbbb85de",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d36b3cf2-08a1-4786-ae60-879841d58d8b",
        "first_name": "Urbano",
        "last_name": "Castrillo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "9c9893a5-5091-44cb-a04d-c78692929ad0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d36b3cf2-08a1-4786-ae60-879841d58d8b",
        "first_name": "Mamen",
        "last_name": "Castrillo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "d4a7a0ca-eba0-4005-af55-28d3e876f678",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d36b3cf2-08a1-4786-ae60-879841d58d8b",
        "first_name": "David",
        "last_name": "Castrillo",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "a08e4031-000c-4cd7-af8b-b49c1947a615",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Maricruz y Loren Martín",
    "token": "token-maricruz-y-loren-martin-53",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "e7bc247c-0571-4580-aa2d-199ef4f7407b",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a08e4031-000c-4cd7-af8b-b49c1947a615",
        "first_name": "Maricruz",
        "last_name": "Martín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "789f2a29-676f-4681-a851-120a669486d4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a08e4031-000c-4cd7-af8b-b49c1947a615",
        "first_name": "Loren",
        "last_name": "Martín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Amigos Madre (Juan, Alicia, César, Ana, Paqui y Basilio)",
    "token": "token-amigos-madre-juan-alicia-54",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fb266c7c-a62a-44d7-a542-322e78c912dc",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "Juan",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "5a993fd8-d7d3-4d2e-a2eb-ca1319ddf660",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "Alicia",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "20ddd621-688f-42a7-a44b-de1babd84f5c",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "César",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "6cdaf0a4-3a9a-484e-a5fe-a9c537814f55",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "Ana",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "f7cbfd0a-4aa9-4889-adc8-3f47891361ff",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "Paqui",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "b13abdbc-2c9a-49b7-a0e2-8ab7fe37bd1e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b5b9bedf-8793-455f-a4bc-1b9354bc8736",
        "first_name": "Basilio",
        "last_name": "Amigos Madre",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "3fd43e0c-ae9c-4ba1-ac5a-bd6629404d53",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Juanlu y Mónica (Grupo D)",
    "token": "token-juanlu-y-monica-grupo-d-55",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "51bb8f30-58d0-42bc-a6be-10f158eb0c43",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3fd43e0c-ae9c-4ba1-ac5a-bd6629404d53",
        "first_name": "Juanlu",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "9c30d680-9c7d-400b-aa49-da70adc7683a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3fd43e0c-ae9c-4ba1-ac5a-bd6629404d53",
        "first_name": "Mónica",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "57a4ea08-6ed2-4575-ae2c-b6e41d985658",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Carlota y Carlitos (Grupo E)",
    "token": "token-carlota-y-carlitos-grupo-56",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "2d895545-04c5-4297-aa60-79def099e6a1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "57a4ea08-6ed2-4575-ae2c-b6e41d985658",
        "first_name": "Carlota",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "8b0fcc99-a55c-4df5-af3f-11ab1f0118c0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "57a4ea08-6ed2-4575-ae2c-b6e41d985658",
        "first_name": "Carlitos",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "e88a1601-d74e-4903-ade0-12e21d1b252b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Valentín",
    "token": "token-valentin-57",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "26e927ed-2be9-4c49-abf5-c224f7c6cb29",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e88a1601-d74e-4903-ade0-12e21d1b252b",
        "first_name": "Valentín",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "b3626682-28d6-4a40-a9fe-4ea222bf0e3b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Javi Oliveira",
    "token": "token-javi-oliveira-58",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "58592925-3fd0-4122-a095-ddd8d6f0b23b",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b3626682-28d6-4a40-a9fe-4ea222bf0e3b",
        "first_name": "Javi Oliveira",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "9e417724-1045-4a78-a39b-48d55e55be68",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Javi Pelos",
    "token": "token-javi-pelos-59",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "875dafe5-faa5-4683-ac52-290deee5e740",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "9e417724-1045-4a78-a39b-48d55e55be68",
        "first_name": "Javi Pelos",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "0cef8a14-6c46-4695-aafe-64cdc57e17ed",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Rafita",
    "token": "token-rafita-60",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "323dc694-4595-41b2-ae9b-0014c7ee9e2a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "0cef8a14-6c46-4695-aafe-64cdc57e17ed",
        "first_name": "Rafita",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "00ea9de1-eee1-426d-a1fc-d34137107d63",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Julián",
    "token": "token-julian-61",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "0b04301d-4a02-4891-acdc-4dea300a7ae0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "00ea9de1-eee1-426d-a1fc-d34137107d63",
        "first_name": "Julián",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "89738e33-f7c2-4235-a003-50f7688dae7b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Ana",
    "token": "token-ana-62",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fb2bf508-48be-4375-a079-b99facdfd7c4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "89738e33-f7c2-4235-a003-50f7688dae7b",
        "first_name": "Ana",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "8b70584f-c3e8-4795-a93f-6cd371d2e5fb",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Teresa",
    "token": "token-teresa-63",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fe7d9452-606b-4d33-ae25-4b8f335dead1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "8b70584f-c3e8-4795-a93f-6cd371d2e5fb",
        "first_name": "Teresa",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "4bc89635-62a2-4a0a-aeb7-44a9aaff6dbb",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Luisa y Tulio Mendoza Rojas",
    "token": "token-luisa-y-tulio-mendoza-ro-64",
    "invitation_status": "sent",
    "allowed_event_ids": [
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "f19d8741-e88e-499c-ada8-f6fe415e67dc",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "4bc89635-62a2-4a0a-aeb7-44a9aaff6dbb",
        "first_name": "Luisa",
        "last_name": "Mendoza Rojas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "d69a0af2-0dea-41d5-affa-bcd050087ad4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "4bc89635-62a2-4a0a-aeb7-44a9aaff6dbb",
        "first_name": "Tulio",
        "last_name": "Mendoza Rojas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "3eadafe4-2b2d-40d0-aee9-9fe075322080",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia De Freitas (Dayana, Imberg y Rodrigo)",
    "token": "token-familia-de-freitas-dayan-65",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fe058536-fa95-4907-a47b-951da11d692c",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3eadafe4-2b2d-40d0-aee9-9fe075322080",
        "first_name": "Dayana",
        "last_name": "De Freitas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "fd8c4112-4b2f-4ec7-a86b-55f24fa62e2a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3eadafe4-2b2d-40d0-aee9-9fe075322080",
        "first_name": "Imberg",
        "last_name": "De Freitas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "dd1637a9-f4ee-4b60-a18e-06fcf9aab2a2",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3eadafe4-2b2d-40d0-aee9-9fe075322080",
        "first_name": "Rodrigo",
        "last_name": "De Freitas",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      }
    ]
  },
  {
    "id": "6ced4e0f-c3cd-4e01-ab7e-ed58accec014",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Familia Mendoza (Marylin, Leo y Diego)",
    "token": "token-familia-mendoza-marylin--66",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "2b256119-a168-4e6c-a39a-5a24de10e3ef",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6ced4e0f-c3cd-4e01-ab7e-ed58accec014",
        "first_name": "Marylin",
        "last_name": "Mendoza",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "b1e05137-8665-4c68-a2d6-1a04d46114f1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6ced4e0f-c3cd-4e01-ab7e-ed58accec014",
        "first_name": "Leo",
        "last_name": "Mendoza",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false
      },
      {
        "id": "1a910d5a-4818-4281-a2a3-41d07a92949a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6ced4e0f-c3cd-4e01-ab7e-ed58accec014",
        "first_name": "Diego",
        "last_name": "Mendoza",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "813b8c48-19d1-4acd-afa2-13c9195213d2",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Javier",
    "token": "token-javier-67",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "7289da22-b9b7-4294-a4fb-7c988a621db0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "813b8c48-19d1-4acd-afa2-13c9195213d2",
        "first_name": "Javier",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "e629bf64-e3e3-4b12-a49d-ca848b66f0fa",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Ilvania",
    "token": "token-ilvania-68",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "12a9b492-e413-4933-ae67-efd2940d0c52",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e629bf64-e3e3-4b12-a49d-ca848b66f0fa",
        "first_name": "Ilvania",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "5da8d5b3-b7ec-45e0-a8a5-8935d5f4f3d5",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Enma",
    "token": "token-enma-69",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "0c16e5fc-94eb-43ab-a400-36c2b91dfe64",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5da8d5b3-b7ec-45e0-a8a5-8935d5f4f3d5",
        "first_name": "Enma",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "08886075-a031-46b6-a7b0-a330d4a3cb3d",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Daniela y Carlitos Machado",
    "token": "token-daniela-y-carlitos-macha-70",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "8f706362-4b49-4239-a0f3-b780df1de165",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "08886075-a031-46b6-a7b0-a330d4a3cb3d",
        "first_name": "Daniela",
        "last_name": "Machado",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "15e36e6b-7d72-487e-a135-52a93c634698",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "08886075-a031-46b6-a7b0-a330d4a3cb3d",
        "first_name": "Carlitos",
        "last_name": "Machado",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "b0345f92-3e60-4ba9-a00b-cc0398ad576b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Daniela Carolina",
    "token": "token-daniela-carolina-71",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "271ef6a3-1cab-47cc-a5a6-3e2a6a702d2f",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b0345f92-3e60-4ba9-a00b-cc0398ad576b",
        "first_name": "Daniela",
        "last_name": "Carolina",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "d62f0fa7-40c5-40e6-a8bd-92468f318344",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Angélica y Esposo Angélica (Grupo F)",
    "token": "token-angelica-y-esposo-angeli-72",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "707a4671-a931-4997-acdc-4b231dddb9a6",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d62f0fa7-40c5-40e6-a8bd-92468f318344",
        "first_name": "Angélica",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "06b7f431-8f87-472e-a936-7c003b21649e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d62f0fa7-40c5-40e6-a8bd-92468f318344",
        "first_name": "Esposo Angélica",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "db9d7c70-7abd-4187-af57-c9755a72c96f",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Vicky y Nelson Esteves",
    "token": "token-vicky-y-nelson-esteves-73",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "72e44c25-29e3-476c-a84e-47949ac4e123",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "db9d7c70-7abd-4187-af57-c9755a72c96f",
        "first_name": "Vicky",
        "last_name": "Esteves",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "2dba8244-6bc1-4105-ada6-4bbceb68fa83",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "db9d7c70-7abd-4187-af57-c9755a72c96f",
        "first_name": "Nelson",
        "last_name": "Esteves",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "f1ea9929-68c5-4dc1-a1df-567880c16551",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Gabi y Alejandro Chitty",
    "token": "token-gabi-y-alejandro-chitty-74",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "216fcafd-349b-4d09-aae9-29aba20d17e1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f1ea9929-68c5-4dc1-a1df-567880c16551",
        "first_name": "Gabi",
        "last_name": "Chitty",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "424833cb-1505-433f-a9ce-92f2754202a7",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f1ea9929-68c5-4dc1-a1df-567880c16551",
        "first_name": "Alejandro",
        "last_name": "Chitty",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "646225f3-8839-4813-a5a3-4fb75ce1f30b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Kalisa y Guti Gutiérrez M",
    "token": "token-kalisa-y-guti-gutierrez--75",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "0561b8aa-8883-45b1-a7e7-bbc9aa24af48",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "646225f3-8839-4813-a5a3-4fb75ce1f30b",
        "first_name": "Kalisa",
        "last_name": "Gutiérrez M",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "572d0527-589e-4f48-a078-52db7b80ed19",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "646225f3-8839-4813-a5a3-4fb75ce1f30b",
        "first_name": "Guti",
        "last_name": "Gutiérrez M",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "fdfdffa3-616e-4479-aaab-5f76c8c028b0",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Carmen y José Luis Medina",
    "token": "token-carmen-y-jose-luis-medin-76",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "7778c42b-47c8-4a3a-a19a-1f4069c92ddd",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fdfdffa3-616e-4479-aaab-5f76c8c028b0",
        "first_name": "Carmen",
        "last_name": "Medina",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "149fcc39-14de-4815-a207-4af325723abc",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "fdfdffa3-616e-4479-aaab-5f76c8c028b0",
        "first_name": "José Luis",
        "last_name": "Medina",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "94517872-e037-4d7e-a54f-4e40ab0ab502",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Morocha y Miguel (Grupo G)",
    "token": "token-morocha-y-miguel-grupo-g-77",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "5bbef59a-099c-443a-a176-c4c7aa33471e",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "94517872-e037-4d7e-a54f-4e40ab0ab502",
        "first_name": "Morocha",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "5145853b-2e92-4afd-a60b-00f71c4b427a",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "94517872-e037-4d7e-a54f-4e40ab0ab502",
        "first_name": "Miguel",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "23837ddd-e742-453e-a728-f44cbd7c6f44",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Rosi",
    "token": "token-rosi-78",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "fd061480-68df-4889-a50f-a38e66701496",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "23837ddd-e742-453e-a728-f44cbd7c6f44",
        "first_name": "Rosi",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "07d8ea4a-0c4a-42ec-ae91-e6d85e6d8e7b",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Angelo",
    "token": "token-angelo-79",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "d4fcd77e-8018-4f70-a2a7-eb0c823a734d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "07d8ea4a-0c4a-42ec-ae91-e6d85e6d8e7b",
        "first_name": "Angelo",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "e1a1e362-145b-42ee-a6cd-173cab84f60e",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Johana",
    "token": "token-johana-80",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "959232e2-a238-43e0-a37c-935b400a1bec",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e1a1e362-145b-42ee-a6cd-173cab84f60e",
        "first_name": "Johana",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "11f531c1-db15-4ed1-aeda-d0bacf7a9349",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Evelio",
    "token": "token-evelio-81",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "de2b55b1-7319-41fc-a089-0f20832afebd",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "11f531c1-db15-4ed1-aeda-d0bacf7a9349",
        "first_name": "Evelio",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "f3f7c485-0ac0-4054-a636-e0eb7dcd4bc0",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Juleima",
    "token": "token-juleima-82",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "8add5246-6738-47d9-a4eb-adef8c670829",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f3f7c485-0ac0-4054-a636-e0eb7dcd4bc0",
        "first_name": "Juleima",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "90fdfa84-6e94-478b-aa0a-548cd429747e",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Fernando",
    "token": "token-fernando-83",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "a2cd1104-8457-47ac-a218-1e7f8b6c0f13",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "90fdfa84-6e94-478b-aa0a-548cd429747e",
        "first_name": "Fernando",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "ed05efae-e8d3-474e-aee8-645ce0af1603",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Juleima (2)",
    "token": "token-juleima-2-84",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "41a93556-6abc-433c-ab60-41ac8c2f86d8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "ed05efae-e8d3-474e-aee8-645ce0af1603",
        "first_name": "Juleima",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "6f7f80e8-c0d7-4c5f-ab68-7e979661ff87",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Adán",
    "token": "token-adan-85",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "3d63137d-5d1c-4e0e-ac3e-d22e65b3856d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "6f7f80e8-c0d7-4c5f-ab68-7e979661ff87",
        "first_name": "Adán",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "2336a725-fb93-4c30-a68b-fed3c9875a54",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Joselin",
    "token": "token-joselin-86",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "ba39ee0c-fb36-4e01-a148-fd8db5d8f9d1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "2336a725-fb93-4c30-a68b-fed3c9875a54",
        "first_name": "Joselin",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "ce649645-ceba-4fe8-a469-e5707b56d19c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Augusto",
    "token": "token-augusto-87",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9a56f00d-a01b-4831-a6bf-9e433dade1b0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "ce649645-ceba-4fe8-a469-e5707b56d19c",
        "first_name": "Augusto",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "d7207a2b-6689-42cd-a0fb-6ecab6aef7dc",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Pierina",
    "token": "token-pierina-88",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "dd67c41d-d53b-4b7d-ab73-78e82e497d38",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d7207a2b-6689-42cd-a0fb-6ecab6aef7dc",
        "first_name": "Pierina",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "5adcb519-5ceb-4d83-afef-4cd6eadcb79d",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Kenia",
    "token": "token-kenia-89",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "62c4d903-ce46-4079-adcf-99e47ec653f4",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "5adcb519-5ceb-4d83-afef-4cd6eadcb79d",
        "first_name": "Kenia",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "b2af84ca-0835-4601-a58c-a3d3da2aec11",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Fidel",
    "token": "token-fidel-90",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "16459dc4-d1da-4ef9-ac4d-6472ed0f22ef",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "b2af84ca-0835-4601-a58c-a3d3da2aec11",
        "first_name": "Fidel",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "d9845397-0a11-4e91-a6bb-2c3820dcbe04",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Michelle",
    "token": "token-michelle-91",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "880a09cf-6e72-4cc5-af45-41b7cb8ce2c0",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "d9845397-0a11-4e91-a6bb-2c3820dcbe04",
        "first_name": "Michelle",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "8d913a7d-48e6-4c4b-a076-18992614f741",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Stephanie",
    "token": "token-stephanie-92",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "02c2cc8d-9cd5-40b0-ab2f-1c5831774121",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "8d913a7d-48e6-4c4b-a076-18992614f741",
        "first_name": "Stephanie",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "aac07e17-aa2f-418c-add3-3e574b728c5c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Rodrigo",
    "token": "token-rodrigo-93",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "e707f0c1-cbee-4b55-ae12-a4f90275aa21",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "aac07e17-aa2f-418c-add3-3e574b728c5c",
        "first_name": "Rodrigo",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "f0496505-8741-4170-ab9a-d0aeda7b3ae5",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Igor y Ana Gutiérrez",
    "token": "token-igor-y-ana-gutierrez-94",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "7f7d2e5c-1607-40fd-ad58-f84432c1bf8d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f0496505-8741-4170-ab9a-d0aeda7b3ae5",
        "first_name": "Igor",
        "last_name": "Gutiérrez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "eb2dc4f3-5660-473c-ae82-89574e6e3fa1",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "f0496505-8741-4170-ab9a-d0aeda7b3ae5",
        "first_name": "Ana",
        "last_name": "Gutiérrez",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "3cdbddec-397b-49f7-ab5e-6c1c7bf7f33c",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Iván y Sandra Martín",
    "token": "token-ivan-y-sandra-martin-95",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "22a82ce1-91e4-4647-ab37-55c88bec23b8",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3cdbddec-397b-49f7-ab5e-6c1c7bf7f33c",
        "first_name": "Iván",
        "last_name": "Martín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "b98b390e-fa33-43eb-a21d-a3d3a4863892",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "3cdbddec-397b-49f7-ab5e-6c1c7bf7f33c",
        "first_name": "Sandra",
        "last_name": "Martín",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "45867d1d-d5e6-4f8b-a8d9-d6473c892533",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Luisja y Marta (Grupo H)",
    "token": "token-luisja-y-marta-grupo-h-96",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "7ecb59c2-9a62-4b25-a09f-a52e23dda0d5",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "45867d1d-d5e6-4f8b-a8d9-d6473c892533",
        "first_name": "Luisja",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "1333ce47-0b72-4861-a046-4cd4c78b65d9",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "45867d1d-d5e6-4f8b-a8d9-d6473c892533",
        "first_name": "Marta",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "64d3b7da-80d5-4360-a083-be6bf97f02ed",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Dani Santa y Novia Dani Merino",
    "token": "token-dani-santa-y-novia-dani--97",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "d9014679-1ae4-4373-a147-e69bf5cda94f",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "64d3b7da-80d5-4360-a083-be6bf97f02ed",
        "first_name": "Dani Santa",
        "last_name": "Merino",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "398dfa22-4408-4436-a4a6-7675f165d971",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "64d3b7da-80d5-4360-a083-be6bf97f02ed",
        "first_name": "Novia Dani",
        "last_name": "Merino",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "775df20f-7e35-4022-adbe-46ca8cf2c79f",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Steakel",
    "token": "token-steakel-98",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "e6f484ba-4128-48e7-aeb4-6ea0a68c5fdd",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "775df20f-7e35-4022-adbe-46ca8cf2c79f",
        "first_name": "Steakel",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "a7fa18dc-fc58-4eb8-a661-335aa529a7f3",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Alberto Rasillo",
    "token": "token-alberto-rasillo-99",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "e20bcb3f-09bb-46b0-a694-708ad3aab132",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "a7fa18dc-fc58-4eb8-a661-335aa529a7f3",
        "first_name": "Alberto Rasillo",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "e928bccc-3462-41aa-a818-010d500610ea",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Campoo y Sandra Campoo Merino",
    "token": "token-campoo-y-sandra-campoo-m-100",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "56a9d83a-6759-475a-acae-30802220075d",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e928bccc-3462-41aa-a818-010d500610ea",
        "first_name": "Campoo",
        "last_name": "Merino",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "d9e5baff-6ab1-4e43-a3e5-fbee00e5d315",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "e928bccc-3462-41aa-a818-010d500610ea",
        "first_name": "Sandra",
        "last_name": "Campoo Merino",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "34281e3a-148b-4ede-ac00-ea423528a312",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Aisar y Lioba (Grupo I)",
    "token": "token-aisar-y-lioba-grupo-i-101",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "9dc87406-7347-4859-a2c4-fdd517d8be43",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "34281e3a-148b-4ede-ac00-ea423528a312",
        "first_name": "Aisar",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "a778e5a7-7741-42e1-acc5-862d27b53e31",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "34281e3a-148b-4ede-ac00-ea423528a312",
        "first_name": "Lioba",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  },
  {
    "id": "648b0c85-eab0-4772-ac4b-d1ec538bcff6",
    "wedding_id": "w-stephanie-rodrigo-2027",
    "name": "Gelcar y Novia Gelcar (Grupo J)",
    "token": "token-gelcar-y-novia-gelcar-gr-102",
    "invitation_status": "sent",
    "custom_message": "Incluye invitación a Preboda & Cata Privada",
    "allowed_event_ids": [
      "evt-preboda-cata",
      "evt-ceremonia",
      "evt-banquete",
      "evt-fiesta-dj"
    ],
    "guests": [
      {
        "id": "cc7bdb5b-f519-4870-aa90-47c6957aac2f",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "648b0c85-eab0-4772-ac4b-d1ec538bcff6",
        "first_name": "Gelcar",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      },
      {
        "id": "74a0276e-ee03-4dc3-a21b-baa0fd404884",
        "wedding_id": "w-stephanie-rodrigo-2027",
        "group_id": "648b0c85-eab0-4772-ac4b-d1ec538bcff6",
        "first_name": "Novia Gelcar",
        "last_name": "",
        "is_child": false,
        "guest_type": "adult",
        "is_plus_one_allowed": false,
        "notes": "Preboda"
      }
    ]
  }
];

export const INITIAL_RSVPS: GroupRSVPSubmission[] = [];

export const INITIAL_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'block-hero',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'hero',
    title: 'Rodrigo & Stephanie',
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
        { name: 'Hoteles en Valladolid Capital (AC Palacio de Santa Ana / Olid)', discount: 'Tarifa especial invitados: RODRIGO&STEPHANIE', distance: 'A 25 min en autobús' }
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
      account_holder: 'Rodrigo & Stephanie'
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

