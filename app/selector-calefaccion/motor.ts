/**
 * Motor de recomendación de selector-calefaccion.
 *
 * Vive aparte, sin dependencias, para poder enumerarlo entero sin navegador: mismo patrón que
 * `app/selector-mascota/motor.ts` (commit 934e57bc). Los pesos son los MISMOS que tenía la app
 * escritos en cadenas de `if`; lo que cambia es cómo se deshacen los empates y de dónde salen
 * las razones.
 *
 *  1. Empates. Antes los resolvía el orden del array de puntuaciones (`sort` estable), siempre
 *     a favor de la aerotermia y en silencio. Ahora, a igualdad de puntos, va primero el
 *     sistema que más encaja con el PRESUPUESTO de instalación declarado (pregunta 9) y, si
 *     sigue el empate, el de menor coste de instalación. El empate se anuncia en pantalla.
 *
 *  2. Razones. Antes eran un texto fijo por sistema: a quien ganaba la caldera de gas le decía
 *     «con una caldera reciente en buen estado…» aunque hubiera respondido que no tiene gas, y
 *     al pellet «en tu zona rural o sin gas natural…» a quien vive en un piso con gas. Ahora se
 *     citan las respuestas que más han sumado al sistema recomendado.
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
  /** Mínimo de la horquilla de instalación, en euros: último criterio de desempate. */
  costeInstalacionMin: number;
  costeAnual: string;
  descripcion: string;
  pros: string[];
  contras: string[];
}

