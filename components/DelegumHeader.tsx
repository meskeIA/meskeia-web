'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import styles from './DelegumHeader.module.css';

/**
 * Cabecera propia de la marca Delegum.
 *
 * Sustituye a FixedHeader (meskeIA) en toda la subweb /delegum.
 * - El logo enlaza a la home de Delegum (no a meskeIA).
 * - NO incluye el buscador Ctrl+K de meskeIA.
 * - Navegación a los tres pilares + toggle de tema.
 */
export default function DelegumHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Delegum — inicio">
          <Image
            src="/delegum/simbolo-marino.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className={`${styles.symbol} ${styles.symbolLight}`}
            priority
          />
          <Image
            src="/delegum/simbolo-blanco.svg"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            className={`${styles.symbol} ${styles.symbolDark}`}
            priority
          />
          <span className={styles.wordmark}>Delegum</span>
        </Link>

        <nav className={styles.nav} aria-label="Secciones de Delegum">
          <Link href="/datos-fiscales" className={styles.navLink}>Datos fiscales</Link>
          <Link href="/asistente-ia" className={styles.navLink}>Asistente IA</Link>
          <Link href="/calculadoras" className={styles.navLink}>Calculadoras</Link>
          <Link href="/guias" className={styles.navLink}>Guías</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
