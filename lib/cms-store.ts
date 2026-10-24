'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wedding, CMSBlock, Event } from './types';
import { INITIAL_WEDDING, INITIAL_EVENTS } from './mock-data';

const CMS_STORAGE_KEY = 'boda_cms_store_v2';

export interface CMSStoreState {
  wedding: Wedding;
  blocks: CMSBlock[];
  events: Event[];
}

export const DEFAULT_CMS_BLOCKS: CMSBlock[] = [
  {
    id: 'block-hero',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'hero',
    title: 'Rodrigo & Stephanie',
    subtitle: '28 · 08 · 2027',
    content: {
      envelope_day: '28',
      envelope_month_year: 'Agosto · 2027',
      envelope_tagline: 'Nos Casamos',
      envelope_button: 'Abrir invitación',
      hero_badge: 'Invitación Exclusiva',
      location_highlight: 'Boda en Bodega Concejo',
      location_detail: 'Valoria la Buena · Valladolid',
      hero_message: 'Nos casamos y no nos imaginaríamos este día sin vosotros',
      cta_primary: 'Confirmar Asistencia',
      cta_secondary: 'Ver Mi Programa',
      image: '/images/bodega/bodega-concejo-banquete-noche.png',
    },
    display_order: 1,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-intro',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'intro',
    title: 'Bienvenidos a Nuestra Boda',
    subtitle: 'Bienvenida & Tarjeta Concierge',
    content: {
      welcome_quote:
        'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas entre viñedos, música en directo y los mejores vinos de nuestra tierra.',
      welcome_body:
        'Queremos que viváis con nosotros cada instante de esta celebración en las tierras vallisoletanas de Valoria la Buena: un fin de semana diseñado para disfrutar sin prisas de la gastronomía, el vino y los mejores recuerdos.',
      concierge_title: 'Concierge del Invitado',
      concierge_badge: 'Guía 2027',
      concierge_items: [
        {
          title: '27 & 28 de Agosto de 2027',
          subtitle: 'Viernes Preboda & Sábado Gran Día',
        },
        {
          title: 'Bodega Concejo · Valoria la Buena',
          subtitle: 'Valladolid (Ctra. Valoria Km 3,6)',
        },
        {
          title: 'Banquete al Aire Libre & Música',
          subtitle: 'Maridaje con vinos de autor, cóctel y DJ',
        },
      ],
      concierge_footer:
        'Consulta en esta web el programa interactivo, confirma tu asistencia, gestiona tu menú y descarga los accesos en tu calendario.',
    },
    display_order: 2,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-story',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'story',
    title: 'Nuestra Historia',
    subtitle: '01 · NOSOTROS',
    content: {
      intro_text:
        'El camino que nos ha traído hasta aquí y por qué este rincón enológico de Valladolid es tan especial para nosotros.',
      paragraphs: [
        'Nuestra historia comenzó entre risas, complicidad y una pasión compartida por nuestra tierra, la gastronomía y el buen vino.',
        'Nos hace una ilusión inmensa dar el "sí, quiero" rodeados de nuestra gente en un entorno tan mágico y personal como los viñedos de Bodega Concejo.',
      ],
      image: '/images/bodega/vinedos-valoria-barrica.png',
      image_badge: 'Tradición & Pasión',
      image_caption: 'Valoria la Buena (Valladolid)',
      signature_left: 'Rodrigo & Stephanie',
      signature_right: 'Agosto · 2027',
    },
    display_order: 3,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-timeline',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'timeline',
    title: 'El Plan de Vuestra Boda',
    subtitle: 'Itinerario · Dos Momentos',
    content: {
      public_title: 'Programa del Fin de Semana',
      description:
        'La celebración se divide en dos momentos únicos entre viñedos, bodega y música en directo.',
      friday_tag: 'PARTE 1 · VIERNES 27 AGOSTO',
      friday_badge: 'Amigos · Exclusivo',
      friday_title: 'Preboda & Cata en la Bodega',
      friday_description:
        'Una velada íntima reservada para nuestros amigos más cercanos: paseo por los viñedos, visita guiada a la sala de crianza en barricas de roble y cata de nuestros mejores vinos de autor con maridaje antes del gran día.',
      saturday_tag: 'PARTE 2 · SÁBADO 28 AGOSTO',
      saturday_badge: 'El Gran Día · Todos los Invitados',
      saturday_title: 'Boda en Bodega Concejo',
      saturday_description:
        'Ceremonia civil al aire libre, banquete en la terraza de viñedos con música en directo y la mejor fiesta con DJ y barra libre bajo las estrellas.',
      saturday_address: 'Ctra. Valoria Km 3,6 · 47200 Valoria La Buena (Valladolid)',
    },
    display_order: 4,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-venue',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'venue',
    title: 'El Lugar',
    subtitle: 'Bodega Concejo',
    content: {
      section_badge: 'Información Práctica',
      section_title: 'Guía del Invitado',
      section_subtitle:
        'Todo lo que necesitas saber sobre traslados, alojamiento, enclave y detalles para disfrutar al máximo.',
      venue_badge: 'El Enclave',
      description:
        'Enclavada en Valoria la Buena (Valladolid), Bodega Concejo es una bodega familiar rodeada de viñedos centenarios donde celebraremos la ceremonia civil al aire libre, el banquete con música en directo y la fiesta nocturna.',
      address: 'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
      google_maps_url:
        'https://maps.google.com/?q=Bodega+Concejo+Ctra+Valoria+Km+3.6+47200+Valoria+la+Buena+Valladolid',
      image: '/images/bodega/bodega-concejo-banquete-noche.png',
    },
    display_order: 5,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-travel',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'travel',
    title: 'Alojamiento & Autobuses de Traslado',
    subtitle: 'Para vuestra mayor comodidad',
    content: {
      hotels: [
        {
          name: 'Posada Real Concejo',
          discount: 'Alojamiento boutique en la propia bodega / Valoria',
          distance: 'En el propio complejo',
        },
        {
          name: 'Hoteles en Valladolid Capital (AC Palacio de Santa Ana / Olid)',
          discount: 'Tarifa especial invitados: RODRIGO&STEPHANIE',
          distance: 'A 25 min en autobús',
        },
      ],
      bus_info:
        'Habrá servicio de autobuses de ida y vuelta desde Valladolid centro (Plaza de Zorrilla) hasta Bodega Concejo para la boda y con varios turnos de regreso tras la fiesta.',
    },
    display_order: 6,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-registry',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'registry',
    title: 'Lista de Bodas',
    subtitle: 'Vuestra presencia es nuestro mayor regalo',
    content: {
      message:
        'Vuestra presencia y compañía en este día tan especial es nuestro mayor regalo. Si además deseáis colaborar en nuestra luna de miel y nueva etapa:',
      iban: 'ES91 2100 0418 4502 0005 1234',
      account_holder: 'Rodrigo & Stephanie',
      bank_name: 'CaixaBank',
    },
    display_order: 7,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-faq',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'faq',
    title: 'Preguntas Frecuentes',
    subtitle: 'Detalles prácticos para el fin de semana',
    content: {
      faqs: [
        {
          question: '¿Cuál es el dress code recomendado?',
          answer:
            'Viernes (preboda): Casual Chic entre viñedos. Sábado (boda): Formal / traje o vestido midi o largo.',
        },
        {
          question: '¿Habrá opciones para alergias y dietas especiales?',
          answer:
            'Por supuesto. En el formulario RSVP de tu invitación puedes indicar cualquier alergia o dieta (vegetariana, celíaca, etc.) y adaptaremos tu menú.',
        },
        {
          question: '¿Hay aparcamiento en la bodega?',
          answer:
            'Sí, Bodega Concejo cuenta con amplio aparcamiento privado gratuito para los invitados que vengan en coche.',
        },
      ],
    },
    display_order: 8,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-contact',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'contact',
    title: 'Libro de Firmas & Pie de Página',
    subtitle: 'Memorias de la Boda',
    content: {
      memories_badge: 'Memorias de la Boda',
      memories_title: 'Libro de Firmas & Galería',
      memories_description:
        'Comparte unas palabras con Rodrigo & Stephanie y revive los momentos más especiales de este fin de semana en Bodega Concejo.',
      footer_monogram: 'R&S',
      footer_names: 'Rodrigo & Stephanie',
      footer_date_location: '28 · 08 · 2027 · Bodega Concejo · Valoria La Buena (Valladolid)',
      footer_quote: '¡Nos hace una ilusión inmensa contar con vosotros en nuestro gran día!',
    },
    display_order: 9,
    is_active: true,
    visibility: 'everyone',
  },
];

