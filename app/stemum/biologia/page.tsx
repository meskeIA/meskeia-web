// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Biología interactiva: genética, ecología y epidemias | Stemum',
  description:
    'Simuladores de biología: modelo depredador-presa de Lotka-Volterra, ecosistemas tróficos y modelos epidemiológicos SIR/SEIR.',
  alternates: { canonical: 'https://stemum.com/biologia/' },
};

export default function StemumBiologia() {
  const APPS = appsDeDisciplina('biologia');

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
