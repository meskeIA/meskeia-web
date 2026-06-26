// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cultura gastronómica: mapas, viajes y huella de la comida | Coquinum',
  description:
    'Visualizadores para entender la comida más allá de la receta: el mapa de las especias, el viaje de los alimentos por el mundo, la huella ambiental de lo que comemos y cómo se digieren los nutrientes. En español y sin coste.',
  alternates: { canonical: 'https://coquinum.com/cultura-gastronomica/' },
};

// Apps de la categoría Cultura gastronómica. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🗺️',
    titulo: 'Mapa de las especias',
    desc: 'De dónde viene cada especia y cómo las rutas comerciales movieron sabores por todo el planeta.',
    slug: 'visualizador-mapa-especias',
  },
  {
    icon: '🌍',
    titulo: 'El viaje de la comida',
    desc: 'Recorrido por el origen y la difusión de alimentos cotidianos: cómo llegaron a tu plato desde el otro lado del mundo.',
    slug: 'visualizador-viaje-comida',
  },
  {
    icon: '🌱',
    titulo: 'Huella de los alimentos',
    desc: 'Compara el impacto ambiental —agua, CO₂, tierra— de lo que comemos para decidir con más información.',
    slug: 'visualizador-huella-alimentos',
  },
  {
    icon: '🧬',
    titulo: 'Digestión de nutrientes',
    desc: 'Visualiza el camino de hidratos, grasas y proteínas por el aparato digestivo y cómo se aprovechan.',
    slug: 'visualizador-digestion-nutrientes',
  },
];

export default function CoquinumCulturaGastronomica() {
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