function mergeWithDefaultBlocks(storedBlocks?: CMSBlock[]): CMSBlock[] {
  if (!Array.isArray(storedBlocks) || storedBlocks.length === 0) {
    return DEFAULT_CMS_BLOCKS;
  }

  // Ensure all default block types exist and merge missing default content keys
  const result: CMSBlock[] = [];
  const usedIds = new Set<string>();

  for (const stored of storedBlocks) {
    const def = DEFAULT_CMS_BLOCKS.find((d) => d.type === stored.type || d.id === stored.id);
    usedIds.add(stored.id);
    if (def) {
      usedIds.add(def.id);
      result.push({
        ...def,
        ...stored,
        content: {
          ...def.content,
          ...(stored.content || {}),
        },
      });
    } else {
      result.push(stored);
    }
  }

  // Add any newly introduced default blocks that weren't in storedBlocks yet
  for (const def of DEFAULT_CMS_BLOCKS) {
    if (!result.some((b) => b.type === def.type)) {
      result.push({
        ...def,
        display_order: result.length + 1,
      });
    }
  }

  return result.sort((a, b) => a.display_order - b.display_order);
}

export function loadCMSStore(): CMSStoreState {
  if (typeof window === 'undefined') {
    return {
      wedding: INITIAL_WEDDING,
      blocks: DEFAULT_CMS_BLOCKS,
      events: INITIAL_EVENTS,
    };
  }

  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) {
      return {
        wedding: INITIAL_WEDDING,
        blocks: DEFAULT_CMS_BLOCKS,
        events: INITIAL_EVENTS,
      };
    }

    const parsed = JSON.parse(raw);
    const wedding: Wedding = {
      ...INITIAL_WEDDING,
      ...(parsed.wedding || {}),
      iban_details: {
        ...INITIAL_WEDDING.iban_details!,
        ...(parsed.wedding?.iban_details || {}),
      },
    };
    const blocks = mergeWithDefaultBlocks(parsed.blocks);
    const events: Event[] =
      Array.isArray(parsed.events) && parsed.events.length > 0
        ? parsed.events
        : INITIAL_EVENTS;

    return { wedding, blocks, events };
  } catch {
    return {
      wedding: INITIAL_WEDDING,
      blocks: DEFAULT_CMS_BLOCKS,
      events: INITIAL_EVENTS,
    };
  }
}

