export const STORAGE_KEY_CREATIVE_PROJECT = 'boda_creative_project_dossier_v1';
export const CREATIVE_PROJECT_UPDATE_EVENT = 'boda_creative_project_updated';
export const DEFAULT_WEDDING_UUID = 'a0000000-0000-0000-0000-000000000001';

export type ProposalApprovalStatus = 'draft' | 'in_review' | 'approved';

export const APPROVAL_STATUS_LABELS: Record<ProposalApprovalStatus, string> = {
  draft: 'En diseño',
  in_review: 'En revisión con pareja',
  approved: 'Propuesta aprobada',
};

export interface CreativeColorSwatch {
  id: string;
  name: string;
  hex: string;
  role: string; // e.g., 'Base Luminosa (45%)', 'Botánico Principal (25%)'
  percentage?: number; // 0 to 100
  usage: string;
}

export function extractPercentageFromRole(role: string): number | null {
  if (!role) return null;
  const matchPct = role.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (matchPct) {
    const val = Math.round(parseFloat(matchPct[1].replace(',', '.')));
    if (!isNaN(val)) return Math.max(0, Math.min(100, val));
  }
  return null;
}

export function getSwatchPercentage(swatch: CreativeColorSwatch, fallback = 20): number {
  if (typeof swatch.percentage === 'number' && !isNaN(swatch.percentage)) {
    return Math.max(0, Math.min(100, Math.round(swatch.percentage)));
  }
  const fromRole = extractPercentageFromRole(swatch.role);
  if (fromRole !== null) return fromRole;
  return fallback;
}

export function formatRoleWithPercentage(roleStr: string, pct: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const trimmed = (roleStr || '').trim();
  if (!trimmed) return `Proporción (${clamped}%)`;
  if (/\(\s*\d+(?:[.,]\d+)?\s*%?\s*\)/.test(trimmed)) {
    return trimmed.replace(/\(\s*\d+(?:[.,]\d+)?\s*%?\s*\)/, `(${clamped}%)`);
  }
  if (/\d+(?:[.,]\d+)?\s*%/.test(trimmed)) {
    return trimmed.replace(/\d+(?:[.,]\d+)?\s*%/, `${clamped}%`);
  }
  return `${trimmed} (${clamped}%)`;
}

/**
 * Ensures every swatch has a numeric `percentage` synced with `role`,
 * and guarantees the sum of percentages NEVER exceeds 100%.
 * If `activeId` is provided, `activeId` keeps its requested percentage (clamped 0..100)
 * and the remaining swatches are proportionally reduced whenever the total would exceed 100%
 * (or scaled to 100% if `forceExact100` is true).
 */
export function enforceMax100Palette(
  swatches: CreativeColorSwatch[],
  activeId?: string,
  explicitPct?: number,
  forceExact100: boolean = false
): CreativeColorSwatch[] {
  if (!swatches || swatches.length === 0) return [];

  const defaultShare = Math.floor(100 / swatches.length);
  const items = swatches.map((sw) => {
    const pct =
      sw.id === activeId && typeof explicitPct === 'number'
        ? Math.max(0, Math.min(100, Math.round(explicitPct)))
        : getSwatchPercentage(sw, defaultShare);
    return {
      ...sw,
      percentage: pct,
    };
  });

  const total = items.reduce((acc, s) => acc + (s.percentage ?? 0), 0);

  if (total > 100 || (forceExact100 && total !== 100)) {
    if (activeId && items.length > 1) {
      const activeItem = items.find((s) => s.id === activeId);
      const activeVal = activeItem ? activeItem.percentage ?? 0 : 0;
      const allowedOthers = Math.max(0, 100 - activeVal);
      const others = items.filter((s) => s.id !== activeId);
      const othersSum = others.reduce((acc, s) => acc + (s.percentage ?? 0), 0);

      let remainingToDistribute = allowedOthers;
      const updatedOthers: Record<string, number> = {};

      others.forEach((o, idx) => {
        if (idx === others.length - 1) {
          updatedOthers[o.id] = Math.max(0, remainingToDistribute);
        } else {
          const share =
            othersSum > 0
              ? Math.round(((o.percentage ?? 0) / othersSum) * allowedOthers)
              : Math.floor(allowedOthers / others.length);
          const bounded = Math.max(0, Math.min(remainingToDistribute, share));
          updatedOthers[o.id] = bounded;
          remainingToDistribute -= bounded;
        }
      });

      return items.map((s) => {
        const finalPct = s.id === activeId ? activeVal : updatedOthers[s.id] ?? 0;
        return {
          ...s,
          percentage: finalPct,
          role: formatRoleWithPercentage(s.role, finalPct),
        };
      });
    } else {
      // Scale all items to sum to 100
      let remaining = 100;
      return items.map((s, idx) => {
        let finalPct = 0;
        if (idx === items.length - 1) {
          finalPct = Math.max(0, remaining);
        } else {
          finalPct =
            total > 0
              ? Math.round(((s.percentage ?? 0) / total) * 100)
              : Math.floor(100 / items.length);
          finalPct = Math.max(0, Math.min(remaining, finalPct));
          remaining -= finalPct;
        }
        return {
          ...s,
          percentage: finalPct,
          role: formatRoleWithPercentage(s.role, finalPct),
        };
      });
    }
  }

  return items.map((s) => ({
    ...s,
    percentage: s.percentage ?? 0,
    role: formatRoleWithPercentage(s.role, s.percentage ?? 0),
  }));
}

export interface CreativeMoodboardItem {
  id: string;
  title: string;
  category: string;
  image_url: string;
  description: string;
  execution_note: string;
}

