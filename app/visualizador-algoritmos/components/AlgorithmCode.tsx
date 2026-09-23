'use client';

import { ALGORITHMS_INFO, SortingAlgorithm } from './types';
import styles from './AlgorithmCode.module.css';

interface AlgorithmCodeProps {
  algorithm: SortingAlgorithm;
  highlightedLine: number;
  description: string;
}

export default function AlgorithmCode({
  algorithm,
  highlightedLine,
  description,
}: AlgorithmCodeProps) {
  const info = ALGORITHMS_INFO[algorithm];

  return (
    <div className={styles.codePanel}>
      <h3 className={styles.title}>
        <span aria-hidden="true">📝</span> Pseudocódigo
      </h3>

      <div className={styles.codeContainer}>
        {info.pseudocode.map((line, index) => (
          <div
            key={index}
            className={`${styles.codeLine} ${index === highlightedLine ? styles.highlighted : ''}`}
            aria-current={index === highlightedLine ? 'step' : undefined}
          >
            <span className={styles.lineNumber}>{index + 1}</span>
            <code className={styles.lineContent}>{line || ' '}</code>
          </div>
        ))}
      </div>

      {description && (
        <div className={styles.stepDescription}>
          <span className={styles.icon} aria-hidden="true">💡</span>
          <p className={styles.text}>{description}</p>
        </div>
      )}
    </div>
  );
}
