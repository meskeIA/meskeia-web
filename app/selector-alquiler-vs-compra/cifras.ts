/**
 * Cifras de selector-alquiler-vs-compra que salen de la normativa o de una fuente externa.
 *
 * NINGUNA se escribe a mano: la guía, la FAQ (FAQPage, lo que leen buscadores e IA), los avisos
 * del resultado y el sello <DataReference> leen de aquí, y aquí se DERIVAN de los módulos de
 * datos del repositorio.
 *
 * ── De dónde sale (24/09/2026, hallazgos 1461, 1462, 1466, 1467 y 1469 del Inspector) ─────────
 * La guía y la FAQ decían «entre el 10 % y el 15 % adicional» de gastos de compra, escrito a
 * mano. Con el motor de compraventa del repositorio (ITP de la vivienda con el tipo general de
 * `data/fiscal`, notaría y registro por arancel), una usada de 200.000 € cuesta del 3,5 % al
 * 10,5 % según la comunidad, y en 18 de 19 territorios queda por debajo de aquel suelo del 10 %.
 * La FAQ pedía además un 20 % de entrada «con ahorros propios» sin mencionar el aval ICO que
 * recoge `data/fiscal/ayudas-personas.ts`, y atribuía a los intereses de los primeros años un
 * «30-50 % del capital» que no aguanta el cálculo.
 */

import {
  ITP_CCAA,
  TERRITORIOS_SIN_IVA,
  calcularAJD,
  calcularITP,
  calcularIVA,
  calcularNotario,
  calcularRegistro,
  type ComunidadAutonoma,
} from '@/data/itp-ccaa';
import { CATEGORIAS_AYUDAS_PERSONAS, FISCAL_AYUDAS_PERSONAS_META, FISCAL_INMUEBLES_META } from '@/data/fiscal';
import { formatDate, formatNumber, formatTipoNominal, parseISODateLocal } from '@/lib';

/** Precio de referencia de los ejemplos (el mismo que usaba la FAQ). */
export const PRECIO_EJEMPLO = 200_000;

/**
 * Lo que las entidades suelen financiar: «normalmente, hasta un máximo del 80 %» del valor de
 * tasación. Es práctica bancaria, no un límite legal. Fuente: Banco de España, Portal del
 * Cliente Bancario, «La tasación no solo es un mero trámite» (12/03/2024), consultada el
 * 24/09/2026.
 */
export const FINANCIACION_HABITUAL = {
  maximo: 0.8,
  fuente: 'Banco de España, Portal del Cliente Bancario (12/03/2024)',
  url: 'https://clientebancario.bde.es/pcb/es/blog/la-tasacion-no-solo-es-un-mero-tramite.html',
} as const;

/** La entrada que el banco no financia: la parte que sale del ahorro, además de los gastos. */
export const ENTRADA_HABITUAL = 1 - FINANCIACION_HABITUAL.maximo;

interface Extremo {
  /** En tanto por uno, sobre el precio. */
  fraccion: number;
  /** Los territorios que lo alcanzan (con el porcentaje redondeado a un decimal). */
  territorios: string[];
}

/** Redondeo a un decimal del porcentaje: el que se publica. */
const aPorcentaje1 = (fraccion: number): number => Math.round(fraccion * 1000) / 10;

function extremos(gastoDe: (c: ComunidadAutonoma) => number | null): { min: Extremo; max: Extremo } {
  const filas = (Object.keys(ITP_CCAA) as ComunidadAutonoma[])
    .map((c) => ({ c, g: gastoDe(c) }))
    .filter((f): f is { c: ComunidadAutonoma; g: number } => f.g !== null);
  const valores = filas.map((f) => aPorcentaje1(f.g));
  const cuales = (objetivo: number) =>
    filas
      .filter((f) => aPorcentaje1(f.g) === objetivo)
      .map((f) => ITP_CCAA[f.c].nombre.replace(/^Ciudad Autónoma de /, ''));
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  return {
    min: { fraccion: min / 100, territorios: cuales(min) },
    max: { fraccion: max / 100, territorios: cuales(max) },
  };
}

const notariaYRegistro = calcularNotario(PRECIO_EJEMPLO) + calcularRegistro(PRECIO_EJEMPLO);

/**
 * Gastos de compra de una vivienda USADA de 200.000 €: ITP con el tipo general de la vivienda
 * (sin reducciones por colectivo), factura notarial estimada y registro. Sin gestoría ni
 * tasación, que no son impuestos ni aranceles.
 */
export const GASTOS_USADA = extremos(
  (c) => (calcularITP(PRECIO_EJEMPLO, c, 'vivienda') + notariaYRegistro) / PRECIO_EJEMPLO,
);

/**
 * Gastos de compra de una vivienda NUEVA de 200.000 € que será la habitual: IVA, AJD de la
 * vivienda habitual, notaría y registro. Sin Canarias, Ceuta y Melilla, donde no rige el IVA
 * sino IGIC o IPSI, que el catálogo no calcula (`TERRITORIOS_SIN_IVA`).
 */
export const GASTOS_NUEVA = extremos((c) =>
  TERRITORIOS_SIN_IVA[c]
    ? null
    : (calcularIVA(PRECIO_EJEMPLO, 'vivienda') +
        calcularAJD(PRECIO_EJEMPLO, c, { objeto: 'vivienda', viviendaHabitual: true }) +
        notariaYRegistro) /
      PRECIO_EJEMPLO,
);

/** «3,5 %», «12 %». */
export const porcentaje = (fraccion: number): string => `${formatTipoNominal(aPorcentaje1(fraccion))} %`;

/** «Ceuta y Melilla», «Cataluña». */
const enumerar = (items: string[]): string =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;

