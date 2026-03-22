/**
 * Calculadora de Deducción I+D+i en el Impuesto sobre Sociedades — lógica pura
 * Usada por: MCP server (calcular_deduccion_idi)
 *
 * Calcula la deducción fiscal aplicable en el Impuesto sobre Sociedades por
 * gastos en actividades de Investigación y Desarrollo (I+D) e Innovación
 * Tecnológica (iT), según los arts. 35-36 de la LIS.
 *
 * Marco normativo:
 *   - LIS art. 35: deducción por actividades de I+D
 *   - LIS art. 36: deducción por actividades de innovación tecnológica (iT)
 *   - LIS art. 39: aplicación de las deducciones (límites y monetización)
 *   - RD 475/2014: definiciones de I+D e iT a efectos del IS
 *   - Acuerdo previo de valoración AEAT (APA): procedimiento para certificar
 *
 * ACTIVIDADES DE I+D (LIS art. 35.1):
 *   Investigación básica + aplicada + desarrollo experimental.
 *   Incluye: proyectos que buscan nuevos conocimientos o aplicaciones nuevas.
 *   NO incluye: mejoras menores, calidad, diseño, marketing.
 *
 * PORCENTAJES DE DEDUCCIÓN I+D (LIS art. 35.2):
 *   a) 25% sobre los gastos del período de I+D.
 *   b) 42% adicional sobre el EXCESO de gastos respecto a la media
 *      de los 2 ejercicios anteriores.
 *   c) 17% adicional sobre gastos de personal investigador cualificado
 *      (personal con dedicación exclusiva a I+D).
 *   d) 8% sobre inversiones en inmovilizado material e intangible afecto a I+D
 *      (excluidos inmuebles y terrenos).
 *
 * ACTIVIDADES DE INNOVACIÓN TECNOLÓGICA (LIS art. 36):
 *   Solo las que NO sean I+D: nuevos productos/procesos o mejoras sustanciales.
 *   - 12% sobre gastos de iT (proyectos de certificación, diseño industrial...)
 *
 * LÍMITE GENERAL (LIS art. 39.1):
 *   La deducción no puede superar el 25% de la cuota íntegra ajustada
 *   (35% si I+D > 10% de la cuota íntegra). El exceso aplica en los 18 ejercicios siguientes.
 *
 * OPCIÓN DE MONETIZACIÓN (LIS art. 39.2 — "cash back"):
 *   Si la empresa no puede aplicar la deducción por insuficiencia de cuota:
 *   - Puede solicitar su ABONO a la AEAT (devolución en efectivo) con un descuento del 20%.
 *   - Límite: 5.000.000 € anuales (I+D) o 1.000.000 € (iT).
 *   - Solo en los 2 años siguientes al período generación (si no aplicó la deducción).
 *
 * Fuente: LIS arts. 35-36-39 (Ley 27/2014) — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_break_even
 */

// ─── Constantes ────────────────────────────────────────────────────────────

// Porcentajes I+D (LIS art. 35.2)
const PCT_ID_BASE = 25;                      // % sobre gastos I+D del período
const PCT_ID_EXCESO_MEDIA = 42;              // % adicional sobre exceso respecto media 2 años
const PCT_ID_PERSONAL_INVESTIGADOR = 17;     // % adicional sobre personal investigador cualificado
const PCT_ID_INMOVILIZADO = 8;               // % sobre inversiones inmovilizado afecto a I+D

// Porcentaje innovación tecnológica (LIS art. 36)
const PCT_IT = 12;                           // % sobre gastos de innovación tecnológica

// Límites (LIS art. 39)
const PCT_LIMITE_CUOTA_GENERAL = 25;         // % cuota íntegra ajustada (límite general)
const PCT_LIMITE_CUOTA_ID_ALTA = 35;         // % si I+D > 10% cuota íntegra
const UMBRAL_ID_ALTA = 10;                   // % I+D/cuota para activar el límite 35%
const LIMITE_MONETIZACION_ID = 5_000_000;    // € máx. monetización I+D
const LIMITE_MONETIZACION_IT = 1_000_000;    // € máx. monetización iT
const DESCUENTO_MONETIZACION = 20;           // % descuento al monetizar (abono AEAT)

