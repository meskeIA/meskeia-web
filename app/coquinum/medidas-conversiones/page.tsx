// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Medidas y conversiones de cocina: tazas a gramos | Coquinum',
  description:
    'Herramientas de precisión para medir en la cocina: convierte tazas, cucharadas y cucharaditas a gramos con el peso real de cada ingrediente. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/medidas-conversiones/' },
};

// Apps de la categoría Medidas y conversiones. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🥄',
    titulo: 'Conversor de tazas a gramos',
    desc: 'Pasa de tazas, cucharadas y cucharaditas a gramos con el peso real de cada ingrediente: la harina no pesa lo mismo que el azúcar ni que los líquidos.',
    slug: 'conversor-tazas-gramos',
  },
  {
    icon: '⛰️',
    titulo: 'Ajuste de recetas por altitud',
    desc: 'Adapta una receta de nivel del mar a la altura a la que cocinas: punto de ebullición del agua y ajustes de horno, leudante, líquido y cocción.',
    slug: 'ajuste-recetas-altitud',
  },
  {
    icon: '🌡️',
    titulo: 'Conversor de temperatura de horno',
    desc: 'Pasa la temperatura del horno entre grados Celsius, Fahrenheit y gas mark, con el equivalente para horno de ventilador y los usos de cada nivel.',
    slug: 'conversor-temperatura-horno',
  },
  {
    icon: '🔄',
    titulo: 'Sustituciones de ingredientes',
    desc: 'Con qué cambiar huevo, mantequilla, azúcar, leche o harina, con proporciones exactas y filtro vegano, sin gluten y sin lactosa.',
    slug: 'sustituciones-ingredientes',
  },
  {
    icon: '⭕',
    titulo: 'Conversor de moldes',
    desc: 'Adapta los ingredientes de una receta al molde que tengas según el área de la base, y ajusta el tiempo de horno.',
    slug: 'conversor-moldes',
  },
  {
    icon: '💧',
    titulo: 'Conversor de líquidos (ml ↔ g)',
    desc: 'Convierte mililitros y gramos según el líquido: cada uno pesa distinto por su densidad (aceite, miel, leche…).',
    slug: 'densidad-liquidos',
  },
  {
    icon: '🤏',
    titulo: 'Medidas «a ojo»',
    desc: 'Cuánto es una pizca, un chorro, un vaso o un puñado: traduce las medidas imprecisas de las recetas.',
    slug: 'medidas-a-ojo',
  },
  {
    icon: '⚖️',
    titulo: 'Conversor de onzas',
    desc: 'De onzas a gramos, mililitros, libras y tazas, separando la onza de peso de la onza líquida, con la diferencia entre EE. UU. y Reino Unido.',
    slug: 'conversor-onzas',
  },
];

export default function CoquinumMedidasConversiones() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-medidas-conversiones" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🥄</span> Medidas y conversiones
          </h1>
          <p className={styles.ejeIntro}>
            La precisión que la cocina de tazas no da. Convierte cualquier medida de volumen a
            gramos según el ingrediente, para que las recetas en tazas salgan igual cada vez.
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
