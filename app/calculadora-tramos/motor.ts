// Motor de la calculadora por tramos — sin dependencias ni presentación.
//
// Dos maneras de aplicar una escala de tramos a una base:
//   · progresivo (o marginal): cada parte de la base paga el tipo de SU tramo. Así se aplican
//     los impuestos sobre la renta. La función importe(base) es CONTINUA: pasar de tramo nunca
//     hace saltar el importe.
//   · escalonado (o al tramo alcanzado): toda la base paga el tipo del tramo al que llega. Así
//     funcionan muchas comisiones, descuentos por volumen y algunas tarifas. La función tiene
//     SALTOS en cada límite, y ahí nacen las zonas donde más base da peor resultado.
//
// Convenio de límites: cada tramo cubre (desde, hasta]. Una base exactamente igual al límite
// pertenece al tramo de abajo («hasta 10.000» incluye el 10.000).
//
// El «tipo» de un tramo es un porcentaje (modo 'porcentaje': 15 significa 15 %) o un precio por
// unidad de base (modo 'precio': 1,20 por m³, por kWh, por unidad…).

export type ModoTipo = 'porcentaje' | 'precio';

export interface Tramo {
  /** Límite superior del tramo; null = sin límite (solo el último). */
  hasta: number | null;
  tipo: number;
}

export interface TramoNormalizado {
  desde: number;
  hasta: number | null;
  tipo: number;
}

export interface FilaDesglose {
  indice: number;
  desde: number;
  hasta: number | null;
  tipo: number;
  /** Parte de la base que cae dentro de este tramo. */
  baseEnTramo: number;
  importe: number;
}

export interface ResultadoProgresivo {
  filas: FilaDesglose[];
  total: number;
  /** total ÷ base, como fracción (modo porcentaje) o como precio medio (modo precio). null si base = 0. */
  tipoMedio: number | null;
  indiceMarginal: number;
  tipoMarginal: number;
}

export interface ResultadoEscalonado {
  indiceAlcanzado: number;
  tipo: number;
  total: number;
}

export type TipoZona = 'neto' | 'importe';

export interface Umbral {
  /** Índice del tramo que EMPIEZA en este límite. */
  indice: number;
  limite: number;
  tipoAntes: number;
  tipoDespues: number;
  /** Cuánto salta el importe escalonado al cruzar el límite (puede ser negativo). */
  salto: number;
  /**
   * Zona por encima del límite donde, en escalonado, más base da peor resultado:
   *   · 'neto'    (modo porcentaje, tipo que sube): lo que queda tras pagar es MENOR que en el límite.
   *   · 'importe' (tipo que baja): se paga MENOS que en el límite aun siendo más base.
   * null si cruzar el límite no produce ninguna de las dos paradojas.
   */
  zona: { tipo: TipoZona; hasta: number; recortada: boolean; infinita: boolean } | null;
}

