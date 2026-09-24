/**
 * Motor de recomendación de selector-calefaccion.
 *
 * Vive aparte, sin dependencias, para poder enumerarlo entero sin navegador: mismo patrón que
 * `app/selector-mascota/motor.ts` (commit 934e57bc). Los pesos son los MISMOS que tenía la app
 * escritos en cadenas de `if`, salvo la opción nueva de la pregunta 5 (hallazgo 1401).
 *
 *  1. Empates. Antes los resolvía el orden del array de puntuaciones (`sort` estable), siempre
 *     a favor de la aerotermia y en silencio. Ahora, a igualdad de puntos, va primero el
 *     sistema que más encaja con el PRESUPUESTO de instalación declarado (pregunta 9) y, si
 *     sigue el empate, el de menor coste de instalación. El empate se anuncia en pantalla.
 *
 *  2. Razones. Antes eran un texto fijo por sistema. Ahora se citan las respuestas que más han
 *     sumado al sistema recomendado.
 *
 *  3. LO DECLARADO COMO LÍMITE ES UN FILTRO, NO UN PESO (hallazgos 1389, 1390 y 1391; forma a
 *     de la familia de selectores, la de selector-smartphone 943 y selector-mascota 1332).
 *     Antes el presupuesto, la unidad exterior y el gas solo sumaban puntos, y la app
 *     recomendaba una aerotermia de 8.000 € a quien había dicho «Menos de 3.000 €», o a quien
 *     no tiene sitio para la unidad exterior que la propia ficha pide. Ahora:
 *       · Presupuesto (pregunta 9): un sistema cabe si el MÍNIMO de su horquilla de
 *         instalación no supera el techo del tramo (el criterio de selector-mascota). Si la
 *         parte alta de la horquilla se sale del tramo, se avisa en los consejos.
 *       · «No tengo espacio» para la unidad exterior (pregunta 8): fuera la aerotermia y el
 *         split. Los dos la necesitan: un equipo partido o split se compone «de una unidad
 *         exterior y de una o varias unidades interiores», y los compactos aire-agua se
 *         instalan «generalmente en el exterior» (IDAE, «La bomba de calor en la
 *         rehabilitación energética de edificios», 2023, §2.2.1.4).
 *       · «No, sin gas natural — No hay acometida de gas en mi zona» (pregunta 5): fuera la
 *         caldera de gas.
 *     Las demás respuestas (clima, meses de uso, refrigeración, «Depende de la comunidad»)
 *     son preferencias o condiciones que se pueden negociar: siguen siendo pesos, y la de la
 *     comunidad se recuerda en los consejos. Los radiadores eléctricos pasan todos los
 *     filtros (800 € de mínimo, sin unidad exterior ni gas), así que siempre queda un sistema.
 *     Lo apartado se dice en pantalla con su motivo.
 *
 *  4. Caldera reciente (hallazgo 1392). A quien tiene una caldera de gas de menos de 5 años no
 *     se le presenta otro sistema como «tu mejor opción» para instalar ya, junto a un consejo
 *     que dice que no la cambie: el sistema que gana se presenta como el que encaja para
 *     cuando toque sustituirla.
 */

export type SistemaKey = 'aerotermia' | 'bomba-calor' | 'caldera-gas' | 'pellet' | 'electrico';

type Pesos = Partial<Record<SistemaKey, number>>;

export interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
  pesos: Pesos;
}

