// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import MaterialApoyoPie from '../MaterialApoyoPie';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Física interactiva: campos, ondas, mecánica y termodinámica | Stemum',
  description:
    'Simuladores de física para experimentar: campo eléctrico, péndulo, colisiones, ondas e interferencia, gas ideal y efecto Doppler.',
  alternates: { canonical: 'https://stemum.com/fisica/' },
};

export default function StemumFisica() {
  const APPS = appsDeDisciplina('fisica');

  return (
    <>
      <AnalyticsTracker appName="stemum-fisica" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-fisica">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-fisica" className={styles.ejeTitle}>
            <span aria-hidden="true">⚛️</span> Física
          </h1>
          <p className={styles.ejeIntro}>
            Mecánica, ondas, electricidad y termodinámica para manipular en tiempo real.
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
          <MaterialApoyoPie disciplina="fisica" pregunta="¿Buscas el dato concreto?" />
        </section>
      </main>
    </>
  );
}
