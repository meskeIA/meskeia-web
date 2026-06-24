'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './StemumFooter.module.css';

/**
 * Footer propio de la marca Stemum.
 *
 * - Bloque de marca + tagline.
 * - Legal compartido con meskeIA (mismo responsable del tratamiento).
 * - Franja de pertenencia a meskeIA con enlace a la web principal.
 * - Botón de compartir (sin AnalyticsTracker: cada página registra su propio uso).
 */
export default function StemumFooter() {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    const url = window.location.href;
    const titulo = document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        /* el usuario canceló el diálogo de compartir */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      } catch {
        /* el navegador bloqueó el portapapeles */
      }
    }
  };

  const anio = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Marca */}
        <div className={styles.brand}>
          <div className={styles.brandLockup}>
            <Image
              src="/stemum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={30}
              height={30}
            />
            <span className={styles.brandName}>Stemum</span>
          </div>
          <p className={styles.brandTagline}>
            Visualizadores y simuladores interactivos de ciencia: física, matemáticas,
            química, computación y biología. Toca, ajusta y descubre cómo funciona el mundo.
          </p>
        </div>

        {/* Legal */}
        <nav className={styles.legal} aria-label="Información legal de Stemum">
          <a href="https://meskeia.com/aviso-legal" className={styles.legalLink}>
            Aviso legal
          </a>
          <a href="https://meskeia.com/privacidad" className={styles.legalLink}>
            Privacidad
          </a>
          <button type="button" className={styles.shareBtn} onClick={compartir} aria-live="polite">
            {copiado ? '✓ Enlace copiado' : '🔗 Compartir'}
          </button>
        </nav>
      </div>

      {/* Pertenencia a meskeIA */}
      <div className={styles.parent}>
        <p>
          Stemum es un servicio de{' '}
          <a href="https://meskeia.com/" className={styles.parentLink}>meskeIA</a>
          {' '}— más de mil herramientas gratuitas para el día a día.
        </p>
        <p className={styles.copyright}>© {anio} meskeIA · Stemum</p>
      </div>
    </footer>
  );
}
