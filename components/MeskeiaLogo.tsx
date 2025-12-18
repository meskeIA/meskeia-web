/**
 * Componente Logo meskeIA
 *
 * Logo oficial reutilizable en todas las aplicaciones
 * Compatible con diseño meskeIA
 *
 * Props:
 * - disableLink: Si true, el logo no tiene enlace (para página principal)
 * - inline: Si true, el logo no es fixed (para usar dentro de contenedores)
 * - showThemeToggle: Si true, muestra el toggle de tema a la derecha (default: true)
 */

'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import styles from './MeskeiaLogo.module.css';

interface MeskeiaLogoProps {
  disableLink?: boolean;
  inline?: boolean;
  showThemeToggle?: boolean;
}

export default function MeskeiaLogo({ disableLink = false, inline = false, showThemeToggle = true }: MeskeiaLogoProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoContent = (
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

  const themeToggle = showThemeToggle && (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={mounted && theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={mounted && theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className={styles.themeIcon}>
        {mounted ? (theme === 'dark' ? '☀️' : '🌙') : '🌙'}
      </span>
    </button>
  );

  // Si es inline sin toggle, no necesita el wrapper headerBar
  const logoElement = disableLink ? (
    <div className={containerClass}>{logoContent}</div>
  ) : (
    <Link href="/" className={containerClass}>
      {logoContent}
    </Link>
  );

  // Si es inline y no muestra toggle, devolver solo el logo sin wrapper
  if (inline && !showThemeToggle) {
    return logoElement;
  }

  // En otros casos, usar el headerBar wrapper
  return (
    <div className={styles.headerBar}>
      {logoElement}
      {themeToggle}
    </div>
  );
}
