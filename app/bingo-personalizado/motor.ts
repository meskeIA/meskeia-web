/**
 * Motor del Bingo Personalizado (S0263, 09/11/2026). Sin dependencias: se prueba en Node con
 * tests/bingo-personalizado-motor.spec.ts.
 *
 * EL MODELO
 *  · Un ELEMENTO es una pareja «lo que canta el bombo» → «lo que va en el cartón». En los juegos
 *    de clase son distintos (7 × 8 → 56, gato → cat); en los de ocio, iguales (perro → perro).
 *  · Las respuestas se AGRUPAN: 3 × 4 y 2 × 6 llevan las dos al 12, que es UNA casilla. El bombo
 *    saca respuestas, no preguntas, y al sacarla canta una de sus preguntas al azar. Así cada
 *    casilla sale una sola vez y la duración de la partida es la que se mide abajo.
 *  · En cada partida entra en juego el DOBLE de respuestas que casillas tiene un cartón (o todas,
 *    si la lista no llega), elegidas al azar. Es lo que fija la duración: el primer cartón lleno
 *    sale cuando ha salido el 85-95 % de lo que está en juego (simulación del 09/11/2026, 3.000
 *    partidas por tamaño). Un tamaño solo se ofrece si la lista llega a 1,5 veces sus casillas:
 *    con menos, los cartones se parecen tanto que la partida la ganan todos a la vez.
 *  · La línea es SIEMPRE una fila horizontal completa, en todos los tamaños. Sin casilla libre.
 *  · El mismo número de partida con la misma lista y el mismo tamaño da los mismos cartones.
 */

export interface Elemento {
  /** Lo que se anuncia al sacar la bola */
  canta: string;
  /** Lo que va escrito en la casilla del cartón */
  carton: string;
  /** Dibujo opcional que acompaña a la casilla (decorativo: la palabra va siempre) */
  emoji?: string;
}

/** Una casilla posible del cartón, con todas las preguntas que llevan a ella */
export interface Respuesta {
  carton: string;
  emoji?: string;
  preguntas: string[];
}

export type GrupoTamano = 'filas3' | 'cuadrado';

export interface Tamano {
  id: string;
  filas: number;
  columnas: number;
  grupo: GrupoTamano;
}

export const TAMANOS: Tamano[] = [
  { id: '3x3', filas: 3, columnas: 3, grupo: 'filas3' },
  { id: '3x4', filas: 3, columnas: 4, grupo: 'filas3' },
  { id: '3x5', filas: 3, columnas: 5, grupo: 'filas3' },
  { id: '3x6', filas: 3, columnas: 6, grupo: 'filas3' },
  { id: '4x4', filas: 4, columnas: 4, grupo: 'cuadrado' },
  { id: '5x5', filas: 5, columnas: 5, grupo: 'cuadrado' },
];

export interface CartonJuego {
  numero: number;
  /** Matriz filas × columnas de índices sobre `Partida.enJuego` */
  casillas: number[][];
}

export interface Partida {
  enJuego: Respuesta[];
  cartones: CartonJuego[];
}

// ─────────────────────────────────────────────────────────────
// Azar con semilla (mulberry32, el mismo que generador-cartones-bingo)
// ─────────────────────────────────────────────────────────────

