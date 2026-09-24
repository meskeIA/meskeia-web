/**
 * Motor de recomendación de selector-portatil.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-smartphone/motor.ts` y `app/selector-mascota/motor.ts`.
 * Las preguntas, los pesos y las reglas de formato, sistema y gama son los MISMOS que tenía la
 * página; lo que cambia es esto:
 *
 *  1. Empate de formato. Antes salía de ordenar un array con `sort` estable: con «A veces»
 *     fuera de casa y pantalla «Grande (17" o más)», portátil y sobremesa empatan a 2 y ganaba
 *     el portátil por ir primero, en silencio. Ahora, a igualdad de puntos, va primero el
 *     formato que más encaja con la pregunta de movilidad (3) y, si sigue, con la de pantalla
 *     (4); el empate se anuncia.
 *
 *  2. Razones. Eran un texto fijo por resultado, no por respuesta (ver `calcularResultado`).
 *     Ahora citan las respuestas que han sumado a cada decisión, y dicen cuándo ha mandado el
 *     presupuesto, como selector-smartphone tras el hallazgo 944.
 */

export type FormatoKey = 'portatil' | 'sobremesa' | 'dos-en-uno' | 'mini-pc';
export type OSKey = 'windows' | 'mac' | 'linux' | 'chromeos';
export type GamaKey = 'basica' | 'media' | 'alta' | 'pro';

export interface Opcion {
  valor: string;
  etiqueta: string;
  desc: string;
}

export interface Pregunta {
  id: number;
  categoria: string;
  pregunta: string;
  icon: string;
  opciones: Opcion[];
}

export interface ModeloRef {
  nombre: string;
  precio: string;
  nota: string;
  icon: string;
}

export interface GamaInfo {
  nombre: string;
  icon: string;
  precioOrientativo: string;
  descripcion: string;
}

export interface FormatoInfo {
  nombre: string;
  icon: string;
  descripcion: string;
}

export interface OSInfo {
  nombre: string;
  icon: string;
  descripcion: string;
}


export const FORMATOS: Record<FormatoKey, FormatoInfo> = {
  portatil: {
    nombre: 'Portátil',
    icon: '💻',
    descripcion: 'Movilidad total, batería integrada y pantalla incluida. La opción más versátil para la mayoría de usuarios.',
  },
  sobremesa: {
    nombre: 'Sobremesa + Monitor',
    icon: '🖥️',
    descripcion: 'Mejor rendimiento por euro, pantalla grande y ergonomía superior. Ideal si siempre trabajas en el mismo sitio.',
  },
  'dos-en-uno': {
    nombre: '2 en 1 (portátil/tablet)',
    icon: '📱',
    descripcion: 'Pantalla táctil y stylus para tomar notas o dibujar. Perfecto para estudiantes y creativos en movimiento.',
  },
  'mini-pc': {
    nombre: 'Mini PC',
    icon: '🔲',
    descripcion: 'Tamaño compacto con rendimiento de sobremesa. Necesita monitor, teclado y ratón. Ideal para un escritorio limpio.',
  },
};

export const OS_INFO: Record<OSKey, OSInfo> = {
  windows: {
    nombre: 'Windows',
    icon: '🪟',
    descripcion: 'Mayor compatibilidad de software, especialmente para gaming, ingeniería y herramientas de empresa. Mayor variedad de precios y modelos.',
  },
  mac: {
    nombre: 'macOS (Apple)',
    icon: '🍎',
    descripcion: 'Excelente integración con iPhone/iPad, autonomía destacada en MacBook y rendimiento eficiente con chip Apple Silicon. Ideal para creativos.',
  },
  linux: {
    nombre: 'Linux',
    icon: '🐧',
    descripcion: 'Máxima personalización, ideal para programación y servidores. Requiere más conocimiento técnico. Software de ofimática y diseño más limitado.',
  },
  chromeos: {
    nombre: 'ChromeOS',
    icon: '🌐',
    descripcion: 'Ligero y seguro, perfecto para navegación web, Google Workspace y educación. No es compatible con software de escritorio tradicional.',
  },
};

