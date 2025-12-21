'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from '../SimuladorGenetica.module.css';
import { PunnettResult, PunnettAnimationState } from './types';

interface PunnettSquareProps {
  punnett: PunnettResult;
  animationState: PunnettAnimationState;
  animationStep: number;
  onStartAnimation: () => void;
  onNextStep: () => void;
  onResetAnimation: () => void;
}

export default function PunnettSquare({
  punnett,
  animationState,
  animationStep,
  onStartAnimation,
  onNextStep,
  onResetAnimation,
}: PunnettSquareProps) {
  const [visibleCells, setVisibleCells] = useState<Set<number>>(new Set());

  // Manejar animación
  useEffect(() => {
    if (animationState === 'complete') {
      // Mostrar todas las celdas
      const allCells = new Set(punnett.cells.map((_, i) => i));
      setVisibleCells(allCells);
    } else if (animationState === 'filling-cells') {
      // Mostrar celdas progresivamente
      const cells = new Set<number>();
      for (let i = 0; i <= animationStep; i++) {
        cells.add(i);
      }
      setVisibleCells(cells);
    } else if (animationState === 'idle') {
      // Mostrar todas las celdas sin animación
      const allCells = new Set(punnett.cells.map((_, i) => i));
      setVisibleCells(allCells);
    } else {
      setVisibleCells(new Set());
    }
  }, [animationState, animationStep, punnett.cells]);

  // Auto-avanzar animación
  useEffect(() => {
    if (animationState === 'showing-gametes') {
      const timer = setTimeout(onNextStep, 1000);
      return () => clearTimeout(timer);
    } else if (animationState === 'filling-cells' && animationStep < punnett.cells.length) {
      const timer = setTimeout(onNextStep, 300);
      return () => clearTimeout(timer);
    }
  }, [animationState, animationStep, punnett.cells.length, onNextStep]);

  const isDihybrid = punnett.size === 4;

  // Obtener gametos únicos para cabeceras
  const uniqueGametes1 = [...new Set(punnett.gametes1)];
  const uniqueGametes2 = [...new Set(punnett.gametes2)];

  return (
    <div className={styles.punnettContainer}>
      <div className={styles.animationControls}>
        {animationState === 'idle' && (
          <button className={styles.animBtn} onClick={onStartAnimation}>
            ▶️ Animar
          </button>
        )}
        {(animationState === 'showing-gametes' || animationState === 'filling-cells') && (
          <button className={styles.animBtn} disabled>
            Animando...
          </button>
        )}
        {animationState === 'complete' && (
          <button className={styles.animBtn} onClick={onResetAnimation}>
            🔄 Reiniciar
          </button>
        )}
      </div>

      <table className={styles.punnettTable}>
        <thead>
          <tr>
            <th className={styles.corner}></th>
            {uniqueGametes1.map((gamete, i) => (
              <th
                key={i}
                colSpan={isDihybrid ? 1 : 1}
                style={{
                  opacity: animationState === 'showing-gametes' || animationState === 'idle' ? 1 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {gamete}
                <br />
                <small>({((1 / uniqueGametes1.length) * 100).toFixed(0)}%)</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {uniqueGametes2.map((gamete2, rowIndex) => (
            <tr key={rowIndex}>
              <th
                style={{
                  opacity: animationState === 'showing-gametes' || animationState === 'idle' ? 1 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {gamete2}
                <br />
                <small>({((1 / uniqueGametes2.length) * 100).toFixed(0)}%)</small>
              </th>
              {uniqueGametes1.map((_, colIndex) => {
                const cellIndex = rowIndex * uniqueGametes1.length + colIndex;
                const cell = punnett.cells[cellIndex];
                const isVisible = visibleCells.has(cellIndex);
                const isAnimating = animationState === 'filling-cells' && animationStep === cellIndex;

                if (!cell) return <td key={colIndex}></td>;

                return (
                  <td
                    key={colIndex}
                    className={`${styles.punnettCell} ${isAnimating ? styles.animating : ''}`}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className={styles.cellGenotype}>{cell.genotype}</div>
                    <div className={styles.cellIcon}>{cell.phenotypeIcon}</div>
                    <div className={styles.cellPhenotype}>{cell.phenotype}</div>
                    <div className={styles.cellProbability}>
                      {(cell.probability * 100).toFixed(1)}%
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
