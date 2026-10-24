/**
 * Las cifras normativas de los textos de simulador-jubilacion-publica (guía, FAQ visible y
 * FAQPage), leídas de `data/fiscal` y del motor del porcentaje, no tecleadas.
 *
 * Hallazgo 2873 (04/10/2026): page.tsx y metadata.ts escribían a mano la escala del porcentaje
 * («36 años y 6 meses», «49», «0,21 %», «209», «248», «16», «0,18 %», «73,78 %», «72,80 %»), el
 * sistema dual (302/304/352,33), los límites (3.359,60 €, 1.256,60/936,20/888,70 €, 9.442/11.013 €),
 * los coeficientes de la anticipada y el resaltado fijo `row.anio === 2026`. Cuadraban con el
 * módulo salvo el escenario de Carlos, que se quedó atrás al cambiar la escala (2872): el resultado
 * sí lo hacía bien porque leía el módulo. Desde aquí, una cifra que cambie en `data/fiscal` cambia
 * también en los textos.
 *
 * Sin React: lo importan page.tsx ('use client') y metadata.ts (servidor).
 */

import { formatCurrency, formatNumber } from '@/lib';
import { calcularPorcentajePension } from '@/lib/calculadoras/pensionPublica';
import {
  FISCAL_PENSIONES_META,
  TABLA_EDAD_JUBILACION,
  getEdadJubilacion,
  getEscalaPorcentajePension,
  getSistemaDualParams,
  BASE_REGULADORA,
  LIMITES_PENSION_2026,
  COMPLEMENTO_MINIMOS_LIMITES_2026,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_JUBILACION_PARCIAL,
  edadMinimaJubilacionParcial,
  getCoeficienteAnticipada,
} from '@/data/fiscal';

const NBSP = ' ';

/** El año de los datos (el del sello del módulo): el que resalta la tabla y nombran los textos. */
export const ANIO_VIGENTE = Number(FISCAL_PENSIONES_META.vigencia);