export const SISTEMAS: Record<SistemaKey, SistemaInfo> = {
  aerotermia: {
    nombre: 'Aerotermia',
    conArticulo: 'la aerotermia',
    icon: '🌡️',
    costeInstalacion: '8.000 – 15.000 €',
    costeInstalacionMin: 8000,
    costeAnual: '600 – 1.100 €',
    descripcion: 'Sistema de bomba de calor aire-agua que calienta, enfría y produce ACS. Alta eficiencia: por cada kWh eléctrico genera 3-4 kWh de calor.',
    pros: ['Calefacción + refrigeración + ACS en un solo equipo', 'COP 3-4: muy eficiente', 'Subvenciones de hasta el 40-60%', 'Ideal con tarifa supervalle nocturna'],
    contras: ['Inversión inicial alta', 'Requiere espacio exterior para la unidad', 'Rendimiento menor con frío extremo'],
  },
  'bomba-calor': {
    nombre: 'Bomba de Calor (split)',
    conArticulo: 'la bomba de calor (split)',
    icon: '❄️',
    costeInstalacion: '2.000 – 5.000 €',
    costeInstalacionMin: 2000,
    costeAnual: '500 – 900 €',
    descripcion: 'Equipos de aire acondicionado con función calefacción. Sin obras, instalación rápida. Ideal para pisos o casas con radiadores eléctricos.',
    pros: ['Menor inversión inicial', 'Sin obras importantes', 'Calefacción y refrigeración', 'Instalación rápida (días)'],
    contras: ['Sin ACS integrado', 'Calor por convección (menos confort que suelo radiante)', 'Menos subvenciones que aerotermia'],
  },
  'caldera-gas': {
    nombre: 'Caldera de Gas',
    conArticulo: 'la caldera de gas',
    icon: '🔥',
    costeInstalacion: '2.500 – 5.000 €',
    costeInstalacionMin: 2500,
    costeAnual: '900 – 1.600 €',
    descripcion: 'Sistema consolidado, instalación sencilla y amplia red de servicio técnico. En declive por normativa europea de eficiencia energética.',
    pros: ['Inversión inicial moderada', 'Red de técnicos muy amplia', 'Calor instantáneo', 'Compatible con instalaciones existentes'],
    contras: ['Gas sujeto a volatilidad de precios', 'Normativa europea restrictiva desde 2025', 'Huella de carbono mayor', 'Sin refrigeración'],
  },
  pellet: {
    nombre: 'Caldera o Estufa de Pellet',
    conArticulo: 'la caldera o estufa de pellet',
    icon: '🪵',
    costeInstalacion: '5.000 – 12.000 €',
    costeInstalacionMin: 5000,
    costeAnual: '700 – 1.200 €',
    descripcion: 'Combustible renovable de bajo coste. Muy eficiente en zonas rurales con acceso a pellet a buen precio. Requiere almacenamiento.',
    pros: ['Combustible renovable y barato', 'Alta autonomía con tolva grande', 'Subvenciones disponibles', 'Buena alternativa sin gas natural'],
    contras: ['Necesita espacio de almacenamiento', 'Mantenimiento más frecuente', 'Requiere suministro regular de pellet', 'Sin refrigeración'],
  },
  electrico: {
    nombre: 'Radiadores Eléctricos de Bajo Consumo',
    conArticulo: 'los radiadores eléctricos de bajo consumo',
    icon: '⚡',
    costeInstalacion: '800 – 2.500 €',
    costeInstalacionMin: 800,
    costeAnual: '1.000 – 2.000 €',
    descripcion: 'Solución sin obras ni instalación de gas. Ideal para uso puntual o complementario. Coste energético más alto, pero inversión mínima.',
    pros: ['Sin obras ni instalación compleja', 'Coste inicial muy bajo', 'Control independiente por estancia', 'Sin mantenimiento'],
    contras: ['Coste eléctrico más alto', 'Sin refrigeración ni ACS', 'No recomendado como sistema principal en climas fríos'],
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
    pregunta: '¿Te interesan las subvenciones disponibles (Next Generation EU, PERTE)?',
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

export interface Resultado {
  sistemaPrincipal: SistemaKey;
  sistemaAlternativa: SistemaKey;
  /** Puntos finales de cada sistema. */
  puntos: Record<SistemaKey, number>;
  /** Otros sistemas con la MISMA puntuación que el recomendado. */
  empatados: SistemaKey[];
  /** Frase que explica cómo se ha deshecho el empate; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
  consejos: string[];
  subvenciones: boolean;
}

const puntosEnLetra = (n: number) => `${n} ${n === 1 ? 'punto' : 'puntos'}`;

/** «los radiadores…» concuerda en plural: «se muestran», «encajan». */
const plural = (info: SistemaInfo) => /^(los|las) /.test(info.conArticulo);

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

  // ─ Orden explicable: puntos; luego el encaje con el presupuesto; luego el coste ─
  const presupuesto = aporte[PREGUNTA_DESEMPATE] ?? {};
  const ordenar = (a: SistemaKey, b: SistemaKey) =>
    puntos[b] - puntos[a] ||
    (presupuesto[b] ?? 0) - (presupuesto[a] ?? 0) ||
    SISTEMAS[a].costeInstalacionMin - SISTEMAS[b].costeInstalacionMin;
  const orden = [...CLAVES].sort(ordenar);
  const sistemaPrincipal = orden[0];
  const sistemaAlternativa = orden[1];
  const info = SISTEMAS[sistemaPrincipal];

  const empatados = orden.slice(1).filter((k) => puntos[k] === puntos[sistemaPrincipal]);
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
  const consejos: string[] = [];
  if (r[5] === 'si_reciente') {
    consejos.push('💡 Tu caldera es reciente: no tiene sentido cambiarla ahora. Espera a que llegue a los 10-12 años para planificar la transición a sistemas renovables.');
  }
  if (sistemaPrincipal === 'caldera-gas') {
    consejos.push('🔄 Planifica la transición a bomba de calor o aerotermia para cuando la caldera llegue al final de su vida útil (10-15 años).');
  }
  if (sistemaPrincipal === 'electrico') {
    consejos.push('🔄 A largo plazo, valora una bomba de calor cuando puedas invertir: consume bastante menos electricidad por cada kWh de calor.');
  }
  if (subvenciones) {
    consejos.push('🏛️ Las subvenciones del programa PERTE Industria Verde y Next Generation EU para renovables se solicitan a través de tu comunidad autónoma. Consulta la web del IDAE (idae.es).');
  }
  if (r[4] === 'frio' && (sistemaPrincipal === 'aerotermia' || sistemaPrincipal === 'bomba-calor')) {
    consejos.push('🌡️ En climas muy fríos, elige equipos con COP garantizado por debajo de -10°C. Las marcas japonesas (Mitsubishi, Daikin, Fujitsu) son referencia en este aspecto.');
  }
  consejos.push('🔧 Pide siempre al menos 3 presupuestos de instaladores certificados. La calidad de la instalación es tan importante como el equipo elegido.');
  if (r[3] === 'radiadores' && sistemaPrincipal === 'aerotermia') {
    consejos.push('📊 Con radiadores existentes, una aerotermia de alta temperatura (hasta 65°C) funciona perfectamente. Es más cara pero evita cambiar todos los radiadores.');
  }

  return { sistemaPrincipal, sistemaAlternativa, puntos, empatados, criterioDesempate, razones, consejos, subvenciones };
}
