/**
 * Calculadora del Impuesto de Donaciones (ISD) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_donaciones)
 *
 * Fuente: Ley 29/1987 ISD + normativas autonómicas 2025
 * Cubre: 17 CCAA, tarifa estatal (16 tramos), tarifa propia Cataluña,
 *        coeficientes multiplicadores y bonificaciones autonómicas.
 */

import {
  TARIFA_ESTATAL_ID,
  TARIFA_CATALUNA_ID_GENERAL,
  TARIFA_CATALUNA_ID_REDUCIDA,
  COEFICIENTES_ID,
  COEFICIENTES_CATALUNA_ID,
  REDUCCIONES_PARENTESCO_ID,
  REDUCCION_DISCAPACIDAD_33_ID,
  REDUCCION_DISCAPACIDAD_65_ID,
  BONIFICACIONES_CCAA_ID,
  type TramoTarifaID,
  type BonificacionGrupoID,
} from '@/data/fiscal';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type GrupoParentesco =
  | 'I-conyuge'
  | 'I-descendiente'
  | 'II'
  | 'II-ascendiente'
  | 'III'
  | 'IV';

export type NivelDiscapacidad = '0' | '33' | '65';

/** 1–4: ninguno/bajo/medio/alto (rangos de patrimonio preexistente) */
export type IndicePatrimonio = 1 | 2 | 3 | 4;

export interface ParametrosDonaciones {
  /** Valor de la donación en euros */
  valorDonacion: number;
  /** Comunidad autónoma del donatario (clave de BONIFICACIONES_CCAA_ID) */
  ccaa: string;
  /** Grupo de parentesco del donatario */
  grupo: GrupoParentesco;
  /** Cargas deducibles en euros (hipotecas u otras cargas reales) */
  cargas?: number;
  /** Si la donación se formaliza en escritura pública (relevante en Cataluña y C-LM) */
  escrituraPublica?: boolean;
  /** Grado de discapacidad del donatario */
  discapacidad?: NivelDiscapacidad;
  /**
   * Índice de patrimonio preexistente del donatario:
   * 1 = 0–402.678 €, 2 = 402.678–2.007.380 €,
   * 3 = 2.007.380–4.020.770 €, 4 = más de 4.020.770 €
   */
  patrimonioIdx?: IndicePatrimonio;
}