export function crearAleatorio(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function barajar<T>(lista: readonly T[], aleatorio: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ─────────────────────────────────────────────────────────────
// Respuestas y tamaños
// ─────────────────────────────────────────────────────────────

/** Junta en una sola respuesta todos los elementos que llevan a la misma casilla. */
export function agruparRespuestas(elementos: readonly Elemento[]): Respuesta[] {
  const porCarton = new Map<string, Respuesta>();
  for (const e of elementos) {
    const previa = porCarton.get(e.carton);
    if (previa) {
      if (!previa.preguntas.includes(e.canta)) previa.preguntas.push(e.canta);
    } else {
      porCarton.set(e.carton, { carton: e.carton, emoji: e.emoji, preguntas: [e.canta] });
    }
  }
  return [...porCarton.values()];
}

export const casillasDe = (t: Tamano): number => t.filas * t.columnas;

/** Respuestas distintas que necesita la lista para ofrecer ese tamaño (1,5 × casillas). */
export const minimoPara = (t: Tamano): number => Math.ceil(1.5 * casillasDe(t));

export const tamanoDisponible = (respuestasDistintas: number, t: Tamano): boolean =>
  respuestasDistintas >= minimoPara(t);

/** Cuántas respuestas entran en juego: el doble de casillas, o todas si la lista no llega. */
export const enJuegoPara = (respuestasDistintas: number, t: Tamano): number =>
  Math.min(respuestasDistintas, 2 * casillasDe(t));

// ─────────────────────────────────────────────────────────────
// Partida
// ─────────────────────────────────────────────────────────────

/**
 * Elige las respuestas en juego y genera `cantidad` cartones distintos entre sí (por contenido,
 * no por orden). Si el tamaño no está disponible para la lista, devuelve una partida vacía.
 */
export function prepararPartida(
  respuestas: readonly Respuesta[],
  tamano: Tamano,
  cantidad: number,
  semilla: number,
): Partida {
  if (!tamanoDisponible(respuestas.length, tamano)) return { enJuego: [], cartones: [] };
  const aleatorio = crearAleatorio(semilla);
  const enJuego = barajar(respuestas, aleatorio).slice(0, enJuegoPara(respuestas.length, tamano));
  const indices = enJuego.map((_, i) => i);
  const casillas = casillasDe(tamano);

  const cartones: CartonJuego[] = [];
  const vistos = new Set<string>();
  let intentos = 0;
  while (cartones.length < cantidad && intentos < cantidad * 50) {
    intentos += 1;
    const elegidos = barajar(indices, aleatorio).slice(0, casillas);
    const firma = [...elegidos].sort((a, b) => a - b).join(',');
    if (vistos.has(firma)) continue;
    vistos.add(firma);
    const matriz: number[][] = [];
    for (let f = 0; f < tamano.filas; f++) {
      matriz.push(elegidos.slice(f * tamano.columnas, (f + 1) * tamano.columnas));
    }
    cartones.push({ numero: cartones.length + 1, casillas: matriz });
  }
  return { enJuego, cartones };
}

/** Saca una respuesta que no haya salido y elige al azar la pregunta con que se canta. */
export function sacarBola(
  partida: Partida,
  salidas: ReadonlySet<number>,
  aleatorio: () => number,
): { indice: number; pregunta: string } | null {
  const quedan: number[] = [];
  for (let i = 0; i < partida.enJuego.length; i++) if (!salidas.has(i)) quedan.push(i);
  if (quedan.length === 0) return null;
  const indice = quedan[Math.floor(aleatorio() * quedan.length)];
  const preguntas = partida.enJuego[indice].preguntas;
  return { indice, pregunta: preguntas[Math.floor(aleatorio() * preguntas.length)] };
}

export interface Comprobacion {
  /** Filas completas, numeradas desde 1 */
  filasCompletas: number[];
  lleno: boolean;
  /** Casillas que aún no han salido */
  faltan: number;
}

export function comprobarCarton(carton: CartonJuego, salidas: ReadonlySet<number>): Comprobacion {
  const filasCompletas: number[] = [];
  let faltan = 0;
  carton.casillas.forEach((fila, i) => {
    const pendientes = fila.filter((c) => !salidas.has(c)).length;
    faltan += pendientes;
    if (pendientes === 0) filasCompletas.push(i + 1);
  });
  return { filasCompletas, lleno: faltan === 0, faltan };
}

// ─────────────────────────────────────────────────────────────
// Lista propia
// ─────────────────────────────────────────────────────────────

export const MAX_LINEAS_PROPIAS = 200;
export const LARGO_RECOMENDADO = 24;

export interface ListaLeida {
  elementos: Elemento[];
  /** Líneas repetidas que se han descartado */
  repetidas: number;
  /** Respuestas que comparten dos o más preguntas distintas */
  respuestasCompartidas: number;
  /** Líneas cuya casilla pasa de LARGO_RECOMENDADO caracteres */
  largas: number;
  /** Líneas que se han quedado fuera por pasar de MAX_LINEAS_PROPIAS */
  sobrantes: number;
}

/**
 * Una línea por elemento. «pregunta = respuesta» separa lo que se canta de lo que va en el
 * cartón (se parte en el PRIMER «=»); sin «=», se canta lo mismo que está escrito.
 */
export function leerListaPropia(texto: string): ListaLeida {
  const vistas = new Set<string>();
  const elementos: Elemento[] = [];
  let repetidas = 0;
  let largas = 0;
  let sobrantes = 0;

  for (const cruda of texto.replace(/\r\n?/g, '\n').split('\n')) {
    const linea = cruda.trim().replace(/\s+/g, ' ');
    if (linea === '') continue;
    const corte = linea.indexOf('=');
    const canta = (corte >= 0 ? linea.slice(0, corte) : linea).trim();
    const carton = (corte >= 0 ? linea.slice(corte + 1) : linea).trim();
    if (canta === '' || carton === '') continue;
    const clave = `${canta.toLowerCase()}\u0000${carton.toLowerCase()}`;
    if (vistas.has(clave)) {
      repetidas += 1;
      continue;
    }
    if (elementos.length >= MAX_LINEAS_PROPIAS) {
      sobrantes += 1;
      continue;
    }
    vistas.add(clave);
    if (carton.length > LARGO_RECOMENDADO) largas += 1;
    elementos.push({ canta, carton });
  }

  const respuestasCompartidas = agruparRespuestas(elementos).filter((r) => r.preguntas.length > 1).length;
  return { elementos, repetidas, respuestasCompartidas, largas, sobrantes };
}

// ─────────────────────────────────────────────────────────────
// Listas de cálculo (se generan, no se escriben)
// ─────────────────────────────────────────────────────────────

/** Tablas de multiplicar elegidas, del ×1 al ×10: «7 × 8» → «56». */
export function generarTablas(tablas: readonly number[]): Elemento[] {
  const elementos: Elemento[] = [];
  for (const t of tablas) {
    for (let b = 1; b <= 10; b++) elementos.push({ canta: `${t} × ${b}`, carton: String(t * b) });
  }
  return elementos;
}

/**
 * Sumas y restas con resultado entre 1 y `maximo`, y operandos desde `minimoOperando`:
 * «8 + 7» → «15», «15 − 7» → «8». La resta va con el signo menos tipográfico (U+2212).
 */
export function generarSumasRestas(maximo: number, minimoOperando: number): Elemento[] {
  const elementos: Elemento[] = [];
  for (let a = minimoOperando; a <= maximo; a++) {
    for (let b = minimoOperando; a + b <= maximo; b++) {
      elementos.push({ canta: `${a} + ${b}`, carton: String(a + b) });
    }
    for (let b = minimoOperando; a - b >= 1; b++) {
      elementos.push({ canta: `${a} − ${b}`, carton: String(a - b) });
    }
  }
  return elementos;
}
