// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cocina y recetas: conversor, escalado y planificador | Coquinum',
  description:
    'Herramientas de cocina del día a día: conversor de unidades de cocina, escalado de recetas por raciones, planificador de menú semanal y orientador de dieta. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/cocina-recetas/' },
};

// Apps de la categoría Cocina y recetas. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '⚖️',
    titulo: 'Conversor de cocina',
    desc: 'Pasa entre gramos, mililitros, tazas y cucharadas, y entre °C y °F, para seguir cualquier receta sin liarte con las medidas.',
    slug: 'calculadora-cocina',
  },
  {
    icon: '🍽️',
    titulo: 'Escalador de recetas',
    desc: 'Ajusta las cantidades de una receta al número de raciones que necesitas, manteniendo las proporciones.',
    slug: 'escalador-recetas',
  },
  {
    icon: '🗓️',
    titulo: 'Planificador de menú',
    desc: 'Organiza las comidas de la semana de forma equilibrada y variada para llegar con todo previsto a la compra.',
    slug: 'planificador-menu',
  },
  {
    icon: '🥗',
    titulo: 'Selector de dieta',
    desc: 'Compara patrones de alimentación según tus objetivos y preferencias para orientarte sobre cuál encaja contigo.',
    slug: 'selector-dieta',
  },
];

export default function CoquinumCocinaRecetas() {
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
            planificar la semana para que cocinar sea más fácil y menos improvisado.
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
