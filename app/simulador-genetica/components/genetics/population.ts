import { Trait, PopulationSimulation, PunnettResult } from '../types';
import { determinePhenotype } from './crosses';
import { formatNumber } from '@/lib';
import { pValorChiCuadrado, valorCriticoChiCuadrado } from './chiCuadrado';

/**
 * El p-valor, con el separador decimal español.
 *
 * ⚠️ 14/09/2026 (hallazgo 828) — los cuatro umbrales iban como cadenas fijas con punto
 * ('> 0.5', '> 0.1', '> 0.05', '< 0.05') en una pantalla donde el cuadro de Punnett y el
 * panel de población sí pasan por `formatNumber`: la misma vista mezclaba los dos formatos.
 * Construirlo aquí impide que el siguiente umbral vuelva a escribirse a mano.
 */
const pTexto = (signo: '>' | '<', umbral: number): string =>
  `${signo} ${formatNumber(umbral, umbral < 0.1 ? 2 : 1)}`;

// Simular una población de N individuos basada en las probabilidades del Punnett
export function simulatePopulation(
  punnett: PunnettResult,
  size: number,
  trait: Trait
): PopulationSimulation {
  const individuals: Array<{
    genotype: string;
    phenotype: string;
    phenotypeIcon: string;
  }> = [];

  // Crear array de probabilidades acumuladas para selección aleatoria
  const cells = punnett.cells;
  const cumulativeProbabilities: number[] = [];
  let cumulative = 0;

  for (const cell of cells) {
    cumulative += cell.probability;
    cumulativeProbabilities.push(cumulative);
  }

  // Generar individuos aleatorios
  for (let i = 0; i < size; i++) {
    const random = Math.random();
    let selectedCell = cells[0];

    for (let j = 0; j < cumulativeProbabilities.length; j++) {
      if (random <= cumulativeProbabilities[j]) {
        selectedCell = cells[j];
        break;
      }
    }

    individuals.push({
      genotype: selectedCell.genotype,
      phenotype: selectedCell.phenotype,
      phenotypeIcon: selectedCell.phenotypeIcon,
    });
  }

  // Calcular ratios observados
  const observedCounts: Record<string, number> = {};
  for (const ind of individuals) {
    observedCounts[ind.phenotype] = (observedCounts[ind.phenotype] || 0) + 1;
  }

  const observedRatios: Record<string, { count: number; percentage: number }> = {};
  for (const [phenotype, count] of Object.entries(observedCounts)) {
    observedRatios[phenotype] = {
      count,
      percentage: (count / size) * 100,
    };
  }

  /**
   * Ratios esperados.
   *
   * ⚠️ 22/09/2026 (hallazgo 1204) — cada categoría se redondeaba por separado con `Math.round`,
   * que además sube los medios, así que las cuatro esperanzas de un dihíbrido con N=200
   * —112,5 · 37,5 · 37,5 · 12,5— se publicaban como 113 + 38 + 38 + 13 = 202. «Observado» suma
   * 200 porque cuenta individuos reales, de modo que las dos columnas que se ponen una al lado
   * de la otra PARA COMPARARSE no hablaban de la misma población.
   *
   * La frecuencia esperada no es un número de individuos: es una esperanza matemática, y con
   * decimales suma exactamente N —112,5 + 37,5 + 37,5 + 12,5 = 200— que es además como la
   * escribe cualquier libro al plantear el chi-cuadrado. Redondear el reparto habría hecho
   * cuadrar la columna a costa de falsear el estadístico, que es lo que hay que evitar: el χ²
   * se calcula con las frecuencias esperadas EXACTAS, no con las enteras.
   */
  const expectedRatios: Record<string, { count: number; percentage: number }> = {};
  for (const [phenotype, data] of Object.entries(punnett.phenotypeRatios)) {
    expectedRatios[phenotype] = {
      count: data.count * size,
      percentage: data.count * 100,
    };
  }

  // Calcular chi-cuadrado, con las frecuencias esperadas exactas (hallazgo 1204)
  let chiSquare = 0;
  for (const phenotype of Object.keys(expectedRatios)) {
    const observed = observedRatios[phenotype]?.count || 0;
    const expected = expectedRatios[phenotype].count;
    if (expected > 0) {
      chiSquare += Math.pow(observed - expected, 2) / expected;
    }
  }

  return {
    size,
    individuals,
    observedRatios,
    expectedRatios,
    chiSquare,
  };
}

