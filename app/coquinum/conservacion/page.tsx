// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Conservación de alimentos: caducidad, congelado y conservas | Coquinum',
  description:
    'Herramientas de conservación de alimentos: cuánto dura cada alimento en la nevera, el congelador y la despensa, y cómo conservar con seguridad. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/conservacion/' },
};

export default function CoquinumConservacion() {
  const APPS = appsDeCategoria('conservacion');

  return (
    <>
      <AnalyticsTracker appName="coquinum-conservacion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🧊</span> Conservación
          </h1>
          <p className={styles.ejeIntro}>
            Que nada se eche a perder y nada te juegue un disgusto: tiempos de conservación y
            seguridad alimentaria para la nevera, el congelador y la despensa.
          </p>
          <div className={styles.grid}>
            {APPS.map((a) => (
              <Link key={a.slug} href={`/${a.slug}/`} className={styles.appCard}>
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
