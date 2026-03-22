/**
 * Calculadora de Ingreso Mínimo Vital (IMV) — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_ingreso_minimo_vital)
 *
 * Calcula la cuantía del IMV según la composición de la unidad de convivencia,
 * el complemento de ayuda a la infancia y la compatibilidad con rentas del trabajo.
 *
 * Cuantías IMV 2025 (RD 789/2024 — actualización IPC):
 *   - Persona sola: 604,22 €/mes (7.250,64 €/año)
 *   - Hogar con 2 miembros: 604,22 × 1,30 = 785,49 €/mes
 *   - Hogar con 3 miembros: 604,22 × 1,45 = 876,12 €/mes
 *   - Hogar con 4 miembros: 604,22 × 1,60 = 966,75 €/mes
 *   - Hogar con 5+ miembros: 604,22 × 1,75 = 1.057,39 €/mes
 *
 * Escala de equivalencia (art. 12 RDL 20/2020):
 *   - 1 adulto: 1,00 (100%)
 *   - Adultos adicionales: +0,30 cada uno
 *   - Menores 23 años (excepto 1º): +0,20 cada uno (el primero incluido en la base)
 *   (Con límite: si la escala supera 2,20, se mantiene en 2,20)
 *
 * IMPORTANTE: La escala 2025 ha cambiado con el RD 789/2024. El primer menor
 * ya no consume un "slot" de adulto — se refuerza la protección a familias monoparentales.
 *
 * Complemento de Ayuda a la Infancia (CAPI) — integrado en el IMV desde 2022:
 *   - Niños de 0-2 años: 115 €/mes (1.380 €/año)
 *   - Niños de 3-5 años: 115 €/mes (1.380 €/año)
 *   - Niños de 6-17 años: 82,50 €/mes (990 €/año)
 *
 * Complemento monoparental: +22% sobre la cuantía base (RDL 20/2020 art. 12 bis).
 *
 * Compatibilidad con trabajo (art. 8 RDL 20/2020):
 *   Fórmula: IMV_efectivo = IMV_garantizado - [(rentas_trabajo - umbral_exclusion) × 0,50]
 *   Umbral exclusión: 3.000 €/año (rentas de trabajo hasta 3.000 € no computan)
 *   Si renta_trabajo_neta ≤ umbral: cobra IMV íntegro
 *
 * Fuente: RDL 20/2020 + RD 789/2024 + Ley 19/2021 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_pension_desempleo, calcular_irpf
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const IMV_BASE_MENSUAL_2025 = 604.22;    // €/mes (1 adulto solo)
const ESCALA_ADULTO_ADICIONAL = 0.30;    // Por cada adulto extra
const ESCALA_MENOR_ADICIONAL = 0.20;     // Por cada menor (a partir del 2º en hogar)
const ESCALA_MAXIMA = 2.20;             // Límite máximo de la escala

// Complemento Ayuda Infancia (CAPI) mensual por edad
const CAPI_0_2 = 115;    // €/mes
const CAPI_3_5 = 115;    // €/mes
const CAPI_6_17 = 82.50; // €/mes

const PCT_COMPLEMENTO_MONOPARENTAL = 22; // % adicional sobre cuantía base

// Compatibilidad con trabajo
const UMBRAL_EXCLUSION_TRABAJO = 3000;    // €/año — no computa
const PCT_REDUCCION_RENTA_TRABAJO = 50;  // % de reducción sobre el exceso

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface MenorCargo {
  /** Edad del menor (años) */
  edad: number;
}

export interface ParametrosIngresoMinimoVital {
  /** Número de adultos en la unidad de convivencia (incluye el solicitante) */
  numAdultos: number;
  /** Menores a cargo en la unidad de convivencia */
  menoresACargo?: MenorCargo[];
  /** ¿Es familia monoparental? (un solo adulto con menores) */
  esMonoparental?: boolean;
  /** Rentas del trabajo anuales de toda la unidad de convivencia (€/año) */
  rentasTrabajoAnuales?: number;
  /** Otras rentas anuales (capital, actividades económicas...) (€/año) */
  otrasRentasAnuales?: number;
}

