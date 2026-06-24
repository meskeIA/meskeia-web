'use client';
// @disclaimer: exempt

import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

// Apps de la disciplina Tierra y Espacio. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🪐',
    titulo: 'Exoplanetas',
    desc: 'Tránsito animado con su curva de luz, el método del bamboleo, la zona habitable y más de 5.500 mundos reales.',
    slug: 'visualizador-exoplanetas',
  },
  {
    icon: '🌋',
    titulo: 'Terremotos y tsunamis',
    desc: 'Fallas y ondas P/S, escalas Richter y Mercalli, y la propagación de tsunamis con el sistema de alerta DART.',
    slug: 'visualizador-terremotos-tsunamis',
  },
];

export default function StemumTierraEspacio() {
  return (
    <>
      <AnalyticsTracker appName="stemum-tierra-espacio" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-tierra-espacio">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-tierra-espacio" className={styles.ejeTitle}>
            <span aria-hidden="true">🌍</span> Tierra y Espacio
          </h1>
          <p className={styles.ejeIntro}>
            Astronomía, geología y ciencias del planeta para manipular en tiempo real.
            Mueve un control y observa cómo responde el sistema.
          </p>
          <div className={styles.grid}>
            {APPS.map((a) => (
              <Link key={a.slug} href={`/${a.slug}`} className={styles.appCard}>
                <span className={styles.cardIcon} aria-hidden="true">{a.icon}</span>
                <h2 className={styles.cardTitulo}>{a.titulo}</h2>
                <p className={styles.cardDesc}>{a.desc}</p>
                <span className={styles.appCardCta}>Abrir →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
