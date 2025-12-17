// Base de datos de huesos del cuerpo humano - meskeIA
// ~80 huesos principales del esqueleto humano adulto

export interface Bone {
  id: string;
  nombre: string;
  nombreLatin: string;
  region: BoneRegion;
  tipo: BoneType;
  cantidad: number; // 1 = impar, 2 = par
  articulaciones: string[];
  funcion: string;
  curiosidad: string;
}

export type BoneRegion =
  | 'Cráneo'
  | 'Cara'
  | 'Columna vertebral'
  | 'Tórax'
  | 'Cintura escapular'
  | 'Extremidad superior'
  | 'Cintura pélvica'
  | 'Extremidad inferior';

export type BoneType =
  | 'Largo'
  | 'Corto'
  | 'Plano'
  | 'Irregular'
  | 'Sesamoideo';

export const REGIONES: BoneRegion[] = [
  'Cráneo',
  'Cara',
  'Columna vertebral',
  'Tórax',
  'Cintura escapular',
  'Extremidad superior',
  'Cintura pélvica',
  'Extremidad inferior',
];

export const TIPOS: BoneType[] = [
  'Largo',
  'Corto',
  'Plano',
  'Irregular',
  'Sesamoideo',
];

// Emojis por región
export const REGION_EMOJI: Record<BoneRegion, string> = {
  'Cráneo': '🧠',
  'Cara': '👤',
  'Columna vertebral': '🦴',
  'Tórax': '🫁',
  'Cintura escapular': '💪',
  'Extremidad superior': '🤚',
  'Cintura pélvica': '🦵',
  'Extremidad inferior': '🦶',
};

// Emojis por tipo
export const TIPO_EMOJI: Record<BoneType, string> = {
  'Largo': '📏',
  'Corto': '🔲',
  'Plano': '📄',
  'Irregular': '🔶',
  'Sesamoideo': '⚫',
};

