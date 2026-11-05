/**
 * Motor del código de colores de resistencias (IEC 60062) y de las series normalizadas
 * de valores (IEC 60063). Lógica pura, sin React: lo usan `codigo-colores-resistencias`
 * (decodificar y codificar) y `calculadora-resistencias-led` (pintar los colores del valor
 * E12 que recomienda). Casos resueltos a mano en `tests/codigo-colores-resistencias-motor.spec.ts`.
 *
 * ── Qué cubre ─────────────────────────────────────────────────────────────────
 *  · 3 bandas: 2 cifras + multiplicador, sin banda de tolerancia (±20 %).
 *  · 4 bandas: 2 cifras + multiplicador + tolerancia.
 *  · 5 bandas: 3 cifras + multiplicador + tolerancia.
 *  · 6 bandas: las 5 anteriores + coeficiente de temperatura (ppm/K).
 *  · El paso inverso: de un valor («4k7», «2,2 MΩ», «470») a sus colores.
 *  · A qué serie normalizada pertenece un valor, y el más cercano de cada serie.
 *
 * ── Tolerancias que se ofrecen, y por qué no todas ────────────────────────────
 * Las tolerancias de marrón (1 %), rojo (2 %), verde (0,5 %), azul (0,25 %), violeta
 * (0,1 %), gris (0,05 %), dorado (5 %) y plateado (10 %) son las que comparten todas las
 * tablas de referencia. Las ediciones recientes de la norma añaden tolerancias más finas
 * para el naranja y el amarillo y no todas las tablas coinciden en ellas ni en la del
 * gris: por eso no se ofrecen como opción, y la app lo dice al lado de la tolerancia.
 *
 * ── Series normalizadas ───────────────────────────────────────────────────────
 * E24 se escribe a mano porque NO sale de la fórmula 10^(i/24): ocho de sus valores (27,
 * 30, 33, 36, 39, 43, 47 y 82) son históricos y difieren en una unidad del redondeo. E96
 * sí coincide con round(10^(i/96)·100) en los 96 valores (cotejado el 05/11/2026 contra
 * la tabla publicada), y el test lo vuelve a comprobar. E12 y E6 son subconjuntos de E24
 * (uno de cada dos, uno de cada cuatro) y E48, de E96 (uno de cada dos).
 */

import { parseSpanishNumber } from '../formatters';

export type ClaveColor =
  | 'negro'
  | 'marron'
  | 'rojo'
  | 'naranja'
  | 'amarillo'
  | 'verde'
  | 'azul'
  | 'violeta'
  | 'gris'
  | 'blanco'
  | 'dorado'
  | 'plateado';

export interface ColorResistencia {
  clave: ClaveColor;
  nombre: string;
  /** Color con que se dibuja la banda. */
  hex: string;
  /** Cifra que representa en una banda de cifra; null si no puede ir en ella. */
  cifra: number | null;
  /** Potencia de 10 del multiplicador; null si no puede ir en esa banda. */
  exponente: number | null;
  /** Tolerancia en %; null si no se ofrece como banda de tolerancia. */
  tolerancia: number | null;
  /** Coeficiente de temperatura en ppm/K (6.ª banda); null si no lo tiene. */
  coefTemperatura: number | null;
}

