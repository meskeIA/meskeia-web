/**
 * Calculadora del Regimen Simplificado de IVA (Modulos)
 * Usada por: MCP server (calcular_regimen_simplificado_iva)
 *
 * Calcula la cuota de IVA trimestral a ingresar por los contribuyentes
 * acogidos al regimen simplificado (modulos), que tributan por estimacion
 * objetiva en IRPF y por regimen simplificado en IVA.
 *
 * Marco normativo:
 *   - LIVA arts. 122-129: regimen simplificado de IVA
 *   - RIVA arts. 37-43: desarrollo reglamentario
 *   - Orden anual del Ministerio de Hacienda: modulos y cuotas anuales
 *   - Orden HFP/1166/2024: modulos para 2025
 *
 * ESTRUCTURA DEL REGIMEN SIMPLIFICADO:
 *
 *   IVA DEVENGADO (repercutido):
 *     Se calcula como CUOTA DEVENGADA POR OPERACIONES CORRIENTES (CDOC)
 *     La CDOC se obtiene multiplicando el indice de cada modulo por su
 *     cuota unitaria anual (fijada por la Orden Ministerial).
 *     La CDOC ya incluye el IVA que se debe a Hacienda.
 *
 *   IVA SOPORTADO (deducible):
 *     El contribuyente puede deducir el IVA soportado en adquisiciones
 *     de bienes y servicios corrientes (art. 123.Uno.B).
 *     Existe un minimo del 1% sobre la CDOC.
 *
 *   CUOTA TRIMESTRAL A INGRESAR:
 *     T1, T2, T3: (CDOC anual / 4) - IVA soportado trimestral
 *     T4: Liquidacion anual: CDOC - IVA soportado anual + ajustes
 *
 *   CUOTA MINIMA:
 *     La cuota a ingresar no puede ser negativa (exceso de IVA soportado
 *     no genera devolucion en simplificado, salvo activos fijos).
 *
 * LIMITES DE EXCLUSION (Orden HFP/1166/2024):
 *   - Volumen de ingresos del conjunto de actividades: <= 250.000 EUR (desde 2023)
 *   - Volumen de adquisiciones e importaciones: <= 250.000 EUR
 *   - Actividades agricolas, forestales y ganaderas: <= 250.000 EUR
 *   Superados estos limites → exclusion automatica al ano siguiente.
 *
 * ACTIVIDADES EXCLUIDAS DEL REGIMEN SIMPLIFICADO:
 *   - Empresarios con facturacion a otras empresas > 125.000 EUR en el ejercicio anterior
 *   - Actividades no incluidas en la Orden de Modulos
 *
 * Fuente: LIVA arts. 122-129 + RIVA arts. 37-43 + Orden HFP/1166/2024 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_autonomos_cuota_ss, calcular_prorrata_iva
 */

// --- Constantes ---

const LIMITE_EXCLUSION_INGRESOS = 250_000;  // EUR desde 2023
const LIMITE_EXCLUSION_COMPRAS = 250_000;   // EUR
const MIN_IVA_SOPORTADO_PCT = 1;            // % de la CDOC anual como minimo de IVA soportado deducible

// --- Tipos publicos ---

export type TrimestreISP = 1 | 2 | 3 | 4;

export interface ParametrosRegimenSimplificadoIVA {
  /**
   * Cuota devengada por operaciones corrientes ANUAL (EUR)
   * Segun los modulos de la actividad (dato de la Orden Ministerial para cada epigrafe IAE)
   */
  cuotaDevengadaAnual: number;
  /**
   * IVA soportado en operaciones corrientes del trimestre (EUR)
   * Compras de bienes y servicios de uso en la actividad
   */
  ivaSoportadoTrimestre: number;
  /**
   * IVA soportado adicional en el conjunto del ano (EUR)
   * Solo para liquidacion anual (T4). Incluye correcciones y regularizaciones.
   */
  ivaSoportadoAdicionalAnual?: number;
  /** Trimestre a liquidar (1, 2, 3 o 4) */
  trimestre: TrimestreISP;
  /**
   * Volumen de ingresos del ejercicio anterior (EUR)
   * Para verificar limites de exclusion
   */
  volumenIngresosPrevio?: number;
  /**
   * Volumen de compras del ejercicio anterior (EUR)
   */
  volumenComprasPrevio?: number;
}

