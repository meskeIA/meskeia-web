/**
 * Calculadora de Rescate de Plan de Pensiones en IRPF
 * Usada por: /chatgpt/rescate-plan-pensiones
 *
 * Calcula la tributacion del rescate de un plan de pensiones (u otro
 * sistema de prevision social: PPA, PIAS, mutualidades, planes de empleo)
 * en el IRPF, incluyendo la reduccion del 40% por aportaciones anteriores
 * a 31/12/2006 para el cobro en forma de capital.
 *
 * Marco normativo:
 *   - LIRPF art. 17.2.a: prestaciones de sistemas de prevision social como RDT
 *   - LIRPF DT 12.ª: regimen transitorio reduccion 40% para aportaciones pre-2007
 *     (hasta el 29/10/2026 este fichero la llamaba «DA 12.a»: es la disposicion
 *     TRANSITORIA duodecima, no una adicional)
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
 * REDUCCION DEL 40% (DT 12.ª LIRPF — regimen transitorio):
 *   - Solo para aportaciones realizadas HASTA el 31/12/2006
 *   - Solo si el cobro es en forma de CAPITAL (no en renta)
 *   - Solo aplicable UNA VEZ por cada plan (y por cada contingencia)
 *   - Plazo para aplicarla: en el ejercicio en que se produce la contingencia o en los
 *     dos siguientes (DT 12.ª.4), sea jubilacion, incapacidad, fallecimiento, dependencia
 *     o desempleo de larga duracion. `anosDesdeContingencia` se lee como ejercicios
 *     transcurridos: 0 = el mismo ano.
 *   - El porcentaje y el plazo NO se escriben aqui: son REGIMEN_TRANSITORIO_PLANES de
 *     data/fiscal/pensiones-irpf.ts desde el 29/10/2026 (cabo C0124), y la escala es
 *     TRAMOS_IRPF_2025 de data/fiscal/irpf.ts (hasta esa fecha, una copia local identica)
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
 * Fuente: LIRPF art. 17.2.a + DT 12.ª — sellos en data/fiscal (pensiones-irpf.ts e irpf.ts)
 *
 * Encadenable con: calcular_irpf, calcular_reduccion_plan_pensiones_irpf, calcular_pension_jubilacion_ss
 */

import { REGIMEN_TRANSITORIO_PLANES, cuotaEscalaGeneral } from '@/data/fiscal';

// --- Constantes ---

const PCT_REDUCCION_PRE2007 = REGIMEN_TRANSITORIO_PLANES.reduccionCapitalPct;          // % reduccion sobre capital pre-2007
const ANOS_PLAZO_REDUCCION = REGIMEN_TRANSITORIO_PLANES.ejerciciosSiguientesContingencia; // ejercicios tras el de la contingencia

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
  /** Ejercicios transcurridos desde el de la contingencia, 0 = el mismo (plazo de la DT 12.ª.4) */
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
      motivoNoReduccion = 'La reduccion del ' + PCT_REDUCCION_PRE2007 + '% solo aplica al rescate en CAPITAL, no en forma de renta periodica.';
    } else if (p.anosDesdeContingencia !== undefined && p.anosDesdeContingencia > ANOS_PLAZO_REDUCCION) {
      motivoNoReduccion = 'Han pasado mas de ' + ANOS_PLAZO_REDUCCION + ' ejercicios desde el de la contingencia. ' +
        'El plazo para aplicar la reduccion del ' + PCT_REDUCCION_PRE2007 + '% ha expirado (DT 12.ª.4 LIRPF).';
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
      'La reduccion del ' + PCT_REDUCCION_PRE2007 + '% solo aplica sobre la parte acumulada de aportaciones anteriores a 01/01/2007.';
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
      'REDUCCION ' + PCT_REDUCCION_PRE2007 + '% (DT 12.ª LIRPF): aplica sobre la parte del capital ' +
      'correspondiente a aportaciones pre-2007 (' + capitalPre2007.toLocaleString('es-ES') + ' EUR). ' +
      'Esta reduccion solo puede aplicarse UNA VEZ por plan y contingencia, ' +
      'y en el ejercicio de la contingencia o en los ' + ANOS_PLAZO_REDUCCION + ' siguientes.'
    );
  }

  if (p.contingencia === 'liquidez_excepcional_10anios') {
    advertencias.push(
      'LIQUIDEZ EXCEPCIONAL: desde 2025, pueden rescatarse aportaciones realizadas ' +
      'antes del 01/01/2015 que lleven 10 anos en el plan. No se requiere contingencia especial, ' +
      'pero tributan igualmente como RDT (sin reduccion del ' + PCT_REDUCCION_PRE2007 + '%).'
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
    fuenteDatos: 'LIRPF art. 17.2.a + DT 12.ª — ' + REGIMEN_TRANSITORIO_PLANES.baseNormativa,
  };
}
