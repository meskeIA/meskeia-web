import { Trait, PopulationSimulation, PunnettResult } from '../types';
import { determinePhenotype } from './crosses';

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

  // Calcular ratios esperados
  const expectedRatios: Record<string, { count: number; percentage: number }> = {};
  for (const [phenotype, data] of Object.entries(punnett.phenotypeRatios)) {
    expectedRatios[phenotype] = {
      count: Math.round(data.count * size),
      percentage: data.count * 100,
    };
  }

  // Calcular chi-cuadrado
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

// Interpretar resultado del chi-cuadrado
export function interpretChiSquare(
  chiSquare: number,
  degreesOfFreedom: number
): {
  interpretation: string;
  isSignificant: boolean;
  pValue: string;
} {
  // Valores críticos aproximados para α = 0.05
  const criticalValues: Record<number, number> = {
    1: 3.841,
    2: 5.991,
    3: 7.815,
    4: 9.488,
    5: 11.070,
  };

  const critical = criticalValues[degreesOfFreedom] || 3.841;
  const isSignificant = chiSquare > critical;

  let interpretation: string;
  let pValue: string;

  if (chiSquare < 0.5) {
    interpretation = 'Ajuste excelente a las proporciones esperadas';
    pValue = '> 0.5';
  } else if (chiSquare < critical * 0.5) {
    interpretation = 'Buen ajuste a las proporciones mendelianas';
    pValue = '> 0.1';
  } else if (!isSignificant) {
    interpretation = 'Ajuste aceptable, diferencias por azar';
    pValue = '> 0.05';
  } else {
    interpretation = 'Diferencia significativa con lo esperado';
    pValue = '< 0.05';
  }

  return {
    interpretation,
    isSignificant,
    pValue,
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
