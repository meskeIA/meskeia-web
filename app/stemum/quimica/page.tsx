// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Química interactiva: equilibrio, titulación y moléculas | Stemum',
  description:
    'Simuladores de química: equilibrio químico y Le Chatelier, titulación ácido-base, geometría molecular VSEPR y estequiometría.',
  alternates: { canonical: 'https://stemum.com/quimica/' },
};

// Apps de la disciplina Química. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '⚗️',
    titulo: 'Equilibrio químico',
    desc: 'Principio de Le Chatelier en vivo: 6 reacciones reversibles, perturbaciones y la comparación de Q con Kc.',
    slug: 'simulador-equilibrio-quimico',
  },
  {
    icon: '🧫',
    titulo: 'Titulación ácido-base',
    desc: 'Bureta y matraz gota a gota con la curva de pH, cuatro tipos de valoración y cuatro indicadores.',
    slug: 'simulador-titulacion',
  },
  {
    icon: '🔷',
    titulo: 'Geometría molecular (VSEPR)',
    desc: 'Geometría 3D rotable según VSEPR: átomo central con pares enlazantes y libres, e hibridación.',
    slug: 'simulador-vsepr',
  },
  {
    icon: '⚖️',
    titulo: 'Estequiometría',
    desc: 'Seis reacciones con reactivo limitante, barras de moles y rendimiento configurable.',
    slug: 'simulador-estequiometria',
  },
];

export default function StemumQuimica() {
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
        </section>
      </main>
    </>
  );
}
