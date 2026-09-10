/**
 * Calculadora del IIVTNU (Plusvalía Municipal) — lógica pura
 * Usada por: /chatgpt/plusvalia-municipal
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
 *   Los coeficientes son por "años de generación" del incremento, y NO viven aquí:
 *   son los de `COEFICIENTES_IIVTNU_2025` en `data/fiscal/inmuebles.ts`.
 *
 * Tipo impositivo máximo: 30% (art. 108 TRLHL), sellado en PLUSVALIA_MUNICIPAL_META.
 *   Cada ayuntamiento fija su propio tipo (≤ 30%).
 *
 * Fuente: TRLHL arts. 104-110 + RDL 26/2021 — vía data/fiscal (módulo sellado)
 *
 * Encadenable con: calcular_compraventa_inmueble, calcular_venta_inmueble, calcular_itp_ccaa
 */

import { COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META } from '@/data/fiscal';

// ─── Coeficientes máximos estatales ─────────────────────────────────────────
// La tabla NO se copia aquí: es `COEFICIENTES_IIVTNU_2025` de `data/fiscal/inmuebles.ts`,
// el módulo sellado (fuente oficial + fecha de verificación) que ya usan la app
// `estimador-plusvalia-municipal`, la ficha de `delegum/datos-fiscales/plusvalia-municipal`,
// `ventaInmueble.ts` y `compraventa.ts`.
//
// Hasta el 09/09/2026 este motor llevaba su propia copia `COEFICIENTES_MAXIMOS`, que citaba
// la MISMA fuente y la MISMA fecha de sellado y no coincidía con ella en 20 de los 21 tramos:
// la de data/fiscal tiene la forma de U del RDL 26/2021 (0,14 al inicio → mínimo 0,08 en los
// años 10-13 → 0,45 a los 20) y la del motor era casi plana. Como este es justo el motor que
// alimenta /api/chatgpt/plusvalia-municipal y el MCP, meskeIA publicaba dos plusvalías
// distintas del mismo inmueble según se preguntara por la web o por un LLM.

/** Tipo impositivo máximo legal (art. 108 TRLHL), tomado del módulo sellado. */
const TIPO_MAX_IIVTNU = PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal; // % máximo legal

/**
 * Coeficiente máximo estatal para unos años de tenencia.
 *
 * Aplica el MISMO clamp que la app y el resto de motores (`compraventa.ts:231`):
 *   - `Math.floor`: los tramos del art. 107.4 TRLHL son años COMPLETOS, así que «7,5 años»
 *     tributa por el tramo de 7. Sin el floor, indexar por 7,5 no encontraba tramo y el
 *     fallback mandaba al 0,45 —el máximo de la escala—, en contra del contribuyente.
 *   - Tope en 20: el último tramo de la tabla es «20 o más años» (0,45), de modo que 20
 *     años exactos ya son 0,45 y no un tramo intermedio.
 *   - Suelo en 0: la fila `anios: 0` es «Menos de 1 año» (0,14), y ahí entra también
 *     medio año, que antes no casaba con la comparación `=== 0`.
 */
