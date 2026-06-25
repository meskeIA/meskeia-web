'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './CoquinumFooter.module.css';

/**
 * Footer propio de la marca Coquinum.
 *
 * - Bloque de marca + tagline.
 * - Legal compartido con meskeIA (mismo responsable del tratamiento).
 * - Franja de pertenencia a meskeIA con enlace a la web principal.
 * - Botón de compartir (sin AnalyticsTracker: cada página registra su propio uso).
 */
export default function CoquinumFooter() {
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
              src="/coquinum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={30}
              height={30}
            />
            <span className={styles.brandName}>Coquinum</span>
          </div>
          <p className={styles.brandTagline}>
            Herramientas de cocina técnica: panadería, repostería, cocción, conversiones,
            bebidas y food cost. Mide, convierte y cocina con precisión.
          </p>
        </div>

        {/* Legal */}
        <nav className={styles.legal} aria-label="Información legal de Coquinum">
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
          Coquinum es un servicio de{' '}
          <a href="https://meskeia.com/" className={styles.parentLink}>meskeIA</a>
          {' '}— más de mil herramientas gratuitas para el día a día.
        </p>
        <p className={styles.copyright}>© {anio} meskeIA · Coquinum</p>
      </div>
    </footer>
  );
}
