'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import styles from './CoquinumHeader.module.css';

/**
 * Cabecera propia de la marca Coquinum (vertical de cocina y gastronomía).
 *
 * Sustituye a FixedHeader (meskeIA) en toda la subweb /coquinum.
 * - El logo enlaza a la home de Coquinum.
 * - NO incluye el buscador Ctrl+K de meskeIA.
 * - Navegación a las secciones (ancla) + toggle de tema.
 */
export default function CoquinumHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Coquinum — inicio">
          <Image
            src="/coquinum/icon.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={styles.symbol}
            priority
          />
          <span className={styles.wordmark}>Coquinum</span>
        </Link>

        <nav className={styles.nav} aria-label="Secciones de Coquinum">
          <Link href="/#secciones" className={styles.navLink}>Secciones</Link>
          <Link href="/#que-es" className={styles.navLink}>Qué es</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
