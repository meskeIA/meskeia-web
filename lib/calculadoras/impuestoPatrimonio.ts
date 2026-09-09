/**
 * Calculadora del Impuesto sobre el Patrimonio (IP) — lógica pura sin React ni DOM
 * Usada por: MCP server Delegum (calcular_impuesto_patrimonio)
 *
 * Valora los bienes con los criterios del Impuesto sobre el Patrimonio,
 * determina si hay obligación de declarar y estima la cuota orientativa
 * aplicando la escala autonómica (o estatal) y la bonificación de la CCAA.
 *
 * Comparte los datos normativos con la app web orientador-impuesto-patrimonio
 * a través de data/fiscal/patrimonio.ts (fuente única).
 *
 * Enfoque: patrimonios SIN participaciones en empresas propias o no cotizadas
 * (esos casos requieren análisis de la exención de empresa familiar, art. 4.8).
 *
 * Fuente: Ley 19/1991 del Impuesto sobre el Patrimonio + normativa autonómica 2025
 */

import {
  getMinimoExentoPatrimonio,
  EXENCION_VIVIENDA_HABITUAL,
  UMBRAL_OBLIGACION_DECLARAR,
  calcularCuotaPatrimonioCCAA,
  ITSGF_UMBRAL,
  MINIMO_EXENTO_ESTATAL,
  BONIFICACIONES_CCAA_PATRIMONIO,
  FISCAL_PATRIMONIO_META,
} from '@/data/fiscal';

/**
 * Patrimonio neto computable (ya con la vivienda habitual exenta descontada) a partir del
 * cual el ITSGF genera cuota de verdad: su mínimo exento estatal (700.000 €) más el primer
 * tramo de su escala, que está al 0 % hasta 3.000.000 € de base liquidable
 * (Ley 38/2022, DA 1.ª Tres — ver lib/calculadoras/impuestoGrandesfortunas.ts).
 *
 * Avisar en 3.000.000 € de patrimonio neto SIN descontar la vivienda habitual, como se hacía
 * antes, anunciaba el impuesto ~800.000 € antes de que cobre un solo euro.
 */
const UMBRAL_ITSGF_CON_CUOTA = ITSGF_UMBRAL + MINIMO_EXENTO_ESTATAL; // 3.700.000 €

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ParametrosImpuestoPatrimonio {
  /** Identificador de CCAA (canónico de data/fiscal/patrimonio.ts) */
  ccaaId: string;
  /** Valor TOTAL de la vivienda habitual (el mayor de catastral/comprobado/adquisición) (€) */
  viviendaHabitual?: number;
  /** Otros inmuebles: segunda vivienda, locales, garajes... (€) */
  otrosInmuebles?: number;
  /** Cuentas y depósitos: el mayor del saldo a 31/12 o medio del 4.º trimestre (€) */
  cuentasDepositos?: number;
  /** Acciones cotizadas (media 4T), ETF y fondos de inversión (liquidativo 31/12) (€) */
  accionesFondos?: number;
  /** Seguros de vida: valor de rescate a 31/12 (€) */
  segurosVida?: number;
  /** Otros bienes: vehículos, joyas, arte, embarcaciones, efectivo... (€) */
  otrosBienes?: number;
  /** Deudas deducibles: préstamos, hipotecas (salvo parte vinculada a bien exento) (€) */
  deudas?: number;
}

/**
 * Supuesto por el que se está (o no) obligado a declarar, art. 37 Ley 19/1991:
 * - `obligado-bruto-2m`: los bienes y derechos BRUTOS superan 2.000.000 € (aunque la cuota sea 0).
 * - `obligado-cuota`: la cuota, YA bonificada, resulta a ingresar.
 * - `obligado-foral-orientativo`: CCAA foral — aquí no se calcula cuota, así que el primer
 *   supuesto no puede comprobarse; solo se señala que la base supera el mínimo exento orientativo.
 * - `no-obligado`: ni cuota a ingresar ni 2.000.000 € brutos.
 */
export type TipoObligacion =
  | 'obligado-bruto-2m'
  | 'obligado-cuota'
  | 'obligado-foral-orientativo'
  | 'no-obligado';