export const GAMAS: Record<GamaKey, GamaInfo> = {
  basica: {
    nombre: 'Gama de entrada',
    icon: '📗',
    precioOrientativo: '300 – 600 €',
    descripcion: 'Navegar, ofimática, videoconferencias y tareas cotidianas sin pretensiones. Rendimiento suficiente, sin lujos.',
  },
  media: {
    nombre: 'Gama media',
    icon: '📘',
    precioOrientativo: '600 – 1.100 €',
    descripcion: 'El punto dulce del mercado. Rendimiento fluido para multitarea, edición de fotos ligera y juegos casuales.',
  },
  alta: {
    nombre: 'Gama alta',
    icon: '📙',
    precioOrientativo: '1.100 – 1.800 €',
    descripcion: 'Procesadores potentes, pantallas de calidad y construcción premium. Para edición de vídeo, diseño o trabajo intensivo.',
  },
  pro: {
    nombre: 'Workstation / Pro',
    icon: '🏆',
    precioOrientativo: '1.800 – 4.000+ €',
    descripcion: 'Rendimiento máximo para CAD, renderizado 3D, IA, edición de vídeo 4K o gaming de alto nivel.',
  },
};

// Modelos por OS × Gama
export const MODELOS: Record<OSKey, Record<GamaKey, ModeloRef[]>> = {
  windows: {
    basica: [
      { nombre: 'Lenovo IdeaPad 3', precio: '~400 €', nota: 'Fiable para ofimática y estudio', icon: '💻' },
      { nombre: 'HP 15s-fq', precio: '~450 €', nota: 'Buena pantalla, teclado cómodo', icon: '💻' },
      { nombre: 'Acer Aspire 3', precio: '~380 €', nota: 'El más económico con garantía', icon: '💻' },
    ],
    media: [
      { nombre: 'Lenovo IdeaPad 5', precio: '~750 €', nota: 'OLED disponible, muy equilibrado', icon: '💻' },
      { nombre: 'ASUS VivoBook 16X', precio: '~800 €', nota: 'Pantalla grande, buena autonomía', icon: '💻' },
      { nombre: 'HP Pavilion Plus 14', precio: '~850 €', nota: 'Pantalla OLED, compacto', icon: '💻' },
    ],
    alta: [
      { nombre: 'Dell XPS 15', precio: '~1.500 €', nota: 'Pantalla OLED, construcción excelente', icon: '💻' },
      { nombre: 'Lenovo ThinkPad X1 Carbon', precio: '~1.600 €', nota: 'El referente empresarial', icon: '💻' },
      { nombre: 'ASUS ProArt Studiobook', precio: '~1.400 €', nota: 'Ideal para diseño y color', icon: '💻' },
    ],
    pro: [
      { nombre: 'Dell XPS 17', precio: '~2.200 €', nota: 'Workstation portátil de referencia', icon: '🏆' },
      { nombre: 'Lenovo ThinkPad P16', precio: '~2.500 €', nota: 'GPU profesional certificada', icon: '🏆' },
    ],
  },
  mac: {
    basica: [
      { nombre: 'MacBook Air M2 (reacondicionado)', precio: '~900 €', nota: 'El mejor portátil básico si el presupuesto lo permite', icon: '💻' },
    ],
    media: [
      { nombre: 'MacBook Air M3 13"', precio: '~1.299 €', nota: 'Silencioso, ligero, batería excepcional', icon: '💻' },
      { nombre: 'MacBook Air M3 15"', precio: '~1.499 €', nota: 'Pantalla grande sin ventilador', icon: '💻' },
    ],
    alta: [
      { nombre: 'MacBook Pro 14" M4', precio: '~1.999 €', nota: 'Pantalla Liquid Retina XDR, potente y eficiente', icon: '💻' },
      { nombre: 'Mac mini M4', precio: '~699 €', nota: 'Sobremesa Apple más asequible, increíble rendimiento', icon: '🖥️' },
    ],
    pro: [
      { nombre: 'MacBook Pro 16" M4 Pro', precio: '~2.999 €', nota: 'Referencia en edición de vídeo y audio', icon: '🏆' },
      { nombre: 'Mac Studio M4 Max', precio: '~2.299 €', nota: 'Workstation de sobremesa compacta', icon: '🏆' },
    ],
  },
  linux: {
    basica: [
      { nombre: 'Lenovo ThinkPad E14 (Linux)', precio: '~550 €', nota: 'Excelente compatibilidad con Linux', icon: '💻' },
      { nombre: 'System76 Lemur Pro', precio: '~700 €', nota: 'Certificado para Linux, autonomía récord', icon: '💻' },
    ],
    media: [
      { nombre: 'Framework Laptop 13', precio: '~850 €', nota: 'Modular, reparable, ideal para Linux', icon: '💻' },
      { nombre: 'Lenovo ThinkPad X1 Carbon (Linux)', precio: '~1.100 €', nota: 'Referente de compatibilidad Linux', icon: '💻' },
    ],
    alta: [
      { nombre: 'System76 Gazelle', precio: '~1.400 €', nota: 'Vendido con Ubuntu o Pop!_OS', icon: '💻' },
      { nombre: 'Framework Laptop 16', precio: '~1.300 €', nota: 'Modular con GPU intercambiable', icon: '💻' },
    ],
    pro: [
      { nombre: 'System76 Thelio (sobremesa)', precio: '~1.800 €', nota: 'Workstation Linux de alto rendimiento', icon: '🏆' },
      { nombre: 'Lenovo ThinkStation P360 Ultra', precio: '~2.200 €', nota: 'Workstation compacta con soporte Linux', icon: '🏆' },
    ],
  },
  chromeos: {
    basica: [
      { nombre: 'Lenovo Chromebook Duet 3', precio: '~280 €', nota: 'Tablet + teclado, portátil y ligero', icon: '💻' },
      { nombre: 'HP Chromebook 14a', precio: '~320 €', nota: 'Buena pantalla, duradero', icon: '💻' },
    ],
    media: [
      { nombre: 'ASUS Chromebook Plus CX34', precio: '~480 €', nota: 'Certificado para IA, buena potencia', icon: '💻' },
      { nombre: 'Lenovo Chromebook Plus 5i', precio: '~550 €', nota: 'Excelente para Google Workspace', icon: '💻' },
    ],
    alta: [
      { nombre: 'Google Pixelbook Go', precio: '~700 €', nota: 'El Chromebook premium de referencia', icon: '💻' },
    ],
    pro: [
      { nombre: 'ASUS Chromebook Flip CX5', precio: '~900 €', nota: '2 en 1 premium con stylus incluido', icon: '🏆' },
    ],
  },
};