export interface Segmento {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const factor = (modo: ModoTipo, tipo: number): number => (modo === 'porcentaje' ? tipo / 100 : tipo);

/** Devuelve un mensaje de error si la escala no es válida, o null si lo es. */
export function validarTramos(tramos: Tramo[], modo: ModoTipo): string | null {
  if (tramos.length === 0) return 'Añade al menos un tramo.';
  let anterior = 0;
  for (let i = 0; i < tramos.length; i++) {
    const t = tramos[i];
    const n = i + 1;
    if (!Number.isFinite(t.tipo)) return `El tipo del tramo ${n} no es un número.`;
    if (t.tipo < 0) return `El tipo del tramo ${n} no puede ser negativo.`;
    if (modo === 'porcentaje' && t.tipo > 100) return `El tipo del tramo ${n} pasa del 100 %.`;
    if (t.hasta === null) {
      if (i !== tramos.length - 1) return `Solo el último tramo puede quedar sin límite (falta el «hasta» del tramo ${n}).`;
      continue;
    }
    if (!Number.isFinite(t.hasta)) return `El límite del tramo ${n} no es un número.`;
    if (t.hasta <= anterior) return `El límite del tramo ${n} tiene que ser mayor que el del tramo anterior.`;
    anterior = t.hasta;
  }
  return null;
}

export function normalizar(tramos: Tramo[]): TramoNormalizado[] {
  let desde = 0;
  return tramos.map((t) => {
    const n = { desde, hasta: t.hasta, tipo: t.tipo };
    if (t.hasta !== null) desde = t.hasta;
    return n;
  });
}

/**
 * Tramo al que pertenece la base, con el convenio (desde, hasta].
 * Si la base supera el último límite y el último tramo tiene tope, se usa el último tramo.
 */
export function indiceTramo(base: number, norm: TramoNormalizado[]): number {
  for (let i = 0; i < norm.length; i++) {
    const h = norm[i].hasta;
    if (h === null || base <= h) return i;
  }
  return norm.length - 1;
}

export function calcularProgresivo(base: number, tramos: Tramo[], modo: ModoTipo): ResultadoProgresivo {
  const norm = normalizar(tramos);
  const ultimo = norm.length - 1;
  const filas: FilaDesglose[] = norm.map((t, i) => {
    // El último tramo absorbe lo que exceda, aunque se le haya puesto tope.
    const techo = t.hasta === null || i === ultimo ? base : Math.min(base, t.hasta);
    const baseEnTramo = Math.max(0, techo - t.desde);
    return { indice: i, desde: t.desde, hasta: t.hasta, tipo: t.tipo, baseEnTramo, importe: baseEnTramo * factor(modo, t.tipo) };
  });
  const total = filas.reduce((s, f) => s + f.importe, 0);
  const indiceMarginal = indiceTramo(base, norm);
  return {
    filas,
    total,
    tipoMedio: base > 0 ? total / base : null,
    indiceMarginal,
    tipoMarginal: norm[indiceMarginal].tipo,
  };
}

export function calcularEscalonado(base: number, tramos: Tramo[], modo: ModoTipo): ResultadoEscalonado {
  const norm = normalizar(tramos);
  const i = indiceTramo(base, norm);
  return { indiceAlcanzado: i, tipo: norm[i].tipo, total: base * factor(modo, norm[i].tipo) };
}

/** Los límites entre tramos, con el salto del escalonado y su zona paradójica si la hay. */
export function calcularUmbrales(tramos: Tramo[], modo: ModoTipo): Umbral[] {
  const norm = normalizar(tramos);
  const umbrales: Umbral[] = [];
  for (let i = 1; i < norm.length; i++) {
    const L = norm[i].desde;
    const fa = factor(modo, norm[i - 1].tipo);
    const fd = factor(modo, norm[i].tipo);
    const finTramo = norm[i].hasta;

    let zona: Umbral['zona'] = null;
    let bruto: number | null = null; // límite superior de la zona sin recortar (Infinity = no se cierra)
    let tipo: TipoZona | null = null;
    if (fd < fa) {
      // Tipo que baja: x·fd < L·fa  ⇔  x < L·fa/fd
      tipo = 'importe';
      bruto = fd > 0 ? (L * fa) / fd : Infinity;
    } else if (modo === 'porcentaje' && fd > fa) {
      // Tipo que sube: neto x·(1−fd) < L·(1−fa)  ⇔  x < L·(1−fa)/(1−fd)
      tipo = 'neto';
      bruto = fd < 1 ? (L * (1 - fa)) / (1 - fd) : Infinity;
    }
    if (tipo !== null && bruto !== null && bruto > L) {
      const recortada = finTramo !== null && bruto > finTramo;
      const hasta = recortada ? (finTramo as number) : bruto;
      zona = { tipo, hasta, recortada, infinita: !recortada && !Number.isFinite(bruto) };
    }

    umbrales.push({ indice: i, limite: L, tipoAntes: norm[i - 1].tipo, tipoDespues: norm[i].tipo, salto: L * (fd - fa), zona });
  }
  return umbrales;
}

/** Vértices de la curva progresiva entre 0 y xMax (es continua y lineal a trozos). */
export function curvaProgresiva(tramos: Tramo[], modo: ModoTipo, xMax: number): { x: number; y: number }[] {
  const xs = [0, ...normalizar(tramos).map((t) => t.hasta).filter((h): h is number => h !== null && h < xMax), xMax];
  return xs.map((x) => ({ x, y: calcularProgresivo(x, tramos, modo).total }));
}

/** Un segmento recto por tramo entre 0 y xMax: la curva escalonada salta en cada límite. */
export function segmentosEscalonados(tramos: Tramo[], modo: ModoTipo, xMax: number): Segmento[] {
  const norm = normalizar(tramos);
  const segs: Segmento[] = [];
  norm.forEach((t, i) => {
    if (t.desde >= xMax) return;
    const fin = t.hasta === null || i === norm.length - 1 ? xMax : Math.min(t.hasta, xMax);
    const f = factor(modo, t.tipo);
    segs.push({ x1: t.desde, y1: t.desde * f, x2: fin, y2: fin * f });
  });
  return segs;
}
