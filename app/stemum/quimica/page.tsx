// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { appsDeDisciplina } from '@/data/stemum';
import MaterialApoyoPie from '../MaterialApoyoPie';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Química interactiva: equilibrio, titulación y moléculas | Stemum',
  description:
    'Simuladores de química: equilibrio químico y Le Chatelier, titulación ácido-base, geometría molecular VSEPR y estequiometría.',
  alternates: { canonical: 'https://stemum.com/quimica/' },
};

export default function StemumQuimica() {
  const APPS = appsDeDisciplina('quimica');

  return (
    <>
      <AnalyticsTracker appName="stemum-quimica" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-quimica">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-quimica" className={styles.ejeTitle}>
            <span aria-hidden="true">🧪</span> Química
          </h1>
          <p className={styles.ejeIntro}>
            Reacciones, equilibrio, estructura molecular y estequiometría para manipular
            en tiempo real. Mueve un control y observa cómo responde el sistema.
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
          <MaterialApoyoPie disciplina="quimica" pregunta="¿Buscas el dato concreto?" />
        </section>
      </main>
    </>
  );
}
