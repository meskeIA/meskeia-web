/**
 * Calculadora de Rescate de Plan de Pensiones en IRPF
 * Usada por: MCP server (calcular_rescate_plan_pensiones)
 *
 * Calcula la tributacion del rescate de un plan de pensiones (u otro
 * sistema de prevision social: PPA, PIAS, mutualidades, planes de empleo)
 * en el IRPF, incluyendo la reduccion del 40% por aportaciones anteriores
 * a 31/12/2006 para el cobro en forma de capital.
 *
 * Marco normativo:
 *   - LIRPF art. 17.2.a: prestaciones de sistemas de prevision social como RDT
 *   - LIRPF DA 12.a: regimen transitorio reduccion 40% para aportaciones pre-2007
 *   - RDL 11/2021 + RD 712/2022: plazo especial COVID para rescates (expirado)
 *   - Ley 12/2022: reforma limites aportacion (no afecta a rescate)
 *   - DGT consultas vinculantes: criterios de aplicacion de la reduccion 40%
 *
 * TRIBUTACION DEL RESCATE:
 *
 *   - Las prestaciones SIEMPRE tributan como RENDIMIENTO DEL TRABAJO (RDT)
 *   - Se integran en la BASE GENERAL (escala progresiva), NO en la base del ahorro
 *   - La retencion la practica la entidad gestora
 *
 * FORMAS DE RESCATE:
 *   a) En forma de RENTA (mensual/anual): cada pago tributa como RDT del ejercicio
 *   b) En forma de CAPITAL (cobro unico): toda la prestacion es RDT del ejercicio
 *   c) MIXTA: parte en capital, parte en renta
 *
 * REDUCCION DEL 40% (DA 12.a LIRPF — regimen transitorio):
 *   - Solo para aportaciones realizadas ANTES del 31/12/2006
 *   - Solo si el cobro es en forma de CAPITAL (no en renta)
 *   - Solo aplicable UNA VEZ por cada plan (y por cada contingencia)
 *   - Plazo para aplicarla: maximo 2 anos desde que se produce la contingencia
 *     (jubilacion, incapacidad, fallecimiento, dependencia, desempleo de larga duracion)
 *   - Para planes de empresa: tambien aplica si las aportaciones de la empresa
 *     son anteriores a 2007
 *
 * CONTINGENCIAS QUE PERMITEN EL RESCATE:
 *   - Jubilacion (incluida jubilacion parcial)
 *   - Incapacidad laboral total, absoluta o gran invalidez
 *   - Fallecimiento (beneficiarios)
 *   - Dependencia severa o gran dependencia
 *   - Desempleo de larga duracion (>12 meses; o >6 con reconocimiento SEPE)
 *   - Enfermedad grave
 *   - LIQUIDEZ EXCEPCIONAL: a partir de los 10 anos de la aportacion (desde 2025
 *     para aportaciones realizadas antes de 01/01/2015)
 *
 * Fuente: LIRPF art. 17.2.a + DA 12.a — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_reduccion_plan_pensiones_irpf, calcular_pension_jubilacion_ss
 */

// --- Constantes ---

const PCT_REDUCCION_PRE2007 = 40;     // % reduccion sobre capital pre-2007
const ANOS_PLAZO_REDUCCION = 2;       // Anos desde contingencia para aplicar reduccion

