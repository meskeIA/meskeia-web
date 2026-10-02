/**
 * Motor de recomendación de selector-portatil.
 *
 * Vive aparte, sin dependencias, para poder enumerar todas las combinaciones de respuestas sin
 * navegador: mismo patrón que `app/selector-smartphone/motor.ts` y `app/selector-mascota/motor.ts`.
 *
 * Historia de lo que se ha cambiado y por qué (el detalle de cada caso, en
 * tests/apps/selector-portatil.spec.ts):
 *
 *  1. Empate de formato (99acf1e0). Con «A veces» fuera de casa y pantalla «Grande (17" o más)»,
 *     portátil y sobremesa empatan a 2; a igualdad de puntos va primero el formato que más encaja
 *     con la pregunta de movilidad (3) y, si sigue, con la de pantalla (4), y se anuncia.
 *
 *  2. Razones (99acf1e0). Citan las respuestas que han sumado a cada decisión.
 *
 *  3. El presupuesto es un FILTRO, no un peso (hallazgo 1405, como el 943 de smartphone). Antes
 *     solo acotaban «Hasta 600 €» y «Más de 1.800 €», y el tramo «1.100 – 1.800 €» sumaba +2 a la
 *     gama: con él la gama podía salir POR ENCIMA del tramo, citando el propio tramo como motivo.
 *     Ahora la gama sale solo del USO (preguntas 1, 2, 7 y 8) y cada tramo tiene su TOPE, con las
 *     mismas horquillas que publica la app. «Más de 1.800 €» sigue ampliando a workstation, y se dice.
 *
 *  4. Sistema operativo (1408, 1409, 1415). Dos respuestas son restricciones, no preferencias:
 *     «Gaming exigente» deja fuera macOS, Linux y ChromeOS (el propio bloque educativo dice que
 *     Windows es imprescindible para el gaming serio), y «Juego bastante» deja fuera ChromeOS, que
 *     no instala software de escritorio tradicional (su propia ficha). Linux era inalcanzable
 *     (sumaba como mucho 2 y pedía 3): ahora basta «Programación o ciencia de datos» sin requisitos
 *     de software. Y la razón genérica de Windows solo dice «ninguna respuesta inclina hacia otro
 *     sistema» cuando es verdad; si alguna sumó, la cita.
 *
 *  5. macOS y la gama (1406, 1407). No hay ningún Mac nuevo en la gama de entrada (ver
 *     MAC_GAMA_MINIMA): con presupuesto de hasta 600 € no se recomienda macOS, y con más, un Mac se
 *     recomienda desde la gama media. ChromeOS no pasa de la gama media: con un uso web no se
 *     aprovecha más potencia, y la «Workstation / Pro» (CAD, 3D, vídeo 4K) no tiene sentido en él.
 *
 *  6. Formato (1410). El 2 en 1 no tenía ninguna pregunta que lo distinguiera (no se pregunta por
 *     lápiz ni pantalla táctil) y no salía en ningún perfil: deja de ser un resultado y queda como
 *     consejo para quien sale portátil con uso creativo. El mini PC era inalcanzable (+2 frente a
 *     los +3 del sobremesa, siempre juntos): ahora, cuando sale escritorio, se elige mini PC si el
 *     uso no pide gráfica dedicada ni la potencia de una gama alta, y torre si la pide.
 *
 *  7. Fichas de modelos → perfil técnico (1406, 1407, 1411, 1412). Las 27 fichas con marca, modelo
 *     y precio caducaban en meses (política del proyecto desde 81fd4bea en smartphone), se salían de
 *     la horquilla de su gama, ofrecían un reacondicionado a quien prefería nuevo y dependían solo
 *     de sistema × gama, no del formato. Ahora el resultado dice QUÉ BUSCAR, escrito para el
 *     formato, el sistema y la gama finales, con la horquilla de la propia gama.
 *
 *  8. Torre o mini PC, con la gama del USO (hallazgo 2703). La regla del punto 6 miraba la gama
 *     FINAL, la que «Más de 1.800 €» sube a pro: a un uso básico le salía una torre «porque tu uso
 *     pide gráfica dedicada o la potencia de una gama alta» encima de «el salto responde a tu
 *     presupuesto, no a una necesidad técnica» (6.432 perfiles). Ahora decide `gamaPorUso`, la
 *     que piden las respuestas antes del presupuesto, que es de lo que habla la razón. Si el
 *     presupuesto la recorta, la torre sigue (el uso la pide, y se puede ampliar después).
 *
 *  9. Sobremesa y sistema (hallazgo 2702). Con macOS salía «Sobremesa + Monitor» con una torre
 *     «para poder cambiar la gráfica más adelante» y la razón «tu uso pide gráfica dedicada», al
 *     lado de «La gráfica va integrada en el chip» (15.888 perfiles). Un Mac de sobremesa es un
 *     equipo compacto cuya gráfica va en el chip y no se cambia: con macOS el escritorio es siempre
 *     el formato compacto (`mini-pc`), con su propia ficha (`infoFormato`), y la potencia que pida
 *     el uso se busca en el chip. Con ChromeOS pasa lo mismo por otra razón: su escritorio es un
 *     equipo compacto y su uso web no aprovecha una gráfica dedicada (punto 5).
 */

