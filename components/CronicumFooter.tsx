'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './CronicumFooter.module.css';
import { urlParaCompartir } from '@/lib/trackingFrom';

/**
 * Footer propio de la marca Cronicum.
 *
 * - Bloque de marca + tagline.
 * - Legal compartido con meskeIA (mismo responsable del tratamiento).
 * - Franja de pertenencia a meskeIA con enlace a la web principal.
 * - Botón de compartir (sin AnalyticsTracker: cada página registra su propio uso).
 */
export default function CronicumFooter() {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    // El ?ref=share tiene que ir en el query y el #from= de quien comparte no
    // viaja con el enlace. Ver lib/trackingFrom.ts.
    const url = urlParaCompartir();
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
              src="/cronicum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={30}
              height={30}
            />
            <span className={styles.brandName}>Cronicum</span>
          </div>
          <p className={styles.brandTagline}>
            La historia de la humanidad contada de forma interactiva: civilizaciones, países
            y la historia de las grandes ideas e inventos. Las raíces del presente.
          </p>
        </div>

        {/* Legal */}
        <nav className={styles.legal} aria-label="Información legal de Cronicum">
          <a href="https://meskeia.com/terminos/" className={styles.legalLink}>
            Aviso legal
          </a>
          <a href="https://meskeia.com/privacidad/" className={styles.legalLink}>
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
          Cronicum es un servicio de{' '}
          <a href="https://meskeia.com/" className={styles.parentLink}>meskeIA</a>
          {' '}— más de mil herramientas gratuitas para el día a día.
        </p>
        <p className={styles.copyright}>© {anio} meskeIA · Cronicum</p>
      </div>
    </footer>
  );
}
