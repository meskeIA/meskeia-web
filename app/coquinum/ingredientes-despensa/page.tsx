// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeCategoria } from '@/data/coquinum';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Ingredientes y despensa: guías para elegir y usar producto | Coquinum',
  description:
    'Guías de producto para elegir y aprovechar la despensa: aceite de oliva, cortes de carne, especias, hierbas, quesos, setas, frutas exóticas, vinagres, arroces, pastas, superalimentos y aditivos, y de dónde viene cada alimento: el mapa de las especias, el viaje de la comida y su huella ambiental. En español y sin coste.',
  alternates: { canonical: 'https://coquinum.com/ingredientes-despensa/' },
};

export default function CoquinumIngredientesDespensa() {
  const APPS = appsDeCategoria('ingredientes-despensa');

  return (
    <>
      <AnalyticsTracker appName="coquinum-ingredientes-despensa" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🥩</span> Ingredientes y despensa
          </h1>
          <p className={styles.ejeIntro}>
            Conocer el producto es media cocina. Guías para elegir bien en la compra y
            sacarle todo el partido a lo que tienes en la despensa, y al final de la sección
            de dónde viene cada alimento: la ruta de las especias, el viaje de la comida por
            el mundo y lo que cuesta traerla hasta la mesa.
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
