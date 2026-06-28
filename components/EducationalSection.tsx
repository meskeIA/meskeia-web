/**
 * Componente EducationalSection - meskeIA
 *
 * Sección colapsable para contenido educativo
 * CRÍTICO para la filosofía educativa de meskeIA
 *
 * Implementa REGLA #7: Contenido Educativo Colapsable
 */

'use client';

import React, { useState } from 'react';
import styles from './EducationalSection.module.css';

interface EducationalSectionProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function EducationalSection({
  title,
  subtitle,
  icon = '📚',
  children,
  defaultOpen = false,
  className = '',
}: EducationalSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon} aria-hidden="true">{icon}</span>
          {title}
        </h3>
        <p className={styles.subtitle}>{subtitle}</p>

        <button
          type="button"
          onClick={toggleOpen}
          className={styles.toggleButton}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Ocultar guía educativa' : 'Ver guía educativa'}
        >
          {isOpen ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
        </button>
      </div>

      {isOpen && (
        <div className={styles.content} aria-live="polite">
          {children}
        </div>
      )}
    </div>
  );
}
