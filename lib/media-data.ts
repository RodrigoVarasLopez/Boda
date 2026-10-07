import { MediaPhoto, GuestBookEntry, MediaPhotoStatus, GuestBookEntryStatus } from './types';
import { buildStoragePath } from './media/urls';

export const STORAGE_KEY_PHOTOS = 'boda_media_photos_v1';
export const STORAGE_KEY_GUESTBOOK = 'boda_guestbook_entries_v1';
export const MEDIA_UPDATE_EVENT = 'boda_media_updated';

const WEDDING_ID = 'w-stephanie-rodrigo-2027';

// Real available images in public/
const PHOTO_ASSETS = [
  { url: '/images/bodega/bodega-concejo-banquete-noche.png', w: 1920, h: 1080, mime: 'image/png', size: 677186, ext: 'png' },
  { url: '/images/bodega/bodega-concejo-fachada-logo.png', w: 1920, h: 1080, mime: 'image/png', size: 487068, ext: 'png' },
  { url: '/images/bodega/cata-vino-burro-loco.png', w: 1280, h: 853, mime: 'image/png', size: 181213, ext: 'png' },
  { url: '/images/bodega/sala-barricas-bodega.png', w: 1280, h: 853, mime: 'image/png', size: 107531, ext: 'png' },
  { url: '/images/bodega/vinedos-valoria-barrica.png', w: 1920, h: 1080, mime: 'image/png', size: 754741, ext: 'png' },
  { url: '/wedding/floral-detail.jpg', w: 1800, h: 1200, mime: 'image/jpeg', size: 877787, ext: 'jpg' },
  { url: '/wedding/hero-mediterranean.jpg', w: 2000, h: 1333, mime: 'image/jpeg', size: 950826, ext: 'jpg' },
  { url: '/wedding/sunset-mediterranean.jpg', w: 2000, h: 1333, mime: 'image/jpeg', size: 1008033, ext: 'jpg' },
  { url: '/wedding/table-setting.jpg', w: 2000, h: 1333, mime: 'image/jpeg', size: 1000066, ext: 'jpg' },
  { url: '/wedding/venue-editorial.jpg', w: 2000, h: 1333, mime: 'image/jpeg', size: 1135048, ext: 'jpg' },
];

const PHOTO_CAPTIONS = [
  'Bodega Concejo iluminada para el banquete al aire libre',
  'Fachada y terraza de Bodega Concejo al atardecer',
  'Cata de vino Burro Loco para la preboda',
  'Sala de crianza y barricas de roble en la bodega',
  'Viñedos de Valoria la Buena bajo el sol castellano',
  'Detalle floral artesanal de las mesas imperiales',
  'Stephanie & Rodrigo en los exteriores de la bodega',
  'Atardecer dorado sobre las lomas de Valoria',
  'Montaje de mesa con vajilla artesanal y olivo',
  'Panorámica editorial del claustro y patio de la bodega',
  'Brindis de bienvenida con los primeros invitados',
  'Preparativos de la ceremonia civil en el jardín',
  'Rincón de firmas con flores silvestres y lino',
  'Copas preparadas para la degustación de tintos',
  'Luz cálida y velas en el porche de Bodega Concejo',
  'Paseo de la pareja entre las hileras de tempranillo',
  'Música en directo durante el cóctel al aire libre',
  'Detalle de la minuta personalizada con motivos de vid',
  'Risas y reencuentros antes de entrar al banquete',
  'Rincón de cócteles y limonada fresca bajo la parra',
  'Llegada de la familia a la posada de la bodega',
  'Barricas centenarias con dedicatorias de los novios',
  'El sol despidiéndose tras las viñas de Valoria',
  'Ambiente festivo en la pista de baile exterior',
  'Primer baile de Stephanie & Rodrigo bajo las guirnaldas',
  'Detalle de los regalos para los invitados',
  'Banderines y farolillos en la zona chill-out',
  'Amigos brindando en la cata previa del viernes',
  'Aperitivos castellanos maridados con vino local',
  'Momento emotivo durante los discursos de los testigos',
  'Las sonrisas cómplices de los recién casados',
  'La noche estrellada sobre el cielo de Valladolid',
  'Puesta de sol reflejada en las copas de cristal',
  'Detalle de los votos en papel de algodón',
  'Mesa presidencial decorada con sarmientos y eucalipto',
  'Selfie divertido del grupo de la universidad',
  'Cata a ciegas guiada por el enólogo de la bodega',
  'Ramillete de olivo y lavanda en cada plato',
  'Baile espontáneo junto a las barricas',
  'La emoción de los padres en primera fila',
  'La barra libre con cócteles temáticos de vino',
  'Foto espontánea de los novios riendo a carcajadas',
  'El coche clásico aparcado junto a la entrada de piedra',
  'Luces tenues para el cierre de una noche inolvidable',
  'Brindis sorpresa organizado por los padrinos',
  'Cariño y abrazos tras la ceremonia',
  'Un paseo íntimo antes de que empiece la cena',
  'Los novios posando con el equipo de la bodega',
  'Último baile de la madrugada con los más animados',
  'El amanecer sobre los viñedos tras la gran fiesta',
];

