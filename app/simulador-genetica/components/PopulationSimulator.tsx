'use client';

import { useState } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { PopulationSimulation, PunnettResult } from './types';
import { interpretChiSquare } from './genetics';

interface PopulationSimulatorProps {
  punnett: PunnettResult;
  simulation: PopulationSimulation | null;
  populationSize: number;
  onSimulate: (size?: number) => void;
  onSetSize: (size: number) => void;
}

export default function PopulationSimulator({
  punnett,
  simulation,
  populationSize,
  onSimulate,
  onSetSize,
}: PopulationSimulatorProps) {
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 500) {
      onSetSize(value);
    }
  };

  // Calcular grados de libertad (número de fenotipos - 1)
  const degreesOfFreedom = Object.keys(punnett.phenotypeRatios).length - 1;

  const chiSquareResult = simulation?.chiSquare
    ? interpretChiSquare(simulation.chiSquare, degreesOfFreedom)
    : null;

  return (
    <div>
      <div className={styles.populationConfig}>
        <label className={styles.label}>Tamaño de población:</label>
        <input
          type="number"
          className={styles.populationInput}
          value={populationSize}
          onChange={handleSizeChange}
          min={10}
          max={500}
        />
        <button className={styles.simulateBtn} onClick={() => onSimulate()}>
          🔄 Simular
        </button>
      </div>

      {simulation && (
        <>
          {/* Grid de individuos */}
          <div className={styles.populationGrid}>
            {simulation.individuals.map((ind, i) => (
              <span
                key={i}
                className={styles.populationIndividual}
                title={`${ind.genotype}: ${ind.phenotype}`}
              >
                {ind.phenotypeIcon}
              </span>
            ))}
          </div>

          {/* Comparación observado vs esperado */}
          <div className={styles.populationResults}>
            <div className={styles.resultColumn}>
              <div className={styles.resultTitle}>Observado</div>
              {Object.entries(simulation.observedRatios).map(([phenotype, data]) => (
                <div key={phenotype} className={styles.resultRow}>
                  <span>{phenotype.split(' (')[0]}</span>
                  <span>
                    {data.count} ({data.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.resultColumn}>
              <div className={styles.resultTitle}>Esperado</div>
              {Object.entries(simulation.expectedRatios).map(([phenotype, data]) => (
                <div key={phenotype} className={styles.resultRow}>
                  <span>{phenotype.split(' (')[0]}</span>
                  <span>
                    {data.count} ({data.percentage.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chi-cuadrado */}
          {chiSquareResult && (
            <div className={styles.chiSquare}>
              <div className={styles.chiSquareTitle}>
                📐 Prueba Chi-cuadrado (χ²)
              </div>
              <div className={styles.chiSquareValue}>
                χ² = {simulation.chiSquare?.toFixed(3)}
              </div>
              <div className={styles.chiSquareInterpretation}>
                <strong>p {chiSquareResult.pValue}</strong>
                <br />
                {chiSquareResult.interpretation}
              </div>
            </div>
          )}
        </>
      )}

      {!simulation && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧬</div>
          <p className={styles.emptyText}>
            Haz clic en &quot;Simular&quot; para generar una población
          </p>
        </div>
      )}
    </div>
  );
}
