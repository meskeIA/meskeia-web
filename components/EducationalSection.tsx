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

        {/*
          El nombre accesible ES el texto visible (WCAG 2.5.3, cabo C0053): hasta el 12/10/2026
          el aria-label decía «Ver guía educativa» y se leía «Ver Guía Completa», y la flecha
          no llevaba aria-hidden. El estado lo da aria-expanded.
        */}
        <button
          type="button"
          onClick={toggleOpen}
          className={styles.toggleButton}
          aria-expanded={isOpen}
        >
          <span aria-hidden="true">{isOpen ? '⬆️' : '⬇️'}</span>{' '}
          {isOpen ? 'Ocultar guía educativa' : 'Ver guía educativa'}
        </button>
      </div>

      {/*
        El contenido se monta SIEMPRE en el DOM (clave para SEO: Googlebot no hace
        clic, así que un `isOpen && children` dejaba todo el contenido educativo
        invisible al crawler en el catálogo entero). Se oculta por CSS cuando está
        colapsado — mismo comportamiento visual (REGLA #7), pero ya es rastreable.

        Sin región viva: lo abre quien pulsa el botón, que ya sabe que se despliega por
        aria-expanded. Con aria-live="polite" el lector leía de un tirón el bloque entero
        al desplegarlo (6.713 caracteres en buscador-palabras-patron; cabo C0053).
      */}
      <div
        className={`${styles.content} ${isOpen ? '' : styles.contentHidden}`}
        data-guia-educativa=""
      >
        {children}
      </div>
    </div>
  );
}