export interface Pregunta {
  id: number;
  categoria: string;
  /** Nombre corto de lo que se pregunta, para citar la respuesta en las razones. */
  tema: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

export interface SistemaInfo {
  nombre: string;
  /** Con artículo, para las frases: «la aerotermia», «los radiadores eléctricos…». */
  conArticulo: string;
  icon: string;
  costeInstalacion: string;
  /** Mínimo de la horquilla de instalación, en euros: filtro de presupuesto y desempate. */
  costeInstalacionMin: number;
  /** Máximo de la horquilla de instalación, en euros: aviso si se sale del tramo. */
  costeInstalacionMax: number;
  costeAnual: string;
  descripcion: string;
  pros: string[];
  contras: string[];
  /** Necesita una unidad exterior (IDAE 2023, §2.2.1.4): filtro de la pregunta 8. */
  necesitaUnidadExterior: boolean;
  /** Necesita acometida de gas natural: filtro de la pregunta 5. */
  necesitaGasNatural: boolean;
  /** Da también refrigeración en verano (lo dicen sus propios pros y contras). */
  refrigera: boolean;
}

/**
 * Rendimiento de la aerotermia. UNA sola cifra para la ficha, la guía y el FAQPage: el FAQPage
 * decía «COP 3-5» mientras la pantalla decía «3-4» (hallazgo 1395). La cifra es la de IDAE:
 * «Por cada kW eléctrico consumido, es capaz de generar una media de 4 kW para usos térmicos»
 * (guía «La bomba de calor en la rehabilitación energética de edificios», 2023, §1), y la misma
 * guía muestra cómo baja el COP con el frío exterior y con la temperatura del agua (gráficos 35
 * y 249).
 */
export const RENDIMIENTO_AEROTERMIA = 'de media, unos 4 kWh de calor por cada kWh eléctrico';
export const FUENTE_RENDIMIENTO = 'guía de IDAE sobre la bomba de calor, 2023';

/** Directiva (UE) 2024/1275, art. 17.15, dicho una sola vez para pantalla, guía y FAQPage. */
export const SIN_AYUDAS_CALDERAS_FOSILES =
  'desde el 1 de enero de 2025, los países de la UE no pueden conceder incentivos financieros para instalar calderas independientes de combustibles fósiles (Directiva (UE) 2024/1275, art. 17.15)';

/**
 * Ayudas públicas (hallazgos 1396 y 1398). La app citaba el MOVES —que financia la movilidad
 * eléctrica, no la calefacción— y un «PERTE Industria Verde» que no existe, con porcentajes
 * distintos en cada sitio (40-60 %, 30-70 %, 40-70 %) y anclados a 2025. Lo verificado el
 * 24/09/2026 en idae.es: el programa 6 del RD 477/2021 subvencionaba la «solar térmica,
 * biomasa, geotérmica, hidrotérmica o aerotérmica (exceptuando las tecnologías aire-aire)» en
 * viviendas, con fondos del Plan de Recuperación, y lo convocaban y gestionaban las
 * comunidades autónomas. Que haya hoy una convocatoria abierta no se ha podido verificar, así
 * que no se da nombre de programa vigente ni porcentaje: se describe el tipo de ayuda.
 */
export const AYUDAS_RENOVABLES =
  'Las ayudas a la calefacción renovable en vivienda (aerotermia aire-agua, geotermia, biomasa o solar térmica) las convocan y gestionan las comunidades autónomas, y su cuantía, requisitos y plazos dependen de cada convocatoria.';
export const AYUDAS_PROGRAMA_2021 =
  'El programa estatal de 2021 (Real Decreto 477/2021, con fondos europeos Next Generation EU) cubría esas tecnologías y dejaba fuera los equipos aire-aire, como los splits.';
export const AYUDAS_DONDE_MIRAR =
  'Comprueba en la agencia de energía de tu comunidad o en el IDAE (idae.es) si hay alguna convocatoria abierta y en qué condiciones.';

export const SISTEMAS: Record<SistemaKey, SistemaInfo> = {
  aerotermia: {
    nombre: 'Aerotermia',
    conArticulo: 'la aerotermia',
    icon: '🌡️',
    costeInstalacion: '8.000 – 15.000 €',
    costeInstalacionMin: 8000,
    costeInstalacionMax: 15000,
    costeAnual: '600 – 1.100 €',
    descripcion: `Sistema de bomba de calor aire-agua que calienta, enfría y produce ACS. Alta eficiencia: ${RENDIMIENTO_AEROTERMIA} (${FUENTE_RENDIMIENTO}).`,
    pros: [
      'Calefacción + refrigeración + ACS en un solo equipo',
      `Muy eficiente: ${RENDIMIENTO_AEROTERMIA}`,
      'Puede optar a ayudas a la calefacción renovable cuando hay convocatoria',
      'Aprovecha las horas de electricidad más barata si tu tarifa las tiene',
    ],
    contras: [
      'Inversión inicial alta',
      'Requiere espacio exterior para la unidad',
      'Rinde menos con mucho frío o cuando el agua tiene que salir muy caliente',
    ],
    necesitaUnidadExterior: true,
    necesitaGasNatural: false,
    refrigera: true,
  },
  'bomba-calor': {
    nombre: 'Bomba de Calor (split)',
    conArticulo: 'la bomba de calor (split)',
    icon: '❄️',
    costeInstalacion: '2.000 – 5.000 €',
    costeInstalacionMin: 2000,
    costeInstalacionMax: 5000,
    costeAnual: '500 – 900 €',
    descripcion: 'Equipos de aire acondicionado con función calefacción. Sin obras, instalación rápida. Ideal para pisos o casas con radiadores eléctricos.',
    pros: ['Menor inversión inicial', 'Sin obras importantes', 'Calefacción y refrigeración', 'Instalación rápida (días)'],
    contras: [
      'Sin ACS integrado',
      'Calor por convección (menos confort que suelo radiante)',
      'Requiere espacio exterior para la unidad',
      'Los equipos aire-aire quedaban fuera de las ayudas estatales a la calefacción renovable de 2021',
    ],
    necesitaUnidadExterior: true,
    necesitaGasNatural: false,
    refrigera: true,
  },
  'caldera-gas': {
    nombre: 'Caldera de Gas',
    conArticulo: 'la caldera de gas',
    icon: '🔥',
    costeInstalacion: '2.500 – 5.000 €',
    costeInstalacionMin: 2500,
    costeInstalacionMax: 5000,
    costeAnual: '900 – 1.600 €',
    descripcion: 'Sistema consolidado, instalación sencilla y amplia red de servicio técnico. Desde 2025 no puede recibir ayudas públicas en la UE.',
    pros: ['Inversión inicial moderada', 'Red de técnicos muy amplia', 'Calor instantáneo', 'Compatible con instalaciones existentes'],
    contras: [
      'Gas sujeto a volatilidad de precios',
      'Sin ayudas públicas para instalarla desde 2025 (Directiva (UE) 2024/1275)',
      'Huella de carbono mayor',
      'Necesita acometida de gas natural',
      'Sin refrigeración',
    ],
    necesitaUnidadExterior: false,
    necesitaGasNatural: true,
    refrigera: false,
  },
  pellet: {
    nombre: 'Caldera o Estufa de Pellet',
    conArticulo: 'la caldera o estufa de pellet',
    icon: '🪵',
    costeInstalacion: '5.000 – 12.000 €',
    costeInstalacionMin: 5000,
    costeInstalacionMax: 12000,
    costeAnual: '700 – 1.200 €',
    descripcion: 'Combustible renovable de bajo coste. Muy eficiente en zonas rurales con acceso a pellet a buen precio. Requiere almacenamiento.',
    pros: [
      'Combustible renovable y barato',
      'Alta autonomía con tolva grande',
      'Puede optar a ayudas a la calefacción renovable (biomasa) cuando hay convocatoria',
      'Buena alternativa sin gas natural',
    ],
    contras: ['Necesita espacio de almacenamiento', 'Mantenimiento más frecuente', 'Requiere suministro regular de pellet', 'Sin refrigeración'],
    necesitaUnidadExterior: false,
    necesitaGasNatural: false,
    refrigera: false,
  },
  electrico: {
    nombre: 'Radiadores Eléctricos de Bajo Consumo',
    conArticulo: 'los radiadores eléctricos de bajo consumo',
    icon: '⚡',
    costeInstalacion: '800 – 2.500 €',
    costeInstalacionMin: 800,
    costeInstalacionMax: 2500,
    costeAnual: '1.000 – 2.000 €',
    descripcion: 'Solución sin obras ni instalación de gas. Ideal para uso puntual o complementario. Coste energético más alto, pero inversión mínima.',
    pros: ['Sin obras ni instalación compleja', 'Coste inicial muy bajo', 'Control independiente por estancia', 'Sin mantenimiento'],
    contras: ['Coste eléctrico más alto', 'Sin refrigeración ni ACS', 'No recomendado como sistema principal en climas fríos'],
    necesitaUnidadExterior: false,
    necesitaGasNatural: false,
    refrigera: false,
  },
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES: SistemaKey[] = ['aerotermia', 'bomba-calor', 'caldera-gas', 'pellet', 'electrico'];

// ─────────────────────────────────────────────
// Preguntas del test (10), con sus pesos
// ─────────────────────────────────────────────

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu vivienda',
    tema: 'Tipo de vivienda',
    pregunta: '¿Qué tipo de vivienda tienes?',
    icon: '🏠',
    opciones: [
      { valor: 'piso', etiqueta: 'Piso en bloque', desc: 'Apartamento o piso en edificio', pesos: { 'bomba-calor': 2, electrico: 1 } },
      { valor: 'chalet', etiqueta: 'Casa unifamiliar o chalet', desc: 'Vivienda independiente con exterior', pesos: { aerotermia: 2, pellet: 1 } },
      { valor: 'adosado', etiqueta: 'Adosado o semidetachado', desc: 'Casa con vecinos en pared medianera', pesos: { aerotermia: 2, pellet: 1 } },
      { valor: 'rural', etiqueta: 'Casa rural o de campo', desc: 'Vivienda aislada fuera de la ciudad', pesos: { pellet: 3, aerotermia: 1 } },
    ],
  },
  {
    id: 2,
    categoria: 'Tu vivienda',
    tema: 'Superficie',
    pregunta: '¿Cuántos metros cuadrados tiene tu vivienda aproximadamente?',
    icon: '📐',
    opciones: [
      { valor: 'pequena', etiqueta: 'Menos de 60 m²', desc: 'Estudio o piso pequeño', pesos: { 'bomba-calor': 2, electrico: 2 } },
      { valor: 'media', etiqueta: '60 – 100 m²', desc: 'Piso o casa mediana', pesos: {} },
      { valor: 'grande', etiqueta: '100 – 180 m²', desc: 'Casa grande o chalet', pesos: { aerotermia: 2, pellet: 1 } },
      { valor: 'muygrande', etiqueta: 'Más de 180 m²', desc: 'Vivienda muy amplia', pesos: { aerotermia: 2, pellet: 1 } },
    ],
  },
  {
    id: 3,
    categoria: 'Tu vivienda',
    tema: 'Distribución del calor',
    pregunta: '¿Qué sistema de distribución de calor tienes instalado?',
    icon: '🔧',
    opciones: [
      { valor: 'radiadores', etiqueta: 'Radiadores de agua', desc: 'Los radiadores clásicos conectados a caldera', pesos: { 'caldera-gas': 2, aerotermia: 1 } },
      { valor: 'suelo', etiqueta: 'Suelo radiante', desc: 'Calefacción por el suelo', pesos: { aerotermia: 3 } },
      { valor: 'fancoils', etiqueta: 'Fan-coils o conductos', desc: 'Sistema de aire forzado', pesos: {} },
      { valor: 'ninguno', etiqueta: 'Ninguno instalado aún', desc: 'Instalación nueva o primera vez', pesos: { aerotermia: 2, 'bomba-calor': 1 } },
    ],
  },
  {
    id: 4,
    categoria: 'Tu vivienda',
    tema: 'Clima',
    pregunta: '¿Cuál es el clima de tu zona?',
    icon: '🌤️',
    opciones: [
      { valor: 'frio', etiqueta: 'Frío o muy frío', desc: 'Inviernos largos, nieve ocasional (interior, norte)', pesos: { aerotermia: 1, pellet: 2, 'caldera-gas': 1 } },
      { valor: 'templado', etiqueta: 'Templado', desc: 'Inviernos suaves, veranos cálidos', pesos: { aerotermia: 2, 'bomba-calor': 1 } },
      { valor: 'caluroso', etiqueta: 'Cálido o mediterráneo', desc: 'Inviernos cortos, veranos muy calurosos', pesos: { 'bomba-calor': 3, aerotermia: 1 } },
      { valor: 'canarias', etiqueta: 'Clima muy suave', desc: 'Canarias o costa sur sin frío real', pesos: { 'bomba-calor': 3, aerotermia: 1 } },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación actual',
    tema: 'Caldera de gas actual',
    pregunta: '¿Tienes actualmente caldera de gas natural?',
    icon: '⛽',
    opciones: [
      { valor: 'si_reciente', etiqueta: 'Sí, menos de 5 años', desc: 'Caldera nueva, en buen estado', pesos: { 'caldera-gas': 4 } },
      // Hallazgo 1401: entre «menos de 5» y «más de 10» no había respuesta para una caldera de
      // 5 a 10 años. Su peso es el punto medio de los dos extremos que ya tenía la app (la
      // reciente suma 4 a la caldera de gas; la antigua, nada): conservarla pesa, pero menos.
      { valor: 'si_media', etiqueta: 'Sí, entre 5 y 10 años', desc: 'Funciona, pero ya no es nueva', pesos: { 'caldera-gas': 2 } },
      { valor: 'si_vieja', etiqueta: 'Sí, más de 10 años', desc: 'Caldera antigua, próxima a renovación', pesos: { aerotermia: 2, 'bomba-calor': 1 } },
      { valor: 'no_gas', etiqueta: 'No, sin gas natural', desc: 'No hay acometida de gas en mi zona', pesos: { aerotermia: 2, pellet: 1, 'bomba-calor': 1 } },
      { valor: 'otro', etiqueta: 'Otro sistema', desc: 'Gasoil, propano, eléctrico…', pesos: {} },
    ],
  },
  {
    id: 6,
    categoria: 'Tu uso',
    tema: 'Refrigeración en verano',
    pregunta: '¿Necesitas también refrigeración en verano?',
    icon: '🌞',
    opciones: [
      { valor: 'imprescindible', etiqueta: 'Sí, imprescindible', desc: 'Veranos muy calurosos, sin aire sería imposible', pesos: { 'bomba-calor': 3, aerotermia: 2 } },
      { valor: 'util', etiqueta: 'Sí, me sería muy útil', desc: 'Caluroso pero me las arreglaba sin él', pesos: { 'bomba-calor': 1, aerotermia: 1 } },
      { valor: 'poco', etiqueta: 'Poco o nada', desc: 'Mi zona no lo requiere', pesos: {} },
    ],
  },
  {
    id: 7,
    categoria: 'Tu uso',
    tema: 'Meses de calefacción',
    pregunta: '¿Cuántos meses al año usas la calefacción?',
    icon: '📅',
    opciones: [
      { valor: 'pocos', etiqueta: '2 – 3 meses', desc: 'Inviernos cortos y suaves', pesos: { 'bomba-calor': 2, electrico: 1 } },
      { valor: 'medio', etiqueta: '4 – 5 meses', desc: 'Invierno estándar', pesos: {} },
      { valor: 'mucho', etiqueta: '6 o más meses', desc: 'Clima frío, uso muy prolongado', pesos: { aerotermia: 2, pellet: 1 } },
    ],
  },
  {
    id: 8,
    categoria: 'Tu situación actual',
    tema: 'Unidad exterior',
    pregunta: '¿Tienes o puedes instalar una unidad exterior (compresor)?',
    icon: '🏗️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, tengo espacio exterior', desc: 'Terraza, jardín o fachada exterior', pesos: { aerotermia: 2, 'bomba-calor': 2 } },
      { valor: 'comunidad', etiqueta: 'Depende de la comunidad', desc: 'Piso en bloque, necesito permiso', pesos: { 'bomba-calor': 1, electrico: 1 } },
      { valor: 'no', etiqueta: 'No tengo espacio', desc: 'Sin posibilidad de instalar unidad exterior', pesos: { 'caldera-gas': 2, electrico: 2 } },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    tema: 'Presupuesto de instalación',
    pregunta: '¿Cuál es tu presupuesto para la instalación?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Menos de 3.000 €', desc: 'Inversión mínima', pesos: { electrico: 4, 'bomba-calor': 2 } },
      { valor: 'medio', etiqueta: '3.000 – 8.000 €', desc: 'Inversión moderada', pesos: { 'bomba-calor': 2, 'caldera-gas': 1, pellet: 1 } },
      { valor: 'alto', etiqueta: '8.000 – 15.000 €', desc: 'Dispuesto a invertir con vista al largo plazo', pesos: { aerotermia: 3 } },
      { valor: 'premium', etiqueta: 'Más de 15.000 €', desc: 'Quiero la mejor solución posible', pesos: { aerotermia: 4 } },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    tema: 'Subvenciones',
    // Antes: «(Next Generation EU, PERTE)». Ningún PERTE financia la calefacción de una
    // vivienda, y los fondos europeos que sí la financiaron no tienen convocatoria vigente
    // verificada (hallazgo 1396): se pregunta por el tipo de ayuda, sin nombres.
    pregunta: '¿Te interesan las ayudas públicas para calefacción renovable?',
    icon: '🏛️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, quiero aprovecharlas', desc: 'Dispuesto a hacer los trámites necesarios', pesos: { aerotermia: 2, pellet: 1 } },
      { valor: 'quizas', etiqueta: 'Si no son muy complicadas', desc: 'Solo si el proceso es sencillo', pesos: { aerotermia: 2, pellet: 1 } },
      { valor: 'no', etiqueta: 'Prefiero no complicarme', desc: 'Prefiero una solución directa sin trámites', pesos: {} },
    ],
  },
];

