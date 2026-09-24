/**
 * Motor de recomendación de selector-mascota.
 *
 * Vive aparte, sin dependencias, para poder enumerarlo y probarlo sin navegador. Mismo patrón
 * que `app/selector-smartphone/motor.ts` (commit 4fe972a2): las respuestas puntúan, pero lo que
 * el usuario ha declarado como LÍMITE no se negocia a puntos, se aplica como filtro y se dice.
 *
 *  1. Alergia al pelo (hallazgo 1332). Antes restaba 3 puntos a perros y gato, y en el 19,6 %
 *     de los perfiles con alergia salía igualmente un perro o un gato, sin mencionar la alergia.
 *     Ahora descarta a todos los animales con pelo —perros, gato y pequeños mamíferos (roedores
 *     y conejo)— y el resultado lo explica. El pájaro no se descarta, pero se avisa de que las
 *     plumas y su polvo también son alérgenos.
 *
 *  2. Niños menores de 5 años y reptiles. Los CDC de EE. UU. recomiendan no tener reptiles ni
 *     anfibios en hogares con menores de 5 años por el riesgo de salmonelosis
 *     (cdc.gov/healthy-pets, «Reptiles and Amphibians»). Mismo tratamiento que la alergia:
 *     filtro de salud, no resta de puntos.
 *
 *  3. El presupuesto mensual acota (hallazgo 1333). Un animal cabe en un tramo si el MÍNIMO de
 *     su horquilla de coste mensual no supera el techo del tramo. Si la mejor opción por estilo
 *     de vida no cabe, se recomienda la mejor que cabe y se dice cuál era la otra.
 *
 *  4. Empates (hallazgo 1334). Antes los resolvía el orden de declaración del objeto de puntos:
 *     siempre a favor del perro, en silencio. Ahora, a igualdad de puntos, gana la que más
 *     encaja con el vínculo que buscas (pregunta 7); si sigue el empate, la de menor coste
 *     mensual mínimo, y después la de menor coste inicial mínimo. El empate se anuncia.
 *
 *  5. Las razones salen de las respuestas (hallazgo 1335). Antes eran un texto fijo por animal
 *     («Tu perfil activo…» al perro de un sedentario). Ahora se citan las respuestas que más
 *     han sumado a la ganadora y, aparte, las que van en su contra.
 */

export type MascotaKey =
  | 'perro-pequeno'
  | 'perro-mediano'
  | 'perro-grande'
  | 'gato'
  | 'roedor'
  | 'pez'
  | 'pajaro'
  | 'reptil';

export interface MascotaInfo {
  nombre: string;
  /** Con artículo, para las frases: «un perro mediano», «unos peces». */
  conArticulo: string;
  /** Para concordar el verbo en las frases («los peces TOLERAN…»). */
  plural: boolean;
  perfil: string;
  icon: string;
  costeInicial: string;
  costeInicialMin: number;
  costeMensual: string;
  costeMensualMin: number;
  costeMensualMax: number;
  esperanzaVida: string;
  descripcion: string;
  pros: string[];
  contras: string[];
  tienePelo: boolean;
  /** Se adopta habitualmente en protectoras (perros, gatos y pequeños mamíferos). */
  adoptable: boolean;
}

