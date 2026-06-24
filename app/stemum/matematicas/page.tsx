'use client';
// @disclaimer: exempt

import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

// Apps de la disciplina Matemáticas. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '📈',
    titulo: 'Cálculo visual',
    desc: 'Límites, la tangente como derivada y el área bajo la curva como integral de Riemann, con tres funciones y sliders.',
    slug: 'visualizador-calculo-visual',
  },
  {
    icon: '📐',
    titulo: 'La derivada como pendiente',
    desc: 'La derivada como pendiente de la tangente: 8 funciones, modo secante hacia el límite y la curva f′(x).',
    slug: 'simulador-derivada-pendiente',
  },
  {
    icon: '∫',
    titulo: 'La integral como área',
    desc: 'Suma de Riemann con 4 métodos (izquierda, derecha, punto medio, trapecio) y el error frente al valor exacto.',
    slug: 'simulador-integral-area',
  },
  {
    icon: '🔔',
    titulo: 'Distribución normal',
    desc: 'Curva de Gauss interactiva: ajusta μ y σ, calcula probabilidades, la regla 68-95-99,7 y la tipificación Z.',
    slug: 'simulador-distribucion-normal',
  },
  {
    icon: '〰️',
    titulo: 'Transformada de Fourier',
    desc: 'Síntesis de señales y su espectro, señales preconfiguradas y los epiciclos animados que las componen.',
    slug: 'visualizador-transformada-fourier',
  },
  {
    icon: '🚪',
    titulo: 'Problema de Monty Hall',
    desc: 'Modo manual y simulación de 10.000 partidas para ver por qué cambiar de puerta gana 2/3 de las veces.',
    slug: 'simulador-monty-hall',
  },
];

export default function StemumMatematicas() {
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
        </section>
      </main>
    </>
  );
}
