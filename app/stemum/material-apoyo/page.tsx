// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { STEMUM_MATERIAL_APOYO } from '@/data/stemum';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Material de apoyo: tablas y formularios de consulta STEM | Stemum',
  description:
    'Tablas de consulta de matemáticas y química con buscador y ejemplo resuelto: derivadas, integrales y valencias. Para tener a mano mientras estudias o resuelves problemas.',
  alternates: { canonical: 'https://stemum.com/material-apoyo/' },
};

// Contenedor de piezas de consulta. La lista vive en data/stemum.ts para que la
// franja de la home, el llms.txt y esta página no se desincronicen.
export default function StemumMaterialApoyo() {
  return (
    <>
      <AnalyticsTracker appName="stemum-material-apoyo" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-material-apoyo">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-material-apoyo" className={styles.ejeTitle}>
            <span aria-hidden="true">📋</span> Material de apoyo
          </h1>
          <p className={styles.ejeIntro}>
            Tablas y formularios de consulta para tener a mano mientras estudias o
            resuelves problemas. A diferencia de los simuladores, aquí no se experimenta:
            se busca el dato concreto y se sigue trabajando.
          </p>
          <div className={styles.grid}>
            {STEMUM_MATERIAL_APOYO.map((m) => (
              <Link key={m.slug} href={`/${m.slug}`} className={styles.appCard}>
                <span className={styles.cardIcon} aria-hidden="true">{m.icon}</span>
                <h2 className={styles.cardTitulo}>{m.titulo}</h2>
                <p className={styles.cardDesc}>{m.desc}</p>
                <span className={styles.appCardCta}>Abrir →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