// Generar una visualización de la población como grid de iconos
export function generatePopulationGrid(
  simulation: PopulationSimulation,
  columns: number = 20
): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];

  for (const individual of simulation.individuals) {
    currentRow.push(individual.phenotypeIcon);
    if (currentRow.length === columns) {
      rows.push(currentRow);
      currentRow = [];
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

/** Nivel de significación del contraste que publica la pestaña Población. */
export const ALFA_CHI_CUADRADO = 0.05;

// Interpretar resultado del chi-cuadrado
export function interpretChiSquare(
  chiSquare: number,
  degreesOfFreedom: number
): {
  interpretation: string;
  isSignificant: boolean;
  pValue: string;
  /** El p-valor exacto, P(χ²_gl > χ²); null cuando el test no procede. */
  pValor: number | null;
  /** El valor crítico con α = 0,05 para ESTOS grados de libertad; null si no procede. */
  valorCritico: number | null;
} {
  /**
   * Con UNA sola categoría no hay test que hacer.
   *
   * ⚠️ 14/09/2026 (hallazgo 832) — un cruce que produce un único fenotipo (AA × aa: toda la
   * F1 es Aa) deja 0 grados de libertad. El estadístico no puede valer entonces otra cosa
   * que 0, porque observado y esperado coinciden por construcción, y `criticalValues[0]` no
   * existía, así que caía al valor de 1 g.l. (3,841) y la app presentaba «χ² = 0,000 · p >
   * 0,5 · Ajuste excelente a las proporciones esperadas», idéntico en todas las corridas,
   * como si fuera evidencia de ajuste. El bloque educativo promete que «el test chi-cuadrado
   * verifica si los resultados son estadísticamente esperables», y ahí no verificaba nada.
   */
  if (degreesOfFreedom < 1) {
    return {
      interpretation:
        'El cruce produce un solo fenotipo, así que no hay grados de libertad: no hay proporciones que contrastar y el test no procede.',
      isSignificant: false,
      pValue: 'no procede',
      pValor: null,
      valorCritico: null,
    };
  }

  /**
   * El veredicto sale del p-valor EXACTO para los grados de libertad del cruce (hallazgo 1586,
   * ver `chiCuadrado.ts`): antes, una tabla de críticos de gl 1 a 5 con `|| 3.841` para el
   * resto juzgaba un cruce de 8 fenotipos (gl = 7, crítico 14,067) como si tuviera uno.
   *
   * Las cuatro franjas se cortan ahora por el propio p y no por fracciones del crítico. Antes
   * «Ajuste excelente · p > 0,5» era χ² < 0,5 para cualquier gl, y con gl = 1 la mediana es
   * 0,455: un χ² de 0,48 daba p = 0,49 y se publicaba «p > 0,5».
   */
  const pValor = pValorChiCuadrado(chiSquare, degreesOfFreedom);
  const valorCritico = valorCriticoChiCuadrado(degreesOfFreedom, ALFA_CHI_CUADRADO);
  const isSignificant = pValor < ALFA_CHI_CUADRADO;

  let interpretation: string;
  let pValue: string;

  if (isSignificant) {
    interpretation = 'Diferencia significativa con lo esperado';
    pValue = pTexto('<', ALFA_CHI_CUADRADO);
  } else if (pValor > 0.5) {
    interpretation = 'Ajuste excelente a las proporciones esperadas';
    pValue = pTexto('>', 0.5);
  } else if (pValor > 0.1) {
    interpretation = 'Buen ajuste a las proporciones mendelianas';
    pValue = pTexto('>', 0.1);
  } else {
    interpretation = 'Ajuste aceptable, diferencias por azar';
    pValue = pTexto('>', ALFA_CHI_CUADRADO);
  }

  return {
    interpretation,
    isSignificant,
    pValue,
    pValor,
    valorCritico,
  };
}

// Calcular tamaño de muestra recomendado para detectar proporciones
export function getRecommendedSampleSize(
  expectedRatio: number,
  precision: number = 0.05
): number {
  // Fórmula aproximada: n = (Z² * p * (1-p)) / E²
  // Z = 1.96 para 95% de confianza
  const z = 1.96;
  const p = expectedRatio;
  const e = precision;

  return Math.ceil((z * z * p * (1 - p)) / (e * e));
}
