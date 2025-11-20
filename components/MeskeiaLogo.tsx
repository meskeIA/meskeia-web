/**
 * Componente Logo meskeIA
 *
 * Logo oficial reutilizable en todas las aplicaciones
 * Compatible con diseño meskeIA
 */

import React from 'react';
import styles from './MeskeiaLogo.module.css';

export default function MeskeiaLogo() {
  return (
    <div className={styles.logoContainer} onClick={() => window.location.href = '/'}>
      <div className={styles.logoIcon}>
        <div className={styles.neuralNetwork}>
          <div className={styles.neuralDot}></div>
          <div className={styles.neuralDot}></div>
          <div className={styles.neuralDot}></div>
          <div className={styles.neuralDot}></div>
        </div>
      </div>
      <div className={styles.logoText}>
        <span className={styles.meske}>meske</span>
        <span className={styles.ia}>IA</span>
      </div>
    </div>
  );
}
