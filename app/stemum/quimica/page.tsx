// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MaterialApoyoPie from '../MaterialApoyoPie';
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
    icon: '🧪',
    titulo: 'Disoluciones (molaridad y dilución)',
    desc: 'Ajusta soluto y volumen y observa la molaridad, g/L, % m/v y ppm en vivo, con el color del vaso según la concentración. Incluye dilución C₁·V₁ = C₂·V₂.',
    slug: 'simulador-disoluciones',
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
  {
    icon: '💨',
    titulo: 'Cinética y Arrhenius',
    desc: 'Distribución de Maxwell-Boltzmann con energía de activación ajustable y la recta de Arrhenius.',
    slug: 'simulador-cinetica-arrhenius',
  },
  {
    icon: '🗺️',
    titulo: 'Tabla periódica y tendencias',
    desc: 'Mapa de calor de los 118 elementos con cinco propiedades y flechas que marcan las tendencias.',
    slug: 'simulador-tabla-periodica-tendencias',
  },
  {
    icon: '🔥',
    titulo: 'Termodinámica química',
    desc: 'Entalpía con catalizador ajustable, energía libre de Gibbs y constante de equilibrio.',
    slug: 'visualizador-termodinamica-quimica',
  },
  {
    icon: '🔋',
    titulo: 'Electroquímica',
    desc: 'Pila Daniell animada, serie electroquímica, electrólisis y baterías de litio.',
    slug: 'visualizador-electroquimica',
  },
  {
    icon: '⚛️',
    titulo: 'El carbono',
    desc: 'Alterna entre los 4 alótropos con sus estructuras SVG, explora el ciclo del carbono y grupos funcionales, y data objetos con un slider de desintegración de C-14.',
    slug: 'visualizador-carbono',
  },
  {
    icon: '⚗️',
    titulo: 'Cinética química',
    desc: 'Mueve Ea, ΔH y catalizador sobre el perfil de energía, ve k crecer en la curva de Arrhenius y compara curvas de concentración y vida media de los órdenes 0, 1 y 2.',
    slug: 'visualizador-cinetica-quimica',
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

          {/* Material de apoyo de la disciplina: enlace al pie para no mezclar
              piezas de consulta con los simuladores de la parrilla. */}
          <MaterialApoyoPie disciplina="quimica" pregunta="¿Buscas el dato concreto?" />
        </section>
      </main>
    </>
  );
}
