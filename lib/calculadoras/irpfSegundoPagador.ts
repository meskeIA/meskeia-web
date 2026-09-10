/**
 * Calculadora IRPF Segundo Pagador — lógica pura sin React ni DOM
 * Usada por: /chatgpt/irpf-segundo-pagador
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
 *   Si supera 1.500 €: el límite de obligación de declarar baja de 22.000 € a 15.876 €
 *   Si no supera 1.500 €: el límite sigue siendo 22.000 €
 *
 * Límites para 2025 (LIRPF art. 96.2-3):
 *   - Un pagador: obligación si rendimientos trabajo > 22.000 €
 *   - Dos o más pagadores y 2º pagador > 1.500 €: obligación si > 15.876 €
 *   - Dos o más pagadores y 2º pagador ≤ 1.500 €: obligación si > 22.000 €
 *
 * Problema habitual: cuando hay dos trabajos simultáneos o sucesivos, cada
 * empresa calcula la retención sobre SU parte del salario sin tener en cuenta
 * los ingresos del otro pagador. Esto genera infrarretención y una deuda en
 * la renta (resultado "a pagar" inesperado).
 *
 * Fuente: LIRPF art. 96 + RIRPF art. 88 — vigente 2025
 * Verificado: 2026-09-09 (constantes importadas de data/fiscal, no copiadas)
 *
 * Encadenable con: calcular_irpf, calcular_sueldo_neto, calcular_devolucion_irpf
 */

// ─── Constantes: TODAS importadas de data/fiscal ────────────────────────────────
//
// ⚠️ REPARADO EL 09/09/2026. Hasta esa fecha este fichero llevaba sus propias copias, y
// dos de ellas habían envejecido: el umbral de varios pagadores estaba en 15.000 € (el
// valor anterior a la subida del SMI; data/fiscal dice 15.876 desde 2024) y la reducción
// del art. 20 en 5.565 € con los límites 13.115/16.825 comparados contra los BRUTOS en
// vez de contra el rendimiento neto.
//
// Medido antes de reparar, frente a la cadena canónica: el motor cobraba de más entre
// 15.000 y 21.000 € de brutos —hasta +1.338 € a 17.000 €—, o sea justo a quien menos
// gana. Por encima de ~21.700 € acertaba, porque su reducción mínima de 0 € coincide
// con lo que la norma dice a partir de 19.747,5 € de RNT.
//
// La escala (TRAMOS_IRPF_2025) sí coincidía tramo a tramo con el original, pero se
// importa igualmente: una copia que hoy coincide es una copia que mañana diverge.

import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  OBLIGACION_DECLARAR_2025,
  calcularReduccionRendimientosTrabajo,
} from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';

