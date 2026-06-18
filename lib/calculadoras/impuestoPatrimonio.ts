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
  BONIFICACIONES_CCAA_PATRIMONIO,
  FISCAL_PATRIMONIO_META,
} from '@/data/fiscal';

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

export type TipoObligacion = 'obligado-bruto-2m' | 'obligado-base' | 'no-obligado';

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
  /** Cuota neta orientativa tras bonificación (€). null si CCAA foral. */
  cuotaNeta: number | null;
  /** Escala usada en el cálculo */
  escalaUsada: 'autonómica' | 'estatal' | null;
  /** ¿La bonificación es variable por interacción con el ITSGF? */
  bonificacionVariableItsgf: boolean;
  /** ¿Podría aplicar el ITSGF (patrimonio neto ≥ 3M€)? */
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

  // Obligación de declarar (Art. 37 Ley 19/1991)
  let obligacion: TipoObligacion;
  let motivoObligacion: string;
  if (patrimonioBruto > UMBRAL_OBLIGACION_DECLARAR) {
    obligacion = 'obligado-bruto-2m';
    motivoObligacion = `Bienes y derechos brutos (${formatoEuros(patrimonioBruto)}) por encima de ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}: obligado a declarar aunque la cuota sea cero.`;
  } else if (baseImponible > minimoExento) {
    obligacion = 'obligado-base';
    motivoObligacion = `Base imponible (${formatoEuros(baseImponible)}) por encima del mínimo exento de ${ccaa.nombre} (${formatoEuros(minimoExento)}): en principio, obligado a declarar.`;
  } else {
    obligacion = 'no-obligado';
    motivoObligacion = `Base imponible (${formatoEuros(baseImponible)}) por debajo del mínimo exento de ${ccaa.nombre} (${formatoEuros(minimoExento)}) y bienes brutos por debajo de ${formatoEuros(UMBRAL_OBLIGACION_DECLARAR)}: en principio, sin obligación de declarar.`;
  }
  const obligadoDeclarar = obligacion !== 'no-obligado';

  // Cuota: no se calcula en régimen foral
  let cuotaBruta: number | null = null;
  let cuotaNeta: number | null = null;
  let porcentajeBonificacion = ccaa.porcentajeBonificacion;
  let escalaUsada: 'autonómica' | 'estatal' | null = null;
  let bonificacionVariableItsgf = ccaa.itsgfInteraccion ?? false;

  if (!ccaa.foral && baseLiquidable > 0) {
    const res = calcularCuotaPatrimonioCCAA(p.ccaaId, baseLiquidable);
    cuotaBruta = r(res.cuotaBruta);
    cuotaNeta = r(res.cuotaNeta);
    porcentajeBonificacion = res.porcentajeBonificacion;
    escalaUsada = res.escalaUsada;
    bonificacionVariableItsgf = res.itsgfInteraccion;
  } else if (!ccaa.foral && baseLiquidable === 0) {
    cuotaBruta = 0;
    cuotaNeta = 0;
    escalaUsada = 'autonómica';
  }

  const aplicaItsgf = patrimonioNeto >= ITSGF_UMBRAL;

  const advertencias: string[] = [];
  if (ccaa.foral) {
    advertencias.push(`${ccaa.nombre} es de régimen foral con normativa propia: la cuota no se calcula aquí. Consulta tu Hacienda foral.`);
  }
  if (bonificacionVariableItsgf && cuotaBruta !== null && cuotaBruta > 0) {
    advertencias.push(`La bonificación de ${ccaa.nombre} es variable: interactúa con el Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF). La cuota real puede diferir de esta orientación.`);
  }
  if (aplicaItsgf) {
    advertencias.push(`Patrimonio neto por encima de ${formatoEuros(ITSGF_UMBRAL)}: además del IP, podría aplicar el Impuesto Temporal de Solidaridad de las Grandes Fortunas (ITSGF), estatal.`);
  }
  if (obligadoDeclarar && porcentajeBonificacion === 100 && !ccaa.foral) {
    advertencias.push(`${ccaa.nombre} bonifica la cuota al 100%: probablemente no pagues, pero la obligación de presentar la declaración se mantiene si superas el mínimo exento o los 2.000.000 € brutos.`);
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

// Helper interno (sin importar @/lib para mantener el módulo auto-contenido)
function formatoEuros(n: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
