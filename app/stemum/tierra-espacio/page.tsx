// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Tierra y Espacio interactivo: exoplanetas y terremotos | Stemum',
  description:
    'Visualizadores de astronomía y geología: tránsitos de exoplanetas y zona habitable, terremotos, escalas Richter y Mercalli, y tsunamis.',
  alternates: { canonical: 'https://stemum.com/tierra-espacio/' },
};

export default function StemumTierraEspacio() {
  const APPS = appsDeDisciplina('tierra-espacio');

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