export type FormatoKey = 'portatil' | 'sobremesa' | 'mini-pc';
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

/** Una línea del perfil técnico o de los consejos: el icono va aparte para ocultarlo al lector. */
export interface Linea {
  icono: string;
  texto: string;
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
    descripcion: 'Torre con monitor aparte: mejor rendimiento por euro, espacio para una gráfica dedicada y ergonomía superior. Ideal si siempre trabajas en el mismo sitio.',
  },
  'mini-pc': {
    nombre: 'Mini PC + Monitor',
    icon: '🔲',
    descripcion: 'Un sobremesa del tamaño de un libro, silencioso y con poco consumo. Necesita monitor, teclado y ratón. Cubre de sobra un uso sin juegos exigentes ni edición pesada.',
  },
};

/**
 * La ficha del escritorio compacto con macOS (hallazgo 2702). «Mini PC» a secas promete «un uso
 * sin juegos exigentes ni edición pesada», y un Mac de sobremesa con un chip de gama alta sí edita
 * vídeo: lo que lo distingue no es la potencia, sino que la gráfica va en el chip y no se cambia.
 */
export const FORMATO_MAC_ESCRITORIO: FormatoInfo = {
  nombre: 'Sobremesa compacto + Monitor',
  icon: '🔲',
  descripcion: 'Un Mac de sobremesa: equipo compacto y silencioso, con la gráfica integrada en el chip. No se amplía por dentro, así que la potencia se elige al comprarlo. Necesita monitor, teclado y ratón.',
};

/** La ficha del formato tal como se muestra: con macOS, el escritorio compacto tiene la suya. */
export function infoFormato(formato: FormatoKey, os: OSKey): FormatoInfo {
  return formato === 'mini-pc' && os === 'mac' ? FORMATO_MAC_ESCRITORIO : FORMATOS[formato];
}