export const BONES: Bone[] = [
  // ═══════════════════════════════════════════════════════════════
  // CRÁNEO (8 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'frontal',
    nombre: 'Frontal',
    nombreLatin: 'Os frontale',
    region: 'Cráneo',
    tipo: 'Plano',
    cantidad: 1,
    articulaciones: ['Parietales', 'Esfenoides', 'Etmoides', 'Nasales', 'Lagrimales', 'Maxilares', 'Cigomáticos'],
    funcion: 'Protege los lóbulos frontales del cerebro y forma el techo de las órbitas oculares',
    curiosidad: 'Al nacer está dividido en dos mitades que se fusionan entre los 2 y 8 años de edad.',
  },
  {
    id: 'parietal',
    nombre: 'Parietal',
    nombreLatin: 'Os parietale',
    region: 'Cráneo',
    tipo: 'Plano',
    cantidad: 2,
    articulaciones: ['Frontal', 'Occipital', 'Temporal', 'Esfenoides', 'Parietal opuesto'],
    funcion: 'Forma la mayor parte de la bóveda craneal y protege los lóbulos parietales',
    curiosidad: 'La sutura entre ambos parietales (sutura sagital) es donde se encontraba la fontanela anterior en bebés.',
  },
  {
    id: 'temporal',
    nombre: 'Temporal',
    nombreLatin: 'Os temporale',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Parietal', 'Occipital', 'Esfenoides', 'Cigomático', 'Mandíbula'],
    funcion: 'Protege el oído interno y medio, y forma la articulación temporomandibular',
    curiosidad: 'Contiene los huesos más pequeños del cuerpo humano: martillo, yunque y estribo.',
  },
  {
    id: 'occipital',
    nombre: 'Occipital',
    nombreLatin: 'Os occipitale',
    region: 'Cráneo',
    tipo: 'Plano',
    cantidad: 1,
    articulaciones: ['Parietales', 'Temporales', 'Esfenoides', 'Atlas (C1)'],
    funcion: 'Protege el cerebelo y el tronco encefálico, contiene el foramen magno',
    curiosidad: 'El foramen magno es el agujero por donde la médula espinal se conecta con el cerebro.',
  },
  {
    id: 'esfenoides',
    nombre: 'Esfenoides',
    nombreLatin: 'Os sphenoidale',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Todos los huesos del cráneo', 'Vómer', 'Palatinos'],
    funcion: 'Une todos los huesos del cráneo y aloja la glándula pituitaria en la silla turca',
    curiosidad: 'Su forma recuerda a una mariposa o murciélago con las alas extendidas.',
  },
  {
    id: 'etmoides',
    nombre: 'Etmoides',
    nombreLatin: 'Os ethmoidale',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Frontal', 'Esfenoides', 'Nasales', 'Maxilares', 'Lagrimales', 'Palatinos', 'Vómer', 'Cornetes inferiores'],
    funcion: 'Forma parte de las órbitas, cavidad nasal y contiene células olfatorias',
    curiosidad: 'La lámina cribosa tiene pequeños agujeros por donde pasan los nervios olfatorios.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CARA (14 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'maxilar',
    nombre: 'Maxilar',
    nombreLatin: 'Maxilla',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Frontal', 'Etmoides', 'Nasal', 'Lagrimal', 'Cigomático', 'Palatino', 'Vómer', 'Cornete inferior', 'Maxilar opuesto'],
    funcion: 'Forma el maxilar superior, el suelo de las órbitas y la mayor parte del paladar duro',
    curiosidad: 'Contiene el seno maxilar, la cavidad paranasal más grande del cuerpo.',
  },
  {
    id: 'mandibula',
    nombre: 'Mandíbula',
    nombreLatin: 'Mandibula',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Temporal (ATM)'],
    funcion: 'Único hueso móvil de la cabeza, permite la masticación y el habla',
    curiosidad: 'Es el hueso más fuerte y grande de la cara. La ATM es la articulación más usada del cuerpo.',
  },
  {
    id: 'nasal',
    nombre: 'Nasal',
    nombreLatin: 'Os nasale',
    region: 'Cara',
    tipo: 'Plano',
    cantidad: 2,
    articulaciones: ['Frontal', 'Etmoides', 'Maxilar', 'Nasal opuesto'],
    funcion: 'Forma el puente de la nariz',
    curiosidad: 'Son los huesos que se fracturan con más frecuencia en traumatismos faciales.',
  },
  {
    id: 'lagrimal',
    nombre: 'Lagrimal',
    nombreLatin: 'Os lacrimale',
    region: 'Cara',
    tipo: 'Plano',
    cantidad: 2,
    articulaciones: ['Frontal', 'Etmoides', 'Maxilar', 'Cornete inferior'],
    funcion: 'Forma parte de la órbita y contiene el conducto nasolagrimal',
    curiosidad: 'Es el hueso más pequeño y frágil de la cara, del tamaño de una uña.',
  },
  {
    id: 'cigomatico',
    nombre: 'Cigomático',
    nombreLatin: 'Os zygomaticum',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Frontal', 'Temporal', 'Maxilar', 'Esfenoides'],
    funcion: 'Forma el pómulo y parte de la órbita, da inserción a músculos masticadores',
    curiosidad: 'El arco cigomático determina en gran parte la forma del rostro.',
  },
  {
    id: 'palatino',
    nombre: 'Palatino',
    nombreLatin: 'Os palatinum',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Maxilar', 'Esfenoides', 'Etmoides', 'Vómer', 'Cornete inferior', 'Palatino opuesto'],
    funcion: 'Forma la parte posterior del paladar duro y parte de la cavidad nasal',
    curiosidad: 'Tiene forma de L y contribuye a separar la cavidad oral de la nasal.',
  },
  {
    id: 'vomer',
    nombre: 'Vómer',
    nombreLatin: 'Vomer',
    region: 'Cara',
    tipo: 'Plano',
    cantidad: 1,
    articulaciones: ['Etmoides', 'Esfenoides', 'Maxilares', 'Palatinos'],
    funcion: 'Forma la parte posteroinferior del tabique nasal',
    curiosidad: 'Su nombre significa "reja de arado" en latín por su forma característica.',
  },
  {
    id: 'cornete-inferior',
    nombre: 'Cornete nasal inferior',
    nombreLatin: 'Concha nasalis inferior',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Etmoides', 'Maxilar', 'Lagrimal', 'Palatino'],
    funcion: 'Aumenta la superficie de la cavidad nasal para calentar y humidificar el aire',
    curiosidad: 'Es el único cornete que es un hueso independiente; los otros son parte del etmoides.',
  },

  // ═══════════════════════════════════════════════════════════════
  // OÍDO (6 huesos - 3 pares)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'martillo',
    nombre: 'Martillo',
    nombreLatin: 'Malleus',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Yunque', 'Membrana timpánica'],
    funcion: 'Transmite las vibraciones del tímpano al yunque',
    curiosidad: 'Junto con yunque y estribo, son los huesos más pequeños del cuerpo (~3-4 mm).',
  },
  {
    id: 'yunque',
    nombre: 'Yunque',
    nombreLatin: 'Incus',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Martillo', 'Estribo'],
    funcion: 'Transmite las vibraciones del martillo al estribo',
    curiosidad: 'Su forma recuerda a un yunque de herrero, de ahí su nombre.',
  },
  {
    id: 'estribo',
    nombre: 'Estribo',
    nombreLatin: 'Stapes',
    region: 'Cráneo',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Yunque', 'Ventana oval (cóclea)'],
    funcion: 'Transmite las vibraciones al oído interno a través de la ventana oval',
    curiosidad: 'Es el hueso más pequeño del cuerpo humano, mide solo 2.5-3 mm.',
  },

  // ═══════════════════════════════════════════════════════════════
  // COLUMNA VERTEBRAL (26 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'atlas',
    nombre: 'Atlas (C1)',
    nombreLatin: 'Atlas',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Occipital', 'Axis (C2)'],
    funcion: 'Sostiene el cráneo y permite el movimiento de flexión-extensión (decir "sí")',
    curiosidad: 'Recibe su nombre del titán Atlas, que sostenía el mundo sobre sus hombros.',
  },
  {
    id: 'axis',
    nombre: 'Axis (C2)',
    nombreLatin: 'Axis',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Atlas', 'C3'],
    funcion: 'Permite la rotación de la cabeza (decir "no") mediante el proceso odontoides',
    curiosidad: 'El proceso odontoides (diente) es un pivote único que encaja en el atlas.',
  },
  {
    id: 'vertebras-cervicales',
    nombre: 'Vértebras cervicales (C3-C7)',
    nombreLatin: 'Vertebrae cervicales',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 5,
    articulaciones: ['Vértebras adyacentes', 'Discos intervertebrales'],
    funcion: 'Soportan el peso de la cabeza y permiten movimiento del cuello',
    curiosidad: 'Las jirafas también tienen solo 7 vértebras cervicales, pero mucho más largas.',
  },
  {
    id: 'vertebras-toracicas',
    nombre: 'Vértebras torácicas (T1-T12)',
    nombreLatin: 'Vertebrae thoracicae',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 12,
    articulaciones: ['Vértebras adyacentes', 'Costillas', 'Discos intervertebrales'],
    funcion: 'Articulan con las costillas y protegen los órganos torácicos',
    curiosidad: 'Son las únicas vértebras que se articulan con las costillas.',
  },
  {
    id: 'vertebras-lumbares',
    nombre: 'Vértebras lumbares (L1-L5)',
    nombreLatin: 'Vertebrae lumbales',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 5,
    articulaciones: ['Vértebras adyacentes', 'Sacro', 'Discos intervertebrales'],
    funcion: 'Soportan la mayor parte del peso corporal y permiten flexión del tronco',
    curiosidad: 'Son las vértebras más grandes porque soportan más peso. El dolor lumbar es muy común.',
  },
  {
    id: 'sacro',
    nombre: 'Sacro',
    nombreLatin: 'Os sacrum',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['L5', 'Coxis', 'Ilíacos (articulación sacroilíaca)'],
    funcion: 'Transmite el peso del tronco a la pelvis y protege órganos pélvicos',
    curiosidad: 'Está formado por 5 vértebras fusionadas. Su nombre significa "hueso sagrado".',
  },
  {
    id: 'coxis',
    nombre: 'Coxis',
    nombreLatin: 'Os coccygis',
    region: 'Columna vertebral',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Sacro'],
    funcion: 'Punto de anclaje para músculos y ligamentos del suelo pélvico',
    curiosidad: 'Es el vestigio de la cola en humanos, formado por 3-5 vértebras fusionadas.',
  },

  // ═══════════════════════════════════════════════════════════════
  // TÓRAX (25 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'esternon',
    nombre: 'Esternón',
    nombreLatin: 'Sternum',
    region: 'Tórax',
    tipo: 'Plano',
    cantidad: 1,
    articulaciones: ['Clavículas', 'Costillas (1-7)', 'Cartílagos costales'],
    funcion: 'Protege el corazón y grandes vasos, punto de anclaje para costillas',
    curiosidad: 'Tiene tres partes: manubrio, cuerpo y apéndice xifoides. Se usa para RCP.',
  },
  {
    id: 'costillas-verdaderas',
    nombre: 'Costillas verdaderas (1-7)',
    nombreLatin: 'Costae verae',
    region: 'Tórax',
    tipo: 'Plano',
    cantidad: 14,
    articulaciones: ['Vértebras torácicas', 'Esternón (vía cartílago)'],
    funcion: 'Protegen órganos vitales y participan en la respiración',
    curiosidad: 'Se llaman "verdaderas" porque se conectan directamente al esternón.',
  },
  {
    id: 'costillas-falsas',
    nombre: 'Costillas falsas (8-10)',
    nombreLatin: 'Costae spuriae',
    region: 'Tórax',
    tipo: 'Plano',
    cantidad: 6,
    articulaciones: ['Vértebras torácicas', 'Cartílago de la costilla superior'],
    funcion: 'Protegen órganos abdominales superiores como hígado y bazo',
    curiosidad: 'Se conectan al esternón indirectamente, a través del cartílago de la 7ª costilla.',
  },
  {
    id: 'costillas-flotantes',
    nombre: 'Costillas flotantes (11-12)',
    nombreLatin: 'Costae fluctuantes',
    region: 'Tórax',
    tipo: 'Plano',
    cantidad: 4,
    articulaciones: ['Vértebras torácicas'],
    funcion: 'Protegen los riñones parcialmente',
    curiosidad: 'No se conectan al esternón, solo a las vértebras; "flotan" en la musculatura.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CINTURA ESCAPULAR (4 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'clavicula',
    nombre: 'Clavícula',
    nombreLatin: 'Clavicula',
    region: 'Cintura escapular',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Esternón', 'Acromion de la escápula'],
    funcion: 'Conecta el brazo al tronco, permite movimientos amplios del hombro',
    curiosidad: 'Es el primer hueso en osificarse en el feto y el más frecuentemente fracturado.',
  },
  {
    id: 'escapula',
    nombre: 'Escápula',
    nombreLatin: 'Scapula',
    region: 'Cintura escapular',
    tipo: 'Plano',
    cantidad: 2,
    articulaciones: ['Clavícula', 'Húmero'],
    funcion: 'Proporciona anclaje para músculos del hombro y brazo',
    curiosidad: 'También llamada "omóplato". Tiene 17 músculos insertados en ella.',
  },

  // ═══════════════════════════════════════════════════════════════
  // EXTREMIDAD SUPERIOR (30 huesos por lado, agrupados)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'humero',
    nombre: 'Húmero',
    nombreLatin: 'Humerus',
    region: 'Extremidad superior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Escápula (hombro)', 'Radio', 'Cúbito (codo)'],
    funcion: 'Permite movimientos del brazo y transmite fuerza al antebrazo',
    curiosidad: 'El nervio radial rodea su diáfisis; por eso golpearse el codo causa hormigueo.',
  },
  {
    id: 'radio',
    nombre: 'Radio',
    nombreLatin: 'Radius',
    region: 'Extremidad superior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Húmero', 'Cúbito', 'Escafoides', 'Semilunar'],
    funcion: 'Permite la pronación y supinación del antebrazo (girar la palma)',
    curiosidad: 'Está en el lado del pulgar. Las fracturas de Colles (radio distal) son muy comunes.',
  },
  {
    id: 'cubito',
    nombre: 'Cúbito',
    nombreLatin: 'Ulna',
    region: 'Extremidad superior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Húmero', 'Radio', 'Piramidal'],
    funcion: 'Forma la parte principal de la articulación del codo',
    curiosidad: 'El olécranon (punta del codo) es donde apoyamos al reclinarnos.',
  },
  {
    id: 'carpos',
    nombre: 'Huesos del carpo',
    nombreLatin: 'Ossa carpi',
    region: 'Extremidad superior',
    tipo: 'Corto',
    cantidad: 16,
    articulaciones: ['Radio', 'Cúbito', 'Metacarpianos', 'Entre sí'],
    funcion: 'Permiten movimientos finos de la muñeca',
    curiosidad: '8 huesos por mano: escafoides, semilunar, piramidal, pisiforme, trapecio, trapezoide, grande y ganchoso.',
  },
  {
    id: 'metacarpianos',
    nombre: 'Metacarpianos',
    nombreLatin: 'Ossa metacarpi',
    region: 'Extremidad superior',
    tipo: 'Largo',
    cantidad: 10,
    articulaciones: ['Carpos', 'Falanges proximales'],
    funcion: 'Forman la palma de la mano y permiten el agarre',
    curiosidad: '5 por mano, numerados del pulgar (I) al meñique (V).',
  },
  {
    id: 'falanges-mano',
    nombre: 'Falanges de la mano',
    nombreLatin: 'Phalanges manus',
    region: 'Extremidad superior',
    tipo: 'Largo',
    cantidad: 28,
    articulaciones: ['Metacarpianos', 'Entre sí'],
    funcion: 'Permiten movimientos precisos de los dedos',
    curiosidad: '14 por mano: el pulgar tiene 2 (proximal y distal), los demás dedos tienen 3.',
  },

  // ═══════════════════════════════════════════════════════════════
  // CINTURA PÉLVICA (2 huesos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'coxal',
    nombre: 'Coxal (hueso ilíaco)',
    nombreLatin: 'Os coxae',
    region: 'Cintura pélvica',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Sacro', 'Coxal opuesto (sínfisis púbica)', 'Fémur'],
    funcion: 'Soporta el peso del tronco y protege órganos pélvicos',
    curiosidad: 'Formado por la fusión de 3 huesos: ilion, isquion y pubis, que se unen en el acetábulo.',
  },

  // ═══════════════════════════════════════════════════════════════
  // EXTREMIDAD INFERIOR (30 huesos por lado, agrupados)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'femur',
    nombre: 'Fémur',
    nombreLatin: 'Femur',
    region: 'Extremidad inferior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Coxal (cadera)', 'Tibia', 'Rótula'],
    funcion: 'Soporta el peso corporal y permite la locomoción',
    curiosidad: 'Es el hueso más largo, fuerte y pesado del cuerpo. Puede soportar 30 veces el peso corporal.',
  },
  {
    id: 'rotula',
    nombre: 'Rótula',
    nombreLatin: 'Patella',
    region: 'Extremidad inferior',
    tipo: 'Sesamoideo',
    cantidad: 2,
    articulaciones: ['Fémur'],
    funcion: 'Protege la rodilla y mejora la eficiencia del cuádriceps',
    curiosidad: 'Es el hueso sesamoideo más grande del cuerpo, incrustado en el tendón del cuádriceps.',
  },
  {
    id: 'tibia',
    nombre: 'Tibia',
    nombreLatin: 'Tibia',
    region: 'Extremidad inferior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Fémur', 'Peroné', 'Astrágalo'],
    funcion: 'Soporta el peso corporal y forma la parte principal de la pierna',
    curiosidad: 'Es el segundo hueso más largo. Su cresta anterior es muy superficial (espinilla).',
  },
  {
    id: 'perone',
    nombre: 'Peroné',
    nombreLatin: 'Fibula',
    region: 'Extremidad inferior',
    tipo: 'Largo',
    cantidad: 2,
    articulaciones: ['Tibia', 'Astrágalo'],
    funcion: 'Estabiliza el tobillo y sirve de anclaje muscular',
    curiosidad: 'No soporta peso significativo. Se usa para injertos óseos por su forma y accesibilidad.',
  },
  {
    id: 'tarsos',
    nombre: 'Huesos del tarso',
    nombreLatin: 'Ossa tarsi',
    region: 'Extremidad inferior',
    tipo: 'Corto',
    cantidad: 14,
    articulaciones: ['Tibia', 'Peroné', 'Metatarsianos', 'Entre sí'],
    funcion: 'Forman el tobillo y parte posterior del pie, absorben impactos',
    curiosidad: '7 por pie: astrágalo, calcáneo, navicular, cuboides, y 3 cuneiformes.',
  },
  {
    id: 'calcaneo',
    nombre: 'Calcáneo',
    nombreLatin: 'Calcaneus',
    region: 'Extremidad inferior',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Astrágalo', 'Cuboides'],
    funcion: 'Forma el talón, principal punto de apoyo al caminar',
    curiosidad: 'Es el hueso del tarso más grande. El tendón de Aquiles se inserta en él.',
  },
  {
    id: 'astragalo',
    nombre: 'Astrágalo',
    nombreLatin: 'Talus',
    region: 'Extremidad inferior',
    tipo: 'Irregular',
    cantidad: 2,
    articulaciones: ['Tibia', 'Peroné', 'Calcáneo', 'Navicular'],
    funcion: 'Transmite el peso del cuerpo al pie, forma la articulación del tobillo',
    curiosidad: 'Es el único hueso del tarso sin inserciones musculares directas.',
  },
  {
    id: 'metatarsianos',
    nombre: 'Metatarsianos',
    nombreLatin: 'Ossa metatarsi',
    region: 'Extremidad inferior',
    tipo: 'Largo',
    cantidad: 10,
    articulaciones: ['Tarsos', 'Falanges proximales'],
    funcion: 'Forman el arco del pie y permiten el impulso al caminar',
    curiosidad: '5 por pie. El primer metatarsiano (dedo gordo) es el más corto y grueso.',
  },
  {
    id: 'falanges-pie',
    nombre: 'Falanges del pie',
    nombreLatin: 'Phalanges pedis',
    region: 'Extremidad inferior',
    tipo: 'Largo',
    cantidad: 28,
    articulaciones: ['Metatarsianos', 'Entre sí'],
    funcion: 'Permiten el agarre y equilibrio al caminar',
    curiosidad: '14 por pie: el dedo gordo tiene 2, los demás tienen 3. Son más cortas que las de la mano.',
  },

  // ═══════════════════════════════════════════════════════════════
  // HUESO ESPECIAL
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hioides',
    nombre: 'Hioides',
    nombreLatin: 'Os hyoideum',
    region: 'Cara',
    tipo: 'Irregular',
    cantidad: 1,
    articulaciones: ['Ninguna (suspendido por ligamentos y músculos)'],
    funcion: 'Ancla la lengua y participa en la deglución y el habla',
    curiosidad: 'Es el único hueso del cuerpo que no se articula con ningún otro hueso.',
  },
];

// Función auxiliar para obtener huesos por región
export function getBonesByRegion(region: BoneRegion): Bone[] {
  return BONES.filter(b => b.region === region);
}

// Función auxiliar para obtener huesos por tipo
export function getBonesByType(tipo: BoneType): Bone[] {
  return BONES.filter(b => b.tipo === tipo);
}

// Función auxiliar para buscar huesos
export function searchBones(query: string): Bone[] {
  const q = query.toLowerCase();
  return BONES.filter(b =>
    b.nombre.toLowerCase().includes(q) ||
    b.nombreLatin.toLowerCase().includes(q) ||
    b.funcion.toLowerCase().includes(q) ||
    b.articulaciones.some(a => a.toLowerCase().includes(q))
  );
}

// Calcular total de huesos (sumando cantidades)
export function getTotalBones(): number {
  return BONES.reduce((total, bone) => total + bone.cantidad, 0);
}
