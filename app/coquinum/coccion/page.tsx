// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Cocción y temperatura: punto de la carne y tiempos | Coquinum',
  description:
    'Herramientas de cocción: temperatura interna y punto de la carne y el pescado con el mínimo seguro, y tiempos de cocción en agua de huevos, arroz, legumbres y verduras. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/coccion/' },
};

// Apps de la categoría Cocción y temperatura. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🌡️',
    titulo: 'Temperatura interna de cocción',
    desc: 'El punto exacto de vacuno, cerdo, pollo, carne picada y pescado, con la temperatura mínima segura del USDA. En °C y °F.',
    slug: 'temperatura-coccion-carne',
  },
  {
    icon: '⏱️',
    titulo: 'Tiempos de cocción',
    desc: 'Cuánto cocer en agua huevos, arroz, pasta, legumbres y verduras, con notas prácticas y ajuste por altitud.',
    slug: 'tiempos-coccion',
  },
  {
    icon: '🌀',
    titulo: 'Horno → freidora de aire',
    desc: 'Adapta cualquier receta de horno a la air fryer: baja la temperatura y reduce el tiempo, con tabla de alimentos.',
    slug: 'conversor-horno-airfryer',
  },
  {
    icon: '🍗',
    titulo: 'Tiempos de asado',
    desc: 'Cuánto asar pollo, pavo, cordero, cerdo o ternera según el peso, con la temperatura interna objetivo.',
    slug: 'tiempos-asado',
  },
  {
    icon: '♨️',
    titulo: 'Sous-vide',
    desc: 'Temperaturas y tiempos de cocción al vacío para carne, pollo, pescado, huevo y verduras.',
    slug: 'sous-vide',
  },
  {
    icon: '🧂',
    titulo: 'Salmuera (brining)',
    desc: 'La sal y el agua para tu salmuera según la concentración, con tiempos por pieza.',
    slug: 'calculadora-salmuera',
  },
  {
    icon: '🥚',
    titulo: 'El huevo perfecto',
    desc: 'El tiempo exacto para el huevo en su punto, según el tamaño y si está frío de la nevera.',
    slug: 'huevo-perfecto',
  },
];

export default function CoquinumCoccion() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-coccion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🌡️</span> Cocción y temperatura
          </h1>
          <p className={styles.ejeIntro}>
            Acertar el punto y cocinar seguro: la temperatura interna de la carne y el pescado y
            los tiempos de cocción de los alimentos del día a día.
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