export const COLORES: ColorResistencia[] = [
  { clave: 'negro', nombre: 'Negro', hex: '#1a1a1a', cifra: 0, exponente: 0, tolerancia: null, coefTemperatura: 250 },
  { clave: 'marron', nombre: 'Marrón', hex: '#8B4513', cifra: 1, exponente: 1, tolerancia: 1, coefTemperatura: 100 },
  { clave: 'rojo', nombre: 'Rojo', hex: '#CC0000', cifra: 2, exponente: 2, tolerancia: 2, coefTemperatura: 50 },
  { clave: 'naranja', nombre: 'Naranja', hex: '#E87000', cifra: 3, exponente: 3, tolerancia: null, coefTemperatura: 15 },
  { clave: 'amarillo', nombre: 'Amarillo', hex: '#FFD700', cifra: 4, exponente: 4, tolerancia: null, coefTemperatura: 25 },
  { clave: 'verde', nombre: 'Verde', hex: '#007700', cifra: 5, exponente: 5, tolerancia: 0.5, coefTemperatura: 20 },
  { clave: 'azul', nombre: 'Azul', hex: '#0055CC', cifra: 6, exponente: 6, tolerancia: 0.25, coefTemperatura: 10 },
  { clave: 'violeta', nombre: 'Violeta', hex: '#7B00B0', cifra: 7, exponente: 7, tolerancia: 0.1, coefTemperatura: 5 },
  { clave: 'gris', nombre: 'Gris', hex: '#808080', cifra: 8, exponente: 8, tolerancia: 0.05, coefTemperatura: 1 },
  { clave: 'blanco', nombre: 'Blanco', hex: '#F2F2F2', cifra: 9, exponente: 9, tolerancia: null, coefTemperatura: null },
  { clave: 'dorado', nombre: 'Dorado', hex: '#D4A017', cifra: null, exponente: -1, tolerancia: 5, coefTemperatura: null },
  { clave: 'plateado', nombre: 'Plateado', hex: '#B8B8B8', cifra: null, exponente: -2, tolerancia: 10, coefTemperatura: null },
];

const POR_CLAVE: Record<ClaveColor, ColorResistencia> = Object.fromEntries(
  COLORES.map((c) => [c.clave, c]),
) as Record<ClaveColor, ColorResistencia>;

export function color(clave: ClaveColor): ColorResistencia {
  return POR_CLAVE[clave];
}

export type NumeroBandas = 3 | 4 | 5 | 6;

/** Qué representa cada banda, en orden de lectura. */
export type PapelBanda = 'cifra' | 'multiplicador' | 'tolerancia' | 'temperatura';

export const PAPELES: Record<NumeroBandas, PapelBanda[]> = {
  3: ['cifra', 'cifra', 'multiplicador'],
  4: ['cifra', 'cifra', 'multiplicador', 'tolerancia'],
  5: ['cifra', 'cifra', 'cifra', 'multiplicador', 'tolerancia'],
  6: ['cifra', 'cifra', 'cifra', 'multiplicador', 'tolerancia', 'temperatura'],
};

/** Tolerancia implícita de una resistencia de 3 bandas (sin banda de tolerancia). */
export const TOLERANCIA_SIN_BANDA = 20;

/** Colores admitidos en una banda según su papel. */
export function coloresPara(papel: PapelBanda): ColorResistencia[] {
  switch (papel) {
    case 'cifra':
      return COLORES.filter((c) => c.cifra !== null);
    case 'multiplicador':
      return COLORES.filter((c) => c.exponente !== null);
    case 'tolerancia':
      return COLORES.filter((c) => c.tolerancia !== null);
    case 'temperatura':
      return COLORES.filter((c) => c.coefTemperatura !== null);
  }
}

function admite(papel: PapelBanda, c: ColorResistencia): boolean {
  switch (papel) {
    case 'cifra':
      return c.cifra !== null;
    case 'multiplicador':
      return c.exponente !== null;
    case 'tolerancia':
      return c.tolerancia !== null;
    case 'temperatura':
      return c.coefTemperatura !== null;
  }
}

/** Quita el error de coma flotante de una multiplicación por potencias de 10. */
function limpiar(x: number): number {
  return Number(x.toPrecision(12));
}

/** significando · 10^exponente sin arrastrar error (47 · 10⁻¹ = 4,7, no 4,7000000000000002). */
function escalar(significando: number, exponente: number): number {
  return exponente >= 0
    ? limpiar(significando * 10 ** exponente)
    : limpiar(significando / 10 ** -exponente);
}

