/**
 * Datos fiscales: Autónomos (RETA)
 *
 * ⚠️ HERRAMIENTA DE ORIENTACIÓN — No constituye asesoramiento fiscal.
 * Datos verificados a la fecha indicada. Pueden haber cambiado.
 * Verifica siempre en la fuente oficial antes de tomar decisiones.
 *
 * Fuente: Real Decreto-ley 13/2022 + Orden PJC/297/2026, de 30 de marzo (art. 18)
 * Verificado: 2026-08-12 (tabla de tramos contrastada contra el texto del BOE)
 * URL oficial: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296
 *
 * ⚠️ 2026-08-12: hasta hoy la tabla se había verificado contra la GUÍA WEB de
 *    Importass, no contra la norma. Al contrastarla con el art. 18 de la Orden
 *    apareció una diferencia: la base máxima del tramo 1 de la tabla reducida
 *    es 718,94 €, no 718,95 € (que es la base MÍNIMA del tramo 2). Un céntimo,
 *    sin efecto en la cuota redondeada, pero el resto de la tabla —catorce
 *    filas— coincide exactamente, así que la única cifra que discrepaba era
 *    precisamente la que no venía de la fuente primaria.
 */

export const FISCAL_AUTONOMOS_META = {
  fuente: 'Real Decreto-ley 13/2022 + Orden PJC/297/2026 (cotización 2026, art. 18)',
  descripcion: 'Sistema de cotización por ingresos reales para autónomos',
  verificado: '2026-08-12',
  vigencia: '2026',
  urlOficial: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-7296',
  nota: 'Tipo 31,50%: CC 28,30% + AT/EP 1,30% + MEI 0,90% (los tres fijados en el art. 18.2 de la Orden PJC/297/2026) + Cese 0,90% + FP 0,10% (LGSS, no los repite la Orden anual). La guía web de Importass sigue mostrando "31,40%" en su encabezado, texto heredado de 2025: manda la Orden.',
};

// Tipo de cotización general RETA 2026
// Desglose: CC 28,30% + AT/EP 1,30% + Cese 0,90% + FP 0,10% + MEI 0,90% = 31,50%
// Fuente: desglose de componentes publicado en importass.seg-social.es (2026-06-09)
export const TIPO_COTIZACION_RETA = 0.315; // 31,50%

// Tramo de cotización por ingresos reales
export interface TramoCotizacion {
  id: number;
  rendimientoMin: number;
  rendimientoMax: number | null; // null = sin límite superior
  /**
   * Si el tramo INCLUYE su rendimientoMax. La norma cierra por arriba todas las fronteras
   * («≤ 670», «> 670 y ≤ 900»…) salvo la del SMI: el tramo 3 es «> 900 y < 1.166,70» y el
   * primero de la tabla general, «≥ 1.166,70 y ≤ 1.300». No elegir tramo a mano: `tramoRETA`.
   */
  rendimientoMaxIncluido: boolean;
  baseMinima: number;
  baseMaxima: number;
  cuotaMinima: number;
  cuotaMaxima: number;
}

/**
 * Tabla de tramos 2026 (importass.seg-social.es, verificada 2026-06-09)
 * Los tramos son de RENDIMIENTO COMPUTABLE mensual del art. 308.1.c LGSS, no del rendimiento
 * neto del IRPF: calcúlalo con `rendimientoComputableMensualRETA` (más abajo).
 * cuotaMinima/cuotaMaxima = baseMinima/Maxima × 31,50% (informativo)
 *
 * ⚠️ 02/10/2026 — hallazgo 2607 del Inspector: hasta hoy este comentario decía «Rendimiento
 * neto = Ingresos − Gastos deducibles − Cuota SS», y simulador-modulos-vs-directa lo copió
 * atribuyéndoselo al art. 308.1. La ley dice otra cosa (ver `rendimientoComputableMensualRETA`).
 * La numeración `id` (1-15) es interna: la Orden numera por tabla —reducida 1-3 y general
 * 1-12—, así que para enseñar el tramo usa `nombreTramoRETA`.
 */