// ─────────────────────────────────────────────
// Preguntas del test (10)
// ─────────────────────────────────────────────

export const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    categoria: 'Tu uso',
    pregunta: '¿Para qué usas principalmente el ordenador?',
    icon: '💻',
    opciones: [
      { valor: 'basico', etiqueta: 'Uso básico', desc: 'Navegar, email, redes sociales, YouTube' },
      { valor: 'ofimática', etiqueta: 'Ofimática y trabajo de oficina', desc: 'Word, Excel, videoconferencias, CRM' },
      { valor: 'creativo', etiqueta: 'Diseño, foto o vídeo', desc: 'Photoshop, Premiere, Illustrator, Lightroom' },
      { valor: 'dev', etiqueta: 'Programación o ciencia de datos', desc: 'Código, servidores, análisis, IA' },
    ],
  },
  {
    id: 2,
    categoria: 'Tu uso',
    pregunta: '¿Juegas a videojuegos en el ordenador?',
    icon: '🎮',
    opciones: [
      { valor: 'no', etiqueta: 'No juego', desc: 'El gaming no es para mí' },
      { valor: 'casual', etiqueta: 'Juegos ligeros', desc: 'Indie, estrategia, juegos poco exigentes' },
      { valor: 'medio', etiqueta: 'Juego bastante', desc: 'Títulos actuales en calidad media-alta' },
      { valor: 'alto', etiqueta: 'Gaming exigente', desc: 'AAA en máxima calidad, 1080p/1440p/4K' },
    ],
  },
  {
    id: 3,
    categoria: 'Tu movilidad',
    pregunta: '¿Necesitas llevarte el ordenador fuera de casa con frecuencia?',
    icon: '🎒',
    opciones: [
      { valor: 'siempre', etiqueta: 'Sí, a diario', desc: 'Trabajo híbrido, estudio, viajes frecuentes' },
      { valor: 'aveces', etiqueta: 'A veces', desc: 'Ocasionalmente fuera de casa' },
      { valor: 'nunca', etiqueta: 'No, siempre en casa', desc: 'Uso exclusivamente en un sitio fijo' },
    ],
  },
  {
    id: 4,
    categoria: 'Tu movilidad',
    pregunta: '¿Qué tamaño de pantalla prefieres?',
    icon: '📐',
    opciones: [
      { valor: 'pequena', etiqueta: 'Compacto (13-14")', desc: 'Ligero y fácil de llevar' },
      { valor: 'medio', etiqueta: 'Estándar (15-16")', desc: 'Equilibrio entre portabilidad y pantalla' },
      { valor: 'grande', etiqueta: 'Grande (17" o más)', desc: 'Máxima superficie de trabajo' },
      { valor: 'da_igual', etiqueta: 'Me da igual', desc: 'No es prioritario para mí' },
    ],
  },
  {
    id: 5,
    categoria: 'Tu situación',
    pregunta: '¿Tienes ya dispositivos Apple (iPhone, iPad…)?',
    icon: '🍎',
    opciones: [
      { valor: 'si_muchos', etiqueta: 'Sí, uso el ecosistema Apple', desc: 'iPhone, iPad, AirPods… todo Apple' },
      { valor: 'alguno', etiqueta: 'Alguno', desc: 'Tengo algún dispositivo Apple' },
      { valor: 'no', etiqueta: 'No, ninguno', desc: 'Uso Android o no tengo móvil Apple' },
    ],
  },
  {
    id: 6,
    categoria: 'Tu situación',
    pregunta: '¿Necesitas software específico para tu trabajo o estudios?',
    icon: '🔧',
    opciones: [
      { valor: 'windows_only', etiqueta: 'Sí, solo disponible en Windows', desc: 'AutoCAD, SolidWorks, software empresarial…' },
      { valor: 'adobe', etiqueta: 'Suite Adobe principalmente', desc: 'Photoshop, Premiere, After Effects, XD…' },
      { valor: 'google', etiqueta: 'Solo herramientas web y Google', desc: 'Docs, Sheets, Gmail, Meet…' },
      { valor: 'sin_requisitos', etiqueta: 'Sin requisitos específicos', desc: 'Cualquier plataforma me sirve' },
    ],
  },
  {
    id: 7,
    categoria: 'Tu uso',
    pregunta: '¿Cuántas horas al día usas el ordenador aproximadamente?',
    icon: '⏱️',
    opciones: [
      { valor: 'poco', etiqueta: 'Menos de 3 horas', desc: 'Uso muy moderado' },
      { valor: 'medio', etiqueta: '3 – 6 horas', desc: 'Uso normal' },
      { valor: 'mucho', etiqueta: '6 – 10 horas', desc: 'Jornada laboral completa' },
      { valor: 'extremo', etiqueta: 'Más de 10 horas', desc: 'Ordenador encendido casi todo el día' },
    ],
  },
  {
    id: 8,
    categoria: 'Tus prioridades',
    pregunta: '¿Cuánto tiempo planeas usar este ordenador?',
    icon: '📅',
    opciones: [
      { valor: 'corto', etiqueta: '2 – 3 años', desc: 'Me gusta renovar con frecuencia' },
      { valor: 'medio', etiqueta: '4 – 5 años', desc: 'Lo habitual' },
      { valor: 'largo', etiqueta: '6 años o más', desc: 'Quiero que dure lo máximo posible' },
    ],
  },
  {
    id: 9,
    categoria: 'Tu presupuesto',
    pregunta: '¿Cuál es tu presupuesto aproximado?',
    icon: '💶',
    opciones: [
      { valor: 'bajo', etiqueta: 'Hasta 600 €', desc: 'Lo esencial sin grandes pretensiones' },
      { valor: 'medio', etiqueta: '600 – 1.100 €', desc: 'Buena relación calidad-precio' },
      { valor: 'alto', etiqueta: '1.100 – 1.800 €', desc: 'Calidad premium' },
      { valor: 'premium', etiqueta: 'Más de 1.800 €', desc: 'Workstation o lo mejor disponible' },
    ],
  },
  {
    id: 10,
    categoria: 'Tu presupuesto',
    pregunta: '¿Considerarías comprar un ordenador reacondicionado certificado?',
    icon: '♻️',
    opciones: [
      { valor: 'si', etiqueta: 'Sí, con garantía', desc: 'Si tiene garantía y buen estado, perfecto' },
      { valor: 'quizas', etiqueta: 'Dependería de la oferta', desc: 'Solo si es una muy buena oportunidad' },
      { valor: 'no', etiqueta: 'Prefiero nuevo siempre', desc: 'No me interesa la segunda mano' },
    ],
  },
];

