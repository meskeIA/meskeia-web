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
  /**
   * ¿El heredero convivió con el causante los dos años anteriores al fallecimiento?
   *
   * Solo importa para el pariente COLATERAL (Grupo III), a quien el art. 20.2.c LISD le
   * exige además tener 65 años o más. Hasta el 27/08/2026 este motor concedía la reducción
   * a todo el Grupo III sin condición, mientras `simulador-heredar-vivienda` sí la
   * comprobaba desde la reparación del hallazgo 204: la misma herencia de un hermano de 40
   * años valía 14.741,88 € en la web y 4.883,57 € por MCP (hallazgo 462).
   */
  convivenciaDosAnios?: boolean;
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
  /**
   * Por qué NO se ha aplicado la reducción por vivienda habitual, cuando se declaró una y
   * el resultado es cero. `null` si se aplicó o si no había vivienda que reducir. Quien
   * presenta el resultado —la web o el MCP— tiene que poder decirlo: un cero sin motivo se
   * lee como «no te corresponde» cuando muchas veces significa «falta un requisito».
   */
  reduccionViviendaNoAplicada: string | null;
  reduccionSeguroVida: number;
  /** Reducción autonómica aplicada sobre la BASE, antes de la tarifa (Asturias) */
  reduccionAutonomicaBase: number;
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Cuota íntegra de una base liquidable según una tarifa del ISD.
 *
 * Aplica la tabla tal como la publica la ley: la CUOTA ÍNTEGRA declarada para el tramo
 * anterior, más el tipo marginal sobre el resto. No es lo mismo que acumular los tramos a
 * mano, porque la columna `cuota` de la tabla oficial arrastra sus propios redondeos: a
 * partir de 31.956,87 € de base las dos lecturas divergen (+0,49 € en el tramo del 9,35 %,
 * −1,84 € en el del 10,20 %, +12,96 € en el del 21,25 %…). Manda la tabla, que es la ley.
 *
 * Es público desde el 24/08/2026 porque `simulador-heredar-vivienda` tenía su propia
 * versión acumulando marginales, y dos apps fiscales de meskeIA daban cuotas íntegras
 * distintas para la misma base liquidable (hallazgo 277 del Inspector).
 */
