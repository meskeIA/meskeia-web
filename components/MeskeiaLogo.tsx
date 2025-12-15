/**
 * Componente Logo meskeIA
 *
 * Logo oficial reutilizable en todas las aplicaciones
 * Compatible con diseño meskeIA
 *
 * Props:
 * - disableLink: Si true, el logo no tiene enlace (para página principal)
 * - inline: Si true, el logo no es fixed (para usar dentro de contenedores)
 */

'use client';

import Link from 'next/link';
import styles from './MeskeiaLogo.module.css';

interface MeskeiaLogoProps {
  disableLink?: boolean;
  inline?: boolean;
}

export default function MeskeiaLogo({ disableLink = false, inline = false }: MeskeiaLogoProps) {
  const content = (
    <>
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
    </>
  );

  const containerClass = `${styles.logoContainer} ${inline ? styles.logoInline : ''}`;

  if (disableLink) {
    return <div className={containerClass}>{content}</div>;
  }

  return (
    <Link href="/" className={containerClass}>
      {content}
    </Link>
  );
}