/** Nombre corto de lo que pregunta cada pregunta, para citar la respuesta en las razones. */
export const TEMA: Record<number, string> = {
  1: 'Uso principal',
  2: 'Videojuegos',
  3: 'Movilidad',
  4: 'Tamaño de pantalla',
  5: 'Dispositivos Apple',
  6: 'Software que necesitas',
  7: 'Horas de uso',
  8: 'Años de uso',
  9: 'Presupuesto',
  10: 'Reacondicionado',
};

/** Orden de declaración: SOLO para recorrer, nunca para desempatar. */
export const CLAVES_FORMATO: FormatoKey[] = ['portatil', 'sobremesa', 'dos-en-uno', 'mini-pc'];

/** Nombre con artículo, para el aviso de empate. */
export const FORMATO_CON_ARTICULO: Record<FormatoKey, string> = {
  portatil: 'el portátil',
  sobremesa: 'el sobremesa con monitor',
  'dos-en-uno': 'el 2 en 1',
  'mini-pc': 'el mini PC',
};

type Aporte = { pregunta: number; puntos: number };

/** Cómo se nombra cada gama dentro de una frase («la gama media»). */
const GAMA_CORTA: Record<GamaKey, string> = {
  basica: 'de entrada',
  media: 'media',
  alta: 'alta',
  pro: 'workstation o pro',
};

