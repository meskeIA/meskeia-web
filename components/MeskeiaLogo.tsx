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
        <svg viewBox="0 0 132 132" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="meskeia-bg" x1="0" y1="0" x2="132" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#3A9BC1"/>
              <stop offset="45%"  stopColor="#2E86AB"/>
              <stop offset="100%" stopColor="#1F6A8B"/>
            </linearGradient>
            <radialGradient id="meskeia-core" cx="50%" cy="45%" r="55%">
              <stop offset="0%"   stopColor="#FFFFFF"/>
              <stop offset="60%"  stopColor="#9BDCD8"/>
              <stop offset="100%" stopColor="#48A9A6"/>
            </radialGradient>
          </defs>
          <rect width="132" height="132" rx="29" fill="url(#meskeia-bg)"/>
          <circle cx="66" cy="66" r="18" fill="url(#meskeia-core)"/>
          <circle cx="66" cy="66" r="7"  fill="#1F6A8B"/>
          <g fill="#FFFFFF">
            <circle cx="26"  cy="26"  r="4.5"/>
            <circle cx="106" cy="30"  r="3.5"/>
            <circle cx="108" cy="104" r="5"/>
            <circle cx="28"  cy="108" r="3"/>
            <circle cx="62"  cy="20"  r="2"/>
            <circle cx="20"  cy="66"  r="2.5"/>
            <circle cx="112" cy="66"  r="2.5"/>
            <circle cx="66"  cy="112" r="2"/>
          </g>
        </svg>
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
