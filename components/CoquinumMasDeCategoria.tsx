'use client';

import Link from 'next/link';
import { useCoquinumHost } from '@/lib/useCoquinumHost';
import { getCoquinumHermanas } from '@/data/coquinum';
import styles from './CoquinumMasDeCategoria.module.css';

interface CoquinumMasDeCategoriaProps {
  appName?: string;
}

/**
 * Bloque "Más de [categoría] en Coquinum" que se muestra al pie de cada app
 * cuando se sirve bajo coquinum.com. Mantiene al visitante dentro del circuito
 * verde del portal (mejora sobre Stemum, que solo ocultaba RelatedApps dejando
 * un callejón sin salida). En meskeia.com no se renderiza (useCoquinumHost = false).
 */
export default function CoquinumMasDeCategoria({ appName }: CoquinumMasDeCategoriaProps) {
  const isCoquinum = useCoquinumHost();

  if (!appName) return null;
  const nav = getCoquinumHermanas(appName);
  // Solo bajo coquinum.com, para apps del portal con al menos una hermana.
  if (!isCoquinum || !nav || nav.hermanas.length === 0) return null;

  return (
    <section className={styles.bloque} aria-label={`Más de ${nav.categoria} en Coquinum`}>
      <h2 className={styles.titulo}>
        Más de <span className={styles.categoria}>{nav.categoria}</span> en Coquinum
      </h2>
      <div className={styles.grid}>
        {nav.hermanas.map((h) => (
          <Link key={h.slug} href={`/${h.slug}/`} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">{h.icon}</span>
            <span className={styles.nombre}>{h.nombre}</span>
          </Link>
        ))}
      </div>
      <Link href={`/${nav.categoriaSlug}/`} className={styles.verTodo}>
        Ver toda la categoría <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
