/**
 * Calculadora de Compensacion de Bases Imponibles Negativas en IS
 * Usada por: MCP server (calcular_compensacion_bases_negativas_is)
 *
 * Calcula el importe de bases imponibles negativas (BINs) de ejercicios
 * anteriores que puede compensarse en el Impuesto sobre Sociedades del
 * ejercicio actual, respetando los limites legales vigentes.
 *
 * Marco normativo:
 *   - LIS art. 26: compensacion de bases imponibles negativas
 *   - LIS art. 26.1: limite de compensacion segun volumen de operaciones
 *   - LIS art. 26.4: requisitos para la compensacion (acreditacion)
 *   - RDL 3/2016: introduccion de limite cuantitativo (70%) desde 2016
 *   - TRLIS art. 25 (anterior): bases negativas pre-2015 sin limite temporal
 *
 * COMPENSACION DE BINS (LIS art. 26 — vigente 2025):
 *
 *   DERECHO A COMPENSAR: Las BINs de ejercicios anteriores pueden compensarse
 *   con las bases imponibles positivas de ejercicios futuros SIN LIMITE TEMPORAL
 *   (desde 2015, con la LIS). Las generadas antes de 2015 tampoco prescriben.
 *
 *   LIMITE DE COMPENSACION ANUAL (art. 26.1):
 *   El importe compensado en un ejercicio no puede superar:
 *
 *   a) IMN (cifra de negocios < 20 M EUR el ano anterior):
 *      Sin limite cuantitativo — puede compensarse el 100% de la BI positiva
 *      PERO: con BINs de contribuyentes con volumen > 20M EUR hay limite
 *
 *   b) VO entre 20 M EUR y 60 M EUR (ano anterior):
 *      Limite = 50% de la base imponible positiva previa a compensacion
 *
 *   c) VO >= 60 M EUR (ano anterior):
 *      Limite = 25% de la base imponible positiva previa a compensacion
 *
 *   d) PARA TODOS: el importe minimo siempre compensable es 1.000.000 EUR
 *      (aunque el 70% de la BI sea inferior a esa cantidad)
 *
 *   NOTA: La reforma de 2023 introdujo ademas un limite general del 70%
 *   para las grandes empresas (VO > 20 M EUR). Para PYMES (VO < 20 M EUR)
 *   NO hay limite porcentual — compensacion al 100%.
 *
 * ACREDITACION: La empresa debe acreditar (conservar documentacion) de las
 * BINs durante el plazo de prescripcion (generalmente 10 anos desde la
 * declaracion) y durante todo el periodo de compensacion.
 *
 * Fuente: LIS art. 26 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_pago_fraccionado
 */

// --- Constantes ---

const UMBRAL_VO_GRANDE_1 = 20_000_000;    // EUR — limite 50%
const UMBRAL_VO_GRANDE_2 = 60_000_000;    // EUR — limite 25%
const PCT_LIMITE_VO_GRANDE_1 = 50;        // % BI positiva
const PCT_LIMITE_VO_GRANDE_2 = 25;        // % BI positiva
const MINIMO_COMPENSABLE = 1_000_000;     // EUR — siempre compensable (para grandes empresas)

// --- Tipos publicos ---

export interface BINEjercicio {
  ejercicio: number;
  importeBIN: number;
  /** Ya compensado en ejercicios anteriores (EUR) */
  importeYaCompensado?: number;
}

export interface ParametrosCompensacionBasesNegativasIS {
  /** Base imponible positiva del ejercicio actual antes de compensacion (EUR) */
  baseImponiblePositiva: number;
  /** Volumen de operaciones del ejercicio anterior (EUR) — para determinar el limite */
  volumenOperacionesAnioAnterior: number;
  /** BINs pendientes de compensar, ordenadas de mas antigua a mas reciente */
  binsAnteriores: BINEjercicio[];
  /** Tipo IS del contribuyente (%) — para calcular cuota */
  tipoIS?: number;
}

export interface DetalleCompensacionBIN {
  ejercicio: number;
  importeBINDisponible: number;
  importeCompensadoEsteAnio: number;
  importePendienteTrasBanio: number;
}

