/**
 * Calculadora de Plan de Pensiones de Empresa — lógica pura
 * Usada por: MCP server (calcular_plan_pension_empresa)
 *
 * Calcula el beneficio fiscal y financiero de los planes de pensiones de empleo
 * (PPE) para empresa y empleado, tras la reforma de la Ley 12/2022 que potenció
 * los PPE como instrumento de ahorro complementario a la pensión pública.
 *
 * Marco normativo:
 *   - LIRPF arts. 51-52 (reducciones en base imponible)
 *   - LPFP (RDL 1/2002, modificado por Ley 12/2022)
 *   - Reglamento de Planes y Fondos de Pensiones (RD 304/2004)
 *
 * Límites de aportación 2025 (LIRPF art. 52):
 *   A) Límite general: el MENOR de:
 *      - 1.500 €/año (aportación individual del partícipe)
 *      - 30% de rendimientos netos del trabajo y actividades económicas
 *
 *   B) Aportaciones empresariales (PPE): hasta 8.500 €/año adicionales.
 *      - El límite conjunto (individual + empresa) = 10.000 €/año
 *      - Las aportaciones empresariales TAMBIÉN reducen la base imponible del empleado
 *
 *   C) Planes de pensiones de empleo simplificados para autónomos (Ley 12/2022):
 *      - Límite adicional: 4.250 €/año (aparte del límite general de 1.500 €)
 *      - Total autónomos con PPE simplificado: 1.500 + 4.250 = 5.750 €/año
 *
 *   D) Trabajadores con discapacidad ≥65%: hasta 24.500 €/año (propio)
 *
 * Para el EMPLEADO:
 *   - Las aportaciones de la empresa reducen la base imponible general del IRPF
 *   - La aportación propia del empleado también reduce la base (límite 1.500 €)
 *   - No tributan en el momento de la aportación (tributación diferida)
 *   - Al rescatar: tributan como rendimiento del trabajo
 *
 * Para la EMPRESA:
 *   - Las aportaciones son gasto deducible en IS (art. 15.d LIS)
 *   - No cotizan a la Seguridad Social (si son contribuciones empresariales al PPE)
 *
 * Fuente: LIRPF arts. 51-52 + Ley 12/2022 + LPFP — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_coste_empleado, calcular_impuesto_sociedades
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────

const LIMITE_APORTACION_INDIVIDUAL = 1500;       // €/año
const LIMITE_APORTACION_EMPRESARIAL = 8500;      // €/año
const LIMITE_CONJUNTO = LIMITE_APORTACION_INDIVIDUAL + LIMITE_APORTACION_EMPRESARIAL; // 10.000 €
const LIMITE_ADICIONAL_AUTONOMO_PPE = 4250;      // €/año (Ley 12/2022)
const PCT_LIMITE_RENDIMIENTOS = 30;              // % máximo de rendimientos netos
const TIPO_SS_EMPRESA_APROX = 31.0;              // % coste SS empresa (aprox. general)

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type ColectivoParticide = 'trabajador_cuenta_ajena' | 'autonomo_con_ppe_simplificado';

export interface ParametrosPlanPensionEmpresa {
  /** Tipo de partícipe */
  colectivo: ColectivoParticide;
  /** Salario bruto anual del empleado (€) — base para calcular el límite del 30% */
  salarioBrutoAnual: number;
  /** Aportación anual de la empresa al PPE (€) */
  aportacionEmpresaAnual: number;
  /** Aportación anual propia del empleado al PPE (€) */
  aportacionEmpleadoAnual?: number;
  /** Tipo marginal IRPF del empleado (%) — para cuantificar el ahorro fiscal */
  tipoMarginalIRPFEmpleado: number;
  /** Tipo IS de la empresa (%) — para cuantificar el ahorro en IS */
  tipoISEmpresa?: number;
}

export interface ResultadoPlanPensionEmpresa {
  // Validación de límites
  /** Límite individual por rendimientos (30%) (€) */
  limiteIndividualRendimientos: number;
  /** Límite individual aplicable (menor entre 1.500 € y el 30%) (€) */
  limiteIndividualAplicable: number;
  /** Límite aportación empresarial máxima (€) */
  limiteEmpresarialMaximo: number;
  /** Límite conjunto máximo (€) */
  limiteConjuntoMaximo: number;

  // Aportaciones reales
  /** Aportación empresa aplicada (€) — limitada al máximo legal */
  aportacionEmpresaEfectiva: number;
  /** Aportación empleado aplicada (€) — limitada al máximo legal */
  aportacionEmpleadoEfectiva: number;
  /** Total aportado al fondo este año (€) */
  totalAportado: number;

  // Beneficio para el empleado
  /** Reducción total de la base imponible del empleado (empresa + propio) (€) */
  reduccionBaseImponibleEmpleado: number;
  /** **Ahorro fiscal IRPF para el empleado (€/año)** */
  ahorroFiscalIRPFEmpleado: number;

  // Beneficio para la empresa
  /** Gasto deducible IS (aportación empresa) (€) */
  gastoDeducibleIS: number;
  /** **Ahorro fiscal IS de la empresa (€/año)** */
  ahorroFiscalISEmpresa: number;
  /** ¿Exenta de cotización SS la aportación empresarial? */
  exentaCotizacionSS: boolean;
  /** Ahorro en cotizaciones SS de la empresa (aprox.) (€/año) */
  ahorroSSOEmpresa: number;

