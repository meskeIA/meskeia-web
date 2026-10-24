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

  // La unidad se separa de la cifra con un espacio duro (U+00A0) EN EL TEXTO, no con un margen
  // CSS: el lector de pantalla, el árbol de accesibilidad y el portapapeles leen el texto, y con
  // el margen recibían «4928,70€» (hallazgo 2322, 27/09/2026). Los grados sexagesimales van
  // pegados («45°») y una unidad que ya trae su propio espacio no se duplica.
  const unidad =
    unit && !/^[\s  °′″']/.test(unit) ? ` ${unit}` : unit;

  return (
    <div className={cardClass}>
      <div className={styles.header}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <h3 className={styles.title}>{title}</h3>
      </div>

      {/* La cifra, ÚNICA hija de su <span>. Suelta junto a la unidad era un nodo de texto, y con la
          página traducida (el traductor cambia cada nodo por <font>) React escribía la cifra nueva
          en el nodo retirado: las tarjetas se quedaban con la de antes mientras el rótulo cambiaba
          (hallazgo 3481, 24/10/2026; forma del cabo C0243). Con un solo hijo de texto, React
          reescribe el textContent del <span> entero. */}
      <div className={styles.valueContainer}>
        <p className={styles.value}>
          <span>{value}</span>
          {unidad && <span className={styles.unit}>{unidad}</span>}
        </p>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
