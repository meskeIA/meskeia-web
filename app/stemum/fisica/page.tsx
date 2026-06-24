// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Física interactiva: campos, ondas, mecánica y termodinámica | Stemum',
  description:
    'Simuladores de física para experimentar: campo eléctrico, péndulo, colisiones, ondas e interferencia, gas ideal y efecto Doppler.',
  alternates: { canonical: 'https://stemum.com/fisica/' },
};

// Apps de la disciplina Física. Viven físicamente en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '⚡',
    titulo: 'Campo eléctrico',
    desc: 'Coloca cargas puntuales y observa las líneas de campo, las equipotenciales y la fuerza sobre una carga de prueba.',
    slug: 'simulador-campo-electrico',
  },
  {
    icon: '🕰️',
    titulo: 'Péndulo y MAS',
    desc: 'Péndulo simple y movimiento armónico: periodo, frecuencia, energía cinética y potencial, y el límite de ángulos pequeños.',
    slug: 'simulador-pendulo',
  },
  {
    icon: '💥',
    titulo: 'Colisiones',
    desc: 'Choques elásticos e inelásticos en 1D con sliders de masa, velocidad y coeficiente de restitución; momento y energía.',
    slug: 'simulador-colisiones',
  },
  {
    icon: '🌊',
    titulo: 'Ondas e interferencia',
    desc: 'Onda viajera, interferencia de dos fuentes y ondas estacionarias en cuerda y tubo, con sus modos armónicos.',
    slug: 'simulador-ondas-interferencia',
  },
  {
    icon: '🎈',
    titulo: 'Gas ideal',
    desc: 'PV = nRT con procesos isotermo, isobaro, isocoro y adiabático, y ciclos Carnot, Otto y Diesel en el diagrama PV.',
    slug: 'simulador-gas-ideal',
  },
  {
    icon: '🚨',
    titulo: 'Efecto Doppler',
    desc: 'Ondas comprimidas y expandidas según la velocidad de la fuente: radar, ecografía, SONAR y el corrimiento al rojo cósmico.',
    slug: 'visualizador-efecto-doppler',
  },
];

export default function StemumFisica() {
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
        </section>
      </main>
    </>
  );
}
