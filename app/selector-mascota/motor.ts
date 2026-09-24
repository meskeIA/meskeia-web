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
 *  2. Niños menores de 5 años: reptiles y pequeños mamíferos. Los CDC de EE. UU. dicen que los
 *     reptiles y anfibios «aren't recommended for households with young children» y que los
 *     menores de 5 años no deben tocarlos (cdc.gov/healthy-pets, «Reptiles and Amphibians»); y
 *     «CDC recommends that children under 5 years old avoid contact with reptiles, amphibians,
 *     poultry (including chicks and ducklings), and rodents» (cdc.gov/healthy-pets/risk-factors).
 *     Antes solo se filtraba el reptil, y a 953 perfiles con niños menores de 5 años se les
 *     recomendaba un «pequeño mamífero (hámster, rata, cobaya…)» (hallazgo 1441). La ficha
 *     agrupa roedores y conejo; el conejo no está en esa lista, pero la página de los CDC sobre
 *     pequeños mamíferos cuenta a los menores de 5 años entre quienes más riesgo tienen con
 *     todos ellos, conejo incluido, así que la ficha entera se filtra y se dice por qué.
 *
 *  3. El presupuesto mensual acota (hallazgo 1333). Un animal cabe en un tramo si el MÍNIMO de
 *     su horquilla de coste mensual queda POR DEBAJO del techo del tramo (hallazgo 1438: con
 *     «no supera», el perro pequeño de 80 – 150 € entraba en «30 – 80 €/mes» aunque toda su
 *     horquilla estuviera en el techo o por encima). No se exige que quepa la horquilla entera,
 *     como en selector-smartphone, porque aquí las horquillas no están alineadas con los tramos:
 *     un gato de 50 – 120 € en «30 – 80 €/mes» cabe en los meses normales, y el resultado avisa
 *     de que la parte alta se sale. Si la mejor opción por estilo de vida no cabe, se recomienda
 *     la mejor que cabe y se dice cuál era la otra.
 *
 *  3.bis El presupuesto INICIAL (hallazgo 1437). Con «Hasta 300 €», a un animal cuya compra
 *     empieza en 300 € o más (los tres perros) se le enseña la tasa de adopción, con el precio
 *     de compra y los 300 € declarados en la nota; si solo la parte alta de la horquilla pasa
 *     de 300 €, se avisa. No se filtra: los perros se adoptan en protectoras.
 *
 *  4. Empates (hallazgo 1334). Antes los resolvía el orden de declaración del objeto de puntos:
 *     siempre a favor del perro, en silencio. Ahora, a igualdad de puntos, gana la que más
 *     encaja con el vínculo que buscas (pregunta 7); si sigue el empate, la de menor coste
 *     mensual mínimo, y después la de menor coste inicial mínimo. El empate se anuncia, y cada
 *     criterio nombra a las que deja detrás cuando no es el mismo para todas (hallazgo 1442:
 *     «su coste mensual mínimo es el más bajo» era falso si otra empatada, apartada por el
 *     vínculo, costaba menos).
 *
 *  5. Las razones salen de las respuestas (hallazgo 1335). Antes eran un texto fijo por animal
 *     («Tu perfil activo…» al perro de un sedentario). Ahora se citan las respuestas que más
 *     han sumado a la ganadora y, aparte, las que van en su contra: también la necesidad de
 *     silencio frente a un perro (1439), el ciclo de vida corto frente a un animal longevo
 *     (1440) y las 3 – 5 horas a solas de un perro, que dejan de ser una razón «a favor»
 *     (1443: RSPCA y PDSA aconsejan no dejarlo solo más de cuatro horas).
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
  costeInicialMax: number;
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
    costeInicialMax: 2000,
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
    costeInicialMax: 1500,
    costeMensual: '100 – 200 €',
    costeMensualMin: 100,
    costeMensualMax: 200,
    esperanzaVida: '10 – 14 años',
    descripcion: 'El equilibrio entre compañía, ejercicio y espacio. Versátil para ciudad y campo. Ideal para familias activas.',
    pros: ['Muy versátil', 'Ideal para familias con niños', 'Gran variedad de carácter', 'Adopción muy disponible'],
    contras: ['Requiere ejercicio a diario', 'No apto para ausencias largas', 'Coste veterinario relevante', 'Necesita adiestramiento básico'],
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
    costeInicialMax: 2000,
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
    costeInicialMax: 1500,
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
    costeInicialMax: 150,
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
    costeInicialMax: 500,
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
    costeInicialMax: 800,
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
    costeInicialMax: 600,
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

/** Animales cuya ficha da una esperanza de vida que empieza en 5 años o más. */
const LONGEVOS: MascotaKey[] = [...PERROS, 'gato', 'reptil', 'pajaro'];

/** Techo de la pregunta 9 «Hasta 300 €», en euros. */
export const TECHO_INICIAL_BAJO = 300;