export interface CreativeSpaceProposal {
  id: string;
  space_type: 'ceremonia' | 'coctel' | 'banquete';
  title: string;
  subtitle: string;
  location: string;
  image_url: string;
  status: ProposalApprovalStatus;
  atmosphere_summary: string;
  key_interventions: string[];
  lighting_and_ambience: string;
  technical_execution: string;
  reusable_tip: string;
}

export interface CreativeCompositionItem {
  id: string;
  title: string;
  zone: string;
  flowers_and_greenery: string;
  vessels_and_props: string;
  dimensions_and_height: string;
  quantity_estimate: string;
}

export interface CreativeSpecialCorner {
  id: string;
  corner_number: 1 | 2 | 3;
  title: string;
  location_moment: string;
  image_url: string;
  concept_description: string;
  elements_included: string[];
  functional_goal: string;
  status: ProposalApprovalStatus;
}

export interface CreativeLayoutZone {
  id: string;
  name: string;
  position_label: string;
  description: string;
  flow_note: string;
}

export interface CreativeLayoutSchema {
  id: string;
  space_name: string;
  subtitle: string;
  orientation_note: string;
  zones: CreativeLayoutZone[];
}

export interface CreativeStationeryItem {
  id: string;
  piece_name: string;
  moment: string;
  format_and_paper: string;
  finish_details: string;
  status: ProposalApprovalStatus;
}

export interface CreativeBudgetPriorityItem {
  id: string;
  element_name: string;
  category_link: string;
  priority_level: 'alta' | 'media' | 'optimizable';
  visual_impact_score: number; // 1-10
  estimated_share: string;
  rationale: string;
  smart_saving_tip: string;
}

export interface CreativeProjectDossier {
  id: string;
  wedding_id: string;
  project_title: string;
  project_subtitle: string;
  last_updated: string;
  // 1. Explicación del concepto creativo
  concept: {
    title: string;
    tagline: string;
    narrative: string;
    how_to_bring_to_reality: string;
    keywords: string[];
  };
  // 2. Moodboard e identidad visual
  moodboard: CreativeMoodboardItem[];
  // 3. Paleta cromática
  color_palette: CreativeColorSwatch[];
  // 4. Selección de materiales, texturas y estilo floral
  materials_and_florals: {
    materials_list: { name: string; texture: string; application: string }[];
    floral_style_title: string;
    floral_style_description: string;
    primary_blooms: string[];
    foliage_and_accents: string[];
    vessels_style: string;
  };
  // 5, 6, 7. Propuestas individuales (Ceremonia, Bienvenida/Cóctel, Banquete)
  space_proposals: CreativeSpaceProposal[];
  // 8. Composiciones y referencias decorativas
  compositions: CreativeCompositionItem[];
  // 9. Diseño conceptual de hasta tres rincones especiales
  special_corners: CreativeSpecialCorner[];
  // 10. Esquemas orientativos de distribución
  layout_schemas: CreativeLayoutSchema[];
  // 11. Identidad gráfica y diseño de toda la papelería acordada
  stationery: {
    monogram_concept: string;
    typography_serif: string;
    typography_sans: string;
    paper_and_seals: string;
    pieces: CreativeStationeryItem[];
  };
  // 12. Recomendaciones para mantener la coherencia visual
  coherence_guidelines: {
    golden_rules: { title: string; description: string }[];
    dos: string[];
    donts: string[];
  };
  // 13. Orientación sobre elementos decorativos a priorizar según presupuesto
  budget_priorities: CreativeBudgetPriorityItem[];
}