  // Coste neto real para la empresa
  /** **Coste neto real para la empresa tras ahorro fiscal y SS (€/año)** */
  costeNetoEmpresa: number;

  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────

export function calcularPlanPensionEmpresa(p: ParametrosPlanPensionEmpresa): ResultadoPlanPensionEmpresa {
  if (p.salarioBrutoAnual <= 0) throw new Error('El salario bruto anual debe ser mayor que cero.');
  if (p.aportacionEmpresaAnual < 0) throw new Error('La aportación de la empresa no puede ser negativa.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoIS = p.tipoISEmpresa ?? 25;

  // ── Límites ───────────────────────────────────────────────────────────────
  const limiteIndividualRendimientos = r(p.salarioBrutoAnual * PCT_LIMITE_RENDIMIENTOS / 100);
  const limiteIndividualAplicable = Math.min(LIMITE_APORTACION_INDIVIDUAL, limiteIndividualRendimientos);

  // Límite empresarial: 8.500 € general; si el empleado aporta más, el límite sube
  // (pero el límite conjunto siempre es 10.000 €)
  const limiteEmpresarialMaximo = LIMITE_APORTACION_EMPRESARIAL;
  const limiteConjuntoMaximo = LIMITE_CONJUNTO;

  // Para autónomo con PPE simplificado: límite individual sube 4.250 € más
  const limiteIndividualConBonus = p.colectivo === 'autonomo_con_ppe_simplificado'
    ? limiteIndividualAplicable + LIMITE_ADICIONAL_AUTONOMO_PPE
    : limiteIndividualAplicable;

  // ── Aportaciones efectivas (limitadas al máximo legal) ───────────────────
  const aportacionEmpresaEfectiva = r(Math.min(p.aportacionEmpresaAnual, limiteEmpresarialMaximo));
  const aportacionEmpleadoMaxima = r(Math.min(limiteIndividualConBonus, limiteConjuntoMaximo - aportacionEmpresaEfectiva));
  const aportacionEmpleadoEfectiva = r(Math.min(p.aportacionEmpleadoAnual ?? 0, aportacionEmpleadoMaxima));
  const totalAportado = r(aportacionEmpresaEfectiva + aportacionEmpleadoEfectiva);

  if (p.aportacionEmpresaAnual > limiteEmpresarialMaximo) {
    advertencias.push(`La aportación empresarial indicada (${p.aportacionEmpresaAnual.toLocaleString('es-ES')} €) supera el límite legal de ${limiteEmpresarialMaximo.toLocaleString('es-ES')} €/año. Se limita al máximo.`);
  }

  // ── Beneficio para el empleado ────────────────────────────────────────────
  const reduccionBaseImponibleEmpleado = r(aportacionEmpresaEfectiva + aportacionEmpleadoEfectiva);
  const ahorroFiscalIRPFEmpleado = r(reduccionBaseImponibleEmpleado * p.tipoMarginalIRPFEmpleado / 100);

  // ── Beneficio para la empresa ─────────────────────────────────────────────
  const gastoDeducibleIS = aportacionEmpresaEfectiva;
  const ahorroFiscalISEmpresa = r(gastoDeducibleIS * tipoIS / 100);
  const exentaCotizacionSS = true; // Las aportaciones empresariales a PPE están exentas de cotización SS
  const ahorroSSOEmpresa = r(aportacionEmpresaEfectiva * TIPO_SS_EMPRESA_APROX / 100);

  const costeNetoEmpresa = r(aportacionEmpresaEfectiva - ahorroFiscalISEmpresa - ahorroSSOEmpresa);

  // ── Advertencias ──────────────────────────────────────────────────────────
  advertencias.push('Las aportaciones empresariales a PPE son RENDIMIENTO DEL TRABAJO EN ESPECIE para el empleado en el momento de la aportación (base de IRPF), pero se COMPENSAN con la reducción en base imponible equivalente, resultando en tributación cero en el momento actual.');
  advertencias.push('Las aportaciones empresariales a PPE están EXENTAS de cotización a la Seguridad Social (tanto trabajador como empresa), siempre que el plan sea un plan de pensiones de empleo del sistema de empleo (LPFP art. 51).');
  advertencias.push('Al RESCATAR el plan de pensiones: todo lo cobrado (capital + rentabilidad) tributa como RENDIMIENTO DEL TRABAJO, a los tipos marginales de la escala general del IRPF. No al tipo del ahorro.');
  if (p.colectivo === 'autonomo_con_ppe_simplificado') {
    advertencias.push(`Autónomo con PPE simplificado (Ley 12/2022): límite individual ampliado a ${(limiteIndividualAplicable + LIMITE_ADICIONAL_AUTONOMO_PPE).toLocaleString('es-ES')} € (1.500 € general + 4.250 € adicionales para PPE de empleo).`);
  }

  return {
    limiteIndividualRendimientos,
    limiteIndividualAplicable: limiteIndividualConBonus,
    limiteEmpresarialMaximo,
    limiteConjuntoMaximo,
    aportacionEmpresaEfectiva,
    aportacionEmpleadoEfectiva,
    totalAportado,
    reduccionBaseImponibleEmpleado,
    ahorroFiscalIRPFEmpleado,
    gastoDeducibleIS,
    ahorroFiscalISEmpresa,
    exentaCotizacionSS,
    ahorroSSOEmpresa,
    costeNetoEmpresa,
    advertencias,
    fuenteDatos: 'LIRPF arts. 51-52 + Ley 12/2022 (PPE simplificado) + LPFP — vigente 2025',
  };
}