export const TRAMOS_RETA_2025: TramoCotizacion[] = [
  // TABLA REDUCIDA (rendimientos < SMI anual)
  { id: 1,  rendimientoMin: 0,       rendimientoMax: 670,     rendimientoMaxIncluido: true,  baseMinima: 653.59,  baseMaxima: 718.94,  cuotaMinima: 205.88, cuotaMaxima: 226.47 },
  { id: 2,  rendimientoMin: 670,     rendimientoMax: 900,     rendimientoMaxIncluido: true,  baseMinima: 718.95,  baseMaxima: 900,     cuotaMinima: 226.47, cuotaMaxima: 283.50 },
  { id: 3,  rendimientoMin: 900,     rendimientoMax: 1166.70, rendimientoMaxIncluido: false, baseMinima: 849.67,  baseMaxima: 1166.70, cuotaMinima: 267.65, cuotaMaxima: 367.51 },
  // TABLA GENERAL (rendimientos >= SMI anual)
  { id: 4,  rendimientoMin: 1166.70, rendimientoMax: 1300,    rendimientoMaxIncluido: true,  baseMinima: 950.98,  baseMaxima: 1300,    cuotaMinima: 299.56, cuotaMaxima: 409.50 },
  { id: 5,  rendimientoMin: 1300,    rendimientoMax: 1500,    rendimientoMaxIncluido: true,  baseMinima: 960.78,  baseMaxima: 1500,    cuotaMinima: 302.65, cuotaMaxima: 472.50 },
  { id: 6,  rendimientoMin: 1500,    rendimientoMax: 1700,    rendimientoMaxIncluido: true,  baseMinima: 960.78,  baseMaxima: 1700,    cuotaMinima: 302.65, cuotaMaxima: 535.50 },
  { id: 7,  rendimientoMin: 1700,    rendimientoMax: 1850,    rendimientoMaxIncluido: true,  baseMinima: 1143.79, baseMaxima: 1850,    cuotaMinima: 360.29, cuotaMaxima: 582.75 },
  { id: 8,  rendimientoMin: 1850,    rendimientoMax: 2030,    rendimientoMaxIncluido: true,  baseMinima: 1209.15, baseMaxima: 2030,    cuotaMinima: 380.88, cuotaMaxima: 639.45 },
  { id: 9,  rendimientoMin: 2030,    rendimientoMax: 2330,    rendimientoMaxIncluido: true,  baseMinima: 1274.51, baseMaxima: 2330,    cuotaMinima: 401.47, cuotaMaxima: 733.95 },
  { id: 10, rendimientoMin: 2330,    rendimientoMax: 2760,    rendimientoMaxIncluido: true,  baseMinima: 1356.21, baseMaxima: 2760,    cuotaMinima: 427.21, cuotaMaxima: 869.40 },
  { id: 11, rendimientoMin: 2760,    rendimientoMax: 3190,    rendimientoMaxIncluido: true,  baseMinima: 1437.91, baseMaxima: 3190,    cuotaMinima: 452.94, cuotaMaxima: 1004.85 },
  { id: 12, rendimientoMin: 3190,    rendimientoMax: 3620,    rendimientoMaxIncluido: true,  baseMinima: 1519.61, baseMaxima: 3620,    cuotaMinima: 478.68, cuotaMaxima: 1140.30 },
  { id: 13, rendimientoMin: 3620,    rendimientoMax: 4050,    rendimientoMaxIncluido: true,  baseMinima: 1601.31, baseMaxima: 4050,    cuotaMinima: 504.41, cuotaMaxima: 1275.75 },
  { id: 14, rendimientoMin: 4050,    rendimientoMax: 6000,    rendimientoMaxIncluido: true,  baseMinima: 1732.03, baseMaxima: 5101.20, cuotaMinima: 545.59, cuotaMaxima: 1606.88 },
  { id: 15, rendimientoMin: 6000,    rendimientoMax: null,    rendimientoMaxIncluido: true,  baseMinima: 1928.10, baseMaxima: 5101.20, cuotaMinima: 607.35, cuotaMaxima: 1606.88 },
];

/**
 * Tramo de la tabla que corresponde a unos rendimientos netos MENSUALES (art. 18 de la
 * Orden PJC/297/2026). Lo usan todos los consumidores: hasta el 26/09/2026 cada uno escribía
 * su propio `find`, y ninguno acertaba todas las fronteras — el asistente de alta cerraba
 * TODAS por arriba (1.166,70 € → tramo 3, base 101,31 € por debajo de la legal) y los otros
 * cuatro las cerraban todas por abajo (670, 900, 1.300 … 6.000 € → el tramo SIGUIENTE).
 * Rendimientos nulos o negativos caen en el tramo 1.
 */
export function tramoRETA(rendimientoMensual: number): TramoCotizacion {
  const tramo = TRAMOS_RETA_2025.find((t) =>
    t.rendimientoMax === null ||
    (t.rendimientoMaxIncluido ? rendimientoMensual <= t.rendimientoMax : rendimientoMensual < t.rendimientoMax),
  );
  return tramo ?? TRAMOS_RETA_2025[TRAMOS_RETA_2025.length - 1];
}