/** Los pesos, uno a uno, para poder decir de dónde sale cada punto. */
const PESOS_FORMATO: Record<number, Record<string, Partial<Record<FormatoKey, number>>>> = {
  3: { siempre: { portatil: 4, 'dos-en-uno': 2 }, aveces: { portatil: 2 }, nunca: { sobremesa: 3, 'mini-pc': 2 } },
  4: { grande: { sobremesa: 2 }, pequena: { portatil: 1, 'dos-en-uno': 1 } },
  1: { creativo: { 'dos-en-uno': 1 } },
};
const PESOS_MAC: Record<number, Record<string, number>> = {
  5: { si_muchos: 3, alguno: 1 },
  6: { windows_only: -3, adobe: 2 },
  1: { dev: 1 },
};
const PESOS_LINUX: Record<number, Record<string, number>> = {
  6: { windows_only: -2 },
  1: { dev: 2 },
};
const PESOS_CHROME: Record<number, Record<string, number>> = {
  6: { windows_only: -4, google: 3 },
  1: { basico: 2 },
};
const PESOS_GAMA: Record<number, Record<string, number>> = {
  1: { creativo: 3, dev: 2 },
  2: { alto: 3, medio: 1 },
  7: { extremo: 2, mucho: 2 },
  8: { largo: 2 },
  9: { alto: 2, premium: 4, bajo: -3 },
};

/** Suma una tabla de pesos y devuelve también, pregunta a pregunta, qué ha aportado. */
function sumar(r: Record<number, string>, tabla: Record<number, Record<string, number>>): { total: number; aportes: Aporte[] } {
  const aportes: Aporte[] = [];
  let total = 0;
  for (const [id, porRespuesta] of Object.entries(tabla)) {
    const puntos = porRespuesta[r[Number(id)]];
    if (puntos === undefined) continue;
    total += puntos;
    aportes.push({ pregunta: Number(id), puntos });
  }
  return { total, aportes };
}

const etiquetaDe = (r: Record<number, string>, id: number) =>
  PREGUNTAS.find((p) => p.id === id)?.opciones.find((o) => o.valor === r[id])?.etiqueta ?? '';

/** «Tema: «respuesta» (+n)», de mayor a menor aporte, solo los que suman. */
function citar(r: Record<number, string>, aportes: Aporte[]): string {
  return aportes
    .filter((a) => a.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos || a.pregunta - b.pregunta)
    .map((a) => `${TEMA[a.pregunta].toLowerCase()}, «${etiquetaDe(r, a.pregunta)}» (+${a.puntos})`)
    .join('; ');
}

