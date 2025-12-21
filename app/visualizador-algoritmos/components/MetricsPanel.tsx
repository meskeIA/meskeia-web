'use client';

import { AlgorithmMetrics } from './types';
import { formatNumber } from '@/lib';
import styles from './MetricsPanel.module.css';

interface MetricsPanelProps {
  metrics: AlgorithmMetrics;
}

export default function MetricsPanel({ metrics }: MetricsPanelProps) {
  // Formatear tiempo en segundos con 1 decimal
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return formatNumber(ms / 1000, 1) + 's';
  };

  return (
    <div className={styles.metricsRow}>
      <div className={styles.metricCard}>
        <div className={styles.metricValue}>{formatNumber(metrics.comparisons, 0)}</div>
        <div className={styles.metricLabel}>Comparaciones</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricValue}>{formatNumber(metrics.swaps, 0)}</div>
        <div className={styles.metricLabel}>Intercambios</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricValue}>{formatNumber(metrics.arrayAccesses, 0)}</div>
        <div className={styles.metricLabel}>Accesos</div>
      </div>

      <div className={styles.metricCard}>
        <div className={styles.metricValue}>{formatTime(metrics.elapsedTime)}</div>
        <div className={styles.metricLabel}>Tiempo</div>
      </div>
    </div>
  );
}
