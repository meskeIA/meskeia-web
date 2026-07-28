// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Computación interactiva: algoritmos, autómatas y estructuras | Stemum',
  description:
    'Simuladores interactivos de computación: algoritmos de ordenación, autómatas finitos, máquina de Turing, grafos, árboles BST/AVL, JOINs de SQL y cómo funciona un LLM.',
  alternates: { canonical: 'https://stemum.com/computacion/' },
};

export default function StemumComputacion() {
  const APPS = appsDeDisciplina('computacion');

  return (
    <>
      <AnalyticsTracker appName="stemum-computacion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-computacion">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-computacion" className={styles.ejeTitle}>
            <span aria-hidden="true">💻</span> Computación
          </h1>
          <p className={styles.ejeIntro}>
            Algoritmos, estructuras de datos, modelos de cómputo e inteligencia artificial,
            para manipular en tiempo real. Mueve un control y observa cómo responde el sistema.
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
