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
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState, useId } from 'react';
import { useStemumHost } from '@/lib/useStemumHost';
import { useCoquinumHost } from '@/lib/useCoquinumHost';
import { STEMUM_APP_DISCIPLINA, STEMUM_DISCIPLINAS } from '@/data/stemum';
import { COQUINUM_APP_CATEGORIA, COQUINUM_CATEGORIAS } from '@/data/coquinum';
import styles from './MeskeiaLogo.module.css';

interface MeskeiaLogoProps {
  disableLink?: boolean;
  inline?: boolean;
  showThemeToggle?: boolean;
}

export default function MeskeiaLogo({ disableLink = false, inline = false, showThemeToggle = true }: MeskeiaLogoProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isStemum = useStemumHost();
  const isCoquinum = useCoquinumHost();
  const pathname = usePathname();
  const uid = useId().replace(/:/g, '');
  const bgId  = `msk-bg-${uid}`;
  const ray1Id = `msk-r1-${uid}`;
  const ray2Id = `msk-r2-${uid}`;
  const ray3Id = `msk-r3-${uid}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Variante de marca Stemum: cuando la app se sirve bajo stemum.com, el chrome
  // compartido muestra el logo Stemum (onda + punto) en vez del de meskeIA.
  const stemumContent = (
    <>
      <div className={styles.logoIcon}>
        <Image
          src="/stemum/icon.svg"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className={styles.stemumIcon}
          priority
        />
      </div>
      <div className={styles.logoText}>
        <span className={styles.stemumWordmark}>Stemum</span>
      </div>
    </>
  );

  // Variante de marca Coquinum: cuando la app se sirve bajo coquinum.com, el
  // chrome compartido muestra el logo Coquinum (las volutas de aroma).
  const coquinumContent = (
    <>
      <div className={styles.logoIcon}>
        <Image
          src="/coquinum/icon.svg"
          alt=""
          aria-hidden="true"
          width={40}
          height={40}
          className={styles.coquinumIcon}
          priority
        />
      </div>
      <div className={styles.logoText}>
        <span className={styles.coquinumWordmark}>Coquinum</span>
      </div>
    </>
  );

  const meskeiaContent = (
    <>
      <div className={styles.logoIcon}>
        <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-hidden="true">
          <defs>
            <linearGradient id={bgId} x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#0f3157"/>
              <stop offset="100%" stopColor="#081d35"/>
            </linearGradient>
            <linearGradient id={ray1Id} x1="80" y1="220" x2="155" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#23d8d0"/>
            </linearGradient>
            <linearGradient id={ray2Id} x1="80" y1="220" x2="250" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#26a9ff"/>
            </linearGradient>
            <linearGradient id={ray3Id} x1="80" y1="220" x2="250" y2="225" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#2fd4d1"/>
            </linearGradient>
          </defs>
          <rect width="300" height="300" rx="60" fill={`url(#${bgId})`}/>
          <line strokeLinecap="round" strokeWidth="20" x1="80" y1="220" x2="155" y2="55"  stroke={`url(#${ray1Id})`}/>
          <line strokeLinecap="round" strokeWidth="16" x1="80" y1="220" x2="250" y2="120" stroke={`url(#${ray2Id})`}/>
          <line strokeLinecap="round" strokeWidth="12" x1="80" y1="220" x2="250" y2="225" stroke={`url(#${ray3Id})`}/>
          <circle cx="80"  cy="220" r="28" fill="#ffffff"/>
          <circle cx="155" cy="55"  r="19" fill="#27d4cf"/>
          <circle cx="250" cy="120" r="15" fill="#25a9ff"/>
          <circle cx="250" cy="225" r="11" fill="#2fd4d1"/>
        </svg>
      </div>
      <div className={styles.logoText}>
        <span className={styles.meske}>meske</span>
        <span className={styles.ia}>IA</span>
      </div>
    </>
  );

  const logoContent = isStemum ? stemumContent : isCoquinum ? coquinumContent : meskeiaContent;

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

  // Bajo stemum.com (cabecera fija de una app), el logo se convierte en un
  // breadcrumb "Stemum › Disciplina" para volver al portal o a la disciplina.
  // Dos enlaces separados (no anidados) dentro de la píldora.
  if (isStemum && !disableLink) {
    const seg = (pathname || '').replace(/^\/+|\/+$/g, '').split('/')[0];
    const discSlug = STEMUM_APP_DISCIPLINA[seg];
    const discLabel = discSlug ? STEMUM_DISCIPLINAS[discSlug] : null;

    return (
      <div className={styles.headerBar}>
        <div className={`${styles.logoContainer} ${styles.stemumPill}`}>
          <Link href="/" className={styles.stemumCrumb} aria-label="Stemum — inicio">
            <span className={styles.logoIcon}>
              <Image
                src="/stemum/icon.svg"
                alt=""
                aria-hidden="true"
                width={34}
                height={34}
                className={styles.stemumIcon}
                priority
              />
            </span>
            <span className={styles.stemumWordmark}>Stemum</span>
          </Link>
          {discLabel && (
            <>
              <span className={styles.stemumSep} aria-hidden="true">›</span>
              <Link href={`/${discSlug}`} className={styles.stemumDiscLink}>
                {discLabel}
              </Link>
            </>
          )}
        </div>
        {themeToggle}
      </div>
    );
  }

  // Bajo coquinum.com (cabecera fija de una app), el logo se convierte en un
  // breadcrumb "Coquinum › Categoría" para volver al portal o a la categoría.
  if (isCoquinum && !disableLink) {
    const seg = (pathname || '').replace(/^\/+|\/+$/g, '').split('/')[0];
    const catSlug = COQUINUM_APP_CATEGORIA[seg];
    const catLabel = catSlug ? COQUINUM_CATEGORIAS[catSlug] : null;

    return (
      <div className={styles.headerBar}>
        <div className={`${styles.logoContainer} ${styles.coquinumPill}`}>
          <Link href="/" className={styles.coquinumCrumb} aria-label="Coquinum — inicio">
            <span className={styles.logoIcon}>
              <Image
                src="/coquinum/icon.svg"
                alt=""
                aria-hidden="true"
                width={34}
                height={34}
                className={styles.coquinumIcon}
                priority
              />
            </span>
            <span className={styles.coquinumWordmark}>Coquinum</span>
          </Link>
          {catLabel && (
            <>
              <span className={styles.coquinumSep} aria-hidden="true">›</span>
              <Link href={`/${catSlug}`} className={styles.coquinumCatLink}>
                {catLabel}
              </Link>
            </>
          )}
        </div>
        {themeToggle}
      </div>
    );
  }

  // En otros casos, usar el headerBar wrapper
  return (
    <div className={styles.headerBar}>
      {logoElement}
      {themeToggle}
    </div>
  );
}
