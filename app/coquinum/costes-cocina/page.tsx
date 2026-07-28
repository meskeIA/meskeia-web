// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Costes y escandallo: food cost y merma para hostelería | Coquinum',
  description:
    'Herramientas de costes para cocina profesional: escandallo y food cost para fijar el precio de tus platos, y cálculo de merma y rendimiento para conocer el coste real de la materia prima. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/costes-cocina/' },
};

export default function CoquinumCostesCocina() {
  const APPS = appsDeCategoria('costes-cocina');

  return (
    <>
      <AnalyticsTracker appName="coquinum-costes-cocina" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">💼</span> Costes y escandallo
          </h1>
          <p className={styles.ejeIntro}>
            El ala profesional de Coquinum: poner números a la cocina para fijar precios con
            margen y conocer el coste real de lo que compras.
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
