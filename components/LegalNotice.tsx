/**
 * Componente LegalNotice meskeIA
 *
 * Muestra enlaces a Términos de Uso y Política de Privacidad
 * Opcionalmente muestra fecha de última actualización
 * Ubicación: Debajo del Hero Section (TODAS las apps)
 */

'use client';

import React from 'react';
import { URL_PRIVACIDAD, URL_TERMINOS } from '@/lib/urls-legales';
import Link from 'next/link';
import DescubreVertical from './DescubreVertical';
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
    <>
    <div className={styles.legalNotice}>
      <span className={styles.icon} aria-hidden="true">ℹ️</span>

      <div className={styles.links}>
        <a href={URL_TERMINOS} className={styles.link}>
          <span className={styles.linkTextFull}>Términos de Uso</span>
          <span className={styles.linkTextShort}>Términos</span>
        </a>

        <span className={styles.separator}>|</span>

        <a href={URL_PRIVACIDAD} className={styles.link}>
          <span className={styles.linkTextFull}>Política de Privacidad</span>
          <span className={styles.linkTextShort}>Privacidad</span>
        </a>

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

    {/* Descubrimiento cruzado hacia el portal vertical (se auto-oculta si la
        app no pertenece a ninguno o si ya se ve desde el dominio del vertical). */}
    <DescubreVertical />
    </>
  );
}
