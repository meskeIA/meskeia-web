// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Panadería y repostería: calculadoras de masa y dulce | Coquinum',
  description:
    'Calculadoras de panadería y repostería: porcentaje del panadero, hidratación de masa, masa madre, temperatura del agua de amasado, ganache, gelatina y punto del azúcar. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/panaderia-reposteria/' },
};

export default function CoquinumPanaderiaReposteria() {
  const APPS = appsDeCategoria('panaderia-reposteria');

  return (
    <>
      <AnalyticsTracker appName="coquinum-panaderia-reposteria" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🍞</span> Panadería y repostería
          </h1>
          <p className={styles.ejeIntro}>
            Las calculadoras de precisión que diferencian a Coquinum: masa, fermentación y
            dulce con las cuentas exactas para que salga a la primera.
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
