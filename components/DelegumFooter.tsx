'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './DelegumFooter.module.css';

/**
 * Footer propio de la marca Delegum.
 *
 * - Bloque de marca + tagline.
 * - Legal propio: Aviso legal y Términos (Delegum) + Privacidad (compartida con meskeIA,
 *   mismo responsable del tratamiento).
 * - Franja de pertenencia a meskeIA con enlace a la web principal.
 * - Botón de compartir (sin AnalyticsTracker: cada página registra su propio uso).
 */
export default function DelegumFooter() {
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
              src="/delegum/simbolo-blanco.svg"
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
            />
            <span className={styles.brandName}>Delegum</span>
          </div>
          <p className={styles.brandTagline}>
            Asesoría digital fiscal, laboral y financiera para España. Datos y cálculos
            orientativos con normativa verificada.
          </p>
        </div>

        {/* Legal */}
        <nav className={styles.legal} aria-label="Información legal de Delegum">
          <Link href="/delegum/aviso-legal" className={styles.legalLink}>
            Aviso legal y Términos
          </Link>
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
          Delegum es un servicio de{' '}
          <a href="https://meskeia.com/" className={styles.parentLink}>meskeIA</a>
          {' '}— más de mil herramientas gratuitas para el día a día.
        </p>
        <p className={styles.copyright}>© {anio} meskeIA · Delegum</p>
      </div>
    </footer>
  );
}