export const OS_INFO: Record<OSKey, OSInfo> = {
  windows: {
    nombre: 'Windows',
    icon: '🪟',
    descripcion: 'Mayor compatibilidad de software, especialmente para gaming, ingeniería y herramientas de empresa. Mayor variedad de precios y equipos.',
  },
  mac: {
    nombre: 'macOS (Apple)',
    icon: '🍎',
    descripcion: 'Buena integración con iPhone y iPad, autonomía destacada en los portátiles y rendimiento eficiente con los chips de Apple. Habitual en diseño, foto y vídeo.',
  },
  linux: {
    nombre: 'Linux',
    icon: '🐧',
    descripcion: 'Máxima personalización, habitual en programación y servidores. Requiere más conocimiento técnico. Software de ofimática y diseño más limitado.',
  },
  chromeos: {
    nombre: 'ChromeOS',
    icon: '🌐',
    descripcion: 'Ligero y seguro, pensado para navegación web, Google Workspace y educación. No es compatible con software de escritorio tradicional.',
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
      { valor: 'basico', etiqueta: 'Uso básico', desc: 'Navegar, email, redes sociales, vídeos' },
      { valor: 'ofimática', etiqueta: 'Ofimática y trabajo de oficina', desc: 'Documentos, hojas de cálculo, videoconferencias' },
      { valor: 'creativo', etiqueta: 'Diseño, foto o vídeo', desc: 'Retoque fotográfico, maquetación, edición de vídeo' },
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
      { valor: 'alto', etiqueta: 'Gaming exigente', desc: 'Títulos exigentes en máxima calidad, 1080p/1440p/4K' },
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
      { valor: 'si_muchos', etiqueta: 'Sí, uso el ecosistema Apple', desc: 'Móvil, tableta, auriculares… todo Apple' },
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
      // AutoCAD tiene versión para Mac (Autodesk, «System requirements for AutoCAD for Mac»):
      // no era un buen ejemplo de programa que solo existe para Windows.
      { valor: 'windows_only', etiqueta: 'Sí, solo disponible en Windows', desc: 'Programas de ingeniería, CAD o de empresa sin versión para otros sistemas' },
      { valor: 'adobe', etiqueta: 'Suite Adobe principalmente', desc: 'Retoque, maquetación, vídeo y animación' },
      { valor: 'google', etiqueta: 'Solo herramientas web y Google', desc: 'Documentos, hojas de cálculo y correo en el navegador' },
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

/**
 * Los dos formatos que COMPITEN por puntos (llevarlo encima o no). El mini PC no compite: es la
 * variante del escritorio que se elige después, según lo que pida el uso (ver `calcularResultado`).
 * Orden de declaración: SOLO para recorrer, nunca para desempatar.
 */
export const CLAVES_FORMATO: Array<'portatil' | 'sobremesa'> = ['portatil', 'sobremesa'];

/** Nombre con artículo, para el aviso de empate. */
export const FORMATO_CON_ARTICULO: Record<FormatoKey, string> = {
  portatil: 'el portátil',
  sobremesa: 'el sobremesa con monitor',
  'mini-pc': 'el mini PC',
};

/** Orden de menor a mayor, para comparar gamas. */
export const ORDEN_GAMAS: GamaKey[] = ['basica', 'media', 'alta', 'pro'];
const esMayor = (a: GamaKey, b: GamaKey) => ORDEN_GAMAS.indexOf(a) > ORDEN_GAMAS.indexOf(b);

/**
 * Gama MÁXIMA que cabe en cada tramo de presupuesto: las horquillas de la pregunta 9 y las de
 * GAMAS son las mismas (hasta 600 € · 600 – 1.100 € · 1.100 – 1.800 € · más de 1.800 €).
 * Mismo criterio que selector-smartphone (hallazgo 943).
 */
export const TOPE_POR_PRESUPUESTO: Record<string, GamaKey> = {
  bajo: 'basica',
  medio: 'media',
  alto: 'alta',
  premium: 'pro',
};

/** Cómo se nombra cada tramo dentro de una frase. */
export const ETIQUETA_PRESUPUESTO: Record<string, string> = {
  bajo: 'de hasta 600 €',
  medio: 'de 600 a 1.100 €',
  alto: 'de 1.100 a 1.800 €',
  premium: 'de más de 1.800 €',
};

/**
 * Gama mínima en la que hay un Mac NUEVO a precio general. El más asequible es el portátil
 * presentado en marzo de 2026 a 699 € en España (Apple Newsroom España, «Precios y
 * disponibilidad», 11/03/2026; Applesfera lo sitúa en 799 € en su guía de precios del 26/08/2026),
 * así que en la gama de entrada (300 – 600 €) no hay ninguno. No se guarda aquí el precio, que
 * cambia: solo la gama, que es lo que usa el motor.
 */
export const MAC_GAMA_MINIMA: GamaKey = 'media';

/** Cifras de memoria que comparten el perfil técnico y el FAQPage (una sola fuente de verdad). */
export const RAM_MINIMA_GB = 8;
export const RAM_RECOMENDADA_GB = 16;
export const RAM_EXIGENTE_GB = 32;

type Aporte = { pregunta: number; puntos: number };

/** Cómo se nombra cada gama dentro de una frase («la gama media»). */
const GAMA_CORTA: Record<GamaKey, string> = {
  basica: 'de entrada',
  media: 'media',
  alta: 'alta',
  pro: 'workstation o pro',
};

/** Los pesos, uno a uno, para poder decir de dónde sale cada punto. */
const PESOS_FORMATO: Record<number, Record<string, Partial<Record<'portatil' | 'sobremesa', number>>>> = {
  3: { siempre: { portatil: 4 }, aveces: { portatil: 2 }, nunca: { sobremesa: 3 } },
  4: { grande: { sobremesa: 2 }, pequena: { portatil: 1 } },
};
export const PESOS_MAC: Record<number, Record<string, number>> = {
  5: { si_muchos: 3, alguno: 1 },
  6: { windows_only: -3, adobe: 2 },
  1: { dev: 1 },
};
export const PESOS_LINUX: Record<number, Record<string, number>> = {
  6: { windows_only: -2 },
  1: { dev: 2 },
};
export const PESOS_CHROME: Record<number, Record<string, number>> = {
  6: { windows_only: -4, google: 3 },
  1: { basico: 2 },
};
/**
 * Lo que pide el USO. El presupuesto ya no suma aquí (antes «1.100 – 1.800 €» sumaba +2, «Más de
 * 1.800 €» +4 y «Hasta 600 €» −3): es un tope aparte (hallazgo 1405).
 */
const PESOS_GAMA: Record<number, Record<string, number>> = {
  1: { creativo: 3, dev: 2 },
  2: { alto: 3, medio: 1 },
  7: { extremo: 2, mucho: 2 },
  8: { largo: 2 },
};

/** Umbrales de puntos de uso → gama (los mismos de siempre). */
const gamaDePuntos = (p: number): GamaKey => (p >= 7 ? 'pro' : p >= 4 ? 'alta' : p >= 1 ? 'media' : 'basica');

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
    // Solo la inicial en minúscula: «dispositivos Apple», no «dispositivos apple».
    .map((a) => `${TEMA[a.pregunta].charAt(0).toLowerCase()}${TEMA[a.pregunta].slice(1)}, «${etiquetaDe(r, a.pregunta)}» (+${a.puntos})`)
    .join('; ');
}

/** Por qué se aparta un sistema que por puntos encajaría. */
export type MotivoDescarte = 'juegos' | 'presupuesto';

export interface Resultado {
  formato: FormatoKey;
  os: OSKey;
  /** La gama que se recomienda: acotada por el presupuesto y ajustada al sistema. */
  gama: GamaKey;
  /** La que pedirían las respuestas de uso, sin mirar el presupuesto. */
  gamaPorUso: GamaKey;
  /** El presupuesto ha recortado la gama por debajo de lo que pedía el uso. */
  recortadaPorPresupuesto: boolean;
  /** «Más de 1.800 €» la ha subido por encima de lo que el uso necesita. */
  ampliadaPorPresupuesto: boolean;
  /** Un sistema que encajaba por puntos y se ha apartado por una restricción declarada. */
  sistemaDescartado: { os: OSKey; motivo: MotivoDescarte } | null;
  /** Otros formatos con la MISMA puntuación que el recomendado. */
  formatosEmpatados: FormatoKey[];
  /** Frase que explica cómo se ha deshecho el empate de formato; vacía si no lo hay. */
  criterioDesempate: string;
  razones: string[];
  /** Qué buscar: especificaciones escritas para el formato, el sistema y la gama FINALES. */
  perfil: Linea[];
  consejos: Linea[];
}

const NOMBRE_OS: Record<OSKey, string> = { windows: 'Windows', mac: 'macOS', linux: 'Linux', chromeos: 'ChromeOS' };

export function calcularResultado(r: Record<number, string>): Resultado {
  const tope = TOPE_POR_PRESUPUESTO[r[9]] ?? 'pro';

  // ─ Sistema operativo: puntos, y dos clases de restricción que apartan un sistema ─
  const mac = sumar(r, PESOS_MAC);
  const linux = sumar(r, PESOS_LINUX);
  const chrome = sumar(r, PESOS_CHROME);
  const candidatos: Array<{ os: OSKey; encaja: boolean; suma: { total: number; aportes: Aporte[] } }> = [
    { os: 'mac', encaja: mac.total >= 3 && r[6] !== 'windows_only', suma: mac },
    // Linux: basta «Programación o ciencia de datos» (+2) sin requisitos de software. Antes pedía
    // 3 puntos que ninguna combinación alcanzaba (hallazgo 1409).
    { os: 'linux', encaja: linux.total >= 2 && r[6] === 'sin_requisitos', suma: linux },
    { os: 'chromeos', encaja: chrome.total >= 3 && r[1] === 'basico', suma: chrome },
  ];
  /** Restricciones declaradas: un sistema que las incumple no se recomienda (hallazgos 1408, 1407). */
  const motivoDescarte = (os: OSKey): MotivoDescarte | null => {
    if (r[2] === 'alto' && os !== 'windows') return 'juegos';
    if (r[2] === 'medio' && os === 'chromeos') return 'juegos';
    if (os === 'mac' && esMayor(MAC_GAMA_MINIMA, tope)) return 'presupuesto';
    return null;
  };
  let os: OSKey = 'windows';
  let sistemaDescartado: Resultado['sistemaDescartado'] = null;
  let aportesDescartado: Aporte[] = [];
  for (const c of candidatos) {
    if (!c.encaja) continue;
    const motivo = motivoDescarte(c.os);
    if (!motivo) {
      os = c.os;
      break;
    }
    if (!sistemaDescartado) {
      sistemaDescartado = { os: c.os, motivo };
      aportesDescartado = c.suma.aportes;
    }
  }

  // ─ Gama: la pide el uso, la acota el presupuesto y la ajusta el sistema ─
  const uso = sumar(r, PESOS_GAMA);
  const gamaPorUso = gamaDePuntos(uso.total);
  const recortadaPorPresupuesto = esMayor(gamaPorUso, tope);
  let gama: GamaKey = recortadaPorPresupuesto ? tope : gamaPorUso;
  // Quien declara más de 1.800 € y un uso modesto sigue recibiendo la workstation que pide, pero se
  // le dice que su uso no la exige (99acf1e0). En ChromeOS no: ver `limitadaPorChromeOS`.
  const ampliadaPorPresupuesto = r[9] === 'premium' && gamaPorUso !== 'pro' && os !== 'chromeos';
  if (ampliadaPorPresupuesto) gama = 'pro';
  // No hay Mac nuevo en la gama de entrada; el filtro de arriba ya garantiza que el tope lo admite.
  const subidaPorMac = os === 'mac' && esMayor(MAC_GAMA_MINIMA, gama);
  if (subidaPorMac) gama = MAC_GAMA_MINIMA;
  // Con ChromeOS y un uso web, más potencia que la de la gama media no se aprovecha.
  const gamaAntesDeChromeOS = gama;
  const limitadaPorChromeOS = os === 'chromeos' && esMayor(gama, 'media');
  if (limitadaPorChromeOS) gama = 'media';

  // ─ Formato: puntos entre portátil y escritorio; a igualdad, movilidad y luego pantalla ─
  const puntosFormato = { portatil: 0, sobremesa: 0 };
  const aporteFormato: Record<number, Partial<Record<'portatil' | 'sobremesa', number>>> = {};
  for (const [id, porRespuesta] of Object.entries(PESOS_FORMATO)) {
    const pesos = porRespuesta[r[Number(id)]];
    if (!pesos) continue;
    aporteFormato[Number(id)] = pesos;
    for (const k of CLAVES_FORMATO) puntosFormato[k] += pesos[k] ?? 0;
  }
  const pesoFormato = (id: number, k: 'portatil' | 'sobremesa') => aporteFormato[id]?.[k] ?? 0;
  const DESEMPATE = [
    { pregunta: 3, motivo: 'encaja mejor con lo que has dicho sobre llevarte el ordenador fuera de casa' },
    { pregunta: 4, motivo: 'encaja mejor con el tamaño de pantalla que prefieres' },
  ];
  const ordenar = (a: 'portatil' | 'sobremesa', b: 'portatil' | 'sobremesa') => {
    if (puntosFormato[a] !== puntosFormato[b]) return puntosFormato[b] - puntosFormato[a];
    for (const { pregunta } of DESEMPATE) {
      const d = pesoFormato(pregunta, b) - pesoFormato(pregunta, a);
      if (d !== 0) return d;
    }
    return CLAVES_FORMATO.indexOf(a) - CLAVES_FORMATO.indexOf(b);
  };
  const ordenFormatos = [...CLAVES_FORMATO].sort(ordenar);
  const ganador = ordenFormatos[0];
  const formatosEmpatados: FormatoKey[] = ordenFormatos.slice(1).filter((k) => puntosFormato[k] === puntosFormato[ganador]);
  let criterioDesempate = '';
  if (formatosEmpatados.length > 0) {
    const decisivos = [...new Set(formatosEmpatados.map((k) =>
      DESEMPATE.findIndex(({ pregunta }) => pesoFormato(pregunta, ganador) !== pesoFormato(pregunta, k as 'portatil' | 'sobremesa')),
    ))].sort((a, b) => a - b);
    const decide = decisivos.includes(-1) ? undefined : { motivo: decisivos.map((i) => DESEMPATE[i].motivo).join(' y, a igualdad, ') };
    // Sin ningún criterio que los separe no hay nada honesto que decir más allá del empate:
    // la enumeración de todos los perfiles (tests/apps/selector-portatil.spec.ts) comprueba
    // que ese caso no se da.
    criterioDesempate = `se muestra primero ${FORMATO_CON_ARTICULO[ganador]} porque ${decide ? decide.motivo : 'ninguna respuesta los distingue'}`;
  }
  // Escritorio: torre si el USO pide gráfica dedicada o la potencia de una gama alta; si no, mini
  // PC. Con la gama que piden las respuestas, no con la final (hallazgo 2703: «Más de 1.800 €»
  // sube la gama a pro, y eso no es una necesidad de gráfica). Con macOS y ChromeOS no hay torre:
  // el escritorio de los dos es compacto (hallazgo 2702; cabecera, punto 9).
  const pideTorre = r[2] === 'medio' || r[2] === 'alto' || r[1] === 'creativo' || esMayor(gamaPorUso, 'media');
  const sinTorre = os === 'mac' || os === 'chromeos';
  const formato: FormatoKey = ganador === 'portatil' ? 'portatil' : pideTorre && !sinTorre ? 'sobremesa' : 'mini-pc';
  const nombreFormato = infoFormato(formato, os).nombre;

  // ─ Razones: salen de las respuestas, no del resultado ─
  const razones: string[] = [];
  const porFormato = [3, 4]
    .filter((id) => pesoFormato(id, ganador) > 0)
    .map((id) => ({ pregunta: id, puntos: pesoFormato(id, ganador) }));
  const citaFormato = citar(r, porFormato);
  if (formato === 'mini-pc' && os === 'mac') {
    razones.push(`Formato — ${nombreFormato}, por lo que has respondido: ${citaFormato}. Con macOS el sobremesa es un equipo compacto con la gráfica integrada en el chip, que no se cambia después: ${pideTorre ? 'la potencia que pide tu uso se elige al comprarlo, en la configuración del chip' : 'elige al comprarlo la configuración que vayas a necesitar'}.`);
  } else if (formato === 'mini-pc' && os === 'chromeos') {
    razones.push(`Formato — ${nombreFormato}, por lo que has respondido: ${citaFormato}. Con ChromeOS el sobremesa es un equipo compacto: un uso centrado en la web no aprovecha la gráfica dedicada ni el espacio de una torre.`);
  } else if (formato === 'mini-pc') {
    razones.push(`Formato — ${nombreFormato}, por lo que has respondido: ${citaFormato}. Y como tu uso no pide gráfica dedicada ni la potencia de una gama alta, un mini PC lo cubre en mucho menos espacio que una torre.`);
  } else if (formato === 'sobremesa') {
    // El motivo concreto, de las respuestas de uso: «gráfica dedicada o la potencia de una gama
    // alta», a secas, se leía como lo contrario de «con tu uso bastaría la gama media» cuando el
    // presupuesto ampliaba la gama (hallazgo 2703).
    const motivoTorre = r[2] === 'medio' || r[2] === 'alto'
      ? `juegas («${etiquetaDe(r, 2)}») y eso pide gráfica dedicada`
      : r[1] === 'creativo'
        ? `editas («${etiquetaDe(r, 1)}») y eso pide gráfica dedicada`
        : `tus respuestas de uso (${citar(r, uso.aportes)}) piden la potencia de una gama ${GAMA_CORTA[gamaPorUso]}`;
    razones.push(`Formato — ${nombreFormato}, por lo que has respondido: ${citaFormato}. Una torre, y no un mini PC, porque ${motivoTorre}.`);
  } else {
    razones.push(`Formato — ${nombreFormato}, por lo que has respondido: ${citaFormato}.`);
  }

  const citaDescartado = citar(r, aportesDescartado);
  const avisoJuegosMedio = ' Juegas bastante: comprueba antes que tus juegos existen para este sistema, cuyo catálogo es más reducido que el de Windows.';
  if (os === 'mac') {
    razones.push(`Sistema — macOS, por lo que has respondido: ${citar(r, mac.aportes)}.${r[2] === 'medio' ? avisoJuegosMedio : ''}`);
  } else if (os === 'linux') {
    razones.push(`Sistema — Linux, por lo que has respondido: ${citar(r, linux.aportes)}, y sin requisitos de software que lo impidan. Si prefieres no cambiar de sistema, Windows y macOS también sirven para programar.${r[2] === 'medio' ? avisoJuegosMedio : ''}`);
  } else if (os === 'chromeos') {
    razones.push(`Sistema — ChromeOS, por lo que has respondido: ${citar(r, chrome.aportes)}.`);
  } else if (sistemaDescartado?.motivo === 'juegos' && r[2] === 'alto') {
    razones.push(`Sistema — Windows. Por lo que has respondido (${citaDescartado}) encajaría ${NOMBRE_OS[sistemaDescartado.os]}, pero juegas a títulos exigentes («${etiquetaDe(r, 2)}»), y Windows es la plataforma con más catálogo y compatibilidad para ellos: mandan los juegos.`);
  } else if (sistemaDescartado?.motivo === 'juegos') {
    razones.push(`Sistema — Windows. Por lo que has respondido (${citaDescartado}) encajaría ChromeOS, pero juegas bastante («${etiquetaDe(r, 2)}») y ChromeOS no instala software de escritorio tradicional, juegos incluidos: mandan los juegos.`);
  } else if (sistemaDescartado?.motivo === 'presupuesto') {
    razones.push(`Sistema — Windows. Por lo que has respondido (${citaDescartado}) encajaría macOS, pero con un presupuesto de hasta 600 € no hay un Mac nuevo a precio general: manda el presupuesto.`);
  } else if (r[6] === 'windows_only') {
    razones.push('Sistema — Windows: necesitas software que solo existe para Windows.');
  } else {
    // Solo «ninguna respuesta inclina» cuando es verdad (hallazgo 1415): si alguna sumó a otro
    // sistema sin llegar a recomendarlo, se cita.
    const inclinaciones = ([['macOS', mac], ['Linux', linux], ['ChromeOS', chrome]] as const)
      .filter(([, s]) => s.aportes.some((a) => a.puntos > 0))
      .map(([nombre, s]) => `${nombre}: ${citar(r, s.aportes)}`);
    razones.push(inclinaciones.length === 0
      ? 'Sistema — Windows: ninguna de tus respuestas inclina hacia otro sistema, y es el de mayor compatibilidad de software.'
      : `Sistema — Windows: alguna respuesta sumaba a otro sistema (${inclinaciones.join(' · ')}), pero no lo bastante para recomendarlo; Windows es el de mayor compatibilidad de software.`);
  }
  // Si el sistema recomendado no es Windows pero se apartó otro por delante, también se dice.
  if (os !== 'windows' && sistemaDescartado) {
    razones.push(sistemaDescartado.motivo === 'presupuesto'
      ? `También encajaría macOS (${citaDescartado}), pero con un presupuesto de hasta 600 € no hay un Mac nuevo a precio general.`
      : `También encajaría ${NOMBRE_OS[sistemaDescartado.os]} (${citaDescartado}), pero no con tu respuesta sobre videojuegos («${etiquetaDe(r, 2)}»).`);
  }

  if (limitadaPorChromeOS) {
    razones.push(`Gama — media: tus respuestas (${citar(r, uso.aportes)}) apuntaban a la gama ${GAMA_CORTA[gamaAntesDeChromeOS]}, pero con ChromeOS y un uso centrado en la web no se aprovecha más potencia: esa exigencia se busca en la construcción, la pantalla y el teclado.`);
  } else if (subidaPorMac) {
    razones.push(`Gama — media: con tu uso bastaría la gama de entrada, pero no hay ningún Mac nuevo por debajo de 600 € a precio general; la gama media (${GAMAS.media.precioOrientativo}) cabe en tu presupuesto.`);
  } else if (recortadaPorPresupuesto) {
    razones.push(`Gama — ${GAMA_CORTA[gama]}: tus respuestas de uso apuntaban a la gama ${GAMA_CORTA[gamaPorUso]} (${GAMAS[gamaPorUso].precioOrientativo}), pero has declarado un presupuesto ${ETIQUETA_PRESUPUESTO[r[9]]}. Manda el presupuesto.`);
  } else if (ampliadaPorPresupuesto) {
    razones.push(`Gama — workstation o pro: con tu uso bastaría la gama ${GAMA_CORTA[gamaPorUso]}; el salto responde a tu presupuesto de más de 1.800 €, no a una necesidad técnica. Gastar menos no te dejaría corto.`);
  } else {
    const margen = esMayor(tope, gama) && r[9] !== 'premium' ? ` Cabe con margen en tu presupuesto ${ETIQUETA_PRESUPUESTO[r[9]]}.` : '';
    razones.push(uso.aportes.some((a) => a.puntos > 0)
      ? `Gama — ${GAMA_CORTA[gama]}, por lo que has respondido: ${citar(r, uso.aportes)}.${margen}`
      : `Gama — ${GAMA_CORTA[gama]}: ninguna de tus respuestas pide más potencia que la de un equipo de entrada.${margen}`);
  }

  // ─ Consejos ─
  const consejos: Linea[] = [];
  if (r[10] === 'si' || r[10] === 'quizas') {
    consejos.push({ icono: '💡', texto: 'Un equipo reacondicionado certificado, con garantía, suele costar bastante menos que el mismo modelo nuevo: compara el plazo de garantía y el estado de la batería.' });
  }
  if (sistemaDescartado?.motivo === 'presupuesto' && r[10] !== 'no') {
    consejos.push({ icono: '♻️', texto: 'Si quieres macOS, mira Macs reacondicionados certificados: puede que alguno quepa en tu presupuesto. Comprueba que su versión de macOS sigue recibiendo actualizaciones.' });
  }
  if (r[3] === 'siempre') {
    consejos.push({ icono: '🔋', texto: 'Para uso diario fuera de casa, comprueba la autonomía real (no la especificada): busca pruebas independientes de batería en uso real.' });
  }
  if (formato !== 'portatil') {
    consejos.push({ icono: '🖥️', texto: 'Invierte en un buen monitor: pasarás más horas mirándolo que al propio ordenador. Un panel IPS o OLED de 24-27" mejora mucho la experiencia.' });
  }
  if (formato === 'portatil' && r[1] === 'creativo' && (r[2] === 'no' || r[2] === 'casual')) {
    consejos.push({ icono: '✏️', texto: 'Si dibujas o retocas con lápiz, mira los convertibles 2 en 1 (pantalla táctil y bisagra de 360°): son portátiles con esa función añadida. Comprueba que admiten lápiz activo.' });
  }
  consejos.push({ icono: '🛒', texto: 'Las campañas de rebajas (regreso a clases, Black Friday…) y la llegada de una generación nueva, que abarata la anterior, suelen ser buenos momentos para comprar.' });

  return {
    formato, os, gama, gamaPorUso, recortadaPorPresupuesto, ampliadaPorPresupuesto, sistemaDescartado,
    formatosEmpatados, criterioDesempate, razones, perfil: perfilTecnico(formato, os, gama, r), consejos,
  };
}

// ─────────────────────────────────────────────
// Perfil técnico: QUÉ BUSCAR, sin marcas ni modelos (hallazgo 1412)
// ─────────────────────────────────────────────

const TAMANO_PANTALLA: Record<string, string> = {
  pequena: '13-14"',
  medio: '15-16"',
  grande: '17" o más',
  da_igual: '14-16"',
};

/**
 * Especificaciones escritas para el formato, el sistema y la gama FINALES. La horquilla de precio
 * es la de la gama (GAMAS), no la de un modelo: así no puede salirse de ella (hallazgo 1406), no
 * hay reacondicionados que ofrecer a quien prefiere nuevo (1407) ni portátiles a quien sale
 * escritorio (1411).
 */
export function perfilTecnico(formato: FormatoKey, os: OSKey, gama: GamaKey, r: Record<number, string>): Linea[] {
  const lineas: Linea[] = [];
  const creativo = r[1] === 'creativo';
  const exigente = creativo || r[1] === 'dev' || r[2] === 'alto';

  // Procesador
  if (os === 'mac') {
    const chip: Record<GamaKey, string> = {
      basica: 'Chip de Apple de gama base',
      media: 'Chip de Apple de gama base',
      alta: 'Chip de Apple de gama base o intermedia (más núcleos de CPU y de gráfica)',
      pro: 'Chip de Apple de gama alta (el máximo de núcleos de CPU y de gráfica)',
    };
    lineas.push({ icono: '⚡', texto: chip[gama] });
  } else {
    const cpu: Record<GamaKey, string> = {
      basica: 'Procesador de gama de entrada o media (serie 3 o 5) de una generación reciente',
      media: 'Procesador de gama media (serie 5) de generación reciente, o de gama alta (serie 7) de la anterior',
      alta: 'Procesador de gama alta (serie 7) de generación reciente',
      pro: 'Procesador tope de gama (serie 7 o 9, o de estación de trabajo) de generación reciente',
    };
    lineas.push({ icono: '⚡', texto: cpu[gama] });
  }

  // Memoria
  const ram: Record<GamaKey, string> = {
    basica: `${RAM_MINIMA_GB} GB de RAM como mínimo; ${RAM_RECOMENDADA_GB} GB si cabe en tu presupuesto`,
    media: `${RAM_RECOMENDADA_GB} GB de RAM`,
    alta: exigente ? `${RAM_RECOMENDADA_GB} a ${RAM_EXIGENTE_GB} GB de RAM (${RAM_EXIGENTE_GB} GB si editas vídeo o usas máquinas virtuales)` : `${RAM_RECOMENDADA_GB} GB de RAM`,
    pro: `${RAM_EXIGENTE_GB} GB de RAM o más`,
  };
  const sufijoRam = os === 'mac'
    ? ' (memoria unificada: no se amplía después, así que elige bien de inicio)'
    : r[8] === 'largo' ? ', a poder ser ampliable' : '';
  lineas.push({ icono: '🧠', texto: `${ram[gama]}${sufijoRam}` });

  // Almacenamiento
  const disco: Record<GamaKey, string> = {
    basica: 'SSD de 256 GB como mínimo; 512 GB recomendable',
    media: 'SSD de 512 GB',
    alta: 'SSD de 512 GB a 1 TB',
    pro: 'SSD de 1 TB o más',
  };
  lineas.push({ icono: '💾', texto: os === 'chromeos' ? 'Almacenamiento de 128 GB o más, mejor SSD: ChromeOS guarda casi todo en la nube' : disco[gama] });

  // Gráfica
  const bajaGama = gama === 'basica' || gama === 'media';
  if (r[2] === 'alto') {
    lineas.push({ icono: '🎮', texto: bajaGama
      ? 'Gráfica dedicada: en esta gama será de entrada, y tendrás que bajar la calidad gráfica en los juegos más exigentes'
      : 'Gráfica dedicada de gama media-alta o alta, con 8 GB de memoria de vídeo o más' });
  } else if (r[2] === 'medio' && os !== 'mac') {
    lineas.push({ icono: '🎮', texto: gama === 'basica'
      ? 'Gráfica integrada reciente de buen rendimiento: los títulos actuales irán en calidad baja'
      : 'Gráfica dedicada de gama media, o una integrada reciente de alto rendimiento' });
  } else if (creativo && os !== 'mac' && !bajaGama) {
    lineas.push({ icono: '🎞️', texto: 'Gráfica dedicada para acelerar la edición de vídeo y los efectos' });
  }
  if (os === 'mac' && (creativo || gama === 'pro')) {
    lineas.push({ icono: '🎞️', texto: 'La gráfica va integrada en el chip: para vídeo o 3D, elige la configuración con más núcleos de gráfica' });
  }
  if (r[6] === 'windows_only' && gama === 'pro') {
    lineas.push({ icono: '📐', texto: 'Si trabajas con CAD o 3D, una gráfica con controladores certificados para tu programa' });
  }

  // Pantalla, o monitor
  const extrasPantalla = [
    // Espacio duro antes del «%» (CLAUDE.md §2, hallazgo 2708)
    creativo ? 'buena cobertura de color (100\u00A0% sRGB o más)' : '',
    r[2] === 'medio' || r[2] === 'alto' ? 'tasa de refresco de 120 Hz o más' : '',
  ].filter(Boolean);
  const conExtras = extrasPantalla.length > 0 ? `, con ${extrasPantalla.join(' y ')}` : '';
  if (formato === 'portatil') {
    lineas.push({ icono: '🖼️', texto: `Pantalla de ${TAMANO_PANTALLA[r[4]] ?? '14-16"'} con panel IPS u OLED y resolución Full HD (1920×1080) como mínimo${conExtras}` });
    if (r[3] === 'siempre') {
      lineas.push({ icono: '🎒', texto: r[2] === 'alto'
        ? 'Con una gráfica potente pesará más y la batería durará menos: entre los que cumplan, elige el más ligero'
        : 'Peso de 1,5 kg o menos, para llevarlo a diario' });
    }
  } else {
    lineas.push({ icono: '🖼️', texto: `Monitor aparte de ${r[4] === 'grande' ? '27" o más' : '24 a 27"'} con panel IPS${conExtras}` });
    // Con macOS no se promete cambiar la gráfica: va en el chip (hallazgo 2702).
    lineas.push({ icono: formato === 'mini-pc' ? '🔲' : '🗄️', texto: formato === 'mini-pc' && os === 'mac'
      ? 'Sobremesa compacto con las salidas de vídeo y los puertos que necesites para monitor, teclado y ratón: no se amplía por dentro, así que elige de inicio la configuración del chip, la memoria y el almacenamiento'
      : formato === 'mini-pc'
        ? 'Mini PC con las salidas de vídeo y los puertos USB que necesites para monitor, teclado y ratón'
        : 'Torre con espacio y fuente de alimentación holgados, para poder cambiar la gráfica más adelante' });
  }

  // Sistema
  if (os === 'linux') {
    lineas.push({ icono: '🐧', texto: 'Compatibilidad con Linux comprobada: equipo vendido con Linux preinstalado o certificado por la distribución que vayas a usar' });
  } else if (os === 'chromeos') {
    lineas.push({ icono: '🔄', texto: 'Fecha de fin de actualizaciones automáticas lo más lejana posible: consúltala para cada modelo antes de comprar' });
  }
  if (r[6] === 'windows_only') {
    lineas.push({ icono: '🔧', texto: 'Comprueba en la web de tu programa sus requisitos mínimos y recomendados' });
  }

  // Durabilidad
  if (r[8] === 'largo') {
    lineas.push({ icono: '🛠️', texto: 'Para que dure 6 años o más: buena construcción, memoria y almacenamiento holgados de inicio, y un plazo largo de garantía y de piezas de repuesto' });
  }

  return lineas;
}
