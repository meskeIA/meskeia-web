// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cultura gastronómica: mapas, viajes y huella de la comida | Coquinum',
  description:
    'Visualizadores para entender la comida más allá de la receta: el mapa de las especias, el viaje de los alimentos por el mundo, la huella ambiental de lo que comemos y cómo se digieren los nutrientes. En español y sin coste.',
  alternates: { canonical: 'https://coquinum.com/cultura-gastronomica/' },
};

export default function CoquinumCulturaGastronomica() {
  const APPS = appsDeCategoria('cultura-gastronomica');

  return (
    <>
      <AnalyticsTracker appName="coquinum-cultura-gastronomica" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🌍</span> Cultura gastronómica
          </h1>
          <p className={styles.ejeIntro}>
            Entender qué comemos y de dónde viene. Visualizadores interactivos sobre el
            origen, el impacto y el viaje de los alimentos por el mundo.
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