export interface ResultadoIngresoMinimoVital {
  /** Número de adultos */
  numAdultos: number;
  /** Número de menores */
  numMenores: number;
  /** Escala de equivalencia aplicada */
  escalaEquivalencia: number;
  /** Cuantía IMV garantizada mensual (antes de compatibilidad trabajo) (€) */
  cuantiaIMVGarantizada: number;
  /** Complemento monoparental (€/mes) */
  complementoMonoparental: number;
  /** Complemento de ayuda a la infancia (CAPI) total mensual (€) */
  complementoInfanciaMensual: number;
  /** Desglose CAPI por menor */
  desgloseInfancia: Array<{ edad: number; importe: number }>;
  /** Rentas del trabajo anuales (€) */
  rentasTrabajoAnuales: number;
  /** Otras rentas anuales (€) */
  otrasRentasAnuales: number;
  /** ¿Las rentas superan el umbral de exclusión? */
  superaUmbralExclusion: boolean;
  /** Umbral de rentas para exclusión del IMV (€/año) */
  umbralExclusionAnual: number;
  /** Reducción por compatibilidad trabajo (€/mes) */
  reduccionCompatibilidadTrabajo: number;
  /** **Cuantía IMV efectiva mensual (€)** */
  cuantiaEfectivaMensual: number;
  /** Cuantía total mensual con CAPI (€) */
  cuantiaTotal: number;
  /** Cuantía anual total (€) */
  cuantiaAnual: number;
  /** ¿Tiene derecho al IMV según los datos indicados? */
  tieneDerechoIMV: boolean;
  /** Motivo de pérdida del derecho (si aplica) */
  motivoPerdidaDerecho?: string;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIngresoMinimoVital(p: ParametrosIngresoMinimoVital): ResultadoIngresoMinimoVital {
  if (p.numAdultos < 1) throw new Error('Debe haber al menos 1 adulto en la unidad de convivencia.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const menores = p.menoresACargo ?? [];
  const numMenores = menores.length;
  const advertencias: string[] = [];

  // Calcular escala de equivalencia
  // Adulto principal: 1,00
  // Adultos adicionales: +0,30 cada uno
  // Menores: el primero computa a 0,20, los siguientes también a 0,20
  // (Con la reforma 2024, todos los menores computan como +0,20 adicional)
  const escalaAdultos = 1 + (p.numAdultos - 1) * ESCALA_ADULTO_ADICIONAL;
  const escalaMenores = numMenores * ESCALA_MENOR_ADICIONAL;
  const escalaTotal = Math.min(escalaAdultos + escalaMenores, ESCALA_MAXIMA);
  const escalaEquivalencia = r(escalaTotal);

  const cuantiaBaseIMV = r(IMV_BASE_MENSUAL_2025 * escalaEquivalencia);

  // Complemento monoparental
  const esMonoparental = p.esMonoparental ?? (p.numAdultos === 1 && numMenores > 0);
  const complementoMonoparental = esMonoparental
    ? r(cuantiaBaseIMV * PCT_COMPLEMENTO_MONOPARENTAL / 100)
    : 0;

  const cuantiaIMVGarantizada = r(cuantiaBaseIMV + complementoMonoparental);

  // CAPI — Complemento de Ayuda a la Infancia
  const desgloseInfancia = menores.map(m => {
    let importe: number;
    if (m.edad <= 2) importe = CAPI_0_2;
    else if (m.edad <= 5) importe = CAPI_3_5;
    else if (m.edad <= 17) importe = CAPI_6_17;
    else importe = 0; // mayores de 17: no aplica CAPI
    return { edad: m.edad, importe };
  });
  const complementoInfanciaMensual = r(desgloseInfancia.reduce((s, d) => s + d.importe, 0));

  // Rentas
  const rentasTrabajoAnuales = r(p.rentasTrabajoAnuales ?? 0);
  const otrasRentasAnuales = r(p.otrasRentasAnuales ?? 0);
  const rentasTotalesAnuales = r(rentasTrabajoAnuales + otrasRentasAnuales);

  // Umbral de exclusión: cuantía IMV anual
  const umbralExclusionAnual = r(cuantiaIMVGarantizada * 12 + complementoInfanciaMensual * 12);

  // Compatibilidad con rentas del trabajo
  // El exceso de rentas del trabajo sobre 3.000 € anuales reduce el IMV al 50%
  let reduccionCompatibilidadMensual = 0;
  const excesoBruto = Math.max(0, rentasTrabajoAnuales - UMBRAL_EXCLUSION_TRABAJO);
  if (excesoBruto > 0) {
    const reduccionAnual = r(excesoBruto * PCT_REDUCCION_RENTA_TRABAJO / 100);
    reduccionCompatibilidadMensual = r(reduccionAnual / 12);
  }

  // Pérdida de derecho si otras rentas superan umbral completo
  const superaUmbralExclusion = rentasTotalesAnuales >= umbralExclusionAnual;
  let tieneDerechoIMV = !superaUmbralExclusion;
  let motivoPerdidaDerecho: string | undefined;

  if (superaUmbralExclusion) {
    tieneDerechoIMV = false;
    motivoPerdidaDerecho = `Las rentas totales anuales (${rentasTotalesAnuales.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €) superan el umbral de exclusión del IMV (${umbralExclusionAnual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/año).`;
  }

  const cuantiaEfectivaMensual = tieneDerechoIMV
    ? r(Math.max(0, cuantiaIMVGarantizada - reduccionCompatibilidadMensual))
    : 0;
  const cuantiaTotal = r(cuantiaEfectivaMensual + (tieneDerechoIMV ? complementoInfanciaMensual : 0));
  const cuantiaAnual = r(cuantiaTotal * 12);

  advertencias.push('El IMV es gestionado por el INSS. Para solicitarlo, presentar el formulario en sede.seg-social.es o en oficinas del INSS. El plazo de resolución puede ser de varios meses.');
  advertencias.push('La cuantía calculada es ORIENTATIVA. La cuantía real depende de la situación patrimonial completa, la convivencia efectiva acreditada y el cómputo de rentas del ejercicio anterior.');
  advertencias.push('El IMV es compatible con prestaciones por hijo a cargo, complemento de pensión para reducción de brecha de género, pensiones contributivas inferiores al IMV y rentas de trabajo (con reducción).');
  if (esMonoparental) {
    advertencias.push(`Familia monoparental: complemento del ${PCT_COMPLEMENTO_MONOPARENTAL}% sobre la cuantía base aplicado. Requiere acreditar la condición de familia monoparental ante el INSS.`);
  }
  if (menores.some(m => m.edad > 17)) {
    advertencias.push('Los menores de 18 o más años no generan CAPI. Solo computan en la escala de equivalencia si forman parte de la unidad de convivencia.');
  }

  return {
    numAdultos: p.numAdultos,
    numMenores,
    escalaEquivalencia,
    cuantiaIMVGarantizada,
    complementoMonoparental,
    complementoInfanciaMensual,
    desgloseInfancia,
    rentasTrabajoAnuales,
    otrasRentasAnuales,
    superaUmbralExclusion,
    umbralExclusionAnual,
    reduccionCompatibilidadTrabajo: reduccionCompatibilidadMensual,
    cuantiaEfectivaMensual,
    cuantiaTotal,
    cuantiaAnual,
    tieneDerechoIMV,
    motivoPerdidaDerecho,
    advertencias,
    fuenteDatos: 'RDL 20/2020 + RD 789/2024 + Ley 19/2021 — cuantías vigentes 2025',
  };
}
