/**
 * Calculadora del Impuesto de Sucesiones (ISD) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_sucesiones)
 *
 * Fuente: Ley 29/1987 ISD + normativas autonómicas 2025
 * Cubre: 17 CCAA, tarifa estatal (7 tramos), tarifa propia Cataluña,
 *        coeficientes multiplicadores, reducciones y bonificaciones autonómicas.
 *
 * Nota: Solo calcula el impuesto sobre la herencia del beneficiario individual,
 * no el reparto de la masa hereditaria ni las legitimas.
 */

import {
  TARIFA_ESTATAL_IS,
  TARIFA_CATALUNA_IS,
  COEFICIENTES_IS,
  COEFICIENTES_CATALUNA_IS,
  REDUCCIONES_PARENTESCO_IS,
  REDUCCIONES_PARENTESCO_CATALUNA_IS,
  REDUCCION_DISCAPACIDAD_33_IS,
  REDUCCION_DISCAPACIDAD_65_IS,
  REDUCCION_EDAD_MENOR_21_IS,
  REDUCCION_EDAD_MENOR_21_MAX_IS,
  REDUCCION_SEGURO_VIDA_MAX_IS,
  REDUCCION_VIVIENDA_PORC_IS,
  REDUCCION_VIVIENDA_MAX_IS,
  PORC_AJUAR_DOMESTICO_IS,
  BONIFICACIONES_CCAA_IS,
  FISCAL_SUCESIONES_META,
  type TramoTarifaIS,
  type BonificacionGrupoIS,
} from '@/data/fiscal';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type GrupoParentescoIS =
  | 'I-conyuge'
  | 'I-descendiente'
  | 'II'
  | 'II-ascendiente'
  | 'III'
  | 'IV';

export type NivelDiscapacidadIS = '0' | '33' | '65';

/** 1–4: ninguno/bajo/medio/alto (rangos de patrimonio preexistente) */
export type IndicePatrimonioIS = 1 | 2 | 3 | 4;

export interface ParametrosSucesiones {
  /** Valor neto de la herencia recibida por este beneficiario (en euros) */
  baseImponible: number;
  /** Comunidad autónoma del causante (clave de BONIFICACIONES_CCAA_IS) */
  ccaa: string;
  /** Grupo de parentesco del heredero */
  grupo: GrupoParentescoIS;
  /** Edad del heredero (relevante si es menor de 21 para reducción adicional) */
  edadHeredero?: number;
  /** Grado de discapacidad del heredero */
  discapacidad?: NivelDiscapacidadIS;
  /**
   * Índice de patrimonio preexistente del heredero:
   * 1 = 0–402.678 €, 2 = 402.678–2.007.380 €,
   * 3 = 2.007.380–4.020.770 €, 4 = más de 4.020.770 €
   */
  patrimonioIdx?: IndicePatrimonioIS;
  /** Valor de la vivienda habitual incluida en la herencia (para reducción 95%) */
  viviendaHabitual?: number;
  /** Importe del seguro de vida recibido (reducción hasta 9.195,49 €) */
  seguroVida?: number;
  /** Si se incluye el ajuar doméstico en la base (3% masa hereditaria) */
  incluyeAjuar?: boolean;
}

export interface ResultadoSucesiones {
  baseImponible: number;
  ajuarDomestico: number;
  baseImponibleConAjuar: number;
  reduccionParentesco: number;
  reduccionEdadMenor21: number;
  reduccionDiscapacidad: number;
  reduccionVivienda: number;
  reduccionSeguroVida: number;
  totalReducciones: number;
  baseLiquidable: number;
  cuotaIntegra: number;
  coeficienteMultiplicador: number;
  cuotaTributaria: number;
  bonificacionCcaa: number;
  porcentajeBonificacion: number;
  detalleBonificacion: string;
  cuotaFinal: number;
  tipoEfectivo: number;
  ccaaNombre: string;
  esForal: boolean;
  tarifaAplicada: string;
  notasCcaa: string;
  fuenteDatos: string;
}

// ─── Helpers privados ──────────────────────────────────────────────────────────

