// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cocción y temperatura: punto de la carne y tiempos | Coquinum',
  description:
    'Herramientas de cocción: temperatura interna y punto de la carne y el pescado con el mínimo seguro, y tiempos de cocción en agua de huevos, arroz, legumbres y verduras. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/coccion/' },
};

export default function CoquinumCoccion() {
  const APPS = appsDeCategoria('coccion');

  return (
    <>
      <AnalyticsTracker appName="coquinum-coccion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🌡️</span> Cocción y temperatura
          </h1>
          <p className={styles.ejeIntro}>
            Acertar el punto y cocinar seguro: la temperatura interna de la carne y el pescado y
            los tiempos de cocción de los alimentos del día a día.
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