function coeficienteMaximoEstatal(aniosTenencia: number): number {
  const anios = Math.min(Math.max(0, Math.floor(aniosTenencia)), 20);
  const entrada = COEFICIENTES_IIVTNU_2025.find(c => c.anios === anios)
    ?? COEFICIENTES_IIVTNU_2025[COEFICIENTES_IIVTNU_2025.length - 1];
  return entrada.coeficiente;
}

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
  /**
   * ¿Se ha podido COMPROBAR si hay incremento real de valor?
   * Solo es `true` cuando se aportan AMBOS precios (adquisición y transmisión).
   * Si es `false`, la sujeción al impuesto está sin verificar y `hayIncrementoReal`
   * no afirma nada: significa «no consta».
   */
  incrementoRealComprobado: boolean;
  /**
   * ¿Hay incremento real de valor? (si no, no se tributa — art. 104.5 TRLHL).
   * Es una afirmación SOLO cuando `incrementoRealComprobado` es `true`.
   * Sin precios se devuelve `false` («no consta»), nunca `true`.
   */
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
  // ── Entradas imposibles: se rechazan en vez de calcular sobre ellas ────────
  // Un NaN, un Infinity o un negativo que llegan al final salen convertidos en cuota,
  // y una cuota es una afirmación. `Math.min(...)` acotaba solo POR ARRIBA, así que un
  // tipo del −50 % devolvía una cuota de −4.400 € sin que nada protestara.
  if (!Number.isFinite(p.valorCatastralSuelo) || p.valorCatastralSuelo <= 0) throw new Error('El valor catastral del suelo debe ser un número finito mayor que cero.');
  if (!Number.isFinite(p.valorCatastralTotal) || p.valorCatastralTotal <= 0) throw new Error('El valor catastral total debe ser un número finito mayor que cero.');
  if (p.valorCatastralSuelo > p.valorCatastralTotal) throw new Error('El valor catastral del suelo no puede superar el total.');
  if (!Number.isFinite(p.aniosTenencia) || p.aniosTenencia < 0) throw new Error('Los años de tenencia deben ser un número finito y no negativo.');
  if (p.tipoImpositivo !== undefined && (!Number.isFinite(p.tipoImpositivo) || p.tipoImpositivo < 0)) throw new Error(`El tipo impositivo municipal debe ser un número finito entre 0 y ${TIPO_MAX_IIVTNU} %.`);
  if (p.coeficienteMunicipal !== undefined && (!Number.isFinite(p.coeficienteMunicipal) || p.coeficienteMunicipal < 0)) throw new Error('El coeficiente municipal debe ser un número finito y no negativo.');
  if (p.precioAdquisicion !== undefined && (!Number.isFinite(p.precioAdquisicion) || p.precioAdquisicion < 0)) throw new Error('El precio de adquisición debe ser un número finito y no negativo.');
  if (p.precioTransmision !== undefined && (!Number.isFinite(p.precioTransmision) || p.precioTransmision < 0)) throw new Error('El precio de transmisión debe ser un número finito y no negativo.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const coefMax = coeficienteMaximoEstatal(p.aniosTenencia);

  // El coeficiente municipal solo puede ser IGUAL O INFERIOR al máximo estatal
  // (art. 107.4 TRLHL); el negativo ya lo ha rechazado la validación de arriba.
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

  // `hayIncrementoReal` es la no sujeción del art. 104.5 TRLHL (STC 182/2021): un hecho
  // jurídico, no un detalle de cálculo, y este motor se lo entrega a un LLM. Hasta el
  // 09/09/2026 nacía en `true` y solo se desmentía si llegaban AMBOS precios, así que sin
  // ver un solo precio la API afirmaba «hay incremento real de valor». Ahora nace en
  // `false` = «no consta» y la comprobación se declara aparte, en `incrementoRealComprobado`.
  //
  // Ojo: «no consta» tampoco es «no sujeto». Por eso, sin precios, el motor SIGUE
  // devolviendo el cálculo objetivo (que es lo único que puede calcular) y añade una
  // advertencia diciendo que la sujeción no se ha verificado. Solo se declara la no
  // sujeción cuando los precios están y demuestran que no hubo incremento.
  const incrementoRealComprobado = p.precioAdquisicion !== undefined && p.precioTransmision !== undefined;
  let hayIncrementoReal = false;

  if (incrementoRealComprobado) {
    incrementoRealValor = r(p.precioTransmision! - p.precioAdquisicion!);
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

  if (incrementoRealComprobado && !hayIncrementoReal) {
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
  if (!incrementoRealComprobado) {
    advertencias.push('NO se ha comprobado si existe incremento real de valor: falta el precio de adquisición, el de transmisión o ambos. Sin los dos no puede verificarse la sujeción al impuesto (art. 104.5 TRLHL y STC 182/2021): si el inmueble se transmite por un precio igual o inferior al de adquisición, la operación NO está sujeta y la cuota calculada aquí no sería exigible. El campo "hayIncrementoReal" se devuelve como false porque NO CONSTA, no porque se haya descartado.');
  }
  advertencias.push('El IIVTNU lo liquida (o autoliquida, según el municipio) el vendedor/transmitente. En donaciones y herencias, es el adquirente quien tributa.');
  advertencias.push('Los coeficientes aplicados son los MÁXIMOS estatales (RDL 26/2021). Su municipio puede aplicar coeficientes propios iguales o inferiores — consulte con el Ayuntamiento o el texto de su Ordenanza Fiscal.');
  if (p.tipoImpositivo === undefined) {
    advertencias.push(`Se ha aplicado el tipo impositivo máximo legal del ${TIPO_MAX_IIVTNU}%. El tipo real de su municipio puede ser inferior — verifique en la Ordenanza Fiscal municipal.`);
  }
  if (p.aniosTenencia < 1) {
    // La fila `anios: 0` de COEFICIENTES_IIVTNU_2025 es «Menos de 1 año»: cubre también
    // medio año, que con la comparación `=== 0` anterior se quedaba fuera del aviso.
    advertencias.push(`Transmisión en menos de 1 año desde la adquisición: se aplica el coeficiente del tramo "menos de 1 año" (${coefMax.toLocaleString('es-ES')}). Compruebe si su municipio aplica norma específica para períodos inferiores al año.`);
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
    incrementoRealComprobado,
    hayIncrementoReal,
    metodoAplicable,
    baseImponibleFinal,
    cuotaIIVTNU,
    advertencias,
    fuenteDatos: `TRLHL arts. 104-110 + RDL 26/2021 (STC 182/2021) — coeficientes de data/fiscal/inmuebles.ts, vigencia ${PLUSVALIA_MUNICIPAL_META.vigencia}, verificados el ${PLUSVALIA_MUNICIPAL_META.verificado}`,
  };
}
