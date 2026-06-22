'use client';

import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import styles from './CronicumHeader.module.css';

/**
 * Cabecera propia de la marca Cronicum (vertical de Historia).
 *
 * Sustituye a FixedHeader (meskeIA) en toda la subweb /cronicum.
 * - El logo enlaza a la home de Cronicum.
 * - NO incluye el buscador Ctrl+K de meskeIA.
 * - Navegación a los dos ejes de la home (anclas) + Grandes acontecimientos + toggle de tema.
 *
 * Usa el icon con tile (icon.svg) porque funciona igual de bien sobre fondo claro
 * y oscuro; el símbolo transparente luminoso se reserva para hero y footer.
 */
export default function CronicumHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Cronicum — inicio">
          <Image
            src="/cronicum/icon.svg"
            alt=""
            aria-hidden="true"
            width={30}
            height={30}
            className={styles.symbol}
            priority
          />
          <span className={styles.wordmark}>Cronicum</span>
        </Link>

        <nav className={styles.nav} aria-label="Secciones de Cronicum">
          <Link href="/#el-mundo" className={styles.navLink}>El mundo</Link>
          <Link href="/#las-cosas" className={styles.navLink}>La historia de las cosas</Link>
          <Link href="/#grandes-acontecimientos" className={styles.navLink}>Grandes acontecimientos</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