export const MASCOTAS: Record<MascotaKey, MascotaInfo> = {
  'perro-pequeno': {
    nombre: 'Perro pequeño',
    conArticulo: 'un perro pequeño',
    plural: false,
    perfil: 'Razas toy o miniatura (Chihuahua, Yorkshire, Bichón…)',
    icon: '🐕',
    costeInicial: '500 – 2.000 €',
    costeInicialMin: 500,
    costeMensual: '80 – 150 €',
    costeMensualMin: 80,
    costeMensualMax: 150,
    esperanzaVida: '12 – 18 años',
    descripcion: 'Compañero muy afectivo y adaptable a espacios pequeños. Necesita paseos diarios aunque cortos. Muy longevo comparado con razas grandes.',
    pros: ['Adaptado a piso sin jardín', 'Muy longevo (hasta 18 años)', 'Fácil de transportar', 'Poco consumo de comida'],
    contras: ['Necesita paseos diarios', 'Muy dependiente del dueño', 'Veterinario y peluquería regulares', 'Puede ser más nervioso/ladrador'],
    tienePelo: true,
    adoptable: true,
  },
  'perro-mediano': {
    nombre: 'Perro mediano',
    conArticulo: 'un perro mediano',
    plural: false,
    perfil: 'Spaniel, Beagle, Border Collie, mestizos…',
    icon: '🐶',
    costeInicial: '300 – 1.500 €',
    costeInicialMin: 300,
    costeMensual: '100 – 200 €',
    costeMensualMin: 100,
    costeMensualMax: 200,
    esperanzaVida: '10 – 14 años',
    descripcion: 'El equilibrio entre compañía, ejercicio y espacio. Versátil para ciudad y campo. Ideal para familias activas.',
    pros: ['Muy versátil', 'Ideal para familias con niños', 'Gran variedad de carácter', 'Adopción muy disponible'],
    contras: ['Requiere ejercicio diario (30-60 min)', 'No apto para ausencias largas', 'Coste veterinario relevante', 'Necesita adiestramiento básico'],
    tienePelo: true,
    adoptable: true,
  },
  'perro-grande': {
    nombre: 'Perro grande',
    conArticulo: 'un perro grande',
    plural: false,
    perfil: 'Labrador, Pastor Alemán, Golden, Mastín…',
    icon: '🦮',
    costeInicial: '400 – 2.000 €',
    costeInicialMin: 400,
    costeMensual: '150 – 280 €',
    costeMensualMin: 150,
    costeMensualMax: 280,
    esperanzaVida: '8 – 12 años',
    descripcion: 'Compañero fiel y protector. Requiere espacio, ejercicio abundante y compromiso económico mayor. Ideal con jardín o acceso fácil a zonas verdes.',
    pros: ['Fidelidad y vínculo muy profundo', 'Excelente con niños', 'Buen perro guardián', 'Temperamento generalmente tranquilo'],
    contras: ['Necesita mucho espacio y ejercicio', 'Coste alimentación elevado', 'Veterinario más caro', 'Menor esperanza de vida'],
    tienePelo: true,
    adoptable: true,
  },
  gato: {
    nombre: 'Gato',
    conArticulo: 'un gato',
    plural: false,
    perfil: 'Europeo común, Siamés, Persa, Maine Coon…',
    icon: '🐱',
    costeInicial: '100 – 1.500 €',
    costeInicialMin: 100,
    costeMensual: '50 – 120 €',
    costeMensualMin: 50,
    costeMensualMax: 120,
    esperanzaVida: '12 – 20 años',
    descripcion: 'Independiente pero afectivo en sus propios términos. No necesita paseos, tolera bien las ausencias de un día. Ideal para personas con ritmo de vida ocupado.',
    pros: ['Muy independiente', 'Sin paseos obligatorios', 'Coste mensual moderado', 'Longevo y adaptable a piso'],
    contras: ['Puede ser difícil de "entrenar"', 'Pelo y alergias frecuentes', 'Arañazos en muebles', 'Necesita bandeja de arena limpia'],
    tienePelo: true,
    adoptable: true,
  },
  roedor: {
    // El conejo es un LAGOMORFO, no un roedor (hallazgo 1338): la ficha se llama «pequeño
    // mamífero» para poder incluirlo sin error. La chinchilla vive hasta 20 años (Manual
    // Veterinario Merck, «Chinchillas»), así que el techo de 10 años la dejaba fuera.
    nombre: 'Pequeño mamífero',
    conArticulo: 'un pequeño mamífero',
    plural: false,
    perfil: 'Roedores (hámster, rata, cobaya, chinchilla…) o conejo, que es un lagomorfo',
    icon: '🐹',
    costeInicial: '30 – 150 €',
    costeInicialMin: 30,
    costeMensual: '15 – 40 €',
    costeMensualMin: 15,
    costeMensualMax: 40,
    esperanzaVida: '2 – 20 años (según especie)',
    descripcion: 'Mascotas de bajo coste y mantenimiento limitado. La esperanza de vida cambia mucho de una especie a otra: del hámster o la rata (2-3 años) a la chinchilla (hasta 20, según el Manual Veterinario Merck), con el conejo y la cobaya en medio.',
    pros: ['Coste muy bajo', 'Sin paseos', 'Ocupan poco espacio', 'Buena primera mascota para niños'],
    contras: ['Hámster y rata viven poco; chinchilla y conejo, muchos años', 'Interacción limitada', 'Activos de noche (hámster)', 'Pérdida puede ser dura para niños pequeños'],
    tienePelo: true,
    adoptable: true,
  },
  pez: {
    nombre: 'Peces',
    conArticulo: 'unos peces',
    plural: true,
    perfil: 'Goldfish, tropicales, betta, marino…',
    icon: '🐠',
    costeInicial: '50 – 500 €',
    costeInicialMin: 50,
    costeMensual: '10 – 30 €',
    costeMensualMin: 10,
    costeMensualMax: 30,
    esperanzaVida: '1 – 15 años (según especie)',
    descripcion: 'La mascota más silenciosa y de menor interacción. Muy decorativa y relajante. El acuario requiere mantenimiento periódico pero no afecta a la vida diaria.',
    pros: ['Sin ruido ni alérgenos', 'Sin paseos ni atención constante', 'Decorativos y relajantes', 'Compatible con alergias'],
    contras: ['Interacción prácticamente nula', 'Acuario requiere mantenimiento semanal', 'Sensibles a cambios de agua', 'No te reconocen'],
    tienePelo: false,
    adoptable: false,
  },
  pajaro: {
    nombre: 'Pájaro',
    conArticulo: 'un pájaro',
    plural: false,
    perfil: 'Periquito, canario, agapornis, loro…',
    icon: '🦜',
    costeInicial: '30 – 800 €',
    costeInicialMin: 30,
    costeMensual: '20 – 60 €',
    costeMensualMin: 20,
    costeMensualMax: 60,
    esperanzaVida: '5 – 30 años (según especie)',
    descripcion: 'Animados y musicales. Los periquitos y canarios son económicos y relativamente fáciles. Los loros son muy inteligentes pero exigen mucha atención y estimulación.',
    pros: ['Alegran el ambiente con sonidos', 'Bajo coste (periquitos/canarios)', 'Muy longevos (loros)', 'Sin paseos ni jardín'],
    contras: ['Ruido puede ser molesto', 'Plumas y alérgenos en el ambiente', 'Jaula requiere limpieza frecuente', 'Loros necesitan mucha interacción'],
    tienePelo: false,
    adoptable: false,
  },
  reptil: {
    nombre: 'Reptil',
    conArticulo: 'un reptil',
    plural: false,
    perfil: 'Gecko, tortuga, camaleón, serpiente…',
    icon: '🦎',
    costeInicial: '100 – 600 €',
    costeInicialMin: 100,
    costeMensual: '20 – 70 €',
    costeMensualMin: 20,
    costeMensualMax: 70,
    esperanzaVida: '10 – 50 años (según especie)',
    descripcion: 'Mascotas únicas para perfiles específicos. Requieren instalaciones especiales (terrario, luz UV, temperatura). Muy longevas, especialmente las tortugas.',
    pros: ['Sin alérgenos (piel/pelo)', 'Sin ruido', 'Fascinantes para entusiastas', 'Muy longevos (tortugas)'],
    contras: ['Interacción muy limitada', 'Instalación cara y específica', 'Alimentación viva en algunos casos', 'Nicho, no apto para todos'],
    tienePelo: false,
    adoptable: false,
  },
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: MascotaKey[] = [
  'perro-pequeno', 'perro-mediano', 'perro-grande', 'gato', 'roedor', 'pez', 'pajaro', 'reptil',
];

const PERROS: MascotaKey[] = ['perro-pequeno', 'perro-mediano', 'perro-grande'];
const esPerro = (m: MascotaKey) => PERROS.includes(m);

type Pesos = Partial<Record<MascotaKey, number>>;

/**
 * Tabla de pesos por pregunta y respuesta. Es la de siempre (la que documenta
 * tests/apps/selector-mascota.spec.ts), sin la resta por alergia —ahora es un filtro— y sin la
 * rama `r[9] === 'muy_bajo'`, que no existía entre las opciones de la pregunta 9.
 */
export const PESOS: Record<number, Record<string, Pesos>> = {
  1: {
    mucho: { 'perro-mediano': 3, 'perro-grande': 3, 'perro-pequeno': 2, gato: 1 },
    medio: { 'perro-pequeno': 2, gato: 3, 'perro-mediano': 1 },
    poco: { gato: 3, pez: 2, pajaro: 1 },
    minimo: { pez: 3, reptil: 2, roedor: 1 },
  },
  2: {
    siempre: { 'perro-grande': 2, 'perro-mediano': 2 },
    pocas: { 'perro-pequeno': 1, gato: 1 },
    muchas: { gato: 3, pez: 2, pajaro: 1 },
    viajes: { pez: 3, reptil: 2, roedor: 1, gato: -1 },
  },
  3: {
    jardin: { 'perro-grande': 3, 'perro-mediano': 2 },
    piso_grande: { 'perro-mediano': 2, 'perro-pequeno': 1, gato: 2 },
    piso_normal: { 'perro-pequeno': 2, gato: 2 },
    piso_pequeno: { gato: 3, pez: 2, roedor: 2, pajaro: 1 },
  },
  4: {
    mucho: { 'perro-grande': 2, 'perro-mediano': 2 },
    medio: { 'perro-mediano': 1, 'perro-pequeno': 1 },
    poco: { gato: 2, pez: 2, reptil: 1 },
  },
  5: {
    si_pequenos: { 'perro-mediano': 1, roedor: -1, reptil: -2 },
    si_mayores: { 'perro-mediano': 2, gato: 1, roedor: 1 },
    adolescentes: { 'perro-mediano': 1, gato: 1 },
  },
  6: {
    alergia_pelo: { pez: 4, reptil: 3, pajaro: 1 },
    sin_ruido: { pez: 3, reptil: 2, gato: 1, pajaro: -2, 'perro-pequeno': -1 },
    comunidad: { pez: 2, roedor: 1, gato: 1, 'perro-grande': -2 },
  },
  7: {
    compania: { 'perro-pequeno': 2, 'perro-mediano': 2, gato: 1 },
    juego: { 'perro-mediano': 2, gato: 1, roedor: 1 },
    tranquilidad: { pez: 2, gato: 2, reptil: 1 },
    novedad: { reptil: 3, pajaro: 2 },
  },
  8: {
    largo: { 'perro-pequeno': 1, gato: 2, reptil: 1 },
    corto: { roedor: 3, pez: 1 },
  },
  9: {
    minimo: { gato: 2, 'perro-mediano': 1, roedor: 2 },
    bajo: { roedor: 1, pez: 1, 'perro-grande': -1 },
  },
  10: {
    muy_bajo: { pez: 3, roedor: 2, pajaro: 1, 'perro-grande': -3, 'perro-mediano': -1 },
    bajo: { gato: 1, pajaro: 1, 'perro-pequeno': 1, 'perro-grande': -2 },
    alto: { 'perro-grande': 2, 'perro-mediano': 1 },
  },
};

/** Techo de cada tramo de la pregunta 10, en €/mes. */
export const TECHO_MENSUAL: Record<string, number> = {
  muy_bajo: 30,
  bajo: 80,
  medio: 180,
  alto: Infinity,
};

export const ETIQUETA_MENSUAL: Record<string, string> = {
  muy_bajo: 'menos de 30 €/mes',
  bajo: '30 – 80 €/mes',
  medio: '80 – 180 €/mes',
  alto: 'más de 180 €/mes',
};

/**
 * Por qué ha sumado cada respuesta, dicho desde la respuesta y no desde el animal
 * (hallazgo 1335). `m` es el nombre con artículo de la ganadora.
 */
type Frase = (m: string, v: (singular: string, plural: string) => string) => string;

const RAZON_A_FAVOR: Record<number, Record<string, Frase>> = {
  1: {
    mucho: (m, v) => `Tienes más de 2 horas al día: da para los paseos, el juego y la atención que ${v('pide', 'piden')} ${m}.`,
    medio: (m, v) => `Con 1 – 2 horas al día cubres bien lo que ${v('necesita', 'necesitan')} ${m}.`,
    poco: (m, v) => `Con menos de una hora al día te conviene un animal que no dependa de ti a todas horas, y ${m} lo ${v('permite', 'permiten')}.`,
    minimo: (m, v) => `Solo tienes los fines de semana: ${m} se ${v('cuida', 'cuidan')} con rutinas cortas entre semana.`,
  },
  2: {
    siempre: (m, v) => `Casi siempre hay alguien en casa, y ${m} lo ${v('agradece', 'agradecen')}: no ${v('pasará', 'pasarán')} horas a solas.`,
    pocas: (m, v) => `La casa se queda vacía 3 – 5 horas, un margen que ${m} ${v('tolera', 'toleran')} bien.`,
    muchas: (m, v) => `La casa se queda vacía 6 – 10 horas: ${m} lo ${v('tolera', 'toleran')} mejor que un perro.`,
    viajes: (m, v) => `Viajas varios días seguidos: ${m} lo ${v('lleva', 'llevan')} mejor que otros animales, con un cuidador puntual o un sistema automático.`,
  },
  3: {
    jardin: (m, v) => `Tienes casa con jardín o patio, el espacio que mejor ${v('aprovecha', 'aprovechan')} ${m}.`,
    piso_grande: (m) => `Un piso de más de 80 m² deja sitio de sobra para ${m}.`,
    piso_normal: (m) => `Un piso de 50 – 80 m² es suficiente para ${m}.`,
    piso_pequeno: (m, v) => `En menos de 50 m², ${m} ${v('ocupa', 'ocupan')} poco y no ${v('necesita', 'necesitan')} salir.`,
  },
  4: {
    mucho: (m) => `Te declaras muy activo: puedes compartir paseos largos y salidas al campo con ${m}.`,
    medio: (m) => `Tus paseos habituales bastan para el ejercicio de ${m}.`,
    poco: (m, v) => `Prefieres estar en casa, y ${m} no te ${v('obliga', 'obligan')} a salir.`,
  },
  5: {
    si_pequenos: (m, v) => `Con niños menores de 5 años, ${m} de carácter tranquilo y siempre con supervisión adulta ${v('puede', 'pueden')} convivir bien.`,
    si_mayores: (m, v) => `Con niños de 5 a 12 años, ${m} les ${v('deja', 'dejan')} participar en el cuidado.`,
    adolescentes: (m) => `Con adolescentes en casa, el cuidado de ${m} se puede repartir.`,
  },
  6: {
    // La alergia al pelo no tiene frase aquí: la explica el filtro, más abajo.
    sin_ruido: (m, v) => `Necesitas silencio, y ${m} apenas ${v('hace', 'hacen')} ruido.`,
    comunidad: (m, v) => `Tu comunidad o tu contrato ponen límites: ${m} ${v('suele', 'suelen')} encajar en ellos mejor que un perro grande.`,
  },
  7: {
    compania: (m, v) => `Buscas compañía constante y afecto, lo que más ${v('ofrece', 'ofrecen')} ${m}.`,
    juego: (m, v) => `Buscas juego e interacción, y ${m} ${v('responde', 'responden')} a ello.`,
    tranquilidad: (m) => `Buscas una presencia tranquila y poco exigente, como la de ${m}.`,
    novedad: (m, v) => `Buscas algo diferente, y ${m} lo ${v('es', 'son')}.`,
  },
  8: {
    largo: (m, v) => `Piensas en un compromiso para toda la vida, y ${m} ${v('es longevo', 'pueden vivir muchos años')}.`,
    corto: (m, v) => `Prefieres un compromiso más corto, y ${m} lo ${v('permite', 'permiten')} según la especie que elijas.`,
  },
  9: {
    minimo: (m, v) => `Quieres adoptar con coste mínimo, y ${m} se ${v('adopta', 'adoptan')} con facilidad en protectoras.`,
    bajo: (m) => `Con hasta 300 € de inversión inicial puedes empezar con ${m}.`,
  },
  10: {
    muy_bajo: (m, v) => `Con menos de 30 €/mes, ${m} ${v('es', 'son')} de lo poco que cabe en tu presupuesto.`,
    bajo: (m) => `Con 30 – 80 €/mes puedes mantener ${m}.`,
    alto: (m) => `Con más de 180 €/mes cubres con holgura los gastos de ${m}.`,
  },
};
/** Respuestas que juegan EN CONTRA de la ganadora aunque haya ganado. */
function tensiones(m: MascotaKey, r: Record<number, string>): string[] {
  const t: string[] = [];
  const nombre = MASCOTAS[m].conArticulo;
  if (esPerro(m)) {
    if (r[1] === 'poco' || r[1] === 'minimo') {
      t.push(`Has dicho que tienes ${r[1] === 'poco' ? 'menos de una hora al día' : 'tiempo solo los fines de semana'}: ${nombre} necesita salir varias veces al día, todos los días.`);
    }
    if (r[4] === 'poco') {
      t.push(`Te declaras sedentario: aunque tú no hagas deporte, ${nombre} necesita paseos diarios.`);
    }
    if (r[2] === 'muchas' || r[2] === 'viajes') {
      t.push(`La casa se queda vacía ${r[2] === 'muchas' ? '6 – 10 horas' : 'varios días seguidos'}: un perro lo lleva mal sin paseador, guardería o alguien que lo atienda.`);
    }
    if (r[3] === 'piso_pequeno' && m !== 'perro-pequeno') {
      t.push(`En menos de 50 m², ${nombre} necesitará salidas largas para compensar la falta de espacio.`);
    }
  }
  if (m === 'gato' && r[2] === 'viajes') {
    t.push('Un gato tolera un día solo, no varios: con viajes frecuentes necesitarás a alguien que pase a atenderlo.');
  }
  if (m === 'roedor' && r[5] === 'si_pequenos') {
    t.push('Con niños menores de 5 años, un pequeño mamífero se manipula con supervisión: se estresa y muerde si lo aprietan.');
  }
  if (m === 'pajaro' && r[6] === 'sin_ruido') {
    t.push('Necesitas silencio: elige especies calladas (el canario canta, los periquitos y los loros gritan).');
  }
  if (m === 'roedor' && r[8] === 'corto') {
    t.push('Si buscas un ciclo corto, el hámster o la rata (2 – 3 años); la chinchilla o el conejo viven muchos más años.');
  }
  return t;
}

export interface Resultado {
  mascota: MascotaKey;
  /** La que ganaría por estilo de vida, sin aplicar alergia, salud ni presupuesto. */
  mascotaPorPerfil: MascotaKey;
  /** Por qué se ha descartado cada animal que no podía ser recomendado. */
  descartes: Partial<Record<MascotaKey, 'alergia' | 'salud' | 'presupuesto'>>;
  /** Puntos finales de cada animal (los descartados también, para poder explicarlos). */
  puntos: Record<MascotaKey, number>;
  /** Otras opciones admitidas con la MISMA puntuación que la recomendada. */
  empatadas: MascotaKey[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  /**
   * El coste inicial que se enseña. Con «Lo mínimo (adopción…)» y un animal que se adopta en
   * protectoras, enseñar el precio de COMPRA contradecía la respuesta (hallazgo 1339).
   */
  costeInicial: { valor: string; nota: string };
  razones: string[];
  aTenerEnCuenta: string[];
  consejos: string[];
}

export function calcularResultado(r: Record<number, string>): Resultado {
  // ─ Puntos, y cuánto aporta cada pregunta a cada animal ─
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<MascotaKey, number>;
  const aporte: Record<number, Pesos> = {};
  for (const [idTexto, porRespuesta] of Object.entries(PESOS)) {
    const id = Number(idTexto);
    const pesos = porRespuesta[r[id]];
    if (!pesos) continue;
    aporte[id] = pesos;
    for (const k of CLAVES) puntos[k] += pesos[k] ?? 0;
  }

  // ─ Filtros: lo declarado como límite no se negocia a puntos ─
  const descartes: Resultado['descartes'] = {};
  const techo = TECHO_MENSUAL[r[10]] ?? Infinity;
  for (const k of CLAVES) {
    if (r[6] === 'alergia_pelo' && MASCOTAS[k].tienePelo) descartes[k] = 'alergia';
    else if (r[5] === 'si_pequenos' && k === 'reptil') descartes[k] = 'salud';
    else if (MASCOTAS[k].costeMensualMin > techo) descartes[k] = 'presupuesto';
  }

  // ─ Orden explicable: puntos; luego vínculo buscado; luego coste mensual; luego inicial ─
  const vinculo = aporte[7] ?? {};
  const ordenar = (a: MascotaKey, b: MascotaKey) =>
    puntos[b] - puntos[a] ||
    (vinculo[b] ?? 0) - (vinculo[a] ?? 0) ||
    MASCOTAS[a].costeMensualMin - MASCOTAS[b].costeMensualMin ||
    MASCOTAS[a].costeInicialMin - MASCOTAS[b].costeInicialMin;

  const mascotaPorPerfil = [...CLAVES].sort(ordenar)[0];
  const admitidas = CLAVES.filter((k) => !descartes[k]).sort(ordenar);
  // Nunca queda vacía: los peces (10 €/mes, sin pelo, sin restricción de edad) pasan todos los filtros.
  const mascota = admitidas[0];
  const info = MASCOTAS[mascota];

  const empatadas = admitidas.slice(1).filter((k) => puntos[k] === puntos[mascota]);
  let criterioDesempate = '';
  if (empatadas.length > 0) {
    const segunda = empatadas[0];
    const seMuestra = `${info.plural ? 'se muestran' : 'se muestra'} primero ${info.conArticulo}`;
    if ((vinculo[mascota] ?? 0) !== (vinculo[segunda] ?? 0)) {
      criterioDesempate = `${seMuestra} porque ${info.plural ? 'encajan' : 'encaja'} mejor con el vínculo que buscas`;
    } else if (info.costeMensualMin !== MASCOTAS[segunda].costeMensualMin) {
      criterioDesempate = `${seMuestra} porque su coste mensual mínimo es el más bajo`;
    } else {
      criterioDesempate = `${seMuestra} porque su coste inicial mínimo es el más bajo`;
    }
  }

  // ─ Razones: las respuestas que más han sumado a la ganadora ─
  const razones: string[] = [];
  const aFavor = Object.entries(aporte)
    .map(([id, pesos]) => ({ id: Number(id), valor: pesos[mascota] ?? 0 }))
    // Solo las que tienen frase: la alergia se explica aparte, con el filtro.
    .filter((x) => x.valor > 0 && RAZON_A_FAVOR[x.id]?.[r[x.id]] !== undefined)
    .sort((a, b) => b.valor - a.valor || a.id - b.id)
    .slice(0, 3);
  for (const { id } of aFavor) {
    const texto = RAZON_A_FAVOR[id]?.[r[id]];
    if (texto) razones.push(texto(info.conArticulo, (sing, plur) => (info.plural ? plur : sing)));
  }

  // Lo que ha filtrado, dicho a la cara.
  if (r[6] === 'alergia_pelo') {
    razones.push('Has declarado alergia al pelo: se han descartado perros, gatos y pequeños mamíferos (roedores y conejo), porque todos tienen pelo.');
  }
  // Solo si el reptil competía de verdad: si iba por detrás, el filtro no ha cambiado nada.
  if (descartes.reptil === 'salud' && puntos.reptil >= puntos[mascota]) {
    razones.push('Con niños menores de 5 años se ha descartado el reptil: los CDC recomiendan no tener reptiles en casa a esa edad por el riesgo de salmonela.');
  }
  if (mascotaPorPerfil !== mascota && descartes[mascotaPorPerfil] === 'presupuesto') {
    const otra = MASCOTAS[mascotaPorPerfil];
    razones.push(
      `Por estilo de vida encajaría ${otra.conArticulo}, pero su coste mensual (${otra.costeMensual}) no cabe en ${ETIQUETA_MENSUAL[r[10]]}: manda el presupuesto, así que la recomendación se limita a lo que cabe en ese tramo.`,
    );
  }
  razones.push(`Coste mensual estimado para ${info.nombre}: ${info.costeMensual}. Esperanza de vida: ${info.esperanzaVida}.`);

  // ─ A tener en cuenta: lo que va en contra aunque haya ganado ─
  const aTenerEnCuenta = tensiones(mascota, r);
  if (info.costeMensualMax > techo) {
    aTenerEnCuenta.push(
      `La parte alta de la horquilla de ${info.conArticulo} (${info.costeMensual}) supera tu tramo de ${ETIQUETA_MENSUAL[r[10]]}: los meses con veterinario pueden salirse de él.`,
    );
  }
  if (mascota === 'pajaro' && r[6] === 'alergia_pelo') {
    aTenerEnCuenta.push('Las plumas y el polvo que desprenden también son alérgenos: consulta con tu alergólogo antes de traer un pájaro a casa.');
  }
  if (r[9] === 'minimo' && !info.adoptable) {
    aTenerEnCuenta.push(`Con ${info.conArticulo} el coste inicial es sobre todo la instalación (${mascota === 'pez' ? 'acuario' : mascota === 'reptil' ? 'terrario, luz UV y calor' : 'jaula y accesorios'}), que no se ahorra adoptando.`);
  }

  // ─ Consejos ─
  const consejos: string[] = [];
  consejos.push('🏥 Antes de decidir, visita una protectora o refugio: adoptar suele ser más económico y das hogar a un animal que lo necesita.');
  if (esPerro(mascota)) {
    consejos.push('💉 Presupuesta seguro de salud para mascotas: una operación puede costar entre 500 y 3.000 €. Hay seguros desde 15 €/mes.');
    consejos.push('📋 Chip, vacunas y, si el perro está catalogado como potencialmente peligroso, licencia y seguro son gastos de los primeros meses. En España la esterilización del perro no es obligatoria por ley estatal, pero sí evitar que críe sin control.');
  }
  if (mascota === 'gato') {
    consejos.push('✂️ La esterilización reduce problemas de salud y comportamiento: entre 100 y 250 € dependiendo del sexo y la clínica. En España es obligatoria antes de los 6 meses (Ley 7/2023, art. 26.i), salvo gatos inscritos como reproductores.');
  }
  consejos.push('⏳ Una mascota es un compromiso de años. Asegúrate de tener plan B para vacaciones, enfermedad o cambios de vida.');

  const costeInicial =
    r[9] === 'minimo' && info.adoptable
      ? {
          valor: 'Tasa de adopción',
          nota: `La fija cada protectora y suele incluir chip y vacunas. Comprando: ${info.costeInicial}.`,
        }
      : { valor: info.costeInicial, nota: '' };

  return {
    mascota,
    mascotaPorPerfil,
    descartes,
    puntos,
    empatadas,
    criterioDesempate,
    costeInicial,
    razones,
    aTenerEnCuenta,
    consejos,
  };
}