export const INITIAL_CREATIVE_DOSSIER: CreativeProjectDossier = {
  id: 'dossier-rodrigo-stephanie-v1',
  wedding_id: DEFAULT_WEDDING_UUID,
  project_title: 'Raíces del Cerrato & Luz de Viñedo',
  project_subtitle:
    'Dossier Digital Personalizado · Dirección de Arte, Escenografía, Estilo Floral y Producción Técnica',
  last_updated: '2026-10-31',

  // 1. EXPLICACIÓN DEL CONCEPTO CREATIVO
  concept: {
    title: 'Elegancia Orgánica entre Piedra Histórica y Viñedos al Atardecer',
    tagline:
      'Un diálogo entre la solemnidad patrimonial de Villamuriel de Cerrato y la calidez enológica contemporánea de Bodega Concejo.',
    narrative:
      'Vuestra boda transcurre en dos escenarios con una personalidad arquitectónica fortísima: la piedra centenaria de la Iglesia de Santa María la Mayor en Villamuriel de Cerrato y el universo de viñedos, barricas y piedra caliza de Bodega Concejo en Valoria la Buena. El concepto creativo no busca disfrazar estos espacios, sino elevar su belleza auténtica mediante una estética "Editorial Mediterránea & Castellana": líneas limpias, materiales nobles sin artificios, composiciones botánicas silvestres con movimiento y una iluminación cálida envolvente que transforme la bodega al caer la noche.',
    how_to_bring_to_reality:
      'Para llevar cada idea a la realidad sin sobrecargar los espacios, aplicamos la regla de "puntos focales de alto impacto": concentramos la inversión floral y escenográfica a la altura de la mirada y del objetivo fotográfico (pórtico y altar en ceremonia, rincón de bienvenida y seating plan en el cóctel, y mesas vestidas con lino y luz de vela en el banquete), reutilizando inteligentemente los arreglos principales entre la iglesia y la bodega.',
    keywords: [
      'Piedra Caliza & Lino Natural',
      'Botánica Silvestre de Agosto',
      'Elegancia Enológica',
      'Luz Cálida de Vela',
      'Artesanía Editorial',
    ],
  },

  // 2. MOODBOARD E IDENTIDAD VISUAL
  moodboard: [
    {
      id: 'mb-1',
      title: 'Atmósfera Nocturna y Luz Cálida en Bodega',
      category: 'Iluminación & Escenografía',
      image_url: '/images/bodega/bodega-concejo-banquete-noche.png',
      description:
        'Cientos de puntos de luz cálida (2700K) suspendidos y velas en cristal transparente que resaltan la arquitectura de Bodega Concejo.',
      execution_note:
        'Se instala guirnalda micro-LED cálida perimetral + candelabros de cristal a tres alturas en cada mesa.',
    },
    {
      id: 'mb-2',
      title: 'Arte de la Mesa: Lino, Cerámica y Cristal',
      category: 'Diseño de Banquete',
      image_url: '/wedding/table-setting.jpg',
      description:
        'Mesas vestidas con mantelería de lino color piedra, servilletas anudadas con espiga/olivo y minuta editorial personalizada sobre cada plato.',
      execution_note:
        'Combinación de mesas redondas con mesa presidencial imperial para favorecer tanto la conversación como la perspectiva fotográfica.',
    },
    {
      id: 'mb-3',
      title: 'Botánica Orgánica con Textura y Movimiento',
      category: 'Estilo Floral',
      image_url: '/wedding/floral-detail.jpg',
      description:
        'Arreglos asimétricos sin espuma floral visible, con caída natural de verde olivo, rosas de jardín marfil y toques empolvados.',
      execution_note:
        'Uso de flores de temporada de finales de agosto resistentes al calor para que luzcan intactas desde las 12:30 h hasta la noche.',
    },
    {
      id: 'mb-4',
      title: 'Identidad Vinícola & Terroir en los Rincones',
      category: 'Rincones Especiales',
      image_url: '/images/bodega/vinedos-valoria-barrica.png',
      description:
        'Integración de barricas de roble auténticas, botellas lacradas y cestas de fibra natural junto a los viñedos.',
      execution_note:
        'Las propias barricas de la bodega sirven de pedestal estructural para el Seating Plan y la estación de bienvenida.',
    },
    {
      id: 'mb-5',
      title: 'Arquitectura y Solemnidad Luminosa',
      category: 'Ceremonia & Entorno',
      image_url: '/wedding/venue-editorial.jpg',
      description:
        'Respeto por la piedra histórica enmarcando los accesos y el altar con columnas vegetales de efecto jardín.',
      execution_note:
        'Estructuras autoportantes en el altar que tras la ceremonia se trasladan en furgoneta climatizada a Bodega Concejo.',
    },
    {
      id: 'mb-6',
      title: 'Golden Hour entre Barricas y Viñedo',
      category: 'Cobertura & Experiencia',
      image_url: '/images/bodega/sala-barricas-bodega.png',
      description:
        'Contraste íntimo de sombras y madera envejecida para los retratos editoriales de la pareja.',
      execution_note:
        'Reservado acceso privado de 15 minutos con el equipo de fotografía antes de abrir el salón.',
    },
  ],

  // 3. PALETA CROMÁTICA
  color_palette: [
    {
      id: 'col-1',
      name: 'Piedra Caliza & Marfil',
      hex: '#F6F3EC',
      role: 'Base Principal (45%)',
      percentage: 45,
      usage: 'Mantelería de lino, papel algodón de papelería, rosas de jardín y velas.',
    },
    {
      id: 'col-2',
      name: 'Verde Olivo Silvestre',
      hex: '#5D6B52',
      role: 'Secundario Botánico (25%)',
      percentage: 25,
      usage: 'Follaje estructural (olivo y eucalipto), cintas de seda, lacres y detalles gráficos.',
    },
    {
      id: 'col-3',
      name: 'Arena Espiga & Roble',
      hex: '#D2C0A5',
      role: 'Neutro Cálido (15%)',
      percentage: 15,
      usage: 'Bajoplatos de fibra/madera, barricas, mobiliario de cóctel y espigas secas.',
    },
    {
      id: 'col-4',
      name: 'Burdeos Reserva Suave',
      hex: '#7A383E',
      role: 'Acento Enológico (10%)',
      percentage: 10,
      usage: 'Toques florales puntuales de final de verano, copas/vino y detalles del Seating Plan.',
    },
    {
      id: 'col-5',
      name: 'Carbón Tinta Editorial',
      hex: '#23201D',
      role: 'Tipografía & Contraste (5%)',
      percentage: 5,
      usage: 'Caligrafía e impresión tipográfica de minutas, meseros y señalética.',
    },
  ],

  // 4. SELECCIÓN DE MATERIALES, TEXTURAS Y ESTILO FLORAL
  materials_and_florals: {
    materials_list: [
      {
        name: 'Lino Lavado de Alto Gramaje',
        texture: 'Trama orgánica, caída mate sin brillos sintéticos',
        application: 'Manteles hasta el suelo, caminos de mesa presidencial y cartel de bienvenida en bastidor.',
      },
      {
        name: 'Madera de Roble Envejecido y Mimbre',
        texture: 'Veta natural cálida y trenzado artesanal',
        application: 'Barricas de apoyo en cóctel, sillas de madera decapada y cestas para pétalos y pai-pais.',
      },
      {
        name: 'Papel Algodón 300g con Bordes Rasgados',
        texture: 'Tacto esponjoso artesanal con lacre en relieve',
        application: 'Minutas personalizadas en cada plato, tarjetas del Seating Plan y números de mesa.',
      },
      {
        name: 'Cristal Soplado y Latón Envejecido',
        texture: 'Transparencia limpia y reflejo dorado mate',
        application: 'Portavelas cilíndricos de seguridad, candelabros estilizados y marcos de señalética.',
      },
    ],
    floral_style_title: 'Jardín Botánico Asimétrico con Guiño Castellano',
    floral_style_description:
      'Huimos de los centros redondos compactos y simétricos. Apostamos por composiciones aireadas, con diferentes alturas y tallos que parecen brotar de forma natural, combinando una base generosa de verdes mediterráneos con flores nobles en tonos crema, blanco roto y un sutil matiz rosado/vino.',
    primary_blooms: [
      'Rosa de jardín inglesa (variedad Patience / O’Hara blanco marfil)',
      'Lisianthus doble en tonos crema y champagne',
      'Dalia café au lait / blanca de temporada de agosto',
      'Astilbe blanco y flor de cera para aportar ligereza aérea',
    ],
    foliage_and_accents: [
      'Rama de olivo natural y eucalipto Cinerea / Parvifolia',
      'Espigas de trigo dorado de Tierra de Campos (guiño local sutil)',
      'Ramas de lentisco y ruscus italiano para estructura duradera',
    ],
    vessels_style:
      'Copas bajas de cerámica artesanal color piedra mate y ánforas de terracota envejecida para los rincones exteriores.',
  },

  // 5, 6, 7. PROPUESTAS INDIVIDUALES: CEREMONIA, BIENVENIDA/CÓCTEL Y BANQUETE
  space_proposals: [
    {
      id: 'prop-ceremonia',
      space_type: 'ceremonia',
      title: 'Propuesta Individual de Ceremonia',
      subtitle: 'Solemnidad Luminosa en la Iglesia de Santa María la Mayor',
      location: 'Iglesia de Villamuriel de Cerrato (13:00 h)',
      image_url: '/wedding/venue-editorial.jpg',
      status: 'approved',
      atmosphere_summary:
        'Realzar la arquitectura del templo sin competir con el retablo, creando un recorrido perfumado de olivo y rosas blancas desde el pórtico exterior hasta el altar.',
      key_interventions: [
        'Pórtico Exterior: Dos ánforas de piedra a distintas alturas flanqueando la puerta de madera para enmarcar la llegada de Stephanie y la salida bajo lluvia de arroz.',
        'Pasillo Central: Ramilletes verticales de olivo, paniculata/astilbe y cinta de lino crudo en bancos alternos (concentrados en los primeros 6 bancos y en el inicio del pasillo).',
        'Zona de Altar y Reclinatorios: Dos composiciones de suelo tipo pradera creciente frente al altar + guirnalda frontal baja a los pies de los novios.',
        'Estación de Salida: Mesa auxiliar vestida con cestas de mimbre con conos de arroz y pétalos naturales.',
      ],
      lighting_and_ambience:
        'Luz natural cenital del templo complementada con grupos de velones gruesos en cilindros de cristal en la base del altar.',
      technical_execution:
        'Montaje a las 10:30 h. Los 2 arreglos principales de suelo del altar se diseñan en bases móviles ocultas para trasladarlos a Bodega Concejo justo al terminar las fotos de familia (14:25 h).',
      reusable_tip:
        'Los arreglos del altar pasan a flanquear la Mesa Presidencial o el Seating Plan en la bodega, ahorrando un 35% en duplicidad floral.',
    },
    {
      id: 'prop-coctel',
      space_type: 'coctel',
      title: 'Propuesta Individual de Bienvenida y Cóctel',
      subtitle: 'Tarde entre Viñedos, Barricas y Jardín Mediterráneo',
      location: 'Jardines y Patio Exterior · Bodega Concejo (15:00 h — 16:45 h)',
      image_url: '/images/bodega/vinedos-valoria-barrica.png',
      status: 'approved',
      atmosphere_summary:
        'Una bienvenida fresca, relajada y gastronómica al aire libre donde los invitados sientan la hospitalidad desde el minuto uno, con zonas de sombra, música envolvente y estaciones decoradas con coherencia.',
      key_interventions: [
        'Arco / Hito de Bienvenida: Bastidor de madera con tela de lino caligrafiada ("Bienvenidos a nuestra boda · Rodrigo & Stephanie") apoyado junto a barrica con arreglo floral asimétrico.',
        'Islas de Cóctel y Mesas Altas: Vestidas con fundas de lino piedra y ramilletes en botellitas de cristal ambarino y transparente.',
        'Zona Lounge & Descanso: Rincones con sillones de mimbre/madera, alfombras de yute y sombrillas color crudo para los familiares mayores.',
        'Estaciones Gastronómicas: Integradas con cajas de madera de vendimia, pizarra/caligrafía editorial y verdes botánicos.',
      ],
      lighting_and_ambience:
        'Luz radiante de tarde tamizada por sombrillas color arena y vegetación; sonido acústico/chill-out perimetral a volumen conversacional.',
      technical_execution:
        'Montaje completo antes de las 13:45 h para recibir a los primeros autocares con las estaciones de bebida fría operativas.',
      reusable_tip:
        'El bastidor de bienvenida de lino se reubica al inicio de la fiesta junto a la zona de baile y recena.',
    },
    {
      id: 'prop-banquete',
      space_type: 'banquete',
      title: 'Propuesta Individual de Banquete',
      subtitle: 'Cena Editorial bajo Cielo de Luz Cálida',
      location: 'Salón Principal · Bodega Concejo (16:45 h — 20:00 h)',
      image_url: '/images/bodega/bodega-concejo-banquete-noche.png',
      status: 'in_review',
      atmosphere_summary:
        'Un salón cálido, elegante y escenográfico donde la madera, la piedra, el lino y la luz de las velas protagonizan la experiencia gastronómica.',
      key_interventions: [
        'Mesa Presidencial: Camino continuo tipo pradera botánica de punta a punta a baja altura con más de 25 puntos de vela en tubo de cristal.',
        'Mesas de Invitados (Combinación Dinámica): Alternancia de centros bajos orgánicos en copa de cerámica piedra con tríos de velas esbeltas para no obstaculizar nunca el contacto visual entre comensales.',
        'Puesta en Mesa Individual: Bajoplato de textura cálida, servilleta de lino en nudo suelto, minuta vertical impresa en papel algodón y detalle/rama aromática.',
        'Escenografía de Techo: Cielo de micro-luces cálidas creando un efecto estrellado íntimo para los brindis y entregas.',
      ],
      lighting_and_ambience:
        'Regulación progresiva de iluminación: cálida y luminosa en la entrada y primeros platos, bajando un 30% la intensidad general en los postres y entregas para que brillen las velas y las micro-luces.',
      technical_execution:
        'Salón 100% montado y velas encendidas a las 16:15 h para que el equipo de fotografía capture el salón limpio antes de que entren los invitados.',
      reusable_tip:
        'Los centros de la mesa presidencial pueden trasladarse después del banquete a la barra de coctelería o mesa de dulces/recena.',
    },
  ],

  // 8. COMPOSICIONES Y REFERENCIAS DECORATIVAS
  compositions: [
    {
      id: 'comp-1',
      title: 'Composición A · Centro de Mesa Redonda Conversacional',
      zone: 'Salón de Banquete (Mesas de 8-10 comensales)',
      flowers_and_greenery:
        'Base asimétrica de olivo y eucalipto con 9-11 tallos de flor principal (rosa inglesa marfil, lisianthus champagne y astilbe blanco).',
      vessels_and_props:
        'Copa baja de cerámica piedra mate + 3 portavelas de cristal con vela cónica color marfil.',
      dimensions_and_height: 'Altura máxima 28 cm (por debajo de la línea de visión de los invitados).',
      quantity_estimate: '12 a 15 unidades según número definitivo de mesas.',
    },
    {
      id: 'comp-2',
      title: 'Composición B · Guirnalda Botánica y Pradera de Mesa Presidencial',
      zone: 'Mesa Presidencial (y frontal de Altar)',
      flowers_and_greenery:
        'Tramo orgánico denso de verdes nobles con agrupaciones florales focales en el centro y caída suave hacia el suelo en los extremos.',
      vessels_and_props:
        'Bases técnicas ocultas con reserva de agua + 18-24 cilindros de cristal con velas flotantes y velas altas.',
      dimensions_and_height: 'Largo 3,20 m · Altura variable entre 18 y 35 cm.',
      quantity_estimate: '1 composición continua + 2 módulos de suelo reutilizados desde ceremonia.',
    },
    {
      id: 'comp-3',
      title: 'Composición C · Columna / Ánfora Escultórica de Bienvenida',
      zone: 'Pórtico de Iglesia → traslado a Seating Plan en Bodega',
      flowers_and_greenery:
        'Ramas largas con carácter arquitectónico, espigas doradas, rosas de jardín abiertas y caída asimétrica.',
      vessels_and_props: 'Ánfora de terracota envejecida sobre pedestal o barrica de roble.',
      dimensions_and_height: 'Altura total conjunto: 1,45 m y 1,15 m (juego de doble altura).',
      quantity_estimate: '2 conjuntos principales.',
    },
  ],

  // 9. DISEÑO CONCEPTUAL DE HASTA TRES RINCONES ESPECIALES
  special_corners: [
    {
      id: 'corner-1',
      corner_number: 1,
      title: 'Rincón 1 · Seating Plan «Gran Reserva Rodrigo & Stephanie»',
      location_moment: 'Acceso del Jardín de Cóctel al Salón Principal (Bodega Concejo)',
      image_url: '/images/bodega/cata-vino-burro-loco.png',
      concept_description:
        'Un homenaje al entorno vinícola: una estructura editorial de madera y lino flanqueada por dos barricas de roble y cajas de vendimia, donde cada mesa lleva el nombre de un pago o rincón especial para la pareja.',
      elements_included: [
        'Panel de lino o estructura de madera con tarjetas colgantes en papel algodón de bordes rasgados',
        'Sello de lacre verde olivo en cada tarjeta de mesa y botellas de vino decorativas lacradas',
        '2 barricas de roble con composiciones florales y faroles de cristal en la base',
        'Iluminación focal cálida para que siga luciendo al atardecer',
      ],
      functional_goal:
        'Diseñado con 2,40 metros de anchura para que 6-8 invitados puedan consultar su mesa simultáneamente sin formar colas en la entrada al salón.',
      status: 'approved',
    },
    {
      id: 'corner-2',
      corner_number: 2,
      title: 'Rincón 2 · Estación de Bienvenida, Pai-Pais, Conos de Pétalos & Agua Aromatizada',
      location_moment: 'Exterior de la Iglesia y Recepción del Cóctel',
      image_url: '/wedding/floral-detail.jpg',
      concept_description:
        'Un rincón de hospitalidad pensado para el confort de los invitados en un día de finales de agosto: estética fresca, natural y fotogénica.',
      elements_included: [
        'Cestas de mimbre artesanal con pai-pais de bambú natural y lazo de lino',
        'Bandejas de madera con conos de papel algodón rellenos de arroz lavado (no mancha los trajes) y pétalos secos',
        'Pañuelos "Para lágrimas de felicidad" con fajín impreso a juego con la papelería',
        'Dispensadores de cristal con agua fría de limón, pepino y hierbabuena a la llegada al cóctel',
      ],
      functional_goal:
        'Cuidar la comodidad térmica de los invitados y garantizar que todo el mundo tenga arroz y pétalos en mano para la gran foto de salida.',
      status: 'approved',
    },
    {
      id: 'corner-3',
      corner_number: 3,
      title: 'Rincón 3 · Lounge del Libro de Firmas, Recuerdos Instantáneos & Fiesta',
      location_moment: 'Transición Salón — Terraza y Zona de Baile Nocturno',
      image_url: '/wedding/sunset-mediterranean.jpg',
      concept_description:
        'Un pequeño salón editorial donde los invitados dejan sus dedicatorias junto a sus fotos instantáneas, complementado por la noche con la estación de alpargatas y retoque festivo.',
      elements_included: [
        'Mesa consola antigua de madera con lámpara cálida sin cable, arreglo floral bajo y velas',
        'Libro de firmas encuadernado en lino natural + bolígrafos dorados de tinta de secado rápido y adhesivos fotográficos',
        'Marco con código QR directo a la Galería de Memorias de la web de la boda para subir fotos en alta resolución',
        'Cestos de esparto bajo la mesa con alpargatas ordenadas por tallas para el baile',
      ],
      functional_goal:
        'Situado estratégicamente junto al paso hacia la barra libre para asegurar que la mayoría de familias firmen y suban sus fotos.',
      status: 'in_review',
    },
  ],

  // 10. ESQUEMAS ORIENTATIVOS DE DISTRIBUCIÓN
  layout_schemas: [
    {
      id: 'layout-ceremonia',
      space_name: 'Esquema 1 · Ceremonia en Iglesia de Santa María la Mayor',
      subtitle: 'Distribución de cortejo, bancos reservados, decoración y pasillo de salida',
      orientation_note:
        'El pasillo central debe mantenerse libre de invitados de pie desde las 12:50 h para garantizar tiro de cámara limpio.',
      zones: [
        {
          id: 'z-cer-1',
          name: 'Pórtico Exterior & Cestas de Arroz',
          position_label: 'Acceso Principal (Sur/Oeste)',
          description: '2 ánforas florales enmarcando la puerta + mesa de conos de arroz y pétalos.',
          flow_note: 'Los invitados forman un pasillo exterior en forma de V tras terminar la misa.',
        },
        {
          id: 'z-cer-2',
          name: 'Primeras 2 Filas de Bancos (Familia Directa)',
          position_label: 'Nave Central · Delante',
          description: 'Reservadas con cartel de papel algodón: familia de la novia a la izquierda, familia del novio a la derecha.',
          flow_note: 'Acceso directo para testigos y lectores sin cruzar el altar.',
        },
        {
          id: 'z-cer-3',
          name: 'Altar, Reclinatorios y Música de Ceremonia',
          position_label: 'Presbiterio / Cabecera',
          description: 'Reclinatorios centrados con guirnalda baja; 2 composiciones de suelo laterales; músicos en el lateral derecho.',
          flow_note: 'Fotógrafo y videógrafo con ángulos cruzados discretos sin tapar la vista a los bancos.',
        },
      ],
    },
    {
      id: 'layout-coctel',
      space_name: 'Esquema 2 · Jardín de Bienvenida y Cóctel en Bodega Concejo',
      subtitle: 'Circulación fluida desde la bajada del autobús hasta la entrada al salón',
      orientation_note:
        'Separar la estación de bebida de bienvenida unos 8 metros de la puerta de entrada evita tapones al bajar de los autobuses.',
      zones: [
        {
          id: 'z-coc-1',
          name: 'Recepción & Cartel de Bienvenida en Lino',
          position_label: 'Zona 1 · Llegada',
          description: 'Arco/bastidor de bienvenida + estación de aguas aromatizadas y copa de cava/vino de recepción.',
          flow_note: 'Flujo natural hacia el centro del jardín sin retenciones.',
        },
        {
          id: 'z-coc-2',
          name: 'Jardín Central: Mesas Altas, Estaciones y Sombra',
          position_label: 'Zona 2 · Corazón del Cóctel',
          description: 'Distribución en abanico de mesas altas vestidas, estaciones gastronómicas en los laterales y mobiliario chill-out bajo sombra.',
          flow_note: 'Camareros circulando en anillo perimetral; sonido ambiente desde el fondo.',
        },
        {
          id: 'z-coc-3',
          name: 'Rincón Seating Plan «Gran Reserva»',
          position_label: 'Zona 3 · Antesala del Salón',
          description: 'Estructura de 2,40 m junto al acceso al salón principal.',
          flow_note: 'Visible durante todo el cóctel para que los invitados localicen su mesa sin prisas antes de las 16:30 h.',
        },
      ],
    },
    {
      id: 'layout-banquete',
      space_name: 'Esquema 3 · Salón de Banquete, Entregas y Pista de Baile',
      subtitle: 'Visibilidad hacia la Mesa Presidencial y conexión con la fiesta',
      orientation_note:
        'Dejar un pasillo central de al menos 1,80 m para la entrada triunfal de los novios y el recorrido de las entregas.',
      zones: [
        {
          id: 'z-ban-1',
          name: 'Mesa Presidencial Escenográfica',
          position_label: 'Cabecera Central del Salón',
          description: 'Presidencial imperial con camino botánico, velas y fondo limpio iluminado (sin cables ni altavoces detrás de los novios).',
          flow_note: 'Visibilidad directa desde todas las mesas redondas.',
        },
        {
          id: 'z-ban-2',
          name: 'Anillo de Mesas de Familiares y Amigos',
          position_label: 'Cuerpo Central del Salón',
          description: 'Mesas de padres y abuelos en primera línea tranquila (alejadas de los altavoces); mesas de amigos jóvenes cercanas al pasillo central y pista.',
          flow_note: 'Facilita las entregas emotivas y anima la entrada y los brindis.',
        },
        {
          id: 'z-ban-3',
          name: 'Cabina DJ, Rincón de Firmas y Pista de Baile',
          position_label: 'Zona de Fiesta / Terraza Conectada',
          description: 'Estación DJ con iluminación orientada hacia la pista, mesa de regalos de entrega oculta junto al DJ y rincón de firmas/alpargatas en el lateral.',
          flow_note: 'Transición inmediata del postre/café al primer baile con bengalas sin desplazamientos largos.',
        },
      ],
    },
  ],

  // 11. IDENTIDAD GRÁFICA Y DISEÑO DE TODA LA PAPELERÍA ACORDADA
  stationery: {
    monogram_concept:
      'Monograma entrelazado «R & S» de trazo fino clásico con ilustración botánica minimalista de una rama de olivo y silueta de Bodega Concejo.',
    typography_serif: 'Cormorant Garamond / Playfair Display (Titulares, nombres propios y números de mesa en cursiva editorial)',
    typography_sans: 'Montserrat / Plus Jakarta Sans en caja alta con tracking amplio (Horarios, ubicaciones y subtítulos)',
    paper_and_seals:
      'Papel verjurado o 100% algodón de 300 g/m² en tono blanco cálido (#F6F3EC), sobres forrados con motivo botánico/bodega y sello de lacre artesanal en verde olivo.',
    pieces: [
      {
        id: 'stat-1',
        piece_name: 'Save the Date & Web Interactiva de Invitados',
        moment: 'Pre-evento (6 a 9 meses antes)',
        format_and_paper: 'Formato digital responsive con música ambiental y cuenta atrás + enlace personalizado por familia.',
        finish_details: 'Fotografía editorial de la pareja y confirmación RSVP integrada.',
        status: 'approved',
      },
      {
        id: 'stat-2',
        piece_name: 'Invitación Principal, Sobre Forrado y Tarjetón de Autobuses',
        moment: 'Entrega formal (3 a 4 meses antes)',
        format_and_paper: 'Tarjetón A5 (14,8 x 21 cm) en papel algodón 300g con bordes rasgados a mano.',
        finish_details: 'Sobre color piedra con forro interior ilustrado y cierre con lacre R&S.',
        status: 'approved',
      },
      {
        id: 'stat-3',
        piece_name: 'Misales de Ceremonia, Conos de Pétalos y Fajines de Pañuelos',
        moment: 'Ceremonia en Villamuriel de Cerrato',
        format_and_paper: 'Díptico vertical en papel verjurado 220g y conos enrollados a juego.',
        finish_details: 'Cinta de seda o cordel de lino natural.',
        status: 'in_review',
      },
      {
        id: 'stat-4',
        piece_name: 'Cartel de Bienvenida en Lino y Tarjetas del Seating Plan',
        moment: 'Recepción y Cóctel en Bodega Concejo',
        format_and_paper: 'Lienzo de lino lavado 70 x 140 cm + tarjetones por mesa en papel algodón.',
        finish_details: 'Cada tarjeta de mesa incluye un pequeño lacre y tipografía de alta legibilidad.',
        status: 'approved',
      },
      {
        id: 'stat-5',
        piece_name: 'Meseros (Números/Nombres de Mesa) y Minutas Nominales',
        moment: 'Salón de Banquete',
        format_and_paper: 'Minuta vertical alargada (9 x 21 cm) con el nombre caligrafiado de cada invitado en la cabecera (funciona a la vez como marca-sitio).',
        finish_details: 'Detalle de rama de olivo fresca sujeta a cada minuta.',
        status: 'in_review',
      },
      {
        id: 'stat-6',
        piece_name: 'Cartelería de Rincones (Firmas, QR de Fotos, Barra y Baños)',
        moment: 'Banquete y Fiesta',
        format_and_paper: 'Láminas A5 y A4 enmarcadas en latón envejecido o soportes de madera de roble.',
        finish_details: 'Incluye código QR directo para que los invitados suban sus fotos al álbum de la web.',
        status: 'draft',
      },
    ],
  },

  // 12. RECOMENDACIONES PARA MANTENER LA COHERENCIA VISUAL
  coherence_guidelines: {
    golden_rules: [
      {
        title: '1. Continuidad de Materiales entre Iglesia y Bodega',
        description:
          'Utilizar exactamente la misma variedad de verde (olivo + eucalipto) y el mismo tono de rosa marfil tanto en la iglesia de Villamuriel como en Bodega Concejo hace que toda la jornada se perciba como una obra única.',
      },
      {
        title: '2. Temperatura de Luz Unificada (2700K Cálida)',
        description:
          'Coordinar con la finca y con el proveedor de la Estación DJ que durante la cena y el primer baile TODA la iluminación sea blanco cálido ámbar (evitando focos azules, verdes o rosas sobre los rostros en fotos y vídeo).',
      },
      {
        title: '3. Papelería como Hilo Conductor Silencioso',
        description:
          'No mezclar carteles comprados de distintos estilos: desde el cartel del autobús hasta la minuta del plato y el cartel de las alpargatas deben usar la misma tipografía y el mismo papel color piedra.',
      },
      {
        title: '4. Menos Cosas Pequeñas, Más Puntos Focales',
        description:
          'Un solo rincón bien dimensionado (con altura, flor abundante y buena luz) luce infinitamente más elegante y fotogénico que cinco mesitas pequeñas dispersas con pocos elementos.',
      },
    ],
    dos: [
      'Mantener una paleta de 3 tonos principales (Piedra, Verde Olivo y Arena) con el Burdeos solo como acento del 10%.',
      'Integrar la minuta y el marca-sitio en una sola pieza editorial sobre el plato para despejar la mesa.',
      'Usar recipientes mates (cerámica, piedra, terracota, madera y cristal limpio) que armonicen con la arquitectura de la bodega.',
      'Ocultar cables, cajas de transporte y botellas de plástico detrás de las estaciones y de la mesa presidencial.',
    ],
    donts: [
      'Evitar flores con colores estridentes o fríos (azules eléctricos, fucsias neón) que choquen con la piedra cálida.',
      'No colocar centros de mesa entre 35 y 60 cm de altura que tapen la cara de los invitados de enfrente.',
      'Evitar láseres multicolores del DJ durante la entrada al salón, los discursos o el primer baile (reservarlos para la barra libre).',
      'No usar cartelería en cartulina blanca brillante estándar: usar siempre papel con textura crema/algodón.',
    ],
  },

  // 13. ORIENTACIÓN SOBRE ELEMENTOS DECORATIVOS A PRIORIZAR SEGÚN PRESUPUESTO
  budget_priorities: [
    {
      id: 'prio-1',
      element_name: 'Mesa Presidencial, Centros de Banquete y Velas',
      category_link: 'Decoración Concejo',
      priority_level: 'alta',
      visual_impact_score: 10,
      estimated_share: '35% de la partida decorativa',
      rationale:
        'Los invitados pasan más de 3 horas sentados en el banquete a menos de 50 cm del centro de mesa y mirando hacia la mesa presidencial. Es lo que más se vive y se fotografía de cerca.',
      smart_saving_tip:
        'Alternar dos modelos de centro en las mesas de invitados: 50% con centro floral completo y 50% con composición de verdes + abundantes velas en cristal a tres alturas.',
    },
    {
      id: 'prio-2',
      element_name: 'Pórtico de Iglesia, Altar y Ramo de Novia',
      category_link: 'Flores Iglesia',
      priority_level: 'alta',
      visual_impact_score: 10,
      estimated_share: '25% de la partida decorativa',
      rationale:
        'El ramo acompaña a Stephanie en el 90% de las fotos del día, y el pórtico + altar protagonizan las fotos más icónicas de la ceremonia y la salida del arroz.',
      smart_saving_tip:
        'No decorar todos los bancos de la iglesia: decorar solo los bancos pares o los primeros 8 bancos y concentrar el presupuesto en el altar y la puerta, trasladando luego los 2 arreglos del altar a la bodega.',
    },
    {
      id: 'prio-3',
      element_name: 'Iluminación Cálida Ambiental y Escenografía de Baile / DJ',
      category_link: 'Estación DJ / Decoración Concejo',
      priority_level: 'alta',
      visual_impact_score: 9,
      estimated_share: '20% de la partida decorativa',
      rationale:
        'La iluminación transforma por completo el espacio al caer la tarde y multiplica por diez la calidad cinematográfica del vídeo y las fotos del banquete y primer baile.',
      smart_saving_tip:
        'Priorizar guirnaldas de micro-luz cálida y focos arquitectónicos ámbar sobre efectos puntuales que solo duran 30 segundos.',
    },
    {
      id: 'prio-4',
      element_name: 'Seating Plan «Gran Reserva» y Papelería en Mesa (Minutas)',
      category_link: 'Decoración Concejo',
      priority_level: 'media',
      visual_impact_score: 8,
      estimated_share: '12% de la partida decorativa',
      rationale:
        'Es el punto donde el 100% de los invitados se detiene en el cóctel y el primer detalle personalizado que encuentran al sentarse.',
      smart_saving_tip:
        'Imprimir el nombre de cada comensal directamente en la cabecera de la minuta (2 en 1: minuta + marca-sitio) ahorra el coste de encargar marcasitios individuales aparte.',
    },
    {
      id: 'prio-5',
      element_name: 'Rincones Auxiliares (Fotomatón / Cigar Bar / Detalles Extra)',
      category_link: 'Decoración Concejo / Otros',
      priority_level: 'optimizable',
      visual_impact_score: 6,
      estimated_share: '8% de la partida decorativa',
      rationale:
        'Aportan encanto y entretenimiento, pero si es necesario ajustar el presupuesto global, pueden resolverse con mobiliario propio de la bodega (barricas y mesas de madera) y papelería coordinada.',
      smart_saving_tip:
        'Aprovechar las barricas reales de Bodega Concejo y reubicar los arreglos florales de bienvenida en la zona del libro de firmas y fiesta.',
    },
  ],
};