export interface Decodificacion {
  ohmios: number;
  /** Tolerancia en %. Con 3 bandas, la implícita del 20 %. */
  tolerancia: number;
  /** true si la tolerancia no viene de una banda (3 bandas). */
  toleranciaImplicita: boolean;
  /** ppm/K; solo con 6 bandas. */
  coefTemperatura: number | null;
  minimo: number;
  maximo: number;
  /** La primera cifra es 0: ninguna resistencia real empieza por negro. */
  empiezaPorNegro: boolean;
}

/**
 * Valor de una resistencia a partir de sus bandas en orden de lectura. Devuelve null si el
 * número de bandas no cuadra o algún color no puede ir en la posición en que está (un
 * dorado como primera cifra, un naranja como tolerancia…).
 */
export function decodificar(n: NumeroBandas, claves: ClaveColor[]): Decodificacion | null {
  const papeles = PAPELES[n];
  if (!papeles || claves.length !== papeles.length) return null;
  const colores = claves.map((k) => POR_CLAVE[k]);
  if (colores.some((c, i) => !c || !admite(papeles[i], c))) return null;

  const numCifras = papeles.filter((p) => p === 'cifra').length;
  const significando = colores.slice(0, numCifras).reduce((acc, c) => acc * 10 + (c.cifra as number), 0);
  const exponente = colores[numCifras].exponente as number;
  const ohmios = escalar(significando, exponente);

  const toleranciaImplicita = n === 3;
  const tolerancia = toleranciaImplicita ? TOLERANCIA_SIN_BANDA : (colores[numCifras + 1].tolerancia as number);
  const coefTemperatura = n === 6 ? (colores[5].coefTemperatura as number) : null;

  return {
    ohmios,
    tolerancia,
    toleranciaImplicita,
    coefTemperatura,
    minimo: limpiar(ohmios * (1 - tolerancia / 100)),
    maximo: limpiar(ohmios * (1 + tolerancia / 100)),
    empiezaPorNegro: colores[0].cifra === 0,
  };
}

/**
 * La misma resistencia leída desde el otro extremo. Con 4, 5 y 6 bandas la banda de
 * tolerancia suele ir algo separada, pero no siempre se distingue, y en las de 5 bandas
 * de precisión hay lecturas válidas en los dos sentidos (marrón-negro-negro-marrón-marrón
 * da 1 kΩ en un sentido y 110 Ω en el otro). Devuelve null si al revés no es una
 * resistencia posible (por ejemplo, porque empezaría por dorado), que es el caso normal.
 * Con 3 bandas no hay banda de tolerancia que oriente y no se calcula.
 */
export function decodificarAlReves(n: NumeroBandas, claves: ClaveColor[]): Decodificacion | null {
  if (n === 3) return null;
  return decodificar(n, [...claves].reverse());
}

// ─────────────────────────────────────────────────────────────────────────────
// Series normalizadas (IEC 60063), como mantisas de tres cifras entre 100 y 999
// ─────────────────────────────────────────────────────────────────────────────

const E24 = [100, 110, 120, 130, 150, 160, 180, 200, 220, 240, 270, 300, 330, 360, 390, 430, 470, 510, 560, 620, 680, 750, 820, 910];
const E96 = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174,
  178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309,
  316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549,
  562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976,
];

export type NombreSerie = 'E6' | 'E12' | 'E24' | 'E48' | 'E96';

export const SERIES: Record<NombreSerie, number[]> = {
  E6: E24.filter((_, i) => i % 4 === 0),
  E12: E24.filter((_, i) => i % 2 === 0),
  E24,
  E48: E96.filter((_, i) => i % 2 === 0),
  E96,
};

/** Tolerancia con la que se suele fabricar cada serie. */
export const TOLERANCIA_SERIE: Record<NombreSerie, number> = { E6: 20, E12: 10, E24: 5, E48: 2, E96: 1 };

