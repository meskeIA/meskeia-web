// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import MaterialApoyoPie from '../MaterialApoyoPie';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Matemáticas interactivas: cálculo, estadística y probabilidad | Stemum',
  description:
    'Visualizadores de matemáticas: cálculo visual, derivadas e integrales, distribución normal, transformada de Fourier y el problema de Monty Hall.',
  alternates: { canonical: 'https://stemum.com/matematicas/' },
};

export default function StemumMatematicas() {
  const APPS = appsDeDisciplina('matematicas');

  return (
    <>
      <AnalyticsTracker appName="stemum-matematicas" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-matematicas">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-matematicas" className={styles.ejeTitle}>
            <span aria-hidden="true">📐</span> Matemáticas
          </h1>
          <p className={styles.ejeIntro}>
            Cálculo, estadística, análisis y probabilidad para manipular en tiempo real.
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

          {/* Material de apoyo de la disciplina: enlace al pie para no mezclar
              piezas de consulta con los simuladores de la parrilla. */}
          <MaterialApoyoPie disciplina="matematicas" pregunta="¿Buscas la fórmula concreta?" />
        </section>
      </main>
    </>
  );
}