export interface Resultado {
  formato: FormatoKey;
  os: OSKey;
  gama: GamaKey;
  /** Otros formatos con la MISMA puntuación que el recomendado. */
  formatosEmpatados: FormatoKey[];
  /** Frase que explica cómo se ha deshecho el empate de formato; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
  consejos: string[];
  modelos: ModeloRef[];
}

export function calcularResultado(r: Record<number, string>): Resultado {
  // ─ Formato: puntos, y a igualdad, la pregunta de movilidad y luego la de pantalla ─
  const puntosFormato = Object.fromEntries(CLAVES_FORMATO.map((k) => [k, 0])) as Record<FormatoKey, number>;
  const aporteFormato: Record<number, Partial<Record<FormatoKey, number>>> = {};
  for (const [id, porRespuesta] of Object.entries(PESOS_FORMATO)) {
    const pesos = porRespuesta[r[Number(id)]];
    if (!pesos) continue;
    aporteFormato[Number(id)] = pesos;
    for (const k of CLAVES_FORMATO) puntosFormato[k] += pesos[k] ?? 0;
  }
  const pesoFormato = (id: number, k: FormatoKey) => aporteFormato[id]?.[k] ?? 0;
  const DESEMPATE = [
    { pregunta: 3, motivo: 'encaja mejor con lo que has dicho sobre llevarte el ordenador fuera de casa' },
    { pregunta: 4, motivo: 'encaja mejor con el tamaño de pantalla que prefieres' },
  ];
  const ordenar = (a: FormatoKey, b: FormatoKey) => {
    if (puntosFormato[a] !== puntosFormato[b]) return puntosFormato[b] - puntosFormato[a];
    for (const { pregunta } of DESEMPATE) {
      const d = pesoFormato(pregunta, b) - pesoFormato(pregunta, a);
      if (d !== 0) return d;
    }
    return CLAVES_FORMATO.indexOf(a) - CLAVES_FORMATO.indexOf(b);
  };
  const ordenFormatos = [...CLAVES_FORMATO].sort(ordenar);
  const formato = ordenFormatos[0];
  const formatosEmpatados = ordenFormatos.slice(1).filter((k) => puntosFormato[k] === puntosFormato[formato]);
  let criterioDesempate = '';
  if (formatosEmpatados.length > 0) {
    // El criterio que lo separa de CADA empatado; si no es el mismo para todos, se dicen los
    // que han intervenido, en su orden.
    const decisivos = [...new Set(formatosEmpatados.map((k) =>
      DESEMPATE.findIndex(({ pregunta }) => pesoFormato(pregunta, formato) !== pesoFormato(pregunta, k)),
    ))].sort((a, b) => a - b);
    const decide = decisivos.includes(-1) ? undefined : { motivo: decisivos.map((i) => DESEMPATE[i].motivo).join(' y, a igualdad, ') };
    // Sin ningún criterio que los separe no hay nada honesto que decir más allá del empate:
    // la enumeración de todos los perfiles (tests/apps/selector-portatil.spec.ts) comprueba
    // que ese caso no se da.
    criterioDesempate = `se muestra primero ${FORMATO_CON_ARTICULO[formato]} porque ${decide ? decide.motivo : 'ninguna respuesta los distingue'}`;
  }

  // ─ Sistema operativo: las MISMAS reglas que antes ─
  const mac = sumar(r, PESOS_MAC);
  const linux = sumar(r, PESOS_LINUX);
  const chrome = sumar(r, PESOS_CHROME);
  let os: OSKey = 'windows';
  if (mac.total >= 3 && r[6] !== 'windows_only') os = 'mac';
  else if (linux.total >= 3 && r[6] === 'sin_requisitos') os = 'linux';
  else if (chrome.total >= 3 && r[1] === 'basico') os = 'chromeos';
  const macDescartadoPorPresupuesto = r[9] === 'bajo' && os === 'mac';
  if (macDescartadoPorPresupuesto) os = 'windows'; // Mac no es viable con presupuesto bajo

  // ─ Gama: las MISMAS reglas que antes, y se dice cuándo manda el presupuesto ─
  const gamaPuntos = sumar(r, PESOS_GAMA);
  let gamaPorPuntos: GamaKey;
  if (gamaPuntos.total >= 7) gamaPorPuntos = 'pro';
  else if (gamaPuntos.total >= 4) gamaPorPuntos = 'alta';
  else if (gamaPuntos.total >= 1) gamaPorPuntos = 'media';
  else gamaPorPuntos = 'basica';
  let gama = gamaPorPuntos;
  // La que pediría el USO, sin los puntos del presupuesto: es la que se cita cuando el
  // presupuesto recorta o amplía (el total ya descuenta −3 con «Hasta 600 €»).
  const puntosUso = gamaPuntos.total - (PESOS_GAMA[9][r[9]] ?? 0);
  const gamaPorUso: GamaKey = puntosUso >= 7 ? 'pro' : puntosUso >= 4 ? 'alta' : puntosUso >= 1 ? 'media' : 'basica';
  if (r[9] === 'bajo') gama = 'basica';
  if (r[9] === 'premium' && gama !== 'pro') gama = 'pro';

  // ─ Razones: salen de las respuestas, no del resultado ─
  // Antes eran un texto fijo por resultado: a quien salía Mac por «Suite Adobe» y
  // «Programación», sin un solo dispositivo Apple, le decía «Con tu ecosistema Apple ya
  // establecido…»; y a cualquier gama alta o pro, «Tu uso intensivo o creativo justifica…»,
  // aunque la hubiera subido solo el presupuesto.
  const razones: string[] = [];
  const porFormato = PREGUNTAS
    .filter((p) => pesoFormato(p.id, formato) > 0)
    .map((p) => ({ pregunta: p.id, puntos: pesoFormato(p.id, formato) }));
  razones.push(`Formato — ${FORMATOS[formato].nombre}, por lo que has respondido: ${citar(r, porFormato)}.`);

  if (os === 'mac') {
    razones.push(`Sistema — macOS, por lo que has respondido: ${citar(r, mac.aportes)}.`);
  } else if (os === 'linux') {
    razones.push(`Sistema — Linux, por lo que has respondido: ${citar(r, linux.aportes)}, y sin requisitos de software que lo impidan.`);
  } else if (os === 'chromeos') {
    razones.push(`Sistema — ChromeOS, por lo que has respondido: ${citar(r, chrome.aportes)}.`);
  } else if (macDescartadoPorPresupuesto) {
    razones.push(`Sistema — Windows. Por lo que has respondido (${citar(r, mac.aportes)}) encajaría macOS, pero con un presupuesto de hasta 600 € no hay un Mac nuevo: manda el presupuesto.`);
  } else if (r[6] === 'windows_only') {
    razones.push('Sistema — Windows: necesitas software que solo existe para Windows.');
  } else {
    razones.push('Sistema — Windows: ninguna de tus respuestas inclina hacia otro sistema, y es el de mayor compatibilidad de software.');
  }

  if (r[9] === 'bajo' && gamaPorUso !== 'basica') {
    razones.push(`Gama — de entrada: tus respuestas de uso apuntaban a la gama ${GAMA_CORTA[gamaPorUso]} (${GAMAS[gamaPorUso].precioOrientativo}), pero has declarado un presupuesto de hasta 600 €. Manda el presupuesto.`);
  } else if (r[9] === 'premium' && gamaPorUso !== 'pro') {
    razones.push(`Gama — workstation o pro: con tu uso bastaría la gama ${GAMA_CORTA[gamaPorUso]}; el salto responde a tu presupuesto de más de 1.800 €, no a una necesidad técnica. Gastar menos no te dejaría corto.`);
  } else if (gamaPuntos.aportes.some((a) => a.puntos > 0)) {
    razones.push(`Gama — ${GAMA_CORTA[gama]}, por lo que has respondido: ${citar(r, gamaPuntos.aportes)}.`);
  } else {
    razones.push(`Gama — ${GAMA_CORTA[gama]}: ninguna de tus respuestas pide más potencia que la de un equipo de entrada.`);
  }

  // ─ Consejos ─
  const consejos: string[] = [];
  if (r[10] === 'si' || r[10] === 'quizas') {
    consejos.push('💡 Un portátil reacondicionado certificado (Amazon Renewed, Back Market, tiendas oficiales Apple) puede ahorrarte un 25-40% con garantía de 12 meses.');
  }
  if (r[8] === 'largo') {
    consejos.push('📅 Si buscas durabilidad, prioriza marcas con buen soporte técnico: Lenovo ThinkPad, Dell XPS y Apple tienen reputación de 5-7 años de vida útil.');
  }
  if (r[3] === 'siempre') {
    consejos.push('🔋 Para uso diario fuera de casa, comprueba la autonomía real (no la especificada): busca reseñas con prueba de batería en uso real.');
  }
  if (formato === 'sobremesa' || formato === 'mini-pc') {
    consejos.push('🖥️ Invierte en un buen monitor: pasarás más horas mirándolo que al propio ordenador. Un panel IPS o OLED de 24-27" mejora mucho la experiencia.');
  }
  consejos.push('🛒 Los mejores momentos para comprar: septiembre (vuelta al cole), Black Friday y Amazon Prime Day. Para Apple, justo después de que anuncien nuevos modelos.');

  const modelos = MODELOS[os][gama];

  return { formato, os, gama, formatosEmpatados, criterioDesempate, razones, consejos, modelos };
}
