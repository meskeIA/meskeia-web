// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cocina y recetas: escalado, planificador y escandallo | Coquinum',
  description:
    'Herramientas de cocina del día a día: conversor de unidades, escalado de recetas por raciones, planificador de menú semanal, cantidades para eventos y orientador de dieta, más el escandallo y la merma para poner precio a un plato. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/cocina-recetas/' },
};

export default function CoquinumCocinaRecetas() {
  const APPS = appsDeCategoria('cocina-recetas');

  return (
    <>
      <AnalyticsTracker appName="coquinum-cocina-recetas" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🍽️</span> Cocina y recetas
          </h1>
          <p className={styles.ejeIntro}>
            Las herramientas de andar por casa: convertir medidas, ajustar raciones y
            planificar la semana para que cocinar sea más fácil y menos improvisado. Y, al
            final de la sección, poner números a lo cocinado: escandallo, food cost y merma
            para quien cocina de forma profesional.
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