export function calcularCuotaIntegraIS(base: number, tarifa: TramoTarifaIS[]): number {
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

  /**
   * Reducción adicional en BASE (Asturias). Aquí solo se rotula: restarla es cosa del paso 6.bis
   * de `calcularSucesion`, porque una reducción en base entra antes de la tarifa.
   *
   * Hasta el 24/08/2026 esta rama era el ÚNICO sitio donde `reduccionBase` se leía en todo el
   * calculador, así que la respuesta imprimía «Reducción adicional en base: 300.000 €» y acto
   * seguido liquidaba sobre una base en la que esos 300.000 € seguían dentro: se contradecía a
   * sí misma. La app web sí la aplicaba desde el hallazgo 200, de modo que la misma herencia
   * daba 0,00 € en meskeia.com y 10.346,13 € por MCP (hallazgo 276 del Inspector).
   */
  if (bGrupo.reduccionBase !== undefined && bGrupo.reduccionBase > 0) {
    return { bonificacion: 0, porcentaje: 0, detalle: `Reducción adicional de ${bGrupo.reduccionBase.toLocaleString('es-ES')} € en la base (${config.nombre}), ya aplicada antes de la tarifa. Sin bonificación en cuota.` };
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

  // Exención total por importe (Andalucía, Galicia: base < 1.000.000 €)
  if (bGrupo.exencion !== undefined && baseLiquidable < bGrupo.exencion) {
    return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total (base liquidable < ${bGrupo.exencion.toLocaleString('es-ES')} €)` };
  }

  // Exención con límite máximo (Aragón: hasta 3M€)
  if (bGrupo.porcentaje === 1 && bGrupo.limite !== null && bGrupo.limite !== undefined) {
    if (baseLiquidable <= bGrupo.limite) {
      return { bonificacion: cuotaTributaria, porcentaje: 100, detalle: `Exención total hasta ${bGrupo.limite.toLocaleString('es-ES')} € (${config.nombre})` };
    }
    return { bonificacion: 0, porcentaje: 0, detalle: `Sin bonificación (base liquidable supera el límite de ${bGrupo.limite.toLocaleString('es-ES')} €) (${config.nombre})` };
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

/** Edad mínima del colateral (Grupo III) para la reducción por vivienda, art. 20.2.c LISD */
export const EDAD_MIN_COLATERAL_VIVIENDA_IS = 65;

/**
 * Reducción del art. 20.2.c LISD por vivienda habitual del causante — FUENTE ÚNICA.
 *
 * ── Por qué es pública (27/08/2026, hallazgos 461 y 462) ──────────────────────
 * La misma regla vivía escrita dos veces: aquí y en `simulador-heredar-vivienda`. Cada
 * copia envejeció por su lado y las dos daban resultados distintos para la MISMA herencia,
 * según se preguntara por la web o por la tool `calcular_sucesiones` del MCP Delegum:
 *
 *   · hermano de 40 años, Madrid, 200.000 € de vivienda habitual → 14.741,88 € en la web
 *     (que sí comprueba el art. 20.2.c) y 4.883,57 € por MCP (que se la concedía a todo el
 *     Grupo III sin mirar edad ni convivencia). Aquí acertaba la web.
 *   · cónyuge, Cataluña, 350.000 € → 12.013,29 € en la web (aplicaba la reducción ESTATAL)
 *     y 31.500,00 € por MCP (no aplicaba ninguna). Aquí no acertaba ninguno de los dos.
 *
 * ⚠️ Cataluña: tiene régimen PROPIO de reducción por vivienda habitual (Ley 19/2010), con
 * topes distintos del estatal y requisito de mantenimiento. Este catálogo NO lo modela, y
 * aplicarle el tope estatal de 122.606,47 € es inventarse una cifra que no es la suya. Se
 * resuelve como el IGIC en el clúster de compraventa: no se calcula, y se DICE. Por eso el
 * motivo viaja en `noAplicada` en vez de dejar un cero mudo. Modelar el régimen catalán
 * exige fuente oficial y queda fuera de una ronda de reparación.
 */
export function evaluarReduccionVivienda(p: {
  valorVivienda?: number;
  grupo: GrupoParentescoIS;
  ccaa: string;
  edadHeredero?: number;
  convivenciaDosAnios?: boolean;
}): { reduccion: number; noAplicada: string | null } {
  if (!p.valorVivienda || p.valorVivienda <= 0) return { reduccion: 0, noAplicada: null };

  if (p.ccaa === 'cataluna') {
    return {
      reduccion: 0,
      noAplicada:
        'Cataluña tiene su propia reducción por vivienda habitual (Ley 19/2010), con topes distintos ' +
        'de los estatales: esta herramienta no la calcula, así que la cuota que sale es la de arriba',
    };
  }

  if (p.grupo === 'IV') {
    return { reduccion: 0, noAplicada: 'sin parentesco: el art. 20.2.c LISD no la contempla' };
  }

  if (p.grupo === 'III') {
    // El colateral solo tiene derecho si además es mayor de 65 años y convivió con el
    // causante los dos años anteriores al fallecimiento (art. 20.2.c LISD).
    if (p.edadHeredero === undefined || p.edadHeredero < EDAD_MIN_COLATERAL_VIVIENDA_IS) {
      return {
        reduccion: 0,
        noAplicada: `pariente colateral menor de ${EDAD_MIN_COLATERAL_VIVIENDA_IS} años`,
      };
    }
    if (!p.convivenciaDosAnios) {
      return { reduccion: 0, noAplicada: 'pariente colateral que no convivió los 2 años anteriores' };
    }
  }

  return {
    reduccion: Math.min(p.valorVivienda * REDUCCION_VIVIENDA_PORC_IS, REDUCCION_VIVIENDA_MAX_IS),
    noAplicada: null,
  };
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

  // 3. Reducción por edad (menor de 21 años: solo descendientes/adoptados, art. 20.2.a LISD)
  let reduccionEdadMenor21 = 0;
  if (!esCataluna && edad !== undefined && edad < 21 && p.grupo === 'I-descendiente') {
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

  // 5. Reducción vivienda habitual — ver `evaluarReduccionVivienda`, que es la fuente única
  // de esta regla desde el 27/08/2026 y la comparten este motor y la app.
  const vivienda = evaluarReduccionVivienda({
    valorVivienda: p.viviendaHabitual,
    grupo: p.grupo,
    ccaa: p.ccaa,
    edadHeredero: edad,
    convivenciaDosAnios: p.convivenciaDosAnios,
  });
  const reduccionVivienda = r(vivienda.reduccion);

  // 6. Reducción seguro de vida (100% cónyuge/descendientes/ascendientes, tope 9.195,49 €)
  let reduccionSeguroVida = 0;
  if (p.seguroVida && (grupoBase === 'I' || grupoBase === 'II')) {
    reduccionSeguroVida = r(Math.min(p.seguroVida, REDUCCION_SEGURO_VIDA_MAX_IS));
  }

  // 6.bis Reducción autonómica sobre la BASE (hoy solo Asturias: 300.000 € para los Grupos I
  // y II, 50.000 € para el III). Es el único beneficio del catálogo modelado como reducción
  // en base en vez de como bonificación en cuota, y entra aquí porque va antes de la tarifa.
  const reduccionAutonomicaBase = ccaaInfo.bonificaciones[p.grupo]?.reduccionBase ?? 0;

  const totalReducciones = r(reduccionParentesco + reduccionEdadMenor21 + reduccionDiscapacidad + reduccionVivienda + reduccionSeguroVida + reduccionAutonomicaBase);
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

  const cuotaIntegra = r(calcularCuotaIntegraIS(baseLiquidable, tarifa));

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
    reduccionViviendaNoAplicada: vivienda.noAplicada,
    reduccionSeguroVida,
    reduccionAutonomicaBase: r(reduccionAutonomicaBase),
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