export interface ResultadoImpuestoPatrimonio {
  /** Patrimonio bruto (todos los bienes, sin restar deudas ni exenciones) (€) */
  patrimonioBruto: number;
  /** Parte de la vivienda habitual que computa (exceso sobre 300.000 €) (€) */
  viviendaHabitualComputable: number;
  /** Base imponible: patrimonio neto computable (con exenciones y menos deudas) (€) */
  baseImponible: number;
  /** Patrimonio neto (bruto − deudas) (€) */
  patrimonioNeto: number;
  /** Mínimo exento aplicable según la CCAA (€) */
  minimoExento: number;
  /** Base liquidable: base imponible − mínimo exento (€) */
  baseLiquidable: number;
  /** Tipo de obligación de declarar */
  obligacion: TipoObligacion;
  /** ¿Está obligado a declarar? */
  obligadoDeclarar: boolean;
  /** Motivo legible de la obligación */
  motivoObligacion: string;
  /** Cuota bruta orientativa antes de bonificación (€). null si CCAA foral. */
  cuotaBruta: number | null;
  /** Porcentaje de bonificación de la CCAA (0–100) */
  porcentajeBonificacion: number;
  /**
   * Importe de la bonificación autonómica (€). null si CCAA foral.
   * Se publica calculado, no estimado por quien lo imprima: `cuotaBruta − bonificacionAplicada`
   * da exactamente `cuotaNeta` con las tres cifras a dos decimales.
   */
  bonificacionAplicada: number | null;
  /** Cuota neta orientativa tras bonificación (€). null si CCAA foral. */
  cuotaNeta: number | null;
  /** Escala usada en el cálculo */
  escalaUsada: 'autonómica' | 'estatal' | null;
  /** ¿La bonificación es variable por interacción con el ITSGF? */
  bonificacionVariableItsgf: boolean;
  /**
   * ¿El ITSGF llegaría a cobrar algo? Se mide sobre la base imponible (patrimonio neto YA con la
   * vivienda habitual exenta descontada) contra 3.700.000 €, que es donde su escala deja el 0 %.
   */
  aplicaItsgf: boolean;
  /** ¿Es CCAA de régimen foral (cálculo no aplicable)? */
  esForal: boolean;
  /** Nombre de la CCAA */
  nombreCCAA: string;
  /** Advertencias relevantes */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularImpuestoPatrimonio(
  p: ParametrosImpuestoPatrimonio,
): ResultadoImpuestoPatrimonio {
  const ccaa = BONIFICACIONES_CCAA_PATRIMONIO.find((c) => c.id === p.ccaaId);
  if (!ccaa) {
    throw new Error(
      `Comunidad autónoma no reconocida: "${p.ccaaId}". Valores válidos: ${BONIFICACIONES_CCAA_PATRIMONIO.map((c) => c.id).join(', ')}.`,
    );
  }

  const r = (n: number) => Math.round(n * 100) / 100;

  const viviendaHabitual = Math.max(0, p.viviendaHabitual ?? 0);
  const otrosInmuebles = Math.max(0, p.otrosInmuebles ?? 0);
  const cuentas = Math.max(0, p.cuentasDepositos ?? 0);
  const accionesFondos = Math.max(0, p.accionesFondos ?? 0);
  const seguros = Math.max(0, p.segurosVida ?? 0);
  const otros = Math.max(0, p.otrosBienes ?? 0);
  const deudas = Math.max(0, p.deudas ?? 0);

  const viviendaHabitualComputable = r(Math.max(0, viviendaHabitual - EXENCION_VIVIENDA_HABITUAL));

  // Bruto: incluye la vivienda habitual completa, sin restar deudas ni exención
  const patrimonioBruto = r(viviendaHabitual + otrosInmuebles + cuentas + accionesFondos + seguros + otros);
  // Base imponible: vivienda solo en su parte no exenta, menos deudas
  const baseImponible = r(Math.max(0, viviendaHabitualComputable + otrosInmuebles + cuentas + accionesFondos + seguros + otros - deudas));
  const patrimonioNeto = r(patrimonioBruto - deudas);

  const minimoExento = getMinimoExentoPatrimonio(p.ccaaId);
  const baseLiquidable = r(Math.max(0, baseImponible - minimoExento));

  // ── Cuota ──────────────────────────────────────────────────────────────────
  // Se calcula ANTES que la obligación de declarar, porque el art. 37 la mide sobre la cuota
  // ya bonificada. No se calcula en régimen foral (normativa propia).
  let cuotaBruta: number | null = null;
  let cuotaNeta: number | null = null;
  let bonificacionAplicada: number | null = null;
  let porcentajeBonificacion = ccaa.porcentajeBonificacion;
  let escalaUsada: 'autonómica' | 'estatal' | null = null;
  let bonificacionVariableItsgf = ccaa.itsgfInteraccion ?? false;

  if (!ccaa.foral) {
    // Se llama SIEMPRE, también con base liquidable 0: antes esa rama se saltaba la llamada y
    // rotulaba 'autonómica' a mano, lo que mentía en las 9 CCAA que usan la escala estatal
    // (Andalucía, Aragón, Canarias, Castilla y León, Castilla-La Mancha, Galicia, La Rioja,
    // Madrid y Murcia). La cifra era correcta; la etiqueta, falsa.
    const res = calcularCuotaPatrimonioCCAA(p.ccaaId, baseLiquidable);
    porcentajeBonificacion = res.porcentajeBonificacion;
    escalaUsada = res.escalaUsada;
    bonificacionVariableItsgf = res.itsgfInteraccion;

    // El desglose se construye sobre la cuota bruta YA redondeada. Antes se publicaba la bruta
    // redondeada y se restaba la NO redondeada, y en Galicia (única bonificación parcial, 50 %)
    // la resta impresa no cuadraba por 1 céntimo en 1 de cada 4 casos.
    cuotaBruta = r(res.cuotaBruta);
    cuotaNeta = Math.max(0, r(cuotaBruta * (1 - porcentajeBonificacion / 100)));
    bonificacionAplicada = r(cuotaBruta - cuotaNeta);
  }

  // ── Obligación de declarar (art. 37 Ley 19/1991) ───────────────────────────
  // Se declara cuando la cuota, «una vez aplicadas las deducciones o bonificaciones que
  // procedieren, resulte a ingresar», O cuando el valor de los bienes y derechos brutos
  // supera 2.000.000 €. Lo primero NO es «base imponible > mínimo exento»: esa es la cuota
  // ANTES de bonificar, y en las 7 CCAA con bonificación total daba un resultado que se
  // contradecía a sí mismo (cuota neta 0 € y «obligado a declarar» en la misma respuesta).
  let obligacion: TipoObligacion;
  let motivoObligacion: string;
  if (patrimonioBruto > UMBRAL_OBLIGACION_DECLARAR) {
    obligacion = 'obligado-bruto-2m';
    motivoObligacion = `Bienes y derechos brutos (${formatoEuros(patrimonioBruto)}) por encima de ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}: obligado a declarar aunque la cuota sea cero.`;
  } else if (ccaa.foral) {
    // Sin cuota calculada no puede comprobarse el primer supuesto: solo se orienta con el mínimo.
    if (baseImponible > minimoExento) {
      obligacion = 'obligado-foral-orientativo';
      motivoObligacion = `${ccaa.nombre} tiene normativa foral propia y aquí no se calcula su cuota. Tu base imponible (${formatoEuros(baseImponible)}) supera el mínimo exento orientativo (${formatoEuros(minimoExento)}), así que probablemente debas declarar: confírmalo con tu Hacienda foral.`;
    } else {
      obligacion = 'no-obligado';
      motivoObligacion = `Base imponible (${formatoEuros(baseImponible)}) por debajo del mínimo exento orientativo de ${ccaa.nombre} (${formatoEuros(minimoExento)}) y bienes brutos por debajo de ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}. ${ccaa.nombre} tiene normativa foral propia: confírmalo con tu Hacienda foral.`;
    }
  } else if ((cuotaNeta ?? 0) > 0) {
    obligacion = 'obligado-cuota';
    motivoObligacion = `La cuota, ya aplicada la bonificación de ${ccaa.nombre}, resulta a ingresar (${formatoEurosCent(cuotaNeta ?? 0)}): obligado a declarar.`;
  } else {
    obligacion = 'no-obligado';
    motivoObligacion = (cuotaBruta ?? 0) > 0
      ? `La bonificación de ${ccaa.nombre} (${porcentajeBonificacion} %) deja la cuota en ${formatoEurosCent(0)} —no resulta a ingresar— y los bienes brutos (${formatoEuros(patrimonioBruto)}) no llegan a ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}: en principio, sin obligación de declarar.`
      : `Base imponible (${formatoEuros(baseImponible)}) por debajo del mínimo exento de ${ccaa.nombre} (${formatoEuros(minimoExento)}) y bienes brutos por debajo de ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}: en principio, sin obligación de declarar.`;
  }
  const obligadoDeclarar = obligacion !== 'no-obligado';

  // El ITSGF no cobra nada por debajo de 3.700.000 € de patrimonio neto computable: su mínimo
  // exento son 700.000 € y su primer tramo está al 0 % hasta 3.000.000 € de base liquidable.
  // La base imponible de aquí ya lleva descontada la vivienda habitual exenta, igual que el neto
  // del ITSGF, así que es la magnitud comparable (el patrimonio neto de este motor, no).
  const aplicaItsgf = baseImponible > UMBRAL_ITSGF_CON_CUOTA;

  const advertencias: string[] = [];
  if (ccaa.foral) {
    advertencias.push(`${ccaa.nombre} es de régimen foral con normativa propia: la cuota no se calcula aquí. Consulta tu Hacienda foral.`);
  }
  if (bonificacionVariableItsgf && cuotaBruta !== null && cuotaBruta > 0) {
    advertencias.push(`La bonificación de ${ccaa.nombre} es variable: interactúa con el Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF). La cuota real puede diferir de esta orientación.`);
  }
  if (aplicaItsgf) {
    advertencias.push(`Patrimonio neto computable por encima de ${formatoEuros(UMBRAL_ITSGF_CON_CUOTA)} (mínimo exento de ${formatoEuros(MINIMO_EXENTO_ESTATAL)} + primer tramo al 0 % hasta ${formatoEuros(ITSGF_UMBRAL)}): además del IP, podría aplicar el Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF), estatal.`);
  }
  if (!ccaa.foral && porcentajeBonificacion === 100 && (cuotaBruta ?? 0) > 0) {
    // Se emite aunque NO haya obligación: es justo cuando más falta hace, porque explica por qué
    // una base por encima del mínimo exento no obliga a nada. La versión anterior enunciaba mal
    // el art. 37 («se mantiene si superas el mínimo exento o los 2.000.000 € brutos»): el mínimo
    // exento no obliga a declarar por sí solo cuando la cuota queda bonificada a cero.
    advertencias.push(`${ccaa.nombre} bonifica la cuota al 100 %: la cuota queda en ${formatoEurosCent(0)} y, por sí sola, no genera obligación de declarar. Esa obligación solo se mantiene si tus bienes y derechos brutos superan los ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)} (art. 37 Ley 19/1991).`);
  }
  advertencias.push('Orientativo: no contempla participaciones en empresas propias o no cotizadas (exención de empresa familiar, art. 4.8).');

  return {
    patrimonioBruto,
    viviendaHabitualComputable,
    baseImponible,
    patrimonioNeto,
    minimoExento,
    baseLiquidable,
    obligacion,
    obligadoDeclarar,
    motivoObligacion,
    cuotaBruta,
    porcentajeBonificacion,
    bonificacionAplicada,
    cuotaNeta,
    escalaUsada,
    bonificacionVariableItsgf,
    aplicaItsgf,
    esForal: ccaa.foral ?? false,
    nombreCCAA: ccaa.nombre,
    advertencias,
    fuenteDatos: `${FISCAL_PATRIMONIO_META.fuente} — verificado ${FISCAL_PATRIMONIO_META.verificado}`,
  };
}

// Helpers internos (sin importar @/lib para mantener el módulo auto-contenido)
function formatoEuros(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

/** Para importes de cuota, donde redondear a euros enteros perdería el dato que se está afirmando. */
function formatoEurosCent(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