/** «36 años y 6 meses», «37 años», «6 meses». */
export function mesesATexto(meses: number): string {
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  if (anios === 0) return `${resto} ${resto === 1 ? 'mes' : 'meses'}`;
  if (resto === 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;
  return `${anios} ${anios === 1 ? 'año' : 'años'} y ${resto} ${resto === 1 ? 'mes' : 'meses'}`;
}

const edad = (e: { anios: number; meses: number }): string => mesesATexto(e.anios * 12 + e.meses);

/** Una edad en años decimales (62, 63,8333…) a texto: «63 años y 10 meses». */
const edadDecimal = (x: number): string => mesesATexto(Math.round(x * 12));

/**
 * «0,21 %», «1,875 %», «16,00 %»: dos decimales, o tres si el dato los tiene. Se mira la 3.ª
 * cifra redondeada, no `n * 100` a pelo: 1,63 × 8 da 13,040000000000001.
 */
const pct = (n: number): string => {
  const tercera = Math.round(n * 1000) !== Math.round(n * 100) * 10;
  return `${formatNumber(n, tercera ? 3 : 2)}${NBSP}%`;
};

// ── Escala del porcentaje (art. 210.1.b y DT 9.ª LGSS) ───────────────────────────────────────

interface Escala { base: number; aniosBase: number; m1: number; p1: number; m2: number; p2: number; cien: number; desde: number }

function escala(anio: number): Escala {
  const e = getEscalaPorcentajePension(anio);
  const [t0, t1, t2] = e.tramos;
  return {
    base: t0.porcentajeBase,
    aniosBase: t0.mesesHasta / 12,
    m1: t1.mesesHasta - t1.mesesDesde + 1,
    p1: t1.incrementoPorMes,
    m2: t2.mesesHasta - t2.mesesDesde + 1,
    p2: t2.incrementoPorMes,
    cien: e.mesesParaCien,
    desde: e.desde,
  };
}

const E_VIGENTE = escala(ANIO_VIGENTE);
const E_SIGUIENTE = escala(ANIO_VIGENTE + 1);
/** ¿Cambia la escala el 1 de enero del año que viene? (en 2026, sí: la DT 9.ª acaba). */
const CAMBIA_LA_ESCALA = E_SIGUIENTE.desde === ANIO_VIGENTE + 1;

/** 25 años cotizados con la escala vigente y con la del año siguiente (73,78 % y 72,80 % en 2026). */
const PCT_25_VIGENTE = calcularPorcentajePension(300, ANIO_VIGENTE);
const PCT_25_SIGUIENTE = calcularPorcentajePension(300, ANIO_VIGENTE + 1);

/** FAQ visible «¿Cuántos años hay que cotizar para cobrar el 100 %?». */
export const RESPUESTA_CIEN_POR_CIEN =
  `En ${ANIO_VIGENTE} se necesitan ${mesesATexto(E_VIGENTE.cien)} cotizados para alcanzar el 100${NBSP}% de la base reguladora. ` +
  `Los primeros ${E_VIGENTE.aniosBase} años dan el ${E_VIGENTE.base}${NBSP}%; cada uno de los ${E_VIGENTE.m1} meses siguientes suma un ${pct(E_VIGENTE.p1)} y los ${E_VIGENTE.m2} posteriores, un ${pct(E_VIGENTE.p2)}.` +
  (CAMBIA_LA_ESCALA
    ? ` Este requisito ha ido subiendo escalón a escalón y desde el 1 de enero de ${ANIO_VIGENTE + 1} será de ${mesesATexto(E_SIGUIENTE.cien)}: ` +
      `cada uno de los ${E_SIGUIENTE.m1} meses siguientes a los ${E_SIGUIENTE.aniosBase} años suma un ${pct(E_SIGUIENTE.p1)} y los ${E_SIGUIENTE.m2} posteriores, un ${pct(E_SIGUIENTE.p2)}. ` +
      `Por eso con 25 años cotizados el porcentaje baja del ${pct(PCT_25_VIGENTE)} al ${pct(PCT_25_SIGUIENTE)} para quien se jubile a partir de ${ANIO_VIGENTE + 1}, y el simulador aplica la escala del año en que te jubilas.`
    : ' El simulador aplica la escala del año en que te jubilas.');

// ── Base reguladora y sistema dual (DT 40.ª LGSS) ───────────────────────────────────────────

const DUAL = getSistemaDualParams(ANIO_VIGENTE);
const TEXTO_CLASICA = `la suma de las últimas ${BASE_REGULADORA.mesesConsiderados} bases de cotización dividida entre ${BASE_REGULADORA.divisor}`;
const TEXTO_AMPLIADA = `las ${DUAL.basesSeleccionadas} mejores bases de un periodo de ${DUAL.ventanaMeses} meses, divididas entre ${formatNumber(DUAL.divisor, 2)}`;

/** FAQ visible «¿Qué es el sistema dual de pensiones?». */
export const RESPUESTA_SISTEMA_DUAL =
  `Desde enero de ${DUAL.anio}, la SS calcula tu pensión con dos fórmulas —la clásica (${TEXTO_CLASICA}) y la ampliada (${TEXTO_AMPLIADA})— y aplica de oficio la más favorable. ` +
  'La ampliada gana cuando hay lagunas o bases muy desiguales, porque puede descartar los peores meses. Esta herramienta parte de una única base media, así que no puede distinguirlas: ' +
  'para saber cuál te conviene hace falta tu historial mes a mes, que es lo que usa el simulador oficial.';

// ── Edad ordinaria (Ley 27/2011, calendario transitorio) ─────────────────────────────────────

const EDAD_VIGENTE = getEdadJubilacion(ANIO_VIGENTE);
const FILA_DEFINITIVA = TABLA_EDAD_JUBILACION[TABLA_EDAD_JUBILACION.length - 1];
export const ANIO_EDAD_DEFINITIVA = FILA_DEFINITIVA.anio;
export const TEXTO_EDAD_VIGENTE = edad(EDAD_VIGENTE.edadSinCotizacion);
export const TEXTO_COTIZACION_VIGENTE = edad(EDAD_VIGENTE.cotizacionPara65);
export const TEXTO_EDAD_DEFINITIVA = edad(FILA_DEFINITIVA.edadSinCotizacion);
export const TEXTO_COTIZACION_DEFINITIVA = edad(FILA_DEFINITIVA.cotizacionPara65);

/** Nota bajo la tabla, FAQ visible «¿Cuándo será definitiva…?» y escenario de Ana. */
export const TEXTO_EDAD_ESTABLE =
  `Desde ${ANIO_EDAD_DEFINITIVA} la edad ordinaria se estabiliza en ${TEXTO_EDAD_DEFINITIVA} (o 65 con ${TEXTO_COTIZACION_DEFINITIVA} cotizados).`;

/** FAQPage, pregunta 1. */
export const RESPUESTA_EDAD =
  `En ${ANIO_VIGENTE}, la edad ordinaria de jubilación en España es de ${TEXTO_EDAD_VIGENTE} si tienes menos de ${TEXTO_COTIZACION_VIGENTE} cotizados, o de 65 años si superas esa cotización. ` +
  `La edad se incrementa progresivamente hasta alcanzar los ${TEXTO_EDAD_DEFINITIVA} en ${ANIO_EDAD_DEFINITIVA} para quienes tengan menos de ${TEXTO_COTIZACION_DEFINITIVA} cotizados. ` +
  'El año de nacimiento y los años cotizados son los dos factores determinantes.';

// ── Anticipada (arts. 207 y 208 LGSS) ────────────────────────────────────────────────────────

const VOL = COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025.map((t) => t.reduccionPorTrimestre);
const INV = COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025.map((t) => t.reduccionPorTrimestre);
const ANIOS_VOL = REQUISITOS_ANTICIPADA_VOLUNTARIA.maxMesesAnticipacion / 12;
const ANIOS_INV = REQUISITOS_ANTICIPADA_INVOLUNTARIA.maxMesesAnticipacion / 12;
const TRIMESTRES_VOL = REQUISITOS_ANTICIPADA_VOLUNTARIA.maxMesesAnticipacion / 3;
const VOL_MAX = Math.max(...VOL);
const VOL_MIN = Math.min(...VOL);
/** El tramo más duro es el de menos años cotizados (el primero de la tabla, «< 38,5»). */
const TRAMO_DURO = edad({ anios: Math.floor(COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025[0].aniosCotizadosHasta), meses: Math.round((COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025[0].aniosCotizadosHasta % 1) * 12) });

/** FAQ visible «¿La reducción por anticipada es permanente?». */
export const RESPUESTA_ANTICIPADA_PERMANENTE =
  `Sí, se mantiene toda la vida. Anticipar ${ANIOS_VOL} años de forma voluntaria son ${TRIMESTRES_VOL} trimestres, entre el ${pct(VOL_MIN * TRIMESTRES_VOL)} y el ${pct(VOL_MAX * TRIMESTRES_VOL)} según los años cotizados: ` +
  `el coeficiente más duro (${pct(VOL_MAX)} por trimestre) le toca precisamente a quien menos ha cotizado. El punto de equilibrio suele estar entre 10 y 15 años.`;

/** FAQ visible «¿Puedo jubilarme antes de la edad ordinaria?». */
export const RESPUESTA_ANTICIPADA_VIAS =
  `Sí: anticipada voluntaria (hasta ${ANIOS_VOL} años antes, ${REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados}+ años cotizados) o involuntaria (hasta ${ANIOS_INV} años, ${REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados}+ cotizados). ` +
  'Ambas implican coeficientes reductores permanentes. Existe una tercera vía, la jubilación anticipada por discapacidad, con un régimen propio y coeficientes distintos que esta herramienta no cubre: si es tu caso, consúltalo en el INSS.';

/** FAQPage, pregunta 3. */
export const RESPUESTA_ANTICIPADA_FAQPAGE =
  `La jubilación anticipada voluntaria aplica coeficientes reductores permanentes sobre la pensión. Jubilarse ${ANIOS_VOL} años antes son ${TRIMESTRES_VOL} trimestres, y la reducción va del ${pct(VOL_MIN * TRIMESTRES_VOL)} al ${pct(VOL_MAX * TRIMESTRES_VOL)} según los años cotizados: ` +
  `el ${pct(VOL_MAX * TRIMESTRES_VOL)} le corresponde a quien tiene menos de ${TRAMO_DURO} cotizados, es decir, a quien menos ha cotizado. ` +
  `La jubilación anticipada involuntaria (despido colectivo, cierre de empresa, etc.) permite anticipar hasta ${ANIOS_INV} años y aplica coeficientes algo menos penalizadores, del ${pct(Math.min(...INV))} al ${pct(Math.max(...INV))} por trimestre.`;

/** Escenario de Pedro: 36 años cotizados, anticipa 2 años de forma voluntaria. */
const PEDRO_COEF = getCoeficienteAnticipada(36, COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025);
export const ESCENARIO_PEDRO = {
  supera: REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados,
  tramo: TRAMO_DURO,
  coef: pct(PEDRO_COEF),
  trimestres: TRIMESTRES_VOL,
  total: pct(PEDRO_COEF * TRIMESTRES_VOL),
};

// ── Parcial (art. 215 LGSS, RDL 11/2024) ─────────────────────────────────────────────────────

const P = REQUISITOS_JUBILACION_PARCIAL;
const PARCIAL_CON = edadDecimal(edadMinimaJubilacionParcial(ANIO_VIGENTE, 99));
const PARCIAL_SIN = edadDecimal(edadMinimaJubilacionParcial(ANIO_VIGENTE, 0));

/** FAQ visible «¿Qué es la jubilación parcial?». */
export const RESPUESTA_PARCIAL =
  `Permite reducir la jornada entre el ${P.reduccionJornadaMin}${NBSP}% y el ${P.reduccionJornadaMax}${NBSP}% combinando salario y pensión parcial. ` +
  `No hay una edad fija: desde el RDL 11/2024 (efectos del 1 de abril de 2025) puede anticiparse como máximo ${P.anticipacionMaximaAnios} años sobre la edad ordinaria, ` +
  `así que en ${ANIO_VIGENTE} son ${PARCIAL_CON} con la cotización suficiente acreditada, o ${PARCIAL_SIN} sin ella. ` +
  `Requiere ${P.anosCotizadosMinimos} años cotizados, contrato de relevo y acuerdo con el empleador.`;

/** FAQPage, pregunta 4. */
export const RESPUESTA_PARCIAL_FAQPAGE =
  `La jubilación parcial permite reducir la jornada laboral entre un ${P.reduccionJornadaMin}${NBSP}% y un ${P.reduccionJornadaMax}${NBSP}% y cobrar simultáneamente la parte proporcional de la pensión, siempre que la empresa contrate a un trabajador sustituto mediante un contrato de relevo. ` +
  `Desde el RDL 11/2024, con efectos del 1 de abril de 2025, no hay una edad fija: puede anticiparse como máximo ${P.anticipacionMaximaAnios} años sobre la edad ordinaria que corresponda, de modo que en ${ANIO_VIGENTE} son ${PARCIAL_CON} con la cotización suficiente acreditada o ${PARCIAL_SIN} sin ella. ` +
  `Se exigen además ${P.anosCotizadosMinimos} años cotizados (${P.anosCotizadosDiscapacidad} con discapacidad igual o superior al 33${NBSP}%), ${P.antiguedadEmpresaAnios} años de antigüedad en la empresa y acuerdo con ella.`;

/** Escenario de María: 35 cotizados hoy, sin la cotización para los 65. */
export const ESCENARIO_MARIA = {
  anticipacion: P.anticipacionMaximaAnios,
  cotizacion: TEXTO_COTIZACION_VIGENTE,
  edad: TEXTO_EDAD_VIGENTE,
  minimo: edadDecimal(edadMinimaJubilacionParcial(ANIO_VIGENTE, 35)),
};

// ── Límites de la cuantía (RD 241/2026) ──────────────────────────────────────────────────────

const L = LIMITES_PENSION_2026;
const C = COMPLEMENTO_MINIMOS_LIMITES_2026;

/** FAQPage, pregunta 5. */
export const RESPUESTA_LIMITES =
  `La pensión máxima de jubilación de la Seguridad Social en ${ANIO_VIGENTE} es de ${formatCurrency(L.maximaMensual)} al mes (en 14 pagas), que se revisa anualmente según el IPC. ` +
  'Esta cifra actúa como techo independientemente de la base reguladora calculada. ' +
  `Por abajo existen cuantías mínimas —${formatCurrency(L.minimaConConyuge)} al mes con cónyuge a cargo, ${formatCurrency(L.minimaSolo)} en unidad unipersonal y ${formatCurrency(L.minimaSinConyuge)} con cónyuge no a cargo—, ` +
  `pero no se aplican solas: el complemento a mínimos exige que las rentas anuales distintas de la pensión no superen ${formatCurrency(C.sinConyuge)}, u ${formatCurrency(C.conConyuge)} contando al cónyuge a cargo.`;

/** FAQPage, pregunta 2: la escala y la base reguladora. */
export const RESPUESTA_CALCULO =
  `La pensión se calcula aplicando a la base reguladora un porcentaje que depende de los años cotizados: el ${E_VIGENTE.base}${NBSP}% con los ${E_VIGENTE.aniosBase} años mínimos, ` +
  `más un ${pct(E_VIGENTE.p1)} por cada uno de los ${E_VIGENTE.m1} meses siguientes y un ${pct(E_VIGENTE.p2)} por cada uno de los ${E_VIGENTE.m2} posteriores, hasta el 100${NBSP}% a los ${mesesATexto(E_VIGENTE.cien)} en ${ANIO_VIGENTE}. ` +
  (CAMBIA_LA_ESCALA
    ? `Desde ${ANIO_VIGENTE + 1} la escala cambia: un ${pct(E_SIGUIENTE.p1)} por cada uno de los ${E_SIGUIENTE.m1} meses siguientes a los ${E_SIGUIENTE.aniosBase} años y un ${pct(E_SIGUIENTE.p2)} por cada uno de los ${E_SIGUIENTE.m2} posteriores, hasta el 100${NBSP}% a los ${mesesATexto(E_SIGUIENTE.cien)}. `
    : '') +
  `La base reguladora clásica es ${TEXTO_CLASICA}. Desde ${DUAL.anio} convive con la fórmula ampliada (${TEXTO_AMPLIADA}) y la Seguridad Social aplica de oficio la más favorable, sin que haya que elegir.`;

/** Escenario de Ana: 2.200 €/mes de base media. */
export const ESCENARIO_ANA_BR = formatCurrency(2200 * BASE_REGULADORA.factor);
export const TEXTO_FACTOR_BR = `${BASE_REGULADORA.mesesConsiderados}/${BASE_REGULADORA.divisor}`;
