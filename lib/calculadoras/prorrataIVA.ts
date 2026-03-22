/**
 * Calculadora de Prorrata del IVA — lógica pura
 * Usada por: MCP server (calcular_prorrata_iva)
 *
 * Calcula el porcentaje de deducción del IVA soportado cuando el sujeto
 * pasivo realiza simultáneamente operaciones que dan derecho a deducción
 * (sujetas y no exentas) y operaciones que NO dan derecho a deducción
 * (exentas o no sujetas), aplicando la regla de la prorrata del IVA.
 *
 * Marco normativo:
 *   - LIVA arts. 102-106: regla de prorrata general y especial
 *   - RIVA arts. 28-34: desarrollo reglamentario
 *   - LIVA art. 99: condiciones para la deducción
 *
 * PRORRATA GENERAL (LIVA art. 104):
 *   Porcentaje = (Operaciones con derecho a deducción / Total operaciones) x 100
 *   - Siempre se redondea AL ALZA a la unidad superior (art. 104.Dos.2.a)
 *   - Excluidos del denominador: autoconsumos, subvenciones vinculadas
 *     a precio, actividades inmobiliarias o financieras ocasionales
 *   - La prorrata PROVISIONAL (año en curso) = definitiva del año anterior
 *   - La prorrata DEFINITIVA se calcula al cierre del ejercicio
 *
 * PRORRATA ESPECIAL (LIVA art. 106):
 *   Mas precisa pero opcional (obligatoria si prorrata general < definitiva -10%).
 *   - Cuotas de operaciones exclusivamente deducibles: 100%
 *   - Cuotas de operaciones exclusivamente no deducibles: 0%
 *   - Cuotas comunes (gastos generales): segun % prorrata general
 *
 * Fuente: LIVA arts. 102-106 + RIVA arts. 28-34 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_modelo_303, calcular_iva, calcular_impuesto_sociedades
 */

// --- Tipos publicos ---

export type TipoProrrata = 'general' | 'especial';

export interface OperacionIVA {
  descripcion?: string;
  importe: number;
  conDerechoDeduccion: boolean;
  excluirDenominador?: boolean;
}

export interface CuotaIVASoportada {
  descripcion?: string;
  cuotaIVA: number;
  afectacion: 'exclusiva_deducible' | 'exclusiva_no_deducible' | 'comun';
}

export interface ParametrosProrrataIVA {
  tipoProrrata: TipoProrrata;
  operaciones: OperacionIVA[];
  cuotasSoportadas?: CuotaIVASoportada[];
  prorrataProvisoriaAplicada?: number;
  ivaDeducidoProvisional?: number;
}

