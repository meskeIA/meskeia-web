/**
 * Componente LegalNotice meskeIA
 *
 * Muestra enlaces a Términos de Uso y Política de Privacidad
 * Opcionalmente muestra fecha de última actualización
 * Ubicación: Debajo del Hero Section (TODAS las apps)
 */

'use client';

import React from 'react';
import Link from 'next/link';
import styles from './LegalNotice.module.css';

interface LegalNoticeProps {
  lastUpdated?: string; // Fecha en formato "2026-02-02" (opcional)
}

export default function LegalNotice({ lastUpdated }: LegalNoticeProps) {
  // Formatear fecha para mostrar
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear fecha compacta para móvil
  const formatDateShort = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.legalNotice}>
      <span className={styles.icon} aria-hidden="true">ℹ️</span>

      <div className={styles.links}>
        <Link href="/terminos" className={styles.link}>
          <span className={styles.linkTextFull}>Términos de Uso</span>
          <span className={styles.linkTextShort}>Términos</span>
        </Link>

        <span className={styles.separator}>|</span>

        <Link href="/privacidad" className={styles.link}>
          <span className={styles.linkTextFull}>Política de Privacidad</span>
          <span className={styles.linkTextShort}>Privacidad</span>
        </Link>

        <span className={styles.separator}>|</span>

        <Link href="/contacto" className={styles.link}>
          Contacto
        </Link>
      </div>

      {lastUpdated && (
        <>
          <span className={styles.separator}>|</span>
          <span className={styles.lastUpdated}>
            <span className={styles.lastUpdatedFull}>
              Última actualización: {formatDate(lastUpdated)}
            </span>
            <span className={styles.lastUpdatedShort}>
              Últ. actualización: {formatDateShort(lastUpdated)}
            </span>
          </span>
        </>
      )}

      <span className={styles.separator}>|</span>

      <span className={styles.copyright}>
        <span className={styles.copyrightFull}>© {new Date().getFullYear()} meskeIA</span>
        <span className={styles.copyrightShort}>© {new Date().getFullYear()}</span>
      </span>
    </div>
  );
}
