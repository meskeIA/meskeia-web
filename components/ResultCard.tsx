/**
 * Componente ResultCard - meskeIA
 *
 * Card estandarizado para mostrar resultados de cálculos
 * Soporta variantes: default, highlight, success, warning, info
 */

'use client';

import React from 'react';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'highlight' | 'success' | 'warning' | 'info';
  icon?: string;
  unit?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ResultCard({
  title,
  value,
  description,
  variant = 'default',
  icon,
  unit,
  className = '',
  children,
}: ResultCardProps) {
  const cardClass = `${styles.card} ${styles[variant]} ${className}`;

  return (
    <div className={cardClass}>
      <div className={styles.header}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={styles.valueContainer}>
        <p className={styles.value}>
          {value}
          {unit && <span className={styles.unit}>{unit}</span>}
        </p>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