/** Número de tramos de la tabla reducida (rendimientos por debajo del SMI); el resto, general. */
const TRAMOS_TABLA_REDUCIDA = 3;

/**
 * Nombre del tramo tal como lo numera la Orden PJC/297/2026, art. 18: «tabla reducida, tramo
 * 1-3» y «tabla general, tramo 1-12». El `id` de TRAMOS_RETA_2025 es correlativo (1-15) y
 * no existe en la norma: «tramo 15» no lo encuentra nadie en el BOE (hallazgo 2611).
 */
export function nombreTramoRETA(t: TramoCotizacion): { tabla: 'reducida' | 'general'; numero: number } {
  return t.id <= TRAMOS_TABLA_REDUCIDA
    ? { tabla: 'reducida', numero: t.id }
    : { tabla: 'general', numero: t.id - TRAMOS_TABLA_REDUCIDA };
}

/**
 * Deducción por gastos genéricos del art. 308.1.c), regla 2.ª, LGSS (BOE-A-2015-11724, texto
 * consolidado consultado el 02/10/2026): 7 % con carácter general y 3 % para los autónomos
 * societarios y los socios de entidades del art. 305.2 b) y e).
 */
export const GASTOS_GENERICOS_RETA = {
  general: 0.07,
  societarios: 0.03,
  norma: 'art. 308.1.c), regla 2.ª, LGSS',
};

/**
 * Rendimiento COMPUTABLE mensual del art. 308.1.c LGSS, que es el que decide el tramo de la
 * tabla del RETA (BOE-A-2015-11724, texto consolidado consultado el 02/10/2026):
 *   · regla 1.ª — en estimación DIRECTA, «el rendimiento neto, incrementado en el importe de
 *     las cuotas de la Seguridad Social y aportaciones a mutualidades alternativas del
 *     titular»; en estimación OBJETIVA, «el rendimiento neto previo» (el minorado en las
 *     actividades agrícolas, forestales y ganaderas);
 *   · regla 2.ª — a eso se le aplica la deducción por gastos genéricos (7 % / 3 %).
 * En la directa simplificada, el rendimiento neto del IRPF ya lleva restados la cuota (gasto
 * deducible) y el 5 % de difícil justificación (art. 30.2.ª RIRPF): la cuota vuelve a sumarse,
 * el 5 % no.
 *
 * ⚠️ 02/10/2026 — hallazgo 2607: simulador-modulos-vs-directa buscaba el tramo con
 * (ingresos − gastos − cuota) / 12, sin devolver la cuota ni restar el 7 %, y avisaba de un
 * déficit inexistente con rentas altas y callaba el real con rentas medias. Los demás
 * consumidores de `tramoRETA` (estimador-cuota-autonomo, comparador-autonomo-vs-sl y los
 * motores de lib/calculadoras) siguen buscando con su propia base: anotado en SOSPECHAS.
 *
 * @param p.rendimientoNetoAnual Rendimiento neto anual de la actividad según el IRPF, en €
 *   (en objetiva, el rendimiento neto previo).
 * @param p.cuotasAnuales Cuotas del RETA (y mutualidad alternativa) deducidas en ese
 *   rendimiento, en €. Solo cuentan en directa.
 * @param p.metodo 'directa' (normal o simplificada) u 'objetiva' (módulos).
 * @param p.societario true para el 3 % de los autónomos del art. 305.2 b) y e).
 * @returns El rendimiento computable MENSUAL, en € (puede ser ≤ 0: tramo 1 de la reducida).
 */
export function rendimientoComputableMensualRETA(p: {
  rendimientoNetoAnual: number;
  cuotasAnuales: number;
  metodo: 'directa' | 'objetiva';
  societario?: boolean;
}): number {
  const base = p.metodo === 'directa' ? p.rendimientoNetoAnual + p.cuotasAnuales : p.rendimientoNetoAnual;
  const deduccion = p.societario ? GASTOS_GENERICOS_RETA.societarios : GASTOS_GENERICOS_RETA.general;
  return (base * (1 - deduccion)) / 12;
}

// Bases de referencia 2026
export const BASES_RETA_2025 = {
  minima: 653.59,
  maxima: 5101.20,
};

// Tarifa plana para nuevos autónomos
export const TARIFA_PLANA_2025 = {
  cuota: 80,        // € mensuales
  duracion: 12,     // meses
  urlInfo: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10817/32232',
};