/** Un extremo con sus territorios, si son pocos: «3,5 % (Ceuta y Melilla)». */
const conTerritorios = (e: Extremo): string =>
  e.territorios.length <= 2 ? `${porcentaje(e.fraccion)} (${enumerar(e.territorios)})` : porcentaje(e.fraccion);

/** «del 3,5 % (Ceuta y Melilla) al 10,5 % (Cataluña)» */
export const RANGO_GASTOS_USADA = `del ${conTerritorios(GASTOS_USADA.min)} al ${conTerritorios(GASTOS_USADA.max)}`;
/** «del 10,5 % al 12 %» */
export const RANGO_GASTOS_NUEVA = `del ${porcentaje(GASTOS_NUEVA.min.fraccion)} al ${porcentaje(GASTOS_NUEVA.max.fraccion)}`;

/** Lo que hay que reunir para una usada de 200.000 €: la entrada más los gastos, en miles. */
const enMiles = (euros: number): string => `${formatNumber(Math.round(euros / 1000) * 1000, 0)} €`;
export const AHORRO_NECESARIO_USADA = {
  min: enMiles(PRECIO_EJEMPLO * (ENTRADA_HABITUAL + GASTOS_USADA.min.fraccion)),
  max: enMiles(PRECIO_EJEMPLO * (ENTRADA_HABITUAL + GASTOS_USADA.max.fraccion)),
};

/** La frase de los gastos, la misma en la guía, la FAQ y los avisos. */
export const FRASE_GASTOS =
  `con los tipos generales de cada comunidad (sin reducciones por colectivo), los impuestos, la ` +
  `notaría y el registro de una vivienda de ${formatNumber(PRECIO_EJEMPLO, 0)} € suman ` +
  `${RANGO_GASTOS_USADA} del precio si es usada, y ${RANGO_GASTOS_NUEVA} si es nueva`;

/**
 * Ejemplo de hipoteca (sistema francés): 200.000 € al 3 % a 30 años. El tipo es ILUSTRATIVO,
 * no un dato de mercado; lo que se publica es aritmética.
 *   cuota 843,21 € · intereses del primer año 5.942,90 € = 58,7 % de lo pagado ese año ·
 *   intereses de toda la vida del préstamo 103.554,90 € = 51,8 % del capital.
 * La FAQ decía que los intereses «pueden superar el 30-50 % del capital en los primeros años»:
 * los de los cinco primeros son el 14,2 % (hallazgo 1466).
 */
export const EJEMPLO_HIPOTECA = (() => {
  const capital = PRECIO_EJEMPLO;
  const tipoAnual = 0.03;
  const anios = 30;
  const i = tipoAnual / 12;
  const n = anios * 12;
  const cuota = (capital * i) / (1 - (1 + i) ** -n);
  let saldo = capital;
  let interesesPrimerAnio = 0;
  for (let mes = 1; mes <= 12; mes++) {
    const interes = saldo * i;
    interesesPrimerAnio += interes;
    saldo -= cuota - interes;
  }
  return {
    capital,
    tipoAnual,
    anios,
    cuota,
    cuotaTexto: `${formatNumber(cuota, 2)} €`,
    partePrimerAnio: interesesPrimerAnio / (cuota * 12),
    interesesTotales: cuota * n - capital,
    interesesTotalesTexto: `${formatNumber(Math.round(cuota * n - capital), 0)} €`,
  };
})();

/** La frase del ejemplo, para la FAQ. */
export const FRASE_INTERESES =
  `por ejemplo, con ${formatNumber(EJEMPLO_HIPOTECA.capital, 0)} € al ` +
  `${formatTipoNominal(EJEMPLO_HIPOTECA.tipoAnual * 100)} % a ${EJEMPLO_HIPOTECA.anios} años, el ` +
  `${formatNumber(EJEMPLO_HIPOTECA.partePrimerAnio * 100, 1)} % de lo que se paga el primer año son ` +
  `intereses, y en toda la vida del préstamo suman unos ${EJEMPLO_HIPOTECA.interesesTotalesTexto}`;

/**
 * El aval del Estado para la primera vivienda, tal como lo describe `data/fiscal`. Si la ficha
 * desaparece, el módulo no carga y el build se para: vale más eso que una FAQ que vuelva a
 * callar la única vía que existe para quien no llega al 20 %.
 */
export const AVAL_ICO = (() => {
  const ficha = CATEGORIAS_AYUDAS_PERSONAS.find((c) => c.id === 'aval-ico-vivienda');
  if (!ficha || !ficha.enlace) {
    throw new Error("selector-alquiler-vs-compra: falta 'aval-ico-vivienda' (con su enlace) en data/fiscal/ayudas-personas.ts");
  }
  return { nombre: ficha.nombre, descripcion: ficha.descripcion, organismo: ficha.organismo, url: ficha.enlace.url };
})();

/** Lo que muestra <DataReference> tras el aviso de responsabilidad (hallazgo 1469). */
export const REFERENCIA_NORMATIVA = {
  normativa: 'Gastos de compra de vivienda (ITP, IVA y AJD)',
  fuente: FISCAL_INMUEBLES_META.fuente,
  verificado: FISCAL_INMUEBLES_META.verificado,
  urlOficial: FISCAL_INMUEBLES_META.urlOficialITP,
  nota:
    `Financiación habitual de hasta el ${formatTipoNominal(FINANCIACION_HABITUAL.maximo * 100)} % del valor ` +
    `de tasación: ${FINANCIACION_HABITUAL.fuente}. ${AVAL_ICO.nombre}: ${AVAL_ICO.organismo}, ficha ` +
    `verificada el ${formatDate(parseISODateLocal(FISCAL_AYUDAS_PERSONAS_META.verificado))}.`,
} as const;
