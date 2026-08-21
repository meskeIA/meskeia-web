'use client';

import { useState } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { formatNumber } from '@/lib';
import { PopulationSimulation, PunnettResult } from './types';
import { interpretChiSquare } from './genetics';

const TAMANO_MINIMO = 10;
const TAMANO_MAXIMO = 500;

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
  const [avisoTamano, setAvisoTamano] = useState('');

  /**
   * El campo declara min=10 y max=500, pero el validador solo comprobaba `> 0 && <= 500`:
   * los valores entre 1 y 9 se simulaban aunque `checkValidity()` los diera por inválidos,
   * y los rechazados revertían sin decir nada (Inspector, 20/08/2026).
   */
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bruto = e.target.value;
    if (bruto.trim() === '') {
      setAvisoTamano('');
      return;
    }
    const value = parseInt(bruto, 10);
    if (isNaN(value) || value < TAMANO_MINIMO || value > TAMANO_MAXIMO) {
      setAvisoTamano(
        `El tamaño de la población debe estar entre ${TAMANO_MINIMO} y ${TAMANO_MAXIMO} individuos.`,
      );
      return;
    }
    setAvisoTamano('');
    onSetSize(value);
  };

  // Calcular grados de libertad (número de fenotipos - 1)
  const degreesOfFreedom = Object.keys(punnett.phenotypeRatios).length - 1;

  // `chiSquare` puede valer 0 —ajuste perfecto, el caso que la FAQ describe como
  // excelente— y con la comprobación por veracidad el panel entero desaparecía justo ahí.
  const chiSquareResult =
    simulation != null && simulation.chiSquare != null
      ? interpretChiSquare(simulation.chiSquare, degreesOfFreedom)
      : null;

  return (
    <div>
      <div className={styles.populationConfig}>
        <label className={styles.label} htmlFor="tamano-poblacion">
          Tamaño de población:
        </label>
        <input
          id="tamano-poblacion"
          type="number"
          className={styles.populationInput}
          value={populationSize}
          onChange={handleSizeChange}
          min={TAMANO_MINIMO}
          max={TAMANO_MAXIMO}
          aria-invalid={avisoTamano !== ''}
          aria-describedby={avisoTamano ? 'aviso-tamano-poblacion' : undefined}
        />
        <button type="button" className={styles.simulateBtn} onClick={() => onSimulate()}>
          <span aria-hidden="true">🔄</span> Simular
        </button>
      </div>

      {avisoTamano && (
        <p id="aviso-tamano-poblacion" role="alert" className={styles.avisoTamano}>
          {avisoTamano}
        </p>
      )}

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
                  <span>{phenotype}</span>
                  <span>
                    {data.count} ({formatNumber(data.percentage, 1)}%)
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.resultColumn}>
              <div className={styles.resultTitle}>Esperado</div>
              {Object.entries(simulation.expectedRatios).map(([phenotype, data]) => (
                <div key={phenotype} className={styles.resultRow}>
                  <span>{phenotype}</span>
                  <span>
                    {data.count} ({formatNumber(data.percentage, 1)}%)
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
                χ² = {formatNumber(simulation.chiSquare ?? 0, 3)}
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