export const NOMBRES_SERIE: NombreSerie[] = ['E6', 'E12', 'E24', 'E48', 'E96'];

/** Mantisa entera de 3 cifras (100-999) si el valor tiene como mucho 3 cifras significativas. */
function mantisa3(ohmios: number): number | null {
  if (!(ohmios > 0) || !Number.isFinite(ohmios)) return null;
  const e = Math.floor(Math.log10(ohmios)) - 2;
  const m = ohmios / 10 ** e;
  const r = Math.round(m);
  if (Math.abs(m - r) > 1e-6 * r) return null;
  // log10 puede quedarse una décima por debajo en potencias exactas de 10 (log10(1000) = 2,9999…)
  if (r >= 1000) return r % 10 === 0 ? r / 10 : null;
  if (r < 100) return null;
  return r;
}

/** Series que contienen exactamente ese valor, de la más gruesa a la más fina. */
export function seriesQueLoContienen(ohmios: number): NombreSerie[] {
  const m = mantisa3(ohmios);
  if (m === null) return [];
  return NOMBRES_SERIE.filter((s) => SERIES[s].includes(m));
}

export interface ValorNormalizado {
  serie: NombreSerie;
  ohmios: number;
  /** Diferencia relativa respecto al pedido, en %: positiva si el normalizado es mayor. */
  diferencia: number;
}

/**
 * El valor de la serie más cercano al pedido, en escala logarítmica (que es como están
 * repartidas las series). Mira también la década vecina: de 9,8 Ω el E12 más cercano es
 * 10 Ω, no 8,2 Ω.
 */
