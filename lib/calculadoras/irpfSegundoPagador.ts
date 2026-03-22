/**
 * Calculadora IRPF Segundo Pagador — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_irpf_segunda_pagador)
 *
 * Determina si existe obligación de presentar la declaración de IRPF cuando
 * hay más de un pagador, y calcula el impacto en la retención y la posible
 * deuda/devolución con Hacienda.
 *
 * Regla del segundo pagador (LIRPF art. 96.3):
 *   Si los rendimientos del trabajo proceden de más de un pagador, la obligación
 *   de declarar se activa cuando la suma de los importes percibidos del segundo
 *   y restantes pagadores supera 1.500 €/año.
 *
 *   Si supera 1.500 €: el límite de obligación de declarar baja de 22.000 € a 15.000 €
 *   Si no supera 1.500 €: el límite sigue siendo 22.000 €
 *
 * Límites para 2025 (LIRPF art. 96.2-3):
 *   - Un pagador: obligación si rendimientos trabajo > 22.000 €
 *   - Dos o más pagadores y 2º pagador > 1.500 €: obligación si > 15.000 €
 *   - Dos o más pagadores y 2º pagador ≤ 1.500 €: obligación si > 22.000 €
 *
 * Problema habitual: cuando hay dos trabajos simultáneos o sucesivos, cada
 * empresa calcula la retención sobre SU parte del salario sin tener en cuenta
 * los ingresos del otro pagador. Esto genera infrarretención y una deuda en
 * la renta (resultado "a pagar" inesperado).
 *
 * Fuente: LIRPF art. 96 + RIRPF art. 88 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_devolucion_irpf
 */

// ─── Constantes 2025 ────────────────────────────────────────────────────────────

const LIMITE_SEGUNDO_PAGADOR = 1500;             // €/año — umbral que activa el segundo pagador
const LIMITE_OBLIGACION_UN_PAGADOR = 22000;      // €/año — límite con un solo pagador
const LIMITE_OBLIGACION_SEGUNDO_PAGADOR = 15000; // €/año — límite con segundo pagador > 1.500 €

// Escala IRPF 2025 (estatal + autonómica orientativa)
const TRAMOS_IRPF_2025: Array<{ hasta: number; tipo: number }> = [
  { hasta: 12450, tipo: 19 },
  { hasta: 20200, tipo: 24 },
  { hasta: 35200, tipo: 30 },
  { hasta: 60000, tipo: 37 },
  { hasta: 300000, tipo: 45 },
  { hasta: Infinity, tipo: 47 },
];

// Reducción por rendimientos del trabajo (orientativa, art. 20 LIRPF)
const REDUCCION_TRABAJO_MAX = 5565;   // € (rendimientos ≤ 13.115 €)
const REDUCCION_TRABAJO_MIN = 0;
const GASTOS_DEDUCIBLES_TRABAJO = 2000; // € (art. 19.2 LIRPF)

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface PagadorInfo {
  /** Descripción del pagador (ej: "Empresa A", "SEPE", "Segunda empresa") */
  descripcion: string;
  /** Rendimientos brutos percibidos de este pagador (€) */
  importeBruto: number;
  /** Retenciones practicadas por este pagador (€) */
  retencionesPracticadas: number;
}

export interface ParametrosIRPFSegundoPagador {
  /** Lista de pagadores (mínimo 1) */
  pagadores: PagadorInfo[];
}

