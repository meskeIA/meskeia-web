/**
 * Cifras de selector-tipo-vivienda que salen de la normativa: los gastos de compra de la guía.
 *
 * NINGUNA se escribe a mano: se DERIVAN de `data/itp-ccaa.ts` y `data/fiscal`, con el mismo
 * enfoque que app/selector-alquiler-vs-compra/cifras.ts (hallazgo 1462 de esa hermana).
 *
 * ── De dónde sale (26/09/2026, hallazgos 2071, 2072 y 2078 del Inspector) ─────────────────────
 * La guía decía, escrito a mano, que los gastos de compra son «entre el 10 % y el 15 %» del
 * precio, el ITP «entre el 6 % y el 10 %» y el AJD «entre el 0,5 % y el 1,5 %», y presentaba
 * el AJD como gasto de toda compra. Con los módulos del repositorio, una vivienda de 200.000 €
 * cuesta del 3,5 % al 10,5 % si es usada (18 de 19 territorios quedaban bajo aquel suelo del
 * 10 %) y del 10,5 % al 12 % si es nueva; el ITP de la vivienda va del 4 % al 13 %, y el AJD de
 * la escritura, del 0 % al 1,5 %, solo en la vivienda nueva: en la usada lo absorbe el ITP
 * (el mismo modelo que `GASTOS_USADA`, que no lo lleva).
 */

import {
  ITP_CCAA,
  RANGO_AJD_VIVIENDA,
  RANGO_ITP_VIVIENDA,
  TERRITORIOS_SIN_IVA,
  calcularAJD,
  calcularITP,
  calcularIVA,
  calcularNotario,
  calcularRegistro,
  type ComunidadAutonoma,
} from '@/data/itp-ccaa';
import { FISCAL_INMUEBLES_META, IVA_INMUEBLES_2025 } from '@/data/fiscal';
import { formatNumber, formatTipoNominal } from '@/lib';

/** Precio de referencia de los ejemplos. */
export const PRECIO_EJEMPLO = 200_000;

/** Porcentaje con espacio duro (U+00A0) antes del «%»: «3,5 %», «12 %». */
export const pct = (valorPorcentual: number): string => `${formatTipoNominal(valorPorcentual)} %`;

interface Extremo {
  /** Porcentaje sobre el precio, redondeado a un decimal (el que se publica). */
  porcentaje: number;
  /** Los territorios que lo alcanzan. */
  territorios: string[];
}

const aPorcentaje1 = (fraccion: number): number => Math.round(fraccion * 1000) / 10;

function extremos(gastoDe: (c: ComunidadAutonoma) => number | null): { min: Extremo; max: Extremo } {
  const filas = (Object.keys(ITP_CCAA) as ComunidadAutonoma[])
    .map((c) => ({ c, g: gastoDe(c) }))
    .filter((f): f is { c: ComunidadAutonoma; g: number } => f.g !== null)
    .map((f) => ({ c: f.c, p: aPorcentaje1(f.g) }));
  const valores = filas.map((f) => f.p);
  const cuales = (objetivo: number) =>
    filas.filter((f) => f.p === objetivo).map((f) => ITP_CCAA[f.c].nombre.replace(/^Ciudad Autónoma de /, ''));
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return { min: { porcentaje: min, territorios: cuales(min) }, max: { porcentaje: max, territorios: cuales(max) } };
}

const notariaYRegistro = calcularNotario(PRECIO_EJEMPLO) + calcularRegistro(PRECIO_EJEMPLO);

/** Vivienda USADA: ITP con el tipo general de la vivienda, notaría y registro (sin AJD). */
const GASTOS_USADA = extremos(
  (c) => (calcularITP(PRECIO_EJEMPLO, c, 'vivienda') + notariaYRegistro) / PRECIO_EJEMPLO,
);

/**
 * Vivienda NUEVA que será la habitual: IVA, AJD, notaría y registro. Sin Canarias, Ceuta y
 * Melilla, donde no rige el IVA sino IGIC o IPSI (`TERRITORIOS_SIN_IVA`).
 */
const GASTOS_NUEVA = extremos((c) =>
  TERRITORIOS_SIN_IVA[c]
    ? null
    : (calcularIVA(PRECIO_EJEMPLO, 'vivienda') +
        calcularAJD(PRECIO_EJEMPLO, c, { objeto: 'vivienda', viviendaHabitual: true }) +
        notariaYRegistro) /
      PRECIO_EJEMPLO,
);

const enumerar = (items: string[]): string =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

const conTerritorios = (e: Extremo): string =>
  e.territorios.length <= 2 ? `${pct(e.porcentaje)} (${enumerar(e.territorios)})` : pct(e.porcentaje);

/** «del 3,5 % (Ceuta y Melilla) al 10,5 % (Cataluña)» */
export const RANGO_GASTOS_USADA = `del ${conTerritorios(GASTOS_USADA.min)} al ${conTerritorios(GASTOS_USADA.max)}`;
/** «del 10,5 % al 12 %» */
export const RANGO_GASTOS_NUEVA = `del ${pct(GASTOS_NUEVA.min.porcentaje)} al ${pct(GASTOS_NUEVA.max.porcentaje)}`;

/** «del 4 % al 13 %» */
export const RANGO_ITP = `del ${pct(RANGO_ITP_VIVIENDA.min)} al ${pct(RANGO_ITP_VIVIENDA.max)}`;
/** «del 0 % al 1,5 %» */
export const RANGO_AJD = `del ${pct(RANGO_AJD_VIVIENDA.min)} al ${pct(RANGO_AJD_VIVIENDA.max)}`;
/** «10 %» */
export const IVA_OBRA_NUEVA = pct(IVA_INMUEBLES_2025.obraNueva);

export const PRECIO_EJEMPLO_TEXTO = `${formatNumber(PRECIO_EJEMPLO, 0)} €`;

/** Lo que muestra <DataReference> tras el aviso de responsabilidad (hallazgo 2072). */
export const REFERENCIA_NORMATIVA = {
  normativa: 'Gastos de compra de vivienda (ITP, IVA y AJD)',
  fuente: FISCAL_INMUEBLES_META.fuente,
  verificado: FISCAL_INMUEBLES_META.verificado,
  urlOficial: FISCAL_INMUEBLES_META.urlOficialITP,
} as const;
