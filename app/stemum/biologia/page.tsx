'use client';
// @disclaimer: exempt

import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

// Apps de la disciplina Biología. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🦊',
    titulo: 'Depredador-presa (Lotka-Volterra)',
    desc: 'Oscilaciones del modelo depredador-presa con diagrama de fases, integración RK4 y modo logístico.',
    slug: 'simulador-lotka-volterra',
  },
  {
    icon: '🌿',
    titulo: 'Ecosistema trófico',
    desc: 'Cuatro ecosistemas con cascadas tróficas: introduce eventos y observa la pirámide alimentaria animada.',
    slug: 'simulador-ecosistema-trofico',
  },
  {
    icon: '🦠',
    titulo: 'Modelos epidemiológicos',
    desc: 'Simulador SIR/SEIR: ajusta Rₜ y compara la curva de cinco enfermedades resolviendo las ecuaciones por Euler.',
    slug: 'visualizador-modelos-epidemiologicos',
  },
];

export default function StemumBiologia() {
  return (
    <>
      <AnalyticsTracker appName="stemum-biologia" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-biologia">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-biologia" className={styles.ejeTitle}>
            <span aria-hidden="true">🧬</span> Biología
          </h1>
          <p className={styles.ejeIntro}>
            Genética, ecología y dinámica de poblaciones para manipular en tiempo real.
            Mueve un control y observa cómo responde el sistema.
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
