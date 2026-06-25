// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Tierra y Espacio interactivo: exoplanetas y terremotos | Stemum',
  description:
    'Visualizadores de astronomía y geología: tránsitos de exoplanetas y zona habitable, terremotos, escalas Richter y Mercalli, y tsunamis.',
  alternates: { canonical: 'https://stemum.com/tierra-espacio/' },
};

// Apps de la disciplina Tierra y Espacio. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🪐',
    titulo: 'Exoplanetas',
    desc: 'Tránsito animado con su curva de luz, el método del bamboleo, la zona habitable y más de 5.500 mundos reales.',
    slug: 'visualizador-exoplanetas',
  },
  {
    icon: '🌋',
    titulo: 'Terremotos y tsunamis',
    desc: 'Fallas y ondas P/S, escalas Richter y Mercalli, y la propagación de tsunamis con el sistema de alerta DART.',
    slug: 'visualizador-terremotos-tsunamis',
  },
  {
    icon: '🕳️',
    titulo: 'Agujeros negros',
    desc: 'Anatomía clicable con el radio de Schwarzschild, la espaguetización y la radiación de Hawking.',
    slug: 'visualizador-agujeros-negros',
  },
  {
    icon: '🌌',
    titulo: 'Cosmología',
    desc: 'Composición del universo, línea temporal del Big Bang, factor de escala a(t) y posibles destinos cósmicos.',
    slug: 'visualizador-cosmologia',
  },
  {
    icon: '🌳',
    titulo: 'Ciclo del carbono',
    desc: 'Cinco reservorios y sus flujos con un control de emisiones y distintos escenarios de mitigación.',
    slug: 'visualizador-ciclo-carbono-completo',
  },
  {
    icon: '🌊',
    titulo: 'El Niño y La Niña',
    desc: 'Circulación de Walker, fases El Niño y La Niña, teleconexiones e índices SOI y ONI.',
    slug: 'visualizador-el-nino',
  },
  {
    icon: '⭐',
    titulo: 'Vida de una estrella',
    desc: 'El slider de masa estelar recalcula vida, temperatura, color espectral y diagrama HR, y bifurca el destino entre enana blanca, neutrón o agujero negro.',
    slug: 'visualizador-vida-estrella',
  },
  {
    icon: '🪐',
    titulo: 'Sistema solar',
    desc: 'Fichas de planetas desplegables, slider de escala que reduce el Sol a un balón y línea del tiempo de la luz desde Mercurio a Neptuno.',
    slug: 'visualizador-sistema-solar',
  },
  {
    icon: '🌱',
    titulo: 'Ciclo del nitrógeno',
    desc: 'Diagrama SVG clicable de fijación, nitrificación y desnitrificación, con slider de año 1900-2025 que cuantifica la fijación humana frente a la biológica.',
    slug: 'visualizador-ciclo-nitrogeno',
  },
];

export default function StemumTierraEspacio() {
  return (
    <>
      <AnalyticsTracker appName="stemum-tierra-espacio" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-tierra-espacio">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-tierra-espacio" className={styles.ejeTitle}>
            <span aria-hidden="true">🌍</span> Tierra y Espacio
          </h1>
          <p className={styles.ejeIntro}>
            Astronomía, geología y ciencias del planeta para manipular en tiempo real.
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