// ==========================================
// LOCAL STORAGE MULTI-WEDDING PERSISTENCE
// ==========================================

function getCurrentCreativeWeddingId(): string {
  if (typeof window === 'undefined') return DEFAULT_WEDDING_UUID;
  try {
    return localStorage.getItem('boda_planner_active_wedding_id_v3') || DEFAULT_WEDDING_UUID;
  } catch {
    return DEFAULT_WEDDING_UUID;
  }
}

function getScopedCreativeKey(): string {
  const wid = getCurrentCreativeWeddingId();
  return wid === DEFAULT_WEDDING_UUID
    ? STORAGE_KEY_CREATIVE_PROJECT
    : `${STORAGE_KEY_CREATIVE_PROJECT}__${wid}`;
}

export function getStoredCreativeDossier(): CreativeProjectDossier {
  if (typeof window === 'undefined') return INITIAL_CREATIVE_DOSSIER;
  try {
    const raw = localStorage.getItem(getScopedCreativeKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.concept) {
        const merged: CreativeProjectDossier = {
          ...INITIAL_CREATIVE_DOSSIER,
          ...parsed,
        };
        merged.color_palette = enforceMax100Palette(merged.color_palette);
        return merged;
      }
    }
  } catch (e) {
    console.warn('Error reading stored creative project dossier:', e);
  }
  return INITIAL_CREATIVE_DOSSIER;
}

export function setStoredCreativeDossier(dossier: CreativeProjectDossier) {
  if (typeof window === 'undefined') return;
  try {
    const withTimestamp: CreativeProjectDossier = {
      ...dossier,
      last_updated: new Date().toISOString().split('T')[0],
    };
    localStorage.setItem(getScopedCreativeKey(), JSON.stringify(withTimestamp));
    window.dispatchEvent(new CustomEvent(CREATIVE_PROJECT_UPDATE_EVENT));
  } catch (e) {
    console.warn('Error saving stored creative project dossier:', e);
  }
}