// Escala general IRPF 2025 (base general — estatal + autonomica media)
// Nota: tipo efectivo depende de la escala autonomica concreta
const TRAMOS_GENERAL_2025: { hasta: number; tipo: number }[] = [
  { hasta: 12_450, tipo: 19 },
  { hasta: 20_200, tipo: 24 },
  { hasta: 35_200, tipo: 30 },
  { hasta: 60_000, tipo: 37 },
  { hasta: 300_000, tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// --- Tipos publicos ---

export type FormaRescate = 'capital' | 'renta' | 'mixta';
export type ContingenciaRescate =
  | 'jubilacion'
  | 'incapacidad'
  | 'fallecimiento'
  | 'dependencia'
  | 'desempleo_larga_duracion'
  | 'enfermedad_grave'
  | 'liquidez_excepcional_10anios';

export interface ParametrosRescatePlanPensiones {
  formaRescate: FormaRescate;
  contingencia: ContingenciaRescate;
  /** Importe total acumulado en el plan de pensiones (EUR) */
  totalAcumulado: number;
  /**
   * Parte del capital correspondiente a aportaciones pre-2007 (EUR)
   * Solo relevante si formaRescate = 'capital' o 'mixta'
   */
  capitalPre2007?: number;
  /**
   * Importe que se rescata en forma de capital (EUR)
   * Si formaRescate = 'capital': igual a totalAcumulado
   * Si formaRescate = 'renta': 0
   * Si formaRescate = 'mixta': importe del pago unico
   */
  importeCapital?: number;
  /** Renta anual en caso de cobro periodico (EUR/ano) */
  rentaAnual?: number;
  /** Anos desde la contingencia (para validar plazo de la reduccion 40%) */
  anosDesdeContingencia?: number;
  /**
   * Otros rendimientos del trabajo en el mismo ejercicio (EUR)
   * Para calcular tipo marginal efectivo
   */
  otrosRdtTrabajoEjercicio?: number;
}

export interface ResultadoRescatePlanPensiones {
  formaRescate: FormaRescate;
  contingencia: ContingenciaRescate;
  totalAcumulado: number;
  importeCapital: number;
  rentaAnual: number;
  capitalPre2007: number;
  /** Aplica la reduccion del 40%? */
  aplicaReduccion40pct: boolean;
  motivoNoReduccion?: string;
  /** Importe de la reduccion del 40% (EUR) */
  importeReduccion: number;
  /** Base imponible por el capital (tras reduccion) — RDT ejercicio actual (EUR) */
  baseImponibleCapital: number;
  /** Tipo marginal estimado aplicable al rescate (%) */
  tipoMarginalEstimado: number;
  /** Cuota IRPF estimada por el rescate en capital (EUR) */
  cuotaEstimadaCapital: number;
  /** Ahorro fiscal por la reduccion 40% (EUR) */
  ahorroReduccion: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion auxiliar ---

function cuotaEscalaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of TRAMOS_GENERAL_2025) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularRescatePlanPensiones(
  p: ParametrosRescatePlanPensiones
): ResultadoRescatePlanPensiones {
  if (p.totalAcumulado <= 0) throw new Error('El total acumulado debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const importeCapital = r(p.importeCapital ?? (p.formaRescate === 'capital' ? p.totalAcumulado : 0));
  const rentaAnual = r(p.rentaAnual ?? 0);
  const capitalPre2007 = r(p.capitalPre2007 ?? 0);
  const otrosRdt = r(p.otrosRdtTrabajoEjercicio ?? 0);

  // Validar reduccion 40%
  let aplicaReduccion40pct = false;
  let motivoNoReduccion: string | undefined;
  let importeReduccion = 0;

  if (capitalPre2007 > 0) {
    if (p.formaRescate === 'renta') {
      motivoNoReduccion = 'La reduccion del 40% solo aplica al rescate en CAPITAL, no en forma de renta periodica.';
    } else if (p.anosDesdeContingencia !== undefined && p.anosDesdeContingencia > ANOS_PLAZO_REDUCCION) {
      motivoNoReduccion = 'Han transcurrido mas de ' + ANOS_PLAZO_REDUCCION + ' anos desde la contingencia. ' +
        'El plazo para aplicar la reduccion del 40% ha expirado (DA 12.a LIRPF).';
    } else if (importeCapital <= 0) {
      motivoNoReduccion = 'No hay importe de capital definido.';
    } else {
      aplicaReduccion40pct = true;
      // La reduccion se aplica sobre la parte del capital correspondiente a aportaciones pre-2007
      const baseReducible = Math.min(capitalPre2007, importeCapital);
      importeReduccion = r(baseReducible * PCT_REDUCCION_PRE2007 / 100);
    }
  } else if (p.formaRescate !== 'renta') {
    motivoNoReduccion = 'No se han indicado aportaciones pre-2007 (capitalPre2007 = 0). ' +
      'La reduccion del 40% solo aplica sobre la parte acumulada de aportaciones anteriores a 01/01/2007.';
  }

  // Base imponible del capital
  const baseImponibleCapital = r(importeCapital - importeReduccion);

  // Tipo marginal estimado
  const baseAcumulada = r(otrosRdt + baseImponibleCapital);
  const cuotaTotal = r(cuotaEscalaGeneral(baseAcumulada));
  const cuotaSinRescate = r(cuotaEscalaGeneral(otrosRdt));
  const cuotaEstimadaCapital = r(cuotaTotal - cuotaSinRescate);

  const tipoMarginalEstimado = baseImponibleCapital > 0
    ? r(cuotaEstimadaCapital / baseImponibleCapital * 100)
    : 0;

  // Ahorro por reduccion
  const cuotaSinReduccion = r(cuotaEscalaGeneral(r(otrosRdt + importeCapital)) - cuotaSinRescate);
  const ahorroReduccion = r(Math.max(0, cuotaSinReduccion - cuotaEstimadaCapital));

  // Advertencias
  advertencias.push(
    'TRIBUTACION COMO RDT: el rescate del plan de pensiones tributa como rendimiento ' +
    'del TRABAJO en la BASE GENERAL (escala progresiva 19%-47%), NO como ganancia ' +
    'patrimonial. El tipo efectivo puede ser muy superior al de otros productos financieros.'
  );

  if (p.formaRescate === 'capital') {
    advertencias.push(
      'RESCATE EN CAPITAL: todo el importe tributa en UN SOLO EJERCICIO. Esto puede ' +
      'elevar el tipo marginal significativamente. Considere el rescate mixto o en renta ' +
      'para distribuir la carga fiscal entre varios ejercicios.'
    );
  }

  if (aplicaReduccion40pct) {
    advertencias.push(
      'REDUCCION 40% (DA 12.a LIRPF): aplica sobre la parte del capital ' +
      'correspondiente a aportaciones pre-2007 (' + capitalPre2007.toLocaleString('es-ES') + ' EUR). ' +
      'Esta reduccion solo puede aplicarse UNA VEZ por plan y contingencia, ' +
      'y en los ' + ANOS_PLAZO_REDUCCION + ' anos siguientes a la contingencia.'
    );
  }

  if (p.contingencia === 'liquidez_excepcional_10anios') {
    advertencias.push(
      'LIQUIDEZ EXCEPCIONAL: desde 2025, pueden rescatarse aportaciones realizadas ' +
      'antes del 01/01/2015 que lleven 10 anos en el plan. No se requiere contingencia especial, ' +
      'pero tributan igualmente como RDT (sin reduccion del 40%).'
    );
  }

  advertencias.push(
    'TIPO ESTIMADO: la escala usada es la general estatal + autonomica media. ' +
    'El tipo real depende de la CCAA de residencia y de la totalidad de rendimientos del ejercicio. ' +
    'La entidad gestora practica retencion antes del abono.'
  );

  if (rentaAnual > 0) {
    advertencias.push(
      'RENTA PERIODICA: cada pago de ' + rentaAnual.toLocaleString('es-ES') + ' EUR/ano ' +
      'tributa como RDT en el ejercicio de cobro. La carga fiscal se distribuye entre ' +
      'varios ejercicios, lo que generalmente reduce el tipo efectivo total.'
    );
  }

  return {
    formaRescate: p.formaRescate,
    contingencia: p.contingencia,
    totalAcumulado: r(p.totalAcumulado),
    importeCapital,
    rentaAnual,
    capitalPre2007,
    aplicaReduccion40pct,
    motivoNoReduccion,
    importeReduccion,
    baseImponibleCapital,
    tipoMarginalEstimado,
    cuotaEstimadaCapital,
    ahorroReduccion,
    advertencias,
    fuenteDatos: 'LIRPF art. 17.2.a + DA 12.a — vigente 2025',
  };
}