function calcularTarifa(base: number, tarifa: TramoTarifaIS[]): number {
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

function getGrupoBase(grupo: GrupoParentescoIS): 'I' | 'II' | 'III' | 'IV' {
  if (grupo === 'I-conyuge' || grupo === 'I-descendiente') return 'I';
  if (grupo === 'II' || grupo === 'II-ascendiente') return 'II';
  if (grupo === 'III') return 'III';
  return 'IV';
}

function aplicarBonificacionIS(
  cuotaTributaria: number,
  baseLiquidable: number,
  grupo: GrupoParentescoIS,
  ccaa: string,
): { bonificacion: number; porcentaje: number; detalle: string } {
  const config = BONIFICACIONES_CCAA_IS[ccaa];
  if (!config) return { bonificacion: 0, porcentaje: 0, detalle: 'CCAA no configurada' };

  const bGrupo: BonificacionGrupoIS | undefined = config.bonificaciones[grupo];
  if (!bGrupo) return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación para este grupo' };

  // Reducción adicional en base (Asturias)
  if (bGrupo.reduccionBase !== undefined && bGrupo.reduccionBase > 0) {
    return { bonificacion: 0, porcentaje: 0, detalle: `Reducción adicional en base: ${bGrupo.reduccionBase.toLocaleString('es-ES')} € (${config.nombre})` };
  }

  // Bonificación escalonada (Castilla-La Mancha, Cantabria)
  if (bGrupo.escalonado && bGrupo.escalonado.length > 0) {
    let pct = 0;
    for (const tramo of bGrupo.escalonado) {
      if (tramo.hasta !== undefined && baseLiquidable <= tramo.hasta) { pct = tramo.porcentaje; break; }
      if (tramo.desde !== undefined && baseLiquidable > tramo.desde) { pct = tramo.porcentaje; }
    }
    const bonif = cuotaTributaria * pct;
    return { bonificacion: bonif, porcentaje: pct * 100, detalle: `Bonificación escalonada ${(pct * 100).toFixed(0)}% (${config.nombre})` };
  }

  // Exención total por importe (Andalucía, Galicia: base ≤ 1.000.000 €)
  if (bGrupo.exencion !== undefined && baseLiquidable <= bGrupo.exencion) {
    return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total (base liquidable ≤ ${bGrupo.exencion.toLocaleString('es-ES')} €)` };
  }

  // Exención con límite máximo (Aragón: hasta 3M€)
  if (bGrupo.porcentaje === 1 && bGrupo.limite !== null && bGrupo.limite !== undefined) {
    if (baseLiquidable <= bGrupo.limite) {
      return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total hasta ${bGrupo.limite.toLocaleString('es-ES')} € (${config.nombre})` };
    }
    const bonif = cuotaTributaria * 1;
    return { bonificacion: bonif, porcentaje: 100, detalle: `Exención total (${config.nombre})` };
  }

  // Bonificación con tope de base (La Rioja)
  if (bGrupo.tope !== undefined && bGrupo.porcentajeMayor !== undefined) {
    const pct = baseLiquidable <= bGrupo.tope ? (bGrupo.porcentaje ?? 0) : bGrupo.porcentajeMayor;
    const bonif = cuotaTributaria * pct;
    return { bonificacion: bonif, porcentaje: pct * 100, detalle: `Bonificación ${(pct * 100).toFixed(0)}% (${config.nombre})` };
  }

  // Bonificación fija
  if (bGrupo.porcentaje !== undefined && bGrupo.porcentaje > 0) {
    const bonif = cuotaTributaria * bGrupo.porcentaje;
    return { bonificacion: bonif, porcentaje: bGrupo.porcentaje * 100, detalle: `Bonificación ${(bGrupo.porcentaje * 100).toFixed(0)}% (${config.nombre})` };
  }

  return { bonificacion: 0, porcentaje: 0, detalle: 'Sin bonificación autonómica para este grupo' };
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularSucesion(p: ParametrosSucesiones): ResultadoSucesiones {
  if (p.baseImponible <= 0) throw new Error('La base imponible debe ser mayor que cero.');
  if (!BONIFICACIONES_CCAA_IS[p.ccaa]) {
    throw new Error(`CCAA no reconocida: "${p.ccaa}". Valores válidos: ${Object.keys(BONIFICACIONES_CCAA_IS).join(', ')}`);
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const esCataluna = p.ccaa === 'cataluna';
  const ccaaInfo = BONIFICACIONES_CCAA_IS[p.ccaa];
  const esForal = ccaaInfo.regimen === 'foral';
  const grupoBase = getGrupoBase(p.grupo);
  const discapacidad = p.discapacidad ?? '0';
  const patrimonioIdx = Math.min(4, Math.max(1, p.patrimonioIdx ?? 1)) - 1;
  const edad = p.edadHeredero;

  // 1. Ajuar doméstico (3% de la base si se incluye)
  const ajuarDomestico = p.incluyeAjuar ? r(p.baseImponible * PORC_AJUAR_DOMESTICO_IS) : 0;
  const baseConAjuar = r(p.baseImponible + ajuarDomestico);

  // 2. Reducción por parentesco
  const reduccionParentesco = esCataluna
    ? (REDUCCIONES_PARENTESCO_CATALUNA_IS[p.grupo] ?? 0)
    : (REDUCCIONES_PARENTESCO_IS[p.grupo] ?? 0);

  // 3. Reducción por edad (menor de 21, solo régimen común)
  let reduccionEdadMenor21 = 0;
  if (!esCataluna && edad !== undefined && edad < 21 && (grupoBase === 'I' || grupoBase === 'II')) {
    const aniosDevida = 21 - edad;
    reduccionEdadMenor21 = Math.min(
      reduccionParentesco + aniosDevida * REDUCCION_EDAD_MENOR_21_IS,
      REDUCCION_EDAD_MENOR_21_MAX_IS,
    ) - reduccionParentesco;
    reduccionEdadMenor21 = Math.max(0, r(reduccionEdadMenor21));
  }

  // 4. Reducción por discapacidad
  let reduccionDiscapacidad = 0;
  if (discapacidad === '33') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_33_IS;
  else if (discapacidad === '65') reduccionDiscapacidad = REDUCCION_DISCAPACIDAD_65_IS;

  // 5. Reducción vivienda habitual (95%, máx 122.606,47 € por heredero)
  const reduccionVivienda = p.viviendaHabitual
    ? r(Math.min(p.viviendaHabitual * REDUCCION_VIVIENDA_PORC_IS, REDUCCION_VIVIENDA_MAX_IS))
    : 0;

  // 6. Reducción seguro de vida (100% cónyuge/descendientes/ascendientes, tope 9.195,49 €)
  let reduccionSeguroVida = 0;
  if (p.seguroVida && (grupoBase === 'I' || grupoBase === 'II')) {
    reduccionSeguroVida = r(Math.min(p.seguroVida, REDUCCION_SEGURO_VIDA_MAX_IS));
  }

  const totalReducciones = r(reduccionParentesco + reduccionEdadMenor21 + reduccionDiscapacidad + reduccionVivienda + reduccionSeguroVida);
  const baseLiquidable = r(Math.max(0, baseConAjuar - totalReducciones));

  // 7. Tarifa
  let tarifa: TramoTarifaIS[];
  let tarifaAplicada: string;
  if (esCataluna) {
    tarifa = TARIFA_CATALUNA_IS;
    tarifaAplicada = 'Tarifa propia Cataluña (7%–32%)';
  } else {
    tarifa = TARIFA_ESTATAL_IS;
    tarifaAplicada = 'Tarifa estatal régimen común (7,65%–25,5%)';
  }

  const cuotaIntegra = r(calcularTarifa(baseLiquidable, tarifa));

  // 8. Coeficiente multiplicador
  const coefs = esCataluna ? COEFICIENTES_CATALUNA_IS : COEFICIENTES_IS;
  const coeficienteMultiplicador = coefs[grupoBase]?.[patrimonioIdx] ?? 1;
  const cuotaTributaria = r(cuotaIntegra * coeficienteMultiplicador);

  // 9. Bonificación autonómica
  const { bonificacion, porcentaje, detalle } = aplicarBonificacionIS(cuotaTributaria, baseLiquidable, p.grupo, p.ccaa);
  const cuotaFinal = r(Math.max(0, cuotaTributaria - bonificacion));
  const tipoEfectivo = r(p.baseImponible > 0 ? (cuotaFinal / p.baseImponible) * 100 : 0);

  return {
    baseImponible:            r(p.baseImponible),
    ajuarDomestico,
    baseImponibleConAjuar:    baseConAjuar,
    reduccionParentesco:      r(reduccionParentesco),
    reduccionEdadMenor21:     r(reduccionEdadMenor21),
    reduccionDiscapacidad:    r(reduccionDiscapacidad),
    reduccionVivienda,
    reduccionSeguroVida,
    totalReducciones,
    baseLiquidable,
    cuotaIntegra,
    coeficienteMultiplicador,
    cuotaTributaria,
    bonificacionCcaa:         r(bonificacion),
    porcentajeBonificacion:   r(porcentaje),
    detalleBonificacion:      detalle,
    cuotaFinal,
    tipoEfectivo,
    ccaaNombre:               ccaaInfo.nombre,
    esForal,
    tarifaAplicada,
    notasCcaa:                ccaaInfo.notas,
    fuenteDatos:              `${FISCAL_SUCESIONES_META.fuente} — verificado ${FISCAL_SUCESIONES_META.verificado}`,
  };
}
