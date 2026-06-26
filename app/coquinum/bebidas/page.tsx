// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Bebidas: café, té, coctelería, cerveza y vino | Coquinum',
  description:
    'Guías y selectores de bebidas: café, té e infusiones, coctelería, estilos de cerveza, variedades de vino y selectores para acertar con la copa según el plato. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/bebidas/' },
};

// Apps de la categoría Bebidas. Viven físicamente en meskeIA y se sirven bajo
// coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '☕',
    titulo: 'Café',
    desc: 'Métodos de extracción, tuestes y orígenes para entender qué hay detrás de cada taza y preparar mejor café en casa.',
    slug: 'guia-cafe',
  },
  {
    icon: '🍵',
    titulo: 'Té',
    desc: 'Verde, negro, oolong o blanco: temperaturas y tiempos de infusión para que cada té dé lo mejor de sí.',
    slug: 'guia-te',
  },
  {
    icon: '🌼',
    titulo: 'Infusiones',
    desc: 'Hierbas e infusiones más allá del té, sus aromas y para qué momento del día va cada una.',
    slug: 'guia-infusiones',
  },
  {
    icon: '🍸',
    titulo: 'Coctelería',
    desc: 'Cócteles clásicos, sus proporciones y técnicas para prepararlos bien. Con consumo responsable.',
    slug: 'guia-cocteles',
  },
  {
    icon: '🍺',
    titulo: 'Estilos de cerveza',
    desc: 'Lager, IPA, stout y compañía: qué define a cada estilo, su intensidad y con qué comida combinan.',
    slug: 'guia-estilos-cerveza',
  },
  {
    icon: '🍇',
    titulo: 'Variedades de vino',
    desc: 'Las principales uvas y sus perfiles, para reconocer qué esperar de cada vino por su varietal.',
    slug: 'guia-varietales-vino',
  },
  {
    icon: '🍷',
    titulo: 'Qué vino elegir',
    desc: 'Selector que te sugiere el vino según el plato, el momento y tus preferencias para acertar con el maridaje.',
    slug: 'que-vino-elegir',
  },
  {
    icon: '🍻',
    titulo: 'Qué cerveza elegir',
    desc: 'Selector que orienta hacia el estilo de cerveza que mejor encaja con lo que vas a comer o el momento.',
    slug: 'que-cerveza-elegir',
  },
];

export default function CoquinumBebidas() {
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