export function saveCMSStore(state: CMSStoreState) {
  if (typeof window === 'undefined') return;
  try {
    // Sync wedding fields from hero & registry blocks for consistency
    const heroBlock = state.blocks.find((b) => b.type === 'hero');
    const introBlock = state.blocks.find((b) => b.type === 'intro');
    const registryBlock = state.blocks.find((b) => b.type === 'registry');

    const syncedWedding: Wedding = {
      ...state.wedding,
      couple_names: heroBlock?.title || state.wedding.couple_names,
      hero_message: heroBlock?.content?.hero_message || state.wedding.hero_message,
      location_summary: heroBlock?.content?.location_detail
        ? `${heroBlock.content.location_highlight || 'Bodega Concejo'} · ${heroBlock.content.location_detail}`
        : state.wedding.location_summary,
      welcome_quote: introBlock?.content?.welcome_quote || state.wedding.welcome_quote,
      iban_details: {
        account_holder:
          registryBlock?.content?.account_holder ||
          state.wedding.iban_details?.account_holder ||
          'Rodrigo & Stephanie',
        iban:
          registryBlock?.content?.iban ||
          state.wedding.iban_details?.iban ||
          'ES91 2100 0418 4502 0005 1234',
        bank_name:
          registryBlock?.content?.bank_name ||
          state.wedding.iban_details?.bank_name ||
          'CaixaBank',
        bic_swift: state.wedding.iban_details?.bic_swift || 'CAIXESBBXXX',
      },
    };

    const nextState: CMSStoreState = {
      wedding: syncedWedding,
      blocks: state.blocks,
      events: state.events,
    };

    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(nextState));
    window.dispatchEvent(new CustomEvent('boda-cms-updated'));
  } catch (e) {
    console.error('Error saving CMS store:', e);
  }
}

export function useCMSData() {
  const [state, setState] = useState<CMSStoreState>(() => ({
    wedding: INITIAL_WEDDING,
    blocks: DEFAULT_CMS_BLOCKS,
    events: INITIAL_EVENTS,
  }));
  const [isHydrated, setIsHydrated] = useState(false);

  const refresh = useCallback(() => {
    setState(loadCMSStore());
  }, []);

  useEffect(() => {
    refresh();
    setIsHydrated(true);

    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === CMS_STORAGE_KEY) {
        refresh();
      }
    };
    const handleCustom = () => refresh();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('boda-cms-updated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('boda-cms-updated', handleCustom);
    };
  }, [refresh]);

  const updateBlocks = useCallback((updater: (prev: CMSBlock[]) => CMSBlock[]) => {
    setState((prev) => {
      const nextBlocks = updater(prev.blocks);
      const nextState = { ...prev, blocks: nextBlocks };
      saveCMSStore(nextState);
      return loadCMSStore();
    });
  }, []);

  const updateBlock = useCallback((blockId: string, patch: Partial<CMSBlock>) => {
    updateBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              ...patch,
              content: patch.content ? { ...b.content, ...patch.content } : b.content,
            }
          : b
      )
    );
  }, [updateBlocks]);

  const updateEvents = useCallback((updater: (prev: Event[]) => Event[]) => {
    setState((prev) => {
      const nextEvents = updater(prev.events);
      const nextState = { ...prev, events: nextEvents };
      saveCMSStore(nextState);
      return loadCMSStore();
    });
  }, []);

  const updateEvent = useCallback((eventId: string, patch: Partial<Event>) => {
    updateEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? { ...evt, ...patch } : evt))
    );
  }, [updateEvents]);

  const updateWedding = useCallback((patch: Partial<Wedding>) => {
    setState((prev) => {
      const nextState = {
        ...prev,
        wedding: { ...prev.wedding, ...patch },
      };
      saveCMSStore(nextState);
      return loadCMSStore();
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaultState: CMSStoreState = {
      wedding: INITIAL_WEDDING,
      blocks: DEFAULT_CMS_BLOCKS,
      events: INITIAL_EVENTS,
    };
    saveCMSStore(defaultState);
    setState(defaultState);
  }, []);

  return {
    wedding: state.wedding,
    blocks: state.blocks,
    events: state.events,
    isHydrated,
    updateBlocks,
    updateBlock,
    updateEvents,
    updateEvent,
    updateWedding,
    resetToDefaults,
  };
}