export interface ResultadoIRPFSegundoPagador {
  /** Lista de pagadores ordenados de mayor a menor importe */
  pagadores: PagadorInfo[];
  /** Total rendimientos brutos de trabajo (€) */
  totalRendimientosBrutos: number;
  /** Importe percibido del segundo y restantes pagadores (€) */
  importeSegundoYRestantesPagadores: number;
  /** ¿Supera el umbral de 1.500 € del segundo pagador? */
  superaUmbralSegundoPagador: boolean;
  /** Límite de obligación de declarar aplicable (€) */
  limiteObligacionDeclarar: number;
  /** ¿Existe obligación de presentar la declaración? */
  obligacionDeclarar: boolean;
  /** Total retenciones practicadas por todos los pagadores (€) */
  totalRetencionesPracticadas: number;
  /**
   * Cuota IRPF estimada sobre el total de rendimientos (€).
   * Calculada aplicando la escala IRPF 2025 sobre el total acumulado.
   */
  cuotaIRPFEstimada: number;
  /** Tipo efectivo estimado (%) */
  tipoEfectivoEstimado: number;
  /**
   * Resultado estimado de la declaración (€):
   * Negativo = a devolver; positivo = a pagar.
   */
  resultadoEstimadoDeclaracion: number;
  /** ¿El resultado es a pagar o a devolver? */
  resultadoDeclaracion: 'a_pagar' | 'a_devolver' | 'cero';
  /** Retención óptima mensual recomendada sobre el salario total (€) */
  retencionOptimaMensual: number;
  /** Tipo de retención efectivo recomendado (%) */
  tipoRetencionRecomendado: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function estimarCuotaIRPF(rendimientosBrutos: number): number {
  // Reducción por rendimientos del trabajo (orientativa)
  let reduccionTrabajo: number;
  if (rendimientosBrutos <= 13115) {
    reduccionTrabajo = REDUCCION_TRABAJO_MAX;
  } else if (rendimientosBrutos <= 16825) {
    reduccionTrabajo = Math.max(REDUCCION_TRABAJO_MIN, REDUCCION_TRABAJO_MAX - 1.14286 * (rendimientosBrutos - 13115));
  } else {
    reduccionTrabajo = REDUCCION_TRABAJO_MIN;
  }

  const rendimientoNeto = Math.max(0, rendimientosBrutos - GASTOS_DEDUCIBLES_TRABAJO - reduccionTrabajo);

  // Mínimo personal (soltero orientativo)
  const minimoPersonal = 5550;
  const baseLiquidable = Math.max(0, rendimientoNeto - minimoPersonal);

  // Aplicar escala IRPF
  let cuota = 0;
  let baseAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseLiquidable <= baseAnterior) break;
    const base = Math.min(baseLiquidable, tramo.hasta === Infinity ? baseLiquidable : tramo.hasta);
    cuota += (base - baseAnterior) * tramo.tipo / 100;
    baseAnterior = tramo.hasta === Infinity ? baseLiquidable : tramo.hasta;
    if (baseLiquidable <= tramo.hasta) break;
  }
  return Math.round(cuota * 100) / 100;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIRPFSegundoPagador(p: ParametrosIRPFSegundoPagador): ResultadoIRPFSegundoPagador {
  if (!p.pagadores || p.pagadores.length < 1) throw new Error('Debe indicar al menos un pagador.');
  if (p.pagadores.some(pg => pg.importeBruto < 0)) throw new Error('Los importes de los pagadores no pueden ser negativos.');

  const r = (n: number) => Math.round(n * 100) / 100;

  // Ordenar: el pagador principal es el de mayor importe
  const pagadoresOrdenados = [...p.pagadores].sort((a, b) => b.importeBruto - a.importeBruto);

  const totalRendimientosBrutos = r(pagadoresOrdenados.reduce((s, pg) => s + pg.importeBruto, 0));
  const totalRetencionesPracticadas = r(pagadoresOrdenados.reduce((s, pg) => s + pg.retencionesPracticadas, 0));

  // El segundo y restantes pagadores son todos excepto el primero
  const importeSegundoYRestantes = r(
    pagadoresOrdenados.slice(1).reduce((s, pg) => s + pg.importeBruto, 0)
  );

  const superaUmbral = importeSegundoYRestantes > LIMITE_SEGUNDO_PAGADOR;
  const limiteObligacion = superaUmbral ? LIMITE_OBLIGACION_SEGUNDO_PAGADOR : LIMITE_OBLIGACION_UN_PAGADOR;
  const obligacionDeclarar = totalRendimientosBrutos > limiteObligacion;

  // Estimación cuota IRPF sobre el total
  const cuotaIRPFEstimada = estimarCuotaIRPF(totalRendimientosBrutos);
  const tipoEfectivoEstimado = totalRendimientosBrutos > 0
    ? r(cuotaIRPFEstimada / totalRendimientosBrutos * 100)
    : 0;

  const resultadoEstimado = r(cuotaIRPFEstimada - totalRetencionesPracticadas);
  const resultadoDeclaracion: 'a_pagar' | 'a_devolver' | 'cero' =
    resultadoEstimado > 0.01 ? 'a_pagar' : resultadoEstimado < -0.01 ? 'a_devolver' : 'cero';

  const tipoRetencionRecomendado = tipoEfectivoEstimado;
  const retencionOptimaMensual = r(cuotaIRPFEstimada / 12);

  const advertencias: string[] = [
    `Regla del segundo pagador (LIRPF art. 96.3): si el 2º pagador supera ${LIMITE_SEGUNDO_PAGADOR.toLocaleString('es-ES')} €/año, la obligación de declarar se activa con ingresos totales > ${LIMITE_OBLIGACION_SEGUNDO_PAGADOR.toLocaleString('es-ES')} € (en lugar de los ${LIMITE_OBLIGACION_UN_PAGADOR.toLocaleString('es-ES')} € habituales).`,
    'Cada empresa retiene el IRPF solo sobre lo que ella paga, sin tener en cuenta los ingresos del otro pagador. Esto genera retención insuficiente y puede resultar en deuda en la declaración de la renta.',
    'Para evitar la deuda, comunicar al pagador principal los ingresos del segundo pagador mediante el modelo 145 actualizado, solicitando un tipo de retención mayor.',
    'La cuota IRPF estimada es orientativa (situación: soltero sin hijos, solo rendimientos del trabajo). La cuota real depende de deducciones adicionales, rendimientos de capital y circunstancias personales completas.',
  ];

  if (resultadoDeclaracion === 'a_pagar') {
    advertencias.unshift(`⚠️ Resultado estimado A PAGAR: ${Math.abs(resultadoEstimado).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €. Las retenciones acumuladas son insuficientes. Solicita un tipo de retención mayor al pagador principal indicando los ingresos del segundo pagador en el modelo 145.`);
  }

  return {
    pagadores: pagadoresOrdenados,
    totalRendimientosBrutos,
    importeSegundoYRestantesPagadores: importeSegundoYRestantes,
    superaUmbralSegundoPagador: superaUmbral,
    limiteObligacionDeclarar: limiteObligacion,
    obligacionDeclarar,
    totalRetencionesPracticadas,
    cuotaIRPFEstimada,
    tipoEfectivoEstimado,
    resultadoEstimadoDeclaracion: resultadoEstimado,
    resultadoDeclaracion,
    retencionOptimaMensual,
    tipoRetencionRecomendado,
    advertencias,
    fuenteDatos: 'LIRPF art. 96 + RIRPF art. 88 — vigente 2025',
  };
}
