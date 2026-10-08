import { MediaPhoto, GuestBookEntry, MediaPhotoStatus, GuestBookEntryStatus } from './types';
import { buildStoragePath } from './media/urls';

export const STORAGE_KEY_PHOTOS = 'boda_media_photos_v2';
export const STORAGE_KEY_GUESTBOOK = 'boda_guestbook_entries_v2';
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
  return [];
}

export function generateFixtureGuestbook(): GuestBookEntry[] {
  return [];
}

let inMemoryPhotos: MediaPhoto[] | null = null;
let inMemoryGuestbook: GuestBookEntry[] | null = null;

export function getStoredPhotos(): MediaPhoto[] {
  if (typeof window === 'undefined') {
    return inMemoryPhotos || [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHOTOS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryPhotos = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored photos:', e);
  }

  inMemoryPhotos = [];
  return [];
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
    return inMemoryGuestbook || [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GUESTBOOK);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryGuestbook = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored guestbook:', e);
  }

  inMemoryGuestbook = [];
  return [];
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
