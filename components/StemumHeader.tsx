'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import styles from './StemumHeader.module.css';

/**
 * Cabecera propia de la marca Stemum (vertical de ciencia interactiva).
 *
 * Sustituye a FixedHeader (meskeIA) en toda la subweb /stemum.
 * - El logo enlaza a la home de Stemum.
 * - NO incluye el buscador Ctrl+K de meskeIA.
 * - Navegación a las disciplinas (ancla) + toggle de tema.
 */
export default function StemumHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Stemum — inicio">
          <Image
            src="/stemum/icon.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={styles.symbol}
            priority
          />
          <span className={styles.wordmark}>Stemum</span>
        </Link>

        <nav className={styles.nav} aria-label="Secciones de Stemum">
          <Link href="/#disciplinas" className={styles.navLink}>Disciplinas</Link>
          <Link href="/#que-es" className={styles.navLink}>Qué es</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
