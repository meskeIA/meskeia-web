'use client';

import styles from '../SimuladorGenetica.module.css';
import { formatNumber } from '@/lib';
import { PunnettResult } from './types';

interface StatisticsPanelProps {
  punnett: PunnettResult;
}

export default function StatisticsPanel({ punnett }: StatisticsPanelProps) {
  // Calcular ratios simplificados
  const calculateSimplifiedRatio = (ratios: Record<string, number>): string => {
    const values = Object.values(ratios);
    if (values.length === 0) return '';

    // Encontrar el mínimo común denominador
    const minValue = Math.min(...values.filter((v) => v > 0));
    const simplified = values.map((v) => Math.round(v / minValue));

    return simplified.join(':');
  };

  const genotypeRatioStr = calculateSimplifiedRatio(punnett.genotypeRatios);
  const phenotypeRatioStr = calculateSimplifiedRatio(
    Object.fromEntries(
      Object.entries(punnett.phenotypeRatios).map(([k, v]) => [k, v.count])
    )
  );

  return (
    <div className={styles.statsGrid}>
      {/* Proporciones Genotípicas */}
      <div className={styles.statsSection}>
        <h4 className={styles.statsSectionTitle}>📊 Proporciones Genotípicas</h4>
        {Object.entries(punnett.genotypeRatios)
          .sort(([, a], [, b]) => b - a)
          .map(([genotype, ratio]) => (
            <div key={genotype} className={styles.ratioBar}>
              <span className={styles.ratioLabel}>
                <strong>{genotype}</strong>
              </span>
              <div className={styles.ratioBarContainer}>
                <div
                  className={styles.ratioBarFill}
                  style={{
                    width: `${ratio * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  }}
                />
              </div>
              <span className={styles.ratioValue}>{formatNumber(ratio * 100, 0)}%</span>
            </div>
          ))}
        {genotypeRatioStr && (
          <div className={styles.ratioSummary}>Ratio: {genotypeRatioStr}</div>
        )}
      </div>

      {/* Proporciones Fenotípicas */}
      <div className={styles.statsSection}>
        <h4 className={styles.statsSectionTitle}>🎨 Proporciones Fenotípicas</h4>
        {Object.entries(punnett.phenotypeRatios)
          .sort(([, a], [, b]) => b.count - a.count)
          .map(([phenotype, data]) => (
            <div key={phenotype} className={styles.ratioBar}>
              <span className={styles.ratioLabel}>
                {/* El « (♀)» / « (♂)» NO se recorta: en herencia ligada al sexo el recuento
                    separa por sexo, así que sin él quedaban dos filas de texto idéntico con
                    porcentajes distintos (Inspector, 20/08/2026). */}
                <span aria-hidden="true">{data.icon}</span> {phenotype}
              </span>
              <div className={styles.ratioBarContainer}>
                <div
                  className={styles.ratioBarFill}
                  style={{
                    width: `${data.count * 100}%`,
                    background: data.color,
                  }}
                />
              </div>
              <span className={styles.ratioValue}>{formatNumber(data.count * 100, 0)}%</span>
            </div>
          ))}
        {phenotypeRatioStr && (
          <div className={styles.ratioSummary}>Ratio: {phenotypeRatioStr}</div>
        )}
      </div>
    </div>
  );
}