const UPLOADERS = [
  'Stephanie & Rodrigo',
  'Sofía Martín',
  'Carlos y María',
  'Familia Pérez',
  'Elena Torres',
  'Alberto Gómez',
  'Lucía Navarro',
  'David y Laura',
  'Marta Sánchez',
  'Pablo Ruiz',
  'Javier y Carmen',
  'Beatriz Domínguez',
  'Andrés Calvo',
  'Sara y Dani',
  'Gonzalo Prieto',
];

export function generateFixturePhotos(): MediaPhoto[] {
  const photos: MediaPhoto[] = [];

  for (let i = 0; i < 50; i++) {
    const asset = PHOTO_ASSETS[i % PHOTO_ASSETS.length];
    const caption = PHOTO_CAPTIONS[i] || `Fotografía del fin de semana #${i + 1}`;
    const uploader = UPLOADERS[i % UPLOADERS.length];
    const id = `photo-2027-${String(i + 1).padStart(3, '0')}`;

    let status: MediaPhotoStatus = 'approved';
    if (i >= 35 && i < 45) {
      status = 'pending';
    } else if (i >= 45) {
      status = 'hidden';
    }

    const is_approved = status === 'approved';
    const is_visible = status !== 'hidden';

    const safeName = `boda-concejo-${String(i + 1).padStart(2, '0')}.${asset.ext}`;
    const storage_path = buildStoragePath(WEDDING_ID, id, safeName);

    const day = (i % 28) + 1;
    const month = i < 20 ? '06' : i < 40 ? '07' : '08';
    const hour = 10 + (i % 12);
    const minute = (i * 7) % 60;
    const createdAt = `2027-${month}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;

    photos.push({
      id,
      wedding_id: WEDDING_ID,
      uploaded_by_guest_id: i % 3 === 0 ? null : `gst-mock-${i}`,
      uploader_name: uploader,
      storage_path,
      photo_url: asset.url,
      original_filename: safeName,
      mime_type: asset.mime,
      file_size: asset.size,
      width: asset.w,
      height: asset.h,
      caption,
      is_visible,
      is_approved,
      status,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return photos;
}

export function generateFixtureGuestbook(): GuestBookEntry[] {
  const messages = [
    { name: 'Sofía Martín', msg: '¡Va a ser una boda absolutamente mágica en Bodega Concejo! No veo la hora de brindar juntos por esta historia tan bonita.', status: 'approved' },
    { name: 'Familia Pérez', msg: 'Muchísimas felicidades parejaza. Allá estaremos para celebrar vuestro amor con todo el cariño y disfrutar de la cata en Valoria.', status: 'approved' },
    { name: 'Carlos y Carmen', msg: 'Qué ganas de acompañaros en un sitio tan especial. ¡Que este amor siga creciendo cada año como el mejor reserva de la bodega!', status: 'approved' },
    { name: 'Elena Torres', msg: 'Queridos Stephanie y Rodrigo, os deseo toda la felicidad del mundo. Será un honor vivir ese fin de semana junto a vosotros.', status: 'approved' },
    { name: 'Alberto Gómez Peláez', msg: '¡A preparar los zapatos de baile y las copas! No faltaremos por nada del mundo. ¡Vivan los novios!', status: 'approved' },
    { name: 'Lucía Navarro', msg: 'Un abrazo gigantesco a los dos. Se os ve tan felices y enamorados... gracias de corazón por hacernos partícipes.', status: 'approved' },
    { name: 'David y Laura', msg: 'Contando los días para ese 25 de agosto en Valoria la Buena. ¡Va a ser histórico!', status: 'approved' },
    { name: 'Marta Sánchez', msg: 'Enhorabuena amigos míos. Veros construir este camino juntos es una alegría inmensa para todos los que os queremos.', status: 'approved' },
    { name: 'Pablo Ruiz', msg: '¡Qué pedazo de localización habéis elegido! Enhorabuena a los dos y preparaos para bailar hasta el amanecer.', status: 'approved' },
    { name: 'Tía Concha & Tío Paco', msg: 'Hijos, qué orgullo veros dar este paso. La bendición más grande para vuestro matrimonio.', status: 'approved' },
    { name: 'Javier y Clara', msg: 'No podemos esperar a brindar con ese Burro Loco en la preboda del viernes. ¡Mucho amor!', status: 'approved' },
    { name: 'Beatriz Domínguez', msg: 'Sois pura inspiración. ¡Que la magia de Bodega Concejo os acompañe durante toda la vida!', status: 'approved' },
    { name: 'Andrés Calvo', msg: '¡Enhorabuena Rodri y Steph! Un abrazo de los grandes desde Madrid, allí estaremos dándolo todo.', status: 'approved' },
    { name: 'Sara y Dani', msg: 'La mejor pareja del mundo se merece la mejor boda del mundo. ¡Os queremos infinito!', status: 'approved' },
    { name: 'Gonzalo Prieto', msg: 'Recién recibí la invitación, ¡espectacular el detalle de la bodega! Nos vemos muy pronto para celebrarlo.', status: 'pending' },
    { name: 'Miriam Alarcón', msg: 'Un mensaje con todo mi cariño desde la distancia mientras confirmo el viaje. ¡Felicidades pareja bella!', status: 'pending' },
    { name: 'Marcos & Irene', msg: '¿Habrá transporte desde Valladolid centro para la fiesta? ¡Queremos darlo todo!', status: 'pending' },
    { name: 'Raquel Ortiz', msg: 'Muchísimas felicidades Stephanie y Rodrigo, un beso enorme a los dos.', status: 'pending' },
    { name: 'Invitado Anónimo', msg: 'Comentario de prueba técnica para validar moderación.', status: 'hidden' },
    { name: 'Spam Bot Filter', msg: 'Descuentos exclusivos en vuelos y reservas de hotel online.', status: 'hidden' },
  ];

  return messages.map((m, idx) => ({
    id: `gb-entry-${String(idx + 1).padStart(3, '0')}`,
    wedding_id: WEDDING_ID,
    guest_name: m.name,
    message: m.msg,
    status: m.status as GuestBookEntryStatus,
    created_at: `2027-06-${String((idx % 25) + 1).padStart(2, '0')}T${12 + (idx % 8)}:00:00.000Z`,
    approved_at: m.status === 'approved' ? `2027-06-${String((idx % 25) + 1).padStart(2, '0')}T14:00:00.000Z` : null,
  }));
}

let inMemoryPhotos: MediaPhoto[] | null = null;
let inMemoryGuestbook: GuestBookEntry[] | null = null;

export function getStoredPhotos(): MediaPhoto[] {
  if (typeof window === 'undefined') {
    if (!inMemoryPhotos) {
      inMemoryPhotos = generateFixturePhotos();
    }
    return inMemoryPhotos;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryPhotos = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored photos:', e);
  }

  const initial = inMemoryPhotos || generateFixturePhotos();
  inMemoryPhotos = initial;
  try {
    localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(initial));
  } catch {
    // quota exceeded or incognito
  }
  return initial;
}

export function setStoredPhotos(photos: MediaPhoto[]) {
  inMemoryPhotos = photos;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(photos));
    } catch (e) {
      console.warn('Error saving stored photos:', e);
    }
    window.dispatchEvent(new CustomEvent(MEDIA_UPDATE_EVENT));
  }
}

export function getStoredGuestbook(): GuestBookEntry[] {
  if (typeof window === 'undefined') {
    if (!inMemoryGuestbook) {
      inMemoryGuestbook = generateFixtureGuestbook();
    }
    return inMemoryGuestbook;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUESTBOOK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryGuestbook = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored guestbook:', e);
  }

  const initial = inMemoryGuestbook || generateFixtureGuestbook();
  inMemoryGuestbook = initial;
  try {
    localStorage.setItem(STORAGE_KEY_GUESTBOOK, JSON.stringify(initial));
  } catch {
    // quota exceeded or incognito
  }
  return initial;
}

export function setStoredGuestbook(entries: GuestBookEntry[]) {
  inMemoryGuestbook = entries;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_GUESTBOOK, JSON.stringify(entries));
    } catch (e) {
      console.warn('Error saving stored guestbook:', e);
    }
    window.dispatchEvent(new CustomEvent(MEDIA_UPDATE_EVENT));
  }
}