/** La pregunta cuyo peso deshace un empate: el presupuesto de instalación. */
const PREGUNTA_DESEMPATE = 9;

/** Techo de cada tramo de la pregunta 9, en euros. */
export const TECHO_PRESUPUESTO: Record<string, number> = {
  bajo: 3000,
  medio: 8000,
  alto: 15000,
  premium: Infinity,
};

export type MotivoDescarte = 'presupuesto' | 'unidad-exterior' | 'sin-gas';

export interface Resultado {
  sistemaPrincipal: SistemaKey;
  /** La segunda entre las ADMITIDAS; null si los filtros solo dejan una. */
  sistemaAlternativa: SistemaKey | null;
  /** La que ganaría por puntos si no se aplicara ningún límite declarado. */
  sistemaPorPuntos: SistemaKey;
  /** Puntos finales de cada sistema (los apartados también, para poder explicarlos). */
  puntos: Record<SistemaKey, number>;
  /** Por qué no puede recomendarse cada sistema apartado por un límite declarado. */
  descartes: Partial<Record<SistemaKey, MotivoDescarte[]>>;
  /** Los que iban por delante del recomendado y se han apartado, en su orden. */
  apartados: SistemaKey[];
  /** Una frase por cada apartado, con su motivo: lo que se dice en pantalla. */
  avisosDescarte: string[];
  /** Otros sistemas ADMITIDOS con la MISMA puntuación que el recomendado. */
  empatados: SistemaKey[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  /**
   * La caldera de gas es de menos de 5 años y gana otro sistema: se presenta como el que encaja
   * para cuando toque sustituirla, no como una obra para ya (hallazgo 1392).
   */
  planificarSustitucion: boolean;
  razones: string[];
  consejos: string[];
  subvenciones: boolean;
}

const puntosEnLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

/** «los radiadores…» concuerda en plural: «se muestran», «encajan». */
const plural = (info: SistemaInfo) => /^(los|las) /.test(info.conArticulo);

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const etiquetaDe = (id: number, valor: string | undefined) =>
  PREGUNTAS.find((p) => p.id === id)?.opciones.find((o) => o.valor === valor)?.etiqueta ?? '';

/** «8.000 €»: el mínimo de la horquilla tal y como la escribe la ficha. */
const desde = (info: SistemaInfo) => `${info.costeInstalacion.split(' – ')[0]} €`;

export function calcularResultado(r: Record<number, string>): Resultado {
  // ─ Puntos, y cuánto aporta cada pregunta a cada sistema ─
  const puntos = Object.fromEntries(CLAVES.map((k) => [k, 0])) as Record<SistemaKey, number>;
  const aporte: Record<number, Pesos> = {};
  for (const p of PREGUNTAS) {
    const opcion = p.opciones.find((o) => o.valor === r[p.id]);
    if (!opcion) continue;
    aporte[p.id] = opcion.pesos;
    for (const k of CLAVES) puntos[k] += opcion.pesos[k] ?? 0;
  }

  // ─ Filtros: lo declarado como límite no se negocia a puntos ─
  const techo = TECHO_PRESUPUESTO[r[9]] ?? Infinity;
  const descartes: Resultado['descartes'] = {};
  for (const k of CLAVES) {
    const info = SISTEMAS[k];
    const motivos: MotivoDescarte[] = [];
    if (info.costeInstalacionMin > techo) motivos.push('presupuesto');
    if (r[8] === 'no' && info.necesitaUnidadExterior) motivos.push('unidad-exterior');
    if (r[5] === 'no_gas' && info.necesitaGasNatural) motivos.push('sin-gas');
    if (motivos.length > 0) descartes[k] = motivos;
  }

  // ─ Orden explicable: puntos; luego el encaje con el presupuesto; luego el coste ─
  const presupuesto = aporte[PREGUNTA_DESEMPATE] ?? {};
  const ordenar = (a: SistemaKey, b: SistemaKey) =>
    puntos[b] - puntos[a] ||
    (presupuesto[b] ?? 0) - (presupuesto[a] ?? 0) ||
    SISTEMAS[a].costeInstalacionMin - SISTEMAS[b].costeInstalacionMin;
  const ordenTotal = [...CLAVES].sort(ordenar);
  const admitidos = ordenTotal.filter((k) => !descartes[k]);
  // Nunca queda vacío: los radiadores eléctricos pasan los tres filtros.
  const sistemaPrincipal = admitidos[0];
  const sistemaAlternativa = admitidos[1] ?? null;
  const sistemaPorPuntos = ordenTotal[0];
  const info = SISTEMAS[sistemaPrincipal];

  // ─ Lo apartado, dicho a la cara ─
  const apartados = ordenTotal.slice(0, ordenTotal.indexOf(sistemaPrincipal));
  const motivoEnFrase = (k: SistemaKey, m: MotivoDescarte): string => {
    if (m === 'presupuesto') return `su instalación empieza en ${desde(SISTEMAS[k])} y no cabe en tu presupuesto («${etiquetaDe(9, r[9])}»)`;
    if (m === 'unidad-exterior') return 'necesita una unidad exterior y has indicado que no tienes espacio para ella';
    return 'necesita acometida de gas natural y has indicado que no la hay en tu zona';
  };
  const avisosDescarte = apartados.map((k) => {
    const otro = SISTEMAS[k];
    const motivos = (descartes[k] ?? []).map((m) => motivoEnFrase(k, m)).join(', y además ');
    return `Con tus respuestas ${plural(otro) ? 'iban' : 'iba'} por delante ${otro.conArticulo}, con ${puntosEnLetra(puntos[k])}, pero ${motivos}.`;
  });

  const empatados = admitidos.slice(1).filter((k) => puntos[k] === puntos[sistemaPrincipal]);
  let criterioDesempate = '';
  if (empatados.length > 0) {
    // El criterio que la separa de CADA empatado; si no es el mismo para todos, se dicen los
    // que han intervenido, en su orden.
    const porPresupuesto = empatados.some((k) => (presupuesto[k] ?? 0) !== (presupuesto[sistemaPrincipal] ?? 0));
    const porCoste = empatados.some((k) => (presupuesto[k] ?? 0) === (presupuesto[sistemaPrincipal] ?? 0));
    const motivos = [
      ...(porPresupuesto ? [`${plural(info) ? 'encajan' : 'encaja'} mejor con el presupuesto de instalación que has indicado`] : []),
      ...(porCoste ? ['su coste de instalación es el más bajo'] : []),
    ];
    criterioDesempate = `${plural(info) ? 'se muestran' : 'se muestra'} primero ${info.conArticulo} porque ${motivos.join(' y, a igualdad, ')}`;
  }

  // ─ Razones: las respuestas que más han sumado al sistema recomendado ─
  const razones = PREGUNTAS
    .map((p) => ({ p, valor: aporte[p.id]?.[sistemaPrincipal] ?? 0 }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor || a.p.id - b.p.id)
    .slice(0, 3)
    .map(({ p, valor }) => {
      const etiqueta = p.opciones.find((o) => o.valor === r[p.id])?.etiqueta ?? '';
      return `${p.tema}: has respondido «${etiqueta}», que suma ${puntosEnLetra(valor)} a ${info.conArticulo}.`;
    });
  if (razones.length === 0) {
    razones.push(`Ninguna respuesta suma de forma destacada a un sistema concreto: ${info.conArticulo} sale por delante solo por el criterio de desempate.`);
  }

  // ─ Consejos ─
  const subvenciones = r[10] === 'si' || r[10] === 'quizas';
  const planificarSustitucion = r[5] === 'si_reciente' && sistemaPrincipal !== 'caldera-gas';
  const consejos: string[] = [];
  // La caldera reciente con OTRO sistema ganador ya se explica arriba, en el aviso de
  // sustitución: repetir aquí «no la cambies» junto a «tu mejor opción» era la contradicción
  // del hallazgo 1392.
  if (r[5] === 'si_reciente' && sistemaPrincipal === 'caldera-gas') {
    consejos.push('💡 Tu caldera es reciente: consérvala mientras funcione bien y planifica el cambio a un sistema renovable para cuando haya que sustituirla.');
  }
  if (r[5] === 'si_media') {
    consejos.push('🔄 Tu caldera de gas tiene entre 5 y 10 años: si funciona bien, compara con el instalador lo que cuesta cambiarla ya y lo que cuesta esperar a que haya que sustituirla.');
  }
  if (sistemaPrincipal === 'caldera-gas') {
    // Sin sitio para una unidad exterior, la aerotermia y el split tampoco serán el relevo.
    const relevo = r[8] === 'no' ? 'un sistema renovable' : 'bomba de calor o aerotermia';
    consejos.push(`🔄 Planifica la transición a ${relevo} para cuando haya que sustituir la caldera. Una caldera de gas nueva ya no tiene ayudas: ${SIN_AYUDAS_CALDERAS_FOSILES}.`);
  }
  if (sistemaPrincipal === 'electrico' && r[8] !== 'no') {
    consejos.push('🔄 A largo plazo, valora una bomba de calor cuando puedas invertir: consume bastante menos electricidad por cada kWh de calor.');
  }
  if (info.necesitaUnidadExterior && r[8] === 'comunidad') {
    consejos.push(`🏢 ${mayuscula(info.conArticulo)} necesita una unidad exterior: confirma con tu comunidad de propietarios que puedes instalarla antes de pedir presupuestos.`);
  }
  if (info.costeInstalacionMax > techo) {
    consejos.push(`💶 La parte alta de la horquilla de instalación de ${info.conArticulo}, ${info.costeInstalacion}, supera tu presupuesto («${etiquetaDe(9, r[9])}»): pide presupuestos con el alcance exacto de la obra antes de decidir.`);
  }
  if (subvenciones) {
    consejos.push(`🏛️ ${AYUDAS_RENOVABLES} ${AYUDAS_DONDE_MIRAR}`);
  }
  if (r[4] === 'frio' && info.necesitaUnidadExterior) {
    // Antes: «Las marcas japonesas (Mitsubishi, Daikin, Fujitsu) son referencia», sin fuente
    // y contra la política de perfiles técnicos sin marcas (hallazgo 1399).
    consejos.push(`🌡️ En climas fríos, compara la ficha técnica de cada equipo: pide su rendimiento (COP) y su potencia con temperaturas exteriores bajo cero, porque los dos bajan con el frío (${FUENTE_RENDIMIENTO}).`);
  }
  consejos.push('🔧 Pide siempre al menos 3 presupuestos de instaladores certificados. La calidad de la instalación es tan importante como el equipo elegido.');
  if (r[3] === 'radiadores' && sistemaPrincipal === 'aerotermia') {
    consejos.push(`📊 Con radiadores de agua hay equipos de aerotermia de alta temperatura (65 °C o más) que permiten conservarlos. Son más caros y rinden menos cuanto más caliente tiene que salir el agua (${FUENTE_RENDIMIENTO}).`);
  }

  return {
    sistemaPrincipal,
    sistemaAlternativa,
    sistemaPorPuntos,
    puntos,
    descartes,
    apartados,
    avisosDescarte,
    empatados,
    criterioDesempate,
    planificarSustitucion,
    razones,
    consejos,
    subvenciones,
  };
}