export interface ResultadoRegimenSimplificadoIVA {
  trimestre: TrimestreISP;
  /** Cuota devengada trimestral (CDOC anual / 4) */
  cuotaDevengadaTrimestral: number;
  /** IVA soportado aplicable al trimestre (no puede superar CDOC - 1%) */
  ivaSoportadoAplicado: number;
  /** Cuota trimestral a ingresar en modelo 310/370 (EUR) */
  cuotaIngresar: number;
  /** Para T4: cuota anual total ya ingresada en T1+T2+T3 (si se proporciona) */
  cuotaAnualEstimada: number;
  /** Aviso si se acerca a los limites de exclusion */
  alertaLimite: boolean;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularRegimenSimplificadoIVA(
  p: ParametrosRegimenSimplificadoIVA
): ResultadoRegimenSimplificadoIVA {
  if (p.cuotaDevengadaAnual <= 0) throw new Error('La cuota devengada anual debe ser mayor que cero.');
  if (p.ivaSoportadoTrimestre < 0) throw new Error('El IVA soportado trimestral no puede ser negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const cuotaDevengadaTrimestral = r(p.cuotaDevengadaAnual / 4);

  // IVA soportado maximo: CDOC - minimo 1% de la CDOC anual
  // Es decir, el IVA soportado deducible no puede dejar la cuota por debajo del 1% de la CDOC
  const minimoACuota = r(p.cuotaDevengadaAnual * MIN_IVA_SOPORTADO_PCT / 100 / 4);
  const maxDeducibleTrimestre = r(cuotaDevengadaTrimestral - minimoACuota);
  const ivaSoportadoAplicado = r(Math.min(p.ivaSoportadoTrimestre, Math.max(0, maxDeducibleTrimestre)));
  const cuotaIngresar = r(Math.max(minimoACuota, cuotaDevengadaTrimestral - ivaSoportadoAplicado));
  const cuotaAnualEstimada = r(cuotaIngresar * 4);

  // Verificar limites de exclusion
  const ingPrev = p.volumenIngresosPrevio ?? 0;
  const compPrev = p.volumenComprasPrevio ?? 0;
  const alertaLimite = ingPrev > LIMITE_EXCLUSION_INGRESOS * 0.85 || compPrev > LIMITE_EXCLUSION_COMPRAS * 0.85;

  if (alertaLimite) {
    advertencias.push(
      'ALERTA LIMITES: el volumen de ingresos (' + ingPrev.toLocaleString('es-ES') + ' EUR) o compras ' +
      '(' + compPrev.toLocaleString('es-ES') + ' EUR) se acerca al limite de exclusion del regimen ' +
      'simplificado (' + LIMITE_EXCLUSION_INGRESOS.toLocaleString('es-ES') + ' EUR). ' +
      'Si se supera en el ejercicio en curso, la exclusion es efectiva el 1 de enero del ano siguiente.'
    );
  }
  if (ingPrev > LIMITE_EXCLUSION_INGRESOS || compPrev > LIMITE_EXCLUSION_COMPRAS) {
    advertencias.push(
      'EXCLUSION: el volumen de ingresos o compras supera el limite. ' +
      'Si esto ocurrio en el ejercicio anterior, el contribuyente ya deberia estar excluido ' +
      'del regimen simplificado y tributar por regimen general de IVA.'
    );
  }

  advertencias.push(
    'MODELO 310 (T1, T2, T3) o MODELO 370 (T4): los tres primeros trimestres se ingresan ' +
    'como pagos a cuenta. En el cuarto trimestre se hace la liquidacion anual final ' +
    'teniendo en cuenta el IVA soportado total del ejercicio y el IVA de los trimestres anteriores.'
  );
  if (p.trimestre === 4) {
    advertencias.push(
      'T4 — LIQUIDACION ANUAL: el cuarto trimestre es la regularizacion final. ' +
      'Debe calcularse la CDOC anual total menos el IVA soportado anual total, ' +
      'y descontar los ingresos ya realizados en T1, T2 y T3.'
    );
    if (p.ivaSoportadoAdicionalAnual && p.ivaSoportadoAdicionalAnual > 0) {
      advertencias.push(
        'IVA soportado adicional anual declarado: ' + p.ivaSoportadoAdicionalAnual.toLocaleString('es-ES') + ' EUR. ' +
        'Este importe debe incluirse en la casilla de IVA soportado de la liquidacion anual del modelo 370.'
      );
    }
  }
  advertencias.push(
    'La CDOC anual debe obtenerse de las tablas de la Orden HFP/1166/2024 para el epigrafe IAE ' +
    'concreto de la actividad, aplicando los modulos objetivos (personal, superficie, potencia, etc.).'
  );

  return {
    trimestre: p.trimestre,
    cuotaDevengadaTrimestral,
    ivaSoportadoAplicado,
    cuotaIngresar,
    cuotaAnualEstimada,
    alertaLimite,
    advertencias,
    fuenteDatos: 'LIVA arts. 122-129 + RIVA arts. 37-43 + Orden HFP/1166/2024 — vigente 2025',
  };
}
