'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wedding, CMSBlock, Event } from './types';
import { INITIAL_WEDDING, INITIAL_EVENTS } from './mock-data';

const CMS_STORAGE_KEY = 'boda_cms_store_v3';

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
      location_highlight: 'Iglesia de Villamuriel de Cerrato & Bodega Concejo',
      location_detail: 'Villamuriel de Cerrato · Valoria la Buena',
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
        'Queremos compartir contigo uno de los momentos más importantes de nuestras vidas: desde el "sí, quiero" en la Iglesia de Villamuriel de Cerrato hasta el cóctel y banquete en Bodega Concejo.',
      welcome_body:
        'Un fin de semana muy especial que comenzará el viernes con la preboda en la Bodega El Corro de Villamuriel de Cerrato (junto a la esclusa del Canal de Castilla) y continuará el sábado con nuestra ceremonia en la Iglesia de Villamuriel de Cerrato, seguida del cóctel, banquete y fiesta en Bodega Concejo.',
      concierge_title: 'Concierge del Invitado',
      concierge_badge: 'Guía 2027',
      concierge_items: [
        {
          title: 'Viernes 27 · Preboda en Villamuriel',
          subtitle: 'Bodega El Corro (Junto a la Esclusa del Canal)',
        },
        {
          title: 'Sábado 28 · Ceremonia Religiosa',
          subtitle: 'Iglesia de Villamuriel de Cerrato',
        },
        {
          title: 'Cóctel, Banquete & Fiesta',
          subtitle: 'Bodega Concejo (Autobuses Villamuriel ↔ Concejo con parada en Palencia)',
        },
      ],
      concierge_footer:
        'Consulta en esta web el programa completo, los horarios de autobuses desde Villamuriel y Palencia, los hoteles recomendados y confirma tu asistencia.',
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
        'El camino que nos ha traído hasta aquí, desde nuestras raíces en Villamuriel de Cerrato hasta celebrar nuestro gran día rodeados de todos vosotros.',
      paragraphs: [
        'Nuestra historia comenzó entre risas, complicidad y el cariño de nuestra gente y nuestra tierra.',
        'Por eso nos hace una ilusión inmensa comenzar celebrando la preboda en la Bodega El Corro de Villamuriel de Cerrato (junto a la esclusa del Canal), darnos el "sí, quiero" en la Iglesia de Villamuriel de Cerrato y brindar juntos después en el cóctel y banquete en Bodega Concejo.',
      ],
      image: '/images/bodega/vinedos-valoria-barrica.png',
      image_badge: 'Villamuriel & Bodega Concejo',
      image_caption: 'Villamuriel de Cerrato · Valoria la Buena',
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
        'Empezaremos el viernes en la Bodega El Corro de Villamuriel de Cerrato y el sábado nos casaremos en la Iglesia de Villamuriel de Cerrato antes de ir al cóctel y banquete en Bodega Concejo.',
      friday_tag: 'PARTE 1 · VIERNES 27 AGOSTO',
      friday_badge: 'Villamuriel de Cerrato',
      friday_title: 'Preboda en Bodega El Corro (Villamuriel de Cerrato)',
      friday_description:
        'Comenzaremos el fin de semana en Villamuriel de Cerrato, en la tradicional Bodega El Corro (situada junto a la esclusa del Canal de Castilla), compartiendo vinos, picoteo y risas con nuestros amigos y familiares.',
      saturday_tag: 'PARTE 2 · SÁBADO 28 AGOSTO',
      saturday_badge: 'El Gran Día · Todos los Invitados',
      saturday_title: 'Iglesia de Villamuriel de Cerrato & Bodega Concejo',
      saturday_description:
        'Celebraremos la ceremonia religiosa en la Iglesia de Villamuriel de Cerrato y, a continuación, nos trasladaremos a Bodega Concejo para disfrutar del cóctel al aire libre, el banquete y la fiesta (con autobuses de Villamuriel al Concejo y viceversa con parada en Palencia).',
      saturday_address:
        'Ceremonia: Iglesia de Villamuriel de Cerrato · Cóctel y Banquete: Bodega Concejo',
    },
    display_order: 4,
    is_active: true,
    visibility: 'everyone',
  },
  {
    id: 'block-venue',
    wedding_id: 'w-stephanie-rodrigo-2027',
    type: 'venue',
    title: 'Los Escenarios',
    subtitle: 'Villamuriel de Cerrato & Bodega Concejo',
    content: {
      section_badge: 'Información Práctica',
      section_title: 'Guía del Invitado',
      section_subtitle:
        'Todo lo que necesitas saber sobre la preboda en Bodega El Corro, la ceremonia en la Iglesia de Villamuriel, el banquete en Bodega Concejo, hoteles y autobuses.',
      venue_badge: 'Ceremonia, Cóctel y Banquete',
      description:
        'La preboda tendrá lugar el viernes en la Bodega El Corro de Villamuriel de Cerrato (junto a la esclusa del Canal). El sábado celebraremos la ceremonia religiosa en la Iglesia de Villamuriel de Cerrato y, acto seguido, disfrutaremos del cóctel, el banquete y la fiesta en Bodega Concejo.',
      address:
        'Iglesia de Villamuriel de Cerrato (Palencia) & Bodega Concejo (Ctra. Valoria Km 3,6)',
      google_maps_url:
        'https://maps.google.com/?q=Iglesia+de+Santa+Maria+la+Mayor+Villamuriel+de+Cerrato+Palencia',
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
    subtitle: 'Hoteles en Palencia y Villamuriel + Autobuses',
    content: {
      hotels: [
        {
          name: 'Hotel Rey Sancho (Palencia)',
          discount: 'Alojamiento recomendado en Palencia capital (con parada de autobús)',
          distance: 'Av. Ponce de León, Palencia (a 10 min de Villamuriel)',
        },
        {
          name: 'Hotel de Villamuriel de Cerrato',
          discount: 'Próxima inauguración · En el propio Villamuriel de Cerrato',
          distance: 'En Villamuriel de Cerrato (Palencia)',
        },
      ],
      bus_info:
        'Habrá servicio de autobuses desde Villamuriel de Cerrato hasta Bodega Concejo (tras la ceremonia en la Iglesia) y de Bodega Concejo a Villamuriel de Cerrato y viceversa, con parada en Palencia.',
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
          question: '¿Dónde se celebran la Preboda, la Ceremonia y el Banquete?',
          answer:
            'El viernes la Preboda es en la Bodega El Corro en Villamuriel de Cerrato (junto a la esclusa del Canal de Castilla). El sábado la Ceremonia es en la Iglesia de Villamuriel de Cerrato y, al terminar, el Cóctel, Banquete y Fiesta serán en Bodega Concejo.',
        },
        {
          question: '¿Cómo funcionan los autobuses?',
          answer:
            'Habrá autobuses de ida desde Villamuriel de Cerrato hasta Bodega Concejo tras la ceremonia, y de regreso desde Bodega Concejo a Villamuriel de Cerrato y viceversa, haciendo parada en Palencia (junto al Hotel Rey Sancho).',
        },
        {
          question: '¿Habrá opciones para alergias y dietas especiales?',
          answer:
            'Por supuesto. En el formulario RSVP de tu invitación puedes indicar cualquier alergia o dieta (vegetariana, celíaca, menú infantil, etc.) y adaptaremos tu menú.',
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
        'Comparte unas palabras con Rodrigo & Stephanie y revive los momentos más especiales de nuestra boda en Villamuriel de Cerrato y Bodega Concejo.',
      footer_monogram: 'R&S',
      footer_names: 'Rodrigo & Stephanie',
      footer_date_location:
        '28 · 08 · 2027 · Villamuriel de Cerrato & Bodega Concejo',
      footer_quote:
        '¡Nos hace una ilusión inmensa contar con vosotros en nuestro gran día!',
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

  const result: CMSBlock[] = [];

  for (const stored of storedBlocks) {
    const def = DEFAULT_CMS_BLOCKS.find(
      (d) => d.type === stored.type || d.id === stored.id
    );
    if (def) {
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
    const heroBlock = state.blocks.find((b) => b.type === 'hero');
    const introBlock = state.blocks.find((b) => b.type === 'intro');
    const registryBlock = state.blocks.find((b) => b.type === 'registry');

    const syncedWedding: Wedding = {
      ...state.wedding,
      couple_names: heroBlock?.title || state.wedding.couple_names,
      hero_message: heroBlock?.content?.hero_message || state.wedding.hero_message,
      location_summary: heroBlock?.content?.location_detail
        ? `${heroBlock.content.location_highlight || 'Villamuriel de Cerrato & Bodega Concejo'} · ${heroBlock.content.location_detail}`
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

  const updateBlock = useCallback(
    (blockId: string, patch: Partial<CMSBlock>) => {
      updateBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...b,
                ...patch,
                content: patch.content
                  ? { ...b.content, ...patch.content }
                  : b.content,
              }
            : b
        )
      );
    },
    [updateBlocks]
  );

  const updateEvents = useCallback((updater: (prev: Event[]) => Event[]) => {
    setState((prev) => {
      const nextEvents = updater(prev.events);
      const nextState = { ...prev, events: nextEvents };
      saveCMSStore(nextState);
      return loadCMSStore();
    });
  }, []);

  const updateEvent = useCallback(
    (eventId: string, patch: Partial<Event>) => {
      updateEvents((prev) =>
        prev.map((evt) => (evt.id === eventId ? { ...evt, ...patch } : evt))
      );
    },
    [updateEvents]
  );

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