export function valorNormalizadoMasCercano(ohmios: number, serie: NombreSerie): ValorNormalizado | null {
  if (!(ohmios > 0) || !Number.isFinite(ohmios)) return null;
  const decada = Math.floor(Math.log10(ohmios)) - 2;
  let mejor = 0;
  let mejorDist = Infinity;
  for (const d of [decada - 1, decada, decada + 1]) {
    for (const m of SERIES[serie]) {
      const c = escalar(m, d);
      const dist = Math.abs(Math.log(c / ohmios));
      if (dist < mejorDist - 1e-12) {
        mejorDist = dist;
        mejor = c;
      }
    }
  }
  return { serie, ohmios: mejor, diferencia: limpiar(((mejor - ohmios) / ohmios) * 100) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso inverso: del valor a los colores
// ─────────────────────────────────────────────────────────────────────────────

const MULTIPLICADOR_LETRA: Record<string, number> = { r: 1, k: 1e3, m: 1e6, g: 1e9 };

/**
 * Lee un valor de resistencia tal como lo escribe la gente o lo trae un esquema:
 * «470», «4,7k», «4.7 kΩ», «1,5 kohm», «2M2», «4k7», «R47», «4R7», «1.500». La «m» se lee
 * como mega: las resistencias de miliohmios no llevan código de colores. Devuelve null si
 * no es un valor positivo.
 */
export function leerValor(texto: string): number | null {
  const t = texto
    .trim()
    .replace(/\s+/g, '')
    .replace(/(Ω|ω|ohmios|ohmio|ohms|ohm)$/i, '');
  if (!t) return null;

  // Notación de esquema (IEC 60062, código RKM): la letra hace de coma.
  const rkm = t.match(/^(\d*)([rRkKmMgG])(\d+)$/);
  if (rkm) {
    const entera = rkm[1] || '0';
    const valor = Number(`${entera}.${rkm[3]}`) * MULTIPLICADOR_LETRA[rkm[2].toLowerCase()];
    return valor > 0 ? limpiar(valor) : null;
  }

  const sufijo = t.match(/^(.*?)([kKmMgG])?$/);
  if (!sufijo) return null;
  const numero = parseSpanishNumber(sufijo[1]);
  if (!Number.isFinite(numero) || numero <= 0) return null;
  const factor = sufijo[2] ? MULTIPLICADOR_LETRA[sufijo[2].toLowerCase()] : 1;
  return limpiar(numero * factor);
}

export interface Codificacion {
  claves: ClaveColor[];
  /** El valor que de verdad representan esas bandas. */
  ohmiosCodificados: number;
  /** false si el valor pedido tenía más cifras de las que caben y se ha redondeado. */
  exacto: boolean;
}

/** Valor mínimo y máximo que se pueden escribir con 2 o 3 cifras y multiplicadores de ×0,01 a ×10⁹. */
export function rangoCodificable(n: 4 | 5 | 6): { minimo: number; maximo: number } {
  const cifras = n === 4 ? 2 : 3;
  return { minimo: escalar(10 ** (cifras - 1), -2), maximo: escalar(10 ** cifras - 1, 9) };
}

/**
 * Colores de un valor para 4, 5 o 6 bandas. La tolerancia y el coeficiente de temperatura
 * los elige quien llama (no se deducen del valor). Si el valor tiene más cifras
 * significativas de las que caben, se redondea a las que caben y `exacto` lo dice.
 * Devuelve null fuera del rango que el código puede escribir.
 */
export function codificar(
  ohmios: number,
  n: 4 | 5 | 6,
  tolerancia: ClaveColor,
  temperatura: ClaveColor = 'marron',
): Codificacion | null {
  if (!(ohmios > 0) || !Number.isFinite(ohmios)) return null;
  if (!admite('tolerancia', POR_CLAVE[tolerancia])) return null;
  if (n === 6 && !admite('temperatura', POR_CLAVE[temperatura])) return null;

  const cifras = n === 4 ? 2 : 3;
  let exponente = Math.floor(Math.log10(ohmios)) - (cifras - 1);
  let significando = Math.round(limpiar(ohmios / 10 ** exponente));
  if (significando >= 10 ** cifras) {
    // 9,96 kΩ con dos cifras redondea a «100»: es 10 × 10³, una década más arriba.
    significando = Math.round(significando / 10);
    exponente += 1;
  }
  if (significando < 10 ** (cifras - 1)) {
    // log10 por debajo en una potencia exacta de 10
    significando *= 10;
    exponente -= 1;
  }
  if (exponente < -2 || exponente > 9) return null;

  const digitos = String(significando).split('').map(Number);
  const deCifra = (d: number) => COLORES.find((c) => c.cifra === d)!.clave;
  const deExponente = COLORES.find((c) => c.exponente === exponente)!.clave;

  const claves: ClaveColor[] = [...digitos.map(deCifra), deExponente, tolerancia];
  if (n === 6) claves.push(temperatura);

  const ohmiosCodificados = escalar(significando, exponente);
  return {
    claves,
    ohmiosCodificados,
    exacto: Math.abs(ohmiosCodificados - ohmios) <= 1e-9 * ohmios,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Presentación: unidad y decimales (la cifra la escribe formatNumber en la vista)
// ─────────────────────────────────────────────────────────────────────────────

export interface ValorConUnidad {
  valor: number;
  unidad: 'Ω' | 'kΩ' | 'MΩ' | 'GΩ';
  /** Decimales justos para no perder cifras (0 a 3). */
  decimales: number;
}

export function conUnidad(ohmios: number): ValorConUnidad {
  const a = Math.abs(ohmios);
  const [divisor, unidad]: [number, ValorConUnidad['unidad']] =
    a >= 1e9 ? [1e9, 'GΩ'] : a >= 1e6 ? [1e6, 'MΩ'] : a >= 1e3 ? [1e3, 'kΩ'] : [1, 'Ω'];
  const valor = limpiar(ohmios / divisor);
  let decimales = 0;
  while (decimales < 3 && Math.abs(Math.round(valor * 10 ** decimales) - valor * 10 ** decimales) > 1e-6) {
    decimales += 1;
  }
  return { valor, unidad, decimales };
}