// ─── Tipos públicos ────────────────────────────────────────────────────────

export interface GastosID {
  /** Gastos totales de I+D del período actual (€) */
  gastosIDPeriodoActual: number;
  /** Media de gastos de I+D de los 2 ejercicios anteriores (€) — para el bonus exceso */
  mediaGastosIDEjerciciosAnteriores?: number;
  /** Gastos de personal investigador cualificado con dedicación exclusiva (€) */
  gastosPersonalInvestigador?: number;
  /** Inversiones en inmovilizado material/intangible afecto a I+D (€) */
  inversionInmovilizadoID?: number;
}

export interface GastosIT {
  /** Gastos de innovación tecnológica (iT) del período (€) */
  gastosITPeriodoActual: number;
}

export interface ParametrosDeduccionIdi {
  /** Datos de actividades de I+D */
  id?: GastosID;
  /** Datos de actividades de innovación tecnológica */
  it?: GastosIT;
  /** Cuota íntegra ajustada del IS del período (€) — para calcular el límite */
  cuotaIntegra: number;
  /** ¿Solicitar monetización (abono AEAT) si no hay suficiente cuota? */
  solicitarMonetizacion?: boolean;
}

export interface ResultadoDeduccionIdi {
  // I+D
  /** Deducción base I+D (25% gastos período) (€) */
  deduccionIDBase: number;
  /** Deducción adicional por exceso sobre media 2 años (42% exceso) (€) */
  deduccionIDExceso: number;
  /** Deducción adicional personal investigador (17%) (€) */
  deduccionIDPersonal: number;
  /** Deducción inmovilizado I+D (8%) (€) */
  deduccionIDInmovilizado: number;
  /** **Total deducción I+D del período (€)** */
  totalDeduccionID: number;

  // iT
  /** **Total deducción innovación tecnológica (12%) (€)** */
  totalDeduccionIT: number;

  // Totales
  /** **Total deducción I+D+i generada (€)** */
  totalDeduccionGenerada: number;
  /** Límite de aplicación sobre cuota (€) */
  limiteAplicacion: number;
  /** Deducción aplicable en el período (€) — limitada a cuota */
  deduccionAplicable: number;
  /** Exceso de deducción pendiente (arrastra 18 ejercicios) (€) */
  excesoPendiente: number;