/** Animales que los CDC desaconsejan con niños menores de 5 años (ver la cabecera, punto 2). */
const NO_CON_MENORES_DE_5: MascotaKey[] = ['reptil', 'roedor'];

/** Lista legible: «A, B y C». */
function enumerarConY(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

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
    // A un perro no se le da como razón a favor (hallazgo 1443): va a `tensiones`, con la
    // recomendación de RSPCA y PDSA de no dejarlo solo más de cuatro horas.
    pocas: (m, v) => `La casa se queda vacía 3 – 5 horas: ${m} lo ${v('lleva', 'llevan')} mejor que otras opciones.`,
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
    // «puedes mantener» prometía de más: el animal cabe si su mínimo queda por debajo de 80 €,
    // y si la parte alta se sale se avisa aparte (hallazgo 1438).
    bajo: (m) => `Tu tramo de 30 – 80 €/mes cubre el coste mensual mínimo de ${m}.`,
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
    if (r[2] === 'pocas') {
      // RSPCA («no longer than four hours») y PDSA («shouldn't be left alone for more than 4
      // hours at a time»): el tramo declarado llega a cinco (hallazgo 1443).
      t.push(`La casa se queda vacía 3 – 5 horas: las guías de bienestar animal (RSPCA, PDSA) aconsejan no dejar a un perro solo más de cuatro horas seguidas, así que los días largos alguien tendrá que sacar a ${nombre}.`);
    }
    if (r[3] === 'piso_pequeno' && m !== 'perro-pequeno') {
      t.push(`En menos de 50 m², ${nombre} necesitará salidas largas para compensar la falta de espacio.`);
    }
    if (r[6] === 'sin_ruido') {
      // Antes solo se avisaba del ruido del pájaro, que no gana en ningún perfil con silencio;
      // al perro mediano y al grande ni siquiera les restaba puntos (hallazgo 1439).
      t.push(`Has indicado que necesitas silencio: ${nombre} puede ladrar, sobre todo cuando se queda solo o se aburre; el ejercicio diario y el adiestramiento lo reducen, pero no lo eliminan.`);
    }
  }
  if (m === 'gato' && r[2] === 'viajes') {
    t.push('Un gato tolera un día solo, no varios: con viajes frecuentes necesitarás a alguien que pase a atenderlo.');
  }
  if (m === 'pajaro' && r[6] === 'sin_ruido') {
    t.push('Necesitas silencio: elige especies calladas (el canario canta, los periquitos y los loros gritan).');
  }
  if (m === 'roedor' && r[8] === 'corto') {
    t.push('Si buscas un ciclo corto, el hámster o la rata (2 – 3 años); la chinchilla o el conejo viven muchos más años.');
  }
  if (r[8] === 'corto' && LONGEVOS.includes(m)) {
    // Solo el pequeño mamífero tenía tensión con «ciclo corto» (hallazgo 1440).
    t.push(`Prefieres un compromiso más corto, pero la esperanza de vida de ${nombre} es de ${MASCOTAS[m].esperanzaVida}: es un compromiso de muchos años.`);
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
    else if (r[5] === 'si_pequenos' && NO_CON_MENORES_DE_5.includes(k)) descartes[k] = 'salud';
    // Cabe si su mínimo queda POR DEBAJO del techo (hallazgo 1438; ver la cabecera, punto 3).
    else if (MASCOTAS[k].costeMensualMin >= techo) descartes[k] = 'presupuesto';
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
    // El criterio que separa a la recomendada de CADA empatada, no solo de la segunda (hallazgo
    // 1442). Si es el mismo para todas, se dice tal cual (y el superlativo es verdad: es menor que
    // el de todas); si no, cada criterio nombra a las que ha dejado detrás.
    const seMuestra = `${info.plural ? 'se muestran' : 'se muestra'} primero ${info.conArticulo}`;
    const decisivo = (k: MascotaKey): 0 | 1 | 2 => {
      if ((vinculo[mascota] ?? 0) !== (vinculo[k] ?? 0)) return 0;
      if (info.costeMensualMin !== MASCOTAS[k].costeMensualMin) return 1;
      return 2;
    };
    const v = (sing: string, plur: string) => (info.plural ? plur : sing);
    const criterios = [
      { motivo: `${v('encaja', 'encajan')} mejor con el vínculo que buscas`, frente: (o: string) => `${v('encaja', 'encajan')} mejor que ${o} con el vínculo que buscas` },
      { motivo: 'su coste mensual mínimo es el más bajo', frente: (o: string) => `su coste mensual mínimo es más bajo que el de ${o}` },
      { motivo: 'su coste inicial mínimo es el más bajo', frente: (o: string) => `su coste inicial mínimo es más bajo que el de ${o}` },
    ];
    const grupos = [...new Set(empatadas.map(decisivo))].sort((a, b) => a - b);
    const porque = grupos.length === 1
      ? criterios[grupos[0]].motivo
      : grupos
        .map((g) => criterios[g].frente(enumerarConY(empatadas.filter((k) => decisivo(k) === g).map((k) => MASCOTAS[k].conArticulo))))
        .join(', y ');
    criterioDesempate = `${seMuestra} porque ${porque}`;
  }

  // ─ Razones: las respuestas que más han sumado a la ganadora ─
  const razones: string[] = [];
  const aFavor = Object.entries(aporte)
    .map(([id, pesos]) => ({ id: Number(id), valor: pesos[mascota] ?? 0 }))
    // Solo las que tienen frase: la alergia se explica aparte, con el filtro. Las 3 – 5 horas a
    // solas no son una razón a favor de un perro (hallazgo 1443): van a `tensiones`.
    .filter((x) => x.valor > 0 && RAZON_A_FAVOR[x.id]?.[r[x.id]] !== undefined)
    .filter((x) => !(x.id === 2 && r[2] === 'pocas' && esPerro(mascota)))
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
  // Solo si el descartado competía de verdad: si iba por detrás, el filtro no ha cambiado nada.
  if (descartes.reptil === 'salud' && puntos.reptil >= puntos[mascota]) {
    razones.push('Con niños menores de 5 años se ha descartado el reptil: los CDC de Estados Unidos no recomiendan reptiles ni anfibios en hogares con niños pequeños, por el riesgo de salmonela.');
  }
  if (descartes.roedor === 'salud' && puntos.roedor >= puntos[mascota]) {
    razones.push('Con niños menores de 5 años se ha descartado el pequeño mamífero: los CDC de Estados Unidos recomiendan que a esa edad eviten el contacto con roedores (hámster, rata, cobaya…) y cuentan a los menores de 5 años entre quienes más riesgo de infección tienen con cualquier pequeño mamífero, conejo incluido.');
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
  // «Hasta 300 €» con un coste inicial que puede pasar de ahí (hallazgo 1437). Si incluso el
  // mínimo llega a 300 €, el valor que se enseña ya es la tasa de adopción (más abajo).
  if (r[9] === 'bajo' && info.costeInicialMin < TECHO_INICIAL_BAJO && info.costeInicialMax > TECHO_INICIAL_BAJO) {
    aTenerEnCuenta.push(
      `El coste inicial de ${info.conArticulo} (${info.costeInicial}) puede pasar de los 300 € que has indicado: con ese presupuesto, ${info.adoptable ? 'busca en protectoras o en la parte baja de esa horquilla' : 'empieza por una instalación sencilla'}.`,
    );
  }

  // ─ Consejos ─
  const consejos: string[] = [];
  consejos.push('🏥 Antes de decidir, visita una protectora o refugio: adoptar suele ser más económico y das hogar a un animal que lo necesita.');
  if (esPerro(mascota)) {
    consejos.push('💉 Prevé cómo afrontarías un gasto veterinario imprevisto, con un seguro de salud para mascotas o de otra forma: en la encuesta de la OCU (España, 2022), el 45 % de los dueños de perro tuvo que llevarlo a urgencias en el último año. El precio del seguro depende de la especie, la edad, la raza y lo que cubra: compara varias ofertas.');
    consejos.push('📋 Chip, vacunas y, si el perro está catalogado como potencialmente peligroso, licencia y seguro son gastos de los primeros meses. En España la esterilización del perro no es obligatoria por ley estatal, pero sí evitar que críe sin control.');
  }
  if (mascota === 'gato') {
    consejos.push('✂️ La esterilización reduce problemas de salud y comportamiento. Su precio depende del sexo (en la hembra es una cirugía abdominal, más compleja que la castración del macho) y de la clínica: pide presupuesto. En España es obligatoria antes de los 6 meses (Ley 7/2023, art. 26.i), salvo gatos inscritos como reproductores.');
  }
  consejos.push('⏳ Una mascota es un compromiso de años. Asegúrate de tener plan B para vacaciones, enfermedad o cambios de vida.');

  const costeInicial =
    r[9] === 'minimo' && info.adoptable
      ? {
          valor: 'Tasa de adopción',
          nota: `La fija cada protectora y suele incluir chip y vacunas. Comprando: ${info.costeInicial}.`,
        }
      : r[9] === 'bajo' && info.costeInicialMin >= TECHO_INICIAL_BAJO
        // «Hasta 300 €» y una compra que empieza en 300 € o más: enseñar el precio de compra sin
        // más contradecía la respuesta (hallazgo 1437). Solo ocurre con los perros, adoptables.
        ? {
            valor: 'Tasa de adopción',
            nota: `Comprar ${info.conArticulo} cuesta ${info.costeInicial}, por encima de los 300 € que has indicado; la tasa de adopción la fija cada protectora y suele incluir chip y vacunas.`,
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