export interface ResultadoCompensacionBasesNegativasIS {
  baseImponiblePositiva: number;
  volumenOperaciones: number;
  /** Regimen de limite aplicable */
  regimenLimite: 'sin_limite' | 'limite_50pct' | 'limite_25pct';
  /** Importe maximo compensable este ejercicio (EUR) */
  maxCompensableEjercicio: number;
  /** Total BINs disponibles antes de compensar */
  totalBINsDisponibles: number;
  detalleCompensacion: DetalleCompensacionBIN[];
  /** Total compensado en este ejercicio (EUR) */
  totalCompensado: number;
  /** BINs que quedan pendientes tras la compensacion (EUR) */
  totalBINsPendientesRestantes: number;
  /** Base imponible tras compensacion (EUR) */
  baseImponibleTrasBins: number;
  /** Cuota IS sobre la base tras compensacion (EUR) */
  cuotaISTrasCompensacion: number;
  /** Cuota IS sin compensacion (referencia) */
  cuotaISSinCompensacion: number;
  /** Ahorro fiscal por compensacion (EUR) */
  ahorroFiscal: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularCompensacionBasesNegativasIS(
  p: ParametrosCompensacionBasesNegativasIS
): ResultadoCompensacionBasesNegativasIS {
  if (p.baseImponiblePositiva <= 0) throw new Error('La base imponible positiva debe ser mayor que cero.');
  if (p.volumenOperacionesAnioAnterior < 0) throw new Error('El volumen de operaciones no puede ser negativo.');
  if (!p.binsAnteriores || p.binsAnteriores.length === 0) throw new Error('Debe indicar al menos una BIN anterior.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoIS = p.tipoIS ?? 25;

  // Determinar limite y regimen
  let regimenLimite: 'sin_limite' | 'limite_50pct' | 'limite_25pct';
  let maxCompensableEjercicio: number;
  const vo = p.volumenOperacionesAnioAnterior;

  if (vo < UMBRAL_VO_GRANDE_1) {
    regimenLimite = 'sin_limite';
    maxCompensableEjercicio = r(p.baseImponiblePositiva); // 100%
  } else if (vo < UMBRAL_VO_GRANDE_2) {
    regimenLimite = 'limite_50pct';
    maxCompensableEjercicio = r(Math.max(
      p.baseImponiblePositiva * PCT_LIMITE_VO_GRANDE_1 / 100,
      MINIMO_COMPENSABLE
    ));
  } else {
    regimenLimite = 'limite_25pct';
    maxCompensableEjercicio = r(Math.max(
      p.baseImponiblePositiva * PCT_LIMITE_VO_GRANDE_2 / 100,
      MINIMO_COMPENSABLE
    ));
  }

  // Calcular BINs disponibles (FIFO — primero las mas antiguas)
  let totalBINsDisponibles = 0;
  const binsOrdenadas = [...p.binsAnteriores].sort((a, b) => a.ejercicio - b.ejercicio);
  const binsConDisponible = binsOrdenadas.map(bin => {
    const disponible = r(bin.importeBIN - (bin.importeYaCompensado ?? 0));
    totalBINsDisponibles += disponible;
    return { ...bin, disponible };
  });
  totalBINsDisponibles = r(totalBINsDisponibles);

  // Compensar FIFO hasta el maximo permitido
  let restanteACompensar = Math.min(maxCompensableEjercicio, totalBINsDisponibles);
  const detalleCompensacion: DetalleCompensacionBIN[] = [];
  let totalCompensado = 0;

  for (const bin of binsConDisponible) {
    const compensadoEsteBin = r(Math.min(bin.disponible, restanteACompensar));
    const pendiente = r(bin.disponible - compensadoEsteBin);
    detalleCompensacion.push({
      ejercicio: bin.ejercicio,
      importeBINDisponible: r(bin.disponible),
      importeCompensadoEsteAnio: compensadoEsteBin,
      importePendienteTrasBanio: pendiente,
    });
    totalCompensado += compensadoEsteBin;
    restanteACompensar -= compensadoEsteBin;
    if (restanteACompensar <= 0) break;
  }
  totalCompensado = r(totalCompensado);
  const totalBINsPendientesRestantes = r(totalBINsDisponibles - totalCompensado);
  const baseImponibleTrasBins = r(p.baseImponiblePositiva - totalCompensado);
  const cuotaISSinCompensacion = r(p.baseImponiblePositiva * tipoIS / 100);
  const cuotaISTrasCompensacion = r(baseImponibleTrasBins * tipoIS / 100);
  const ahorroFiscal = r(cuotaISSinCompensacion - cuotaISTrasCompensacion);

  if (regimenLimite !== 'sin_limite') {
    advertencias.push(
      'LIMITE DE COMPENSACION: el volumen de operaciones (' + vo.toLocaleString('es-ES') + ' EUR) ' +
      'supera el umbral de ' + (regimenLimite === 'limite_50pct' ? '20' : '60') + ' M EUR. ' +
      'Solo puede compensar el ' + (regimenLimite === 'limite_50pct' ? '50' : '25') + '% ' +
      'de la base imponible positiva, con un minimo de 1.000.000 EUR.'
    );
    if (totalBINsDisponibles > maxCompensableEjercicio) {
      advertencias.push(
        'El exceso de BINs no compensable en este ejercicio (' +
        (totalBINsDisponibles - maxCompensableEjercicio).toLocaleString('es-ES') + ' EUR) ' +
        'queda pendiente para ejercicios futuros. No hay limite temporal para su compensacion.'
      );
    }
  }
  advertencias.push(
    'ORDEN DE COMPENSACION FIFO: se compensan primero las BINs mas antiguas, ' +
    'segun criterio de la AEAT para maximizar la compensacion efectiva.'
  );
  advertencias.push(
    'DOCUMENTACION: las BINs deben estar acreditadas con la declaracion original del IS del ' +
    'ejercicio en que se generaron, y mantenerse durante todo el periodo de compensacion ' +
    'mas el plazo de prescripcion (10 anos desde la presentacion).'
  );
  if (totalBINsPendientesRestantes > 0) {
    advertencias.push(
      'Quedan ' + totalBINsPendientesRestantes.toLocaleString('es-ES') + ' EUR de BINs ' +
      'pendientes de compensar en ejercicios futuros (sin limite temporal).'
    );
  }

  return {
    baseImponiblePositiva: r(p.baseImponiblePositiva),
    volumenOperaciones: r(vo),
    regimenLimite,
    maxCompensableEjercicio,
    totalBINsDisponibles,
    detalleCompensacion,
    totalCompensado,
    totalBINsPendientesRestantes,
    baseImponibleTrasBins,
    cuotaISTrasCompensacion,
    cuotaISSinCompensacion,
    ahorroFiscal,
    advertencias,
    fuenteDatos: 'LIS art. 26 — vigente 2025',
  };
}