export interface ResultadoProrrataIVA {
  tipoProrrata: TipoProrrata;
  totalOperacionesConDeduccion: number;
  totalDenominador: number;
  pctProrrata: number;
  totalIVASoportado: number;
  ivaDeducible: number;
  ivaNoDeducible: number;
  regularizacionAnual: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularProrrataIVA(p: ParametrosProrrataIVA): ResultadoProrrataIVA {
  if (!p.operaciones || p.operaciones.length === 0) {
    throw new Error('Debe indicar al menos una operacion para calcular la prorrata.');
  }

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  let numerador = 0;
  let denominador = 0;

  for (const op of p.operaciones) {
    if (op.excluirDenominador) {
      advertencias.push(
        'Operacion excluida del denominador: ' +
        (op.descripcion ?? 'sin descripcion') +
        ' (' + op.importe.toLocaleString('es-ES') + ' EUR). ' +
        'Los autoconsumos, subvenciones vinculadas y operaciones inmobiliarias/financieras ocasionales ' +
        'se excluyen del denominador de la prorrata (LIVA art. 104.Dos.2.a).'
      );
      continue;
    }
    if (op.conDerechoDeduccion) {
      numerador += op.importe;
    }
    denominador += op.importe;
  }

  numerador = r(numerador);
  denominador = r(denominador);

  if (denominador === 0) throw new Error('El denominador de la prorrata es cero. Verifique las operaciones indicadas.');

  const prorrataBruta = (numerador / denominador) * 100;
  const pctProrrata = Math.min(100, Math.ceil(prorrataBruta));

  let ivaExclusivoDeducible = 0;
  let ivaExclusivoNoDeducible = 0;
  let ivaComun = 0;

  for (const cuota of (p.cuotasSoportadas ?? [])) {
    if (cuota.afectacion === 'exclusiva_deducible') {
      ivaExclusivoDeducible += cuota.cuotaIVA;
    } else if (cuota.afectacion === 'exclusiva_no_deducible') {
      ivaExclusivoNoDeducible += cuota.cuotaIVA;
    } else {
      ivaComun += cuota.cuotaIVA;
    }
  }

  ivaExclusivoDeducible = r(ivaExclusivoDeducible);
  ivaExclusivoNoDeducible = r(ivaExclusivoNoDeducible);
  ivaComun = r(ivaComun);

  const totalIVASoportado = r(ivaExclusivoDeducible + ivaExclusivoNoDeducible + ivaComun);

  let ivaDeducible: number;
  let ivaNoDeducible: number;

  if (p.tipoProrrata === 'especial') {
    const ivaComunDeducible = r(ivaComun * pctProrrata / 100);
    ivaDeducible = r(ivaExclusivoDeducible + ivaComunDeducible);
    ivaNoDeducible = r(totalIVASoportado - ivaDeducible);
    advertencias.push(
      'Prorrata especial: las cuotas de gastos exclusivamente deducibles se deducen al 100%, ' +
      'las exclusivamente no deducibles al 0%, y las comunes segun el porcentaje de prorrata. ' +
      'Es mas precisa pero requiere contabilidad mas detallada por tipo de afectacion.'
    );
  } else {
    ivaDeducible = r(totalIVASoportado * pctProrrata / 100);
    ivaNoDeducible = r(totalIVASoportado - ivaDeducible);
  }

  let regularizacionAnual = 0;
  if (p.prorrataProvisoriaAplicada !== undefined && p.ivaDeducidoProvisional !== undefined) {
    regularizacionAnual = r(ivaDeducible - p.ivaDeducidoProvisional);
    if (Math.abs(regularizacionAnual) > 0) {
      const signo = regularizacionAnual > 0 ? 'a favor de la empresa (deducir adicional)' : 'a ingresar en Hacienda';
      advertencias.push(
        'Regularizacion anual: ' +
        Math.abs(regularizacionAnual).toLocaleString('es-ES', { minimumFractionDigits: 2 }) +
        ' EUR ' + signo + '. Se incluye en el modelo 303 del 4.o trimestre.'
      );
    }
  }

  advertencias.push(
    'Prorrata provisional para el proximo ejercicio: ' + pctProrrata + '% ' +
    '(igual a la prorrata definitiva de este anio). ' +
    'Se aplica en los modelos 303 trimestrales del anio siguiente hasta la regularizacion de diciembre.'
  );
  advertencias.push(
    'Redondeo al alza obligatorio (LIVA art. 104.Dos.2.a): la prorrata se redondea SIEMPRE a la unidad superior. ' +
    'Ejemplo: 72,3% -> 73%. Esto beneficia al contribuyente.'
  );
  if (pctProrrata < 10) {
    advertencias.push(
      'Prorrata muy baja (<10%): casi todas sus operaciones son exentas. ' +
      'Verifique si alguna exencion puede renunciarse (arts. 20.Dos LIVA) para recuperar mas IVA soportado.'
    );
  }

  return {
    tipoProrrata: p.tipoProrrata,
    totalOperacionesConDeduccion: numerador,
    totalDenominador: denominador,
    pctProrrata,
    totalIVASoportado,
    ivaDeducible,
    ivaNoDeducible,
    regularizacionAnual,
    advertencias,
    fuenteDatos: 'LIVA arts. 102-106 + RIVA arts. 28-34 - vigente 2025',
  };
}