const LIMITE_SEGUNDO_PAGADOR = OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador;
const LIMITE_OBLIGACION_UN_PAGADOR = OBLIGACION_DECLARAR_2025.trabajo.unPagador;
const LIMITE_OBLIGACION_SEGUNDO_PAGADOR = OBLIGACION_DECLARAR_2025.trabajo.variosPagadores;
const GASTOS_DEDUCIBLES_TRABAJO = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

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
  // Art. 19.2.f: los gastos deducibles se restan ANTES de la reducción del art. 20, y la
  // reducción se calcula sobre el rendimiento NETO, no sobre los brutos. Compararla contra
  // los brutos desplazaba los umbrales 2.000 € y era la mitad del defecto de este motor.
  const rendimientoNetoTrabajo = Math.max(0, rendimientosBrutos - GASTOS_DEDUCIBLES_TRABAJO);
  const reduccionTrabajo = calcularReduccionRendimientosTrabajo(rendimientoNetoTrabajo);

  const rendimientoNeto = Math.max(0, rendimientoNetoTrabajo - reduccionTrabajo);

  // Mínimo personal (soltero orientativo)
  const minimoPersonal = MINIMOS_IRPF_2025.personal;

  // ⚠️ 09/09/2026: el mínimo personal y familiar NO se resta de la base. El art. 63.1.2º
  // LIRPF manda aplicar la escala a la base liquidable completa y minorar la cuota «en el
  // importe derivado de aplicar a la parte de la base liquidable general correspondiente al
  // mínimo personal y familiar esta misma escala» (AEAT, Manual Renta 2025). Restarlo de la
  // base lo valora al tipo MARGINAL y subestima la cuota — hasta 1.443 € en rentas altas.
  // `devolucionIRPF.ts` y `dividendoEmpresarial.ts` ya lo hacían así; estos motores no.
  const escala = (base: number): number => {
    let cuota = 0;
    let baseAnterior = 0;
    for (const tramo of TRAMOS_IRPF_2025) {
      if (base <= baseAnterior) break;
      cuota += (Math.min(base, tramo.hasta) - baseAnterior) * tramo.tipo / 100;
      baseAnterior = tramo.hasta;
    }
    return cuota;
  };

  const cuota = Math.max(0, escala(rendimientoNeto) - escala(Math.min(minimoPersonal, rendimientoNeto)));
  return Math.round(cuota * 100) / 100;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIRPFSegundoPagador(p: ParametrosIRPFSegundoPagador): ResultadoIRPFSegundoPagador {
  if (!p.pagadores || p.pagadores.length < 1) throw new Error('Debe indicar al menos un pagador.');
  if (p.pagadores.some(pg => pg.importeBruto < 0)) throw new Error('Los importes de los pagadores no pueden ser negativos.');
  // Las retenciones se validan igual que los importes: la guarda vivía solo en la ruta HTTP,
  // así que cualquier otro consumidor del motor podía colar una retención negativa y obtener
  // un «a pagar» inflado. Y NaN/Infinity atravesaban las dos: `NaN < 0` es false y
  // `typeof NaN === 'number'`, con lo que el motor respondía «no estás obligado a declarar»
  // calculado sobre nada. JSON.parse('1e999') devuelve Infinity, así que llegaba por HTTP.
  if (p.pagadores.some(pg => pg.retencionesPracticadas < 0)) {
    throw new Error('Las retenciones practicadas no pueden ser negativas.');
  }
  if (p.pagadores.some(pg => !Number.isFinite(pg.importeBruto) || !Number.isFinite(pg.retencionesPracticadas))) {
    throw new Error('Los importes y las retenciones deben ser números finitos.');
  }

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
    `Regla del segundo pagador (LIRPF art. 96.3): si el 2º pagador supera ${formatNumber(LIMITE_SEGUNDO_PAGADOR, 0)} €/año, la obligación de declarar se activa con ingresos totales > ${formatNumber(LIMITE_OBLIGACION_SEGUNDO_PAGADOR, 0)} € (en lugar de los ${formatNumber(LIMITE_OBLIGACION_UN_PAGADOR, 0)} € habituales).`,
    'Cada empresa retiene el IRPF solo sobre lo que ella paga, sin tener en cuenta los ingresos del otro pagador. Esto genera retención insuficiente y puede resultar en deuda en la declaración de la renta.',
    'Para evitar la deuda, comunicar al pagador principal los ingresos del segundo pagador mediante el modelo 145 actualizado, solicitando un tipo de retención mayor.',
    'La cuota IRPF estimada es orientativa (situación: soltero sin hijos, solo rendimientos del trabajo). La cuota real depende de deducciones adicionales, rendimientos de capital y circunstancias personales completas.',
  ];

  if (resultadoDeclaracion === 'a_pagar') {
    advertencias.unshift(`⚠️ Resultado estimado A PAGAR: ${formatNumber(Math.abs(resultadoEstimado))} €. Las retenciones acumuladas son insuficientes. Solicita un tipo de retención mayor al pagador principal indicando los ingresos del segundo pagador en el modelo 145.`);
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