  // Monetización
  /** Importe monetizable (abono AEAT, con descuento 20%) (€) */
  importeMonetizable: number;
  /** Importe recibido tras descuento monetización (€) */
  importeRecibidoMonetizacion: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularDeduccionIdi(p: ParametrosDeduccionIdi): ResultadoDeduccionIdi {
  if (!p.id && !p.it) throw new Error('Debe indicar gastos de I+D y/o innovación tecnológica.');
  if (p.cuotaIntegra < 0) throw new Error('La cuota íntegra no puede ser negativa.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  // ── I+D ───────────────────────────────────────────────────────────────────
  let deduccionIDBase = 0;
  let deduccionIDExceso = 0;
  let deduccionIDPersonal = 0;
  let deduccionIDInmovilizado = 0;

  if (p.id) {
    deduccionIDBase = r(p.id.gastosIDPeriodoActual * PCT_ID_BASE / 100);

    if (p.id.mediaGastosIDEjerciciosAnteriores !== undefined && p.id.mediaGastosIDEjerciciosAnteriores > 0) {
      const exceso = Math.max(0, p.id.gastosIDPeriodoActual - p.id.mediaGastosIDEjerciciosAnteriores);
      // El exceso ya está incluido en la base; el bonus adicional es (42-25)=17% sobre el exceso
      deduccionIDExceso = r(exceso * (PCT_ID_EXCESO_MEDIA - PCT_ID_BASE) / 100);
    } else {
      advertencias.push('Sin media de ejercicios anteriores: no se calcula el bonus del 42% sobre el exceso. Si existen gastos I+D en años previos, facilite la media de los 2 ejercicios anteriores para optimizar la deducción.');
    }

    if (p.id.gastosPersonalInvestigador) {
      deduccionIDPersonal = r(p.id.gastosPersonalInvestigador * PCT_ID_PERSONAL_INVESTIGADOR / 100);
    }

    if (p.id.inversionInmovilizadoID) {
      deduccionIDInmovilizado = r(p.id.inversionInmovilizadoID * PCT_ID_INMOVILIZADO / 100);
    }
  }

  const totalDeduccionID = r(deduccionIDBase + deduccionIDExceso + deduccionIDPersonal + deduccionIDInmovilizado);

  // ── iT ────────────────────────────────────────────────────────────────────
  const totalDeduccionIT = p.it ? r(p.it.gastosITPeriodoActual * PCT_IT / 100) : 0;

  const totalDeduccionGenerada = r(totalDeduccionID + totalDeduccionIT);

  // ── Límite de aplicación (LIS art. 39.1) ─────────────────────────────────
  // Si I+D > 10% cuota íntegra → límite 35%; si no → 25%
  const pctIDSobreCuota = p.cuotaIntegra > 0 ? (totalDeduccionID / p.cuotaIntegra * 100) : 0;
  const pctLimite = pctIDSobreCuota > UMBRAL_ID_ALTA ? PCT_LIMITE_CUOTA_ID_ALTA : PCT_LIMITE_CUOTA_GENERAL;
  const limiteAplicacion = r(p.cuotaIntegra * pctLimite / 100);

  const deduccionAplicable = r(Math.min(totalDeduccionGenerada, limiteAplicacion));
  const excesoPendiente = r(Math.max(0, totalDeduccionGenerada - deduccionAplicable));

  // ── Monetización (LIS art. 39.2) ─────────────────────────────────────────
  let importeMonetizable = 0;
  let importeRecibidoMonetizacion = 0;

  if (p.solicitarMonetizacion && excesoPendiente > 0) {
    const maxMonetizableID = Math.min(totalDeduccionID, LIMITE_MONETIZACION_ID);
    const maxMonetizableIT = Math.min(totalDeduccionIT, LIMITE_MONETIZACION_IT);
    importeMonetizable = r(Math.min(excesoPendiente, maxMonetizableID + maxMonetizableIT));
    importeRecibidoMonetizacion = r(importeMonetizable * (1 - DESCUENTO_MONETIZACION / 100));
    advertencias.push(`Monetización (abono AEAT): descuento del ${DESCUENTO_MONETIZACION}% sobre el importe monetizable. Límite: ${LIMITE_MONETIZACION_ID.toLocaleString('es-ES')} € para I+D y ${LIMITE_MONETIZACION_IT.toLocaleString('es-ES')} € para iT. Solo disponible si no se aplicó la deducción en los 2 ejercicios anteriores.`);
  }

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push('DEFINICIÓN CRÍTICA: la AEAT distingue estrictamente entre I+D (25%/42%) e iT (12%). Las actividades de mejora continua, control de calidad, diseño estético o marketing NO califican. Se recomienda obtener un Informe Motivado Vinculante (IMV) del MINECO para garantizar la calificación.');
  advertencias.push('Personal investigador: el bonus del 17% solo aplica a personal con titulación universitaria o FP superior con DEDICACIÓN EXCLUSIVA a las actividades de I+D. El personal mixto (I+D + otras) no da derecho a este bonus.');
  if (excesoPendiente > 0) {
    advertencias.push(`Exceso de deducción de ${excesoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €: puede aplicarse en los 18 ejercicios siguientes. Alternativamente, solicitar monetización (abono AEAT) con descuento del 20%.`);
  }
  advertencias.push('Acuerdo Previo de Actuaciones (APA): para proyectos de I+D de importe significativo, se recomienda solicitar APA a la AEAT antes de iniciar el proyecto para garantizar la calificación y la deducción.');

  return {
    deduccionIDBase,
    deduccionIDExceso,
    deduccionIDPersonal,
    deduccionIDInmovilizado,
    totalDeduccionID,
    totalDeduccionIT,
    totalDeduccionGenerada,
    limiteAplicacion,
    deduccionAplicable,
    excesoPendiente,
    importeMonetizable,
    importeRecibidoMonetizacion,
    advertencias,
    fuenteDatos: 'LIS arts. 35-36-39 (Ley 27/2014) + RD 475/2014 — vigente 2025',
  };
}
