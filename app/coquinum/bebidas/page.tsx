// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Bebidas: café, té, coctelería, cerveza y vino | Coquinum',
  description:
    'Guías y selectores de bebidas: café, té e infusiones, coctelería, estilos de cerveza, variedades de vino y selectores para acertar con la copa según el plato. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/bebidas/' },
};

export default function CoquinumBebidas() {
  const APPS = appsDeCategoria('bebidas');

  return (
    <>
      <AnalyticsTracker appName="coquinum-bebidas" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🍷</span> Bebidas
          </h1>
          <p className={styles.ejeIntro}>
            La mesa también se bebe. Guías de café, té, cerveza y vino, y selectores para
            dar con la copa que mejor acompaña cada plato.
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
