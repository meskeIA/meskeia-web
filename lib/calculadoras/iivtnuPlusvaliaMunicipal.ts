/**
 * Calculadora del IIVTNU (Plusvalía Municipal) — lógica pura
 * Usada por: MCP server (calcular_iivtnu_plusvalia_municipal)
 *
 * Calcula el Impuesto sobre el Incremento del Valor de los Terrenos de
 * Naturaleza Urbana (IIVTNU), conocido como "plusvalía municipal", aplicando
 * los dos métodos de cálculo vigentes tras la STC 182/2021 del TC.
 *
 * Marco normativo:
 *   - TRLHL arts. 104-110 (RDL 2/2004)
 *   - RDL 26/2021 (reforma urgente tras STC 182/2021):
 *     * Método objetivo: coeficiente × valor catastral del suelo
 *     * Método real: incremento real × (V.C. suelo / V.C. total)
 *     * El contribuyente puede elegir el que resulte en menor cuota
 *   - STC 182/2021: no puede gravarse una transmisión sin incremento real de valor
 *   - STC 59/2017: no puede gravarse si no hay plusvalía real
 *
 * Coeficientes máximos RDL 26/2021 (actualizados por Ley 22/2021 y PGE):
 *   Cada municipio aplica sus coeficientes propios (≤ máximos estatales).
 *   Los coeficientes son por "años de generación" del incremento.
 *
 * Tipo impositivo máximo: 30% (art. 108 TRLHL).
 *   Cada ayuntamiento fija su propio tipo (≤ 30%).
 *
 * Fuente: TRLHL arts. 104-110 + RDL 26/2021 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_compraventa_inmueble, calcular_venta_inmueble, calcular_itp_ccaa
 */

// ─── Coeficientes máximos estatales 2025 ────────────────────────────────────
// Fuente: RDL 26/2021 (art. único, modificación art. 107.4 TRLHL)
// Índice = años completos de tenencia (1 a 20; >20 usa valor especial)

const COEFICIENTES_MAXIMOS: Record<number, number> = {
  1: 0.14,
  2: 0.13,
  3: 0.15,
  4: 0.16,
  5: 0.18,
  6: 0.19,
  7: 0.20,
  8: 0.21,
  9: 0.22,
  10: 0.22,
  11: 0.22,
  12: 0.21,
  13: 0.21,
  14: 0.21,
  15: 0.21,
  16: 0.21,
  17: 0.22,
  18: 0.23,
  19: 0.24,
  20: 0.30,
};
const COEFICIENTE_MAS_20_ANIOS = 0.45;
const TIPO_MAX_IIVTNU = 30; // % máximo legal

// ─── Tipos públicos ────────────────────────────────────────────────────────

export interface ParametrosIIVTNU {
  /** Valor catastral del suelo en la fecha de transmisión (€) */
  valorCatastralSuelo: number;
  /** Valor catastral total del inmueble (suelo + construcción) (€) */
  valorCatastralTotal: number;
  /**
   * Precio de adquisición original del inmueble (€).
   * Necesario para el método real (si no se indica, solo se aplica el objetivo).
   */
  precioAdquisicion?: number;
  /** Precio de transmisión (venta) del inmueble (€) */
  precioTransmision?: number;
  /** Años completos de tenencia (diferencia entre fecha adquisición y transmisión) */
  aniosTenencia: number;
  /**
   * Tipo impositivo municipal aplicable (%).
   * Si no se indica, se usa el máximo legal del 30%.
   * Consultar con el Ayuntamiento el tipo vigente.
   */
  tipoImpositivo?: number;
  /**
   * Coeficiente municipal aplicado (si el municipio usa uno inferior al máximo estatal).
   * Si no se indica, se usa el máximo estatal.
   */
  coeficienteMunicipal?: number;
}

export interface ResultadoIIVTNU {
  /** Años de tenencia */
  aniosTenencia: number;
  /** Coeficiente aplicado */
  coeficienteAplicado: number;
  /** Tipo impositivo aplicado (%) */
  tipoImpositivoAplicado: number;

  // Método objetivo (art. 107.1 bis TRLHL)
  /** Base imponible por método objetivo (€) */
  baseImponibleObjetivo: number;
  /** Cuota por método objetivo (€) */
  cuotaMetodoObjetivo: number;

  // Método real (art. 107.5 TRLHL) — solo si se aportan precios
  /** Incremento real de valor (€) — null si no se aportan precios */
  incrementoRealValor: number | null;
  /** Base imponible por método real (€) — null si no se aportan precios */
  baseImponibleReal: number | null;
  /** Cuota por método real (€) — null si no se aportan precios */
  cuotaMetodoReal: number | null;