export interface ResultadoDonaciones {
  /** Valor bruto de la donación */
  baseImponible: number;
  /** Cargas deducidas */
  cargas: number;
  /** baseImponible - cargas */
  baseLiquidable: number;
  /** Reducción por parentesco aplicada */
  reduccionParentesco: number;
  /** Reducción por discapacidad aplicada */
  reduccionDiscapacidad: number;
  /** Base sobre la que se aplica la tarifa */
  baseNetaReducida: number;
  /** Cuota antes del coeficiente multiplicador */
  cuotaIntegra: number;
  /** Coeficiente multiplicador aplicado */
  coeficienteMultiplicador: number;
  /** cuotaIntegra × coeficienteMultiplicador */
  cuotaTributaria: number;
  /** Importe de la bonificación autonómica */
  bonificacionCcaa: number;
  /** Porcentaje de bonificación autonómica (0–100) */
  porcentajeBonificacion: number;
  /** Descripción textual de la bonificación aplicada */
  detalleBonificacion: string;
  /** Cuota a pagar (cuotaTributaria - bonificacionCcaa) */
  cuotaFinal: number;
  /** Tipo efectivo sobre el valor total de la donación (%) */
  tipoEfectivo: number;
  /** Nombre de la CCAA */
  ccaaNombre: string;
  /** Si la CCAA tiene régimen foral (estimación aproximada) */
  esForal: boolean;
  /** Tarifa utilizada para el cálculo */
  tarifaAplicada: string;
  /** Notas de la CCAA (advertencias sobre regímenes forales, requisitos, etc.) */
  notasCcaa: string;
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

function calcularTarifa(base: number, tarifa: TramoTarifaID[]): number {
  if (base <= 0) return 0;
  let prevHasta = 0;
  for (const tramo of tarifa) {
    if (base <= tramo.hasta) {
      return tramo.cuota + (base - prevHasta) * (tramo.tipo / 100);
    }
    prevHasta = tramo.hasta;
  }
  return 0;
}

function getGrupoBase(grupo: GrupoParentesco): 'I' | 'II' | 'III' | 'IV' {
  if (grupo === 'I-conyuge' || grupo === 'I-descendiente') return 'I';
  if (grupo === 'II' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

function aplicarBonificacion(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: GrupoParentesco,
  ccaa: string,
  escrituraPublica: boolean
): { bonificacion: number; porcentaje: number; detalle: string } {
  const config = BONIFICACIONES_CCAA_ID[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const bGrupo: BonificacionGrupoID | undefined = config.bonificaciones[grupo];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };

  // Castilla-La Mancha requiere escritura pública
  if (config.requiereEscritura && !escrituraPublica) {
    return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación: requiere escritura pública notarial' };
  }

  // Exención total por importe (Andalucía: base ≤ 1.000.000 €)
  if (bGrupo.exencion !== undefined && baseLiquidable <= bGrupo.exencion) {
    return {
      bonificacion: cuotaTributaria,
      porcentaje: 100,
      detalle: `Exención total (base liquidable ≤ ${bGrupo.exencion.toLocaleString('es-ES')} €)`,
    };
  }

  // Bonificación fija por porcentaje
  if (bGrupo.porcentaje !== undefined && bGrupo.porcentaje > 0) {
    const bonif = cuotaTributaria * bGrupo.porcentaje;
    const pct = (bGrupo.porcentaje * 100).toFixed(1).replace('.0', '');
    return {
      bonificacion: bonif,
      porcentaje: bGrupo.porcentaje * 100,
      detalle: `Bonificación ${pct}% (${config.nombre})`,
    };
  }

  return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica para este grupo' };
}

// ─── Función principal ────────────────────────────────────────────────────────

export function calcularDonacion(p: ParametrosDonaciones): ResultadoDonaciones {
  if (p.valorDonacion <= 0) throw new Error('El valor de la donación debe ser mayor que cero.');
  if (!BONIFICACIONES_CCAA_ID[p.ccaa]) throw new Error(`CCAA no reconocida: "${p.ccaa}". Valores válidos: ${Object.keys(BONIFICACIONES_CCAA_ID).join(', ')}`);

  const cargasNum = Math.max(0, p.cargas ?? 0);
  const escrituraPublica = p.escrituraPublica ?? true;
  const discapacidad = p.discapacidad ?? '0';
  const patrimonioIdx = Math.min(4, Math.max(1, p.patrimonioIdx ?? 1)) - 1; // 0-based

  const ccaaInfo = BONIFICACIONES_CCAA_ID[p.ccaa];
  const esCataluna = p.ccaa === 'cataluna';
  const esForal = ccaaInfo.regimen === 'foral';
  const grupoBase = getGrupoBase(p.grupo);

  // 1. Base imponible
  const baseImponible = p.valorDonacion;

  // 2. Cargas deducibles → base liquidable
  const baseLiquidable = Math.max(0, baseImponible - cargasNum);

  // 3. Reducción por parentesco (no aplica en Cataluña — tiene tarifa propia)
  const reduccionParentesco = !esCataluna
    ? (REDUCCIONES_PARENTESCO_ID[p.grupo] ?? 0)
    : 0;

  // 4. Reducción por discapacidad
  let reduccionDiscapacidad = 0;
  if (discapacidad === '33') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_33_ID;
  else if (discapacidad === '65') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_65_ID;

  // 5. Base neta reducida
  const baseNetaReducida = Math.max(0, baseLiquidable - reduccionParentesco - reduccionDiscapacidad);

  // 6. Tarifa aplicable
  let tarifa: TramoTarifaID[];
  let tarifaAplicada: string;

  if (esCataluna) {
    const esGrupoReducido = grupoBase === 'I' || grupoBase === 'II';
    if (esGrupoReducido && escrituraPublica) {
      tarifa = TARIFA_CATALUNA_ID_REDUCIDA;
      tarifaAplicada = 'Tarifa reducida Cataluña (5%–9%, Grupos I/II con escritura pública)';
    } else {
      tarifa = TARIFA_CATALUNA_ID_GENERAL;
      tarifaAplicada = 'Tarifa general Cataluña (7%–32%)';
    }
  } else {
    tarifa = TARIFA_ESTATAL_ID;
    tarifaAplicada = 'Tarifa estatal régimen común (7,65%–34%)';
  }

  const cuotaIntegra = calcularTarifa(baseNetaReducida, tarifa);

  // 7. Coeficiente multiplicador por patrimonio preexistente
  const coefs = esCataluna ? COEFICIENTES_CATALUNA_ID : COEFICIENTES_ID;
  const coeficienteMultiplicador = coefs[grupoBase]?.[patrimonioIdx] ?? 1;

  const cuotaTributaria = cuotaIntegra * coeficienteMultiplicador;

  // 8. Bonificación autonómica
  const { bonificacion, porcentaje, detalle } = aplicarBonificacion(
    cuotaTributaria, baseLiquidable, p.grupo, p.ccaa, escrituraPublica
  );

  const cuotaFinal = Math.max(0, cuotaTributaria - bonificacion);
  const tipoEfectivo = baseImponible > 0 ? (cuotaFinal / baseImponible) * 100 : 0;

  return {
    baseImponible: Math.round(baseImponible * 100) / 100,
    cargas: Math.round(cargasNum * 100) / 100,
    baseLiquidable: Math.round(baseLiquidable * 100) / 100,
    reduccionParentesco: Math.round(reduccionParentesco * 100) / 100,
    reduccionDiscapacidad: Math.round(reduccionDiscapacidad * 100) / 100,
    baseNetaReducida: Math.round(baseNetaReducida * 100) / 100,
    cuotaIntegra: Math.round(cuotaIntegra * 100) / 100,
    coeficienteMultiplicador,
    cuotaTributaria: Math.round(cuotaTributaria * 100) / 100,
    bonificacionCcaa: Math.round(bonificacion * 100) / 100,
    porcentajeBonificacion: Math.round(porcentaje * 100) / 100,
    detalleBonificacion: detalle,
    cuotaFinal: Math.round(cuotaFinal * 100) / 100,
    tipoEfectivo: Math.round(tipoEfectivo * 100) / 100,
    ccaaNombre: ccaaInfo.nombre,
    esForal,
    tarifaAplicada,
    notasCcaa: ccaaInfo.notas,
  };
}