  // Resultado final
  /** ¿Hay incremento real de valor? (si no, no se tributa) */
  hayIncrementoReal: boolean;
  /** Método más beneficioso para el contribuyente */
  metodoAplicable: 'objetivo' | 'real' | 'ninguno_sin_incremento';
  /** **Base imponible final (€)** */
  baseImponibleFinal: number;
  /** **Cuota IIVTNU a pagar (€)** */
  cuotaIIVTNU: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularIIVTNU(p: ParametrosIIVTNU): ResultadoIIVTNU {
  if (p.valorCatastralSuelo <= 0) throw new Error('El valor catastral del suelo debe ser mayor que cero.');
  if (p.valorCatastralTotal <= 0) throw new Error('El valor catastral total debe ser mayor que cero.');
  if (p.valorCatastralSuelo > p.valorCatastralTotal) throw new Error('El valor catastral del suelo no puede superar el total.');
  if (p.aniosTenencia < 0) throw new Error('Los años de tenencia no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const anios = Math.min(p.aniosTenencia, 20);
  const coefMax = anios === 0
    ? COEFICIENTES_MAXIMOS[1]  // menos de 1 año → coeficiente del año 1
    : (p.aniosTenencia > 20 ? COEFICIENTE_MAS_20_ANIOS : (COEFICIENTES_MAXIMOS[anios] ?? COEFICIENTE_MAS_20_ANIOS));

  const coeficienteAplicado = p.coeficienteMunicipal !== undefined
    ? Math.min(p.coeficienteMunicipal, coefMax)
    : coefMax;

  const tipoImpositivo = p.tipoImpositivo !== undefined
    ? Math.min(p.tipoImpositivo, TIPO_MAX_IIVTNU)
    : TIPO_MAX_IIVTNU;

  // ── Método objetivo ────────────────────────────────────────────────────────
  const baseImponibleObjetivo = r(p.valorCatastralSuelo * coeficienteAplicado);
  const cuotaMetodoObjetivo = r(baseImponibleObjetivo * tipoImpositivo / 100);

  // ── Método real ────────────────────────────────────────────────────────────
  let incrementoRealValor: number | null = null;
  let baseImponibleReal: number | null = null;
  let cuotaMetodoReal: number | null = null;
  let hayIncrementoReal = true;

  if (p.precioAdquisicion !== undefined && p.precioTransmision !== undefined) {
    incrementoRealValor = r(p.precioTransmision - p.precioAdquisicion);
    hayIncrementoReal = incrementoRealValor > 0;

    if (hayIncrementoReal) {
      const proporcionSuelo = p.valorCatastralSuelo / p.valorCatastralTotal;
      baseImponibleReal = r(incrementoRealValor * proporcionSuelo);
      cuotaMetodoReal = r(baseImponibleReal * tipoImpositivo / 100);
    } else {
      baseImponibleReal = 0;
      cuotaMetodoReal = 0;
    }
  }

  // ── Método aplicable ───────────────────────────────────────────────────────
  let metodoAplicable: 'objetivo' | 'real' | 'ninguno_sin_incremento';
  let baseImponibleFinal: number;
  let cuotaIIVTNU: number;

  if (!hayIncrementoReal) {
    metodoAplicable = 'ninguno_sin_incremento';
    baseImponibleFinal = 0;
    cuotaIIVTNU = 0;
    advertencias.push('No existe incremento real de valor: el precio de transmisión es igual o inferior al de adquisición. Conforme a la STC 182/2021, no existe hecho imponible y no se tributa por IIVTNU. Debe acreditarse ante el Ayuntamiento con la escritura de adquisición y transmisión.');
  } else if (cuotaMetodoReal !== null && cuotaMetodoReal < cuotaMetodoObjetivo) {
    metodoAplicable = 'real';
    baseImponibleFinal = baseImponibleReal!;
    cuotaIIVTNU = cuotaMetodoReal;
  } else {
    metodoAplicable = 'objetivo';
    baseImponibleFinal = baseImponibleObjetivo;
    cuotaIIVTNU = cuotaMetodoObjetivo;
  }

  // ── Advertencias ───────────────────────────────────────────────────────────
  advertencias.push('El IIVTNU lo liquida (o autoliquida, según el municipio) el vendedor/transmitente. En donaciones y herencias, es el adquirente quien tributa.');
  advertencias.push('Los coeficientes aplicados son los MÁXIMOS estatales. Su municipio puede aplicar coeficientes propios iguales o inferiores — consulte con el Ayuntamiento o el texto de su Ordenanza Fiscal.');
  if (p.tipoImpositivo === undefined) {
    advertencias.push(`Se ha aplicado el tipo impositivo máximo legal del ${TIPO_MAX_IIVTNU}%. El tipo real de su municipio puede ser inferior — verifique en la Ordenanza Fiscal municipal.`);
  }
  if (p.aniosTenencia === 0) {
    advertencias.push('Transmisión en menos de 1 año desde la adquisición: se aplica el coeficiente del tramo "hasta 1 año" (0,14). Compruebe si su municipio aplica norma específica para períodos inferiores al año.');
  }
  advertencias.push('Método real: para acogerse a él, el contribuyente debe probarlo aportando las escrituras de adquisición y transmisión. La base imponible real se calcula proporcionalmente al peso del suelo en el valor catastral total.');

  return {
    aniosTenencia: p.aniosTenencia,
    coeficienteAplicado,
    tipoImpositivoAplicado: tipoImpositivo,
    baseImponibleObjetivo,
    cuotaMetodoObjetivo,
    incrementoRealValor,
    baseImponibleReal,
    cuotaMetodoReal,
    hayIncrementoReal,
    metodoAplicable,
    baseImponibleFinal,
    cuotaIIVTNU,
    advertencias,
    fuenteDatos: 'TRLHL arts. 104-110 + RDL 26/2021 (STC 182/2021) — vigente 2025',
  };
}
