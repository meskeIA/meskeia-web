// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Biología interactiva: genética, ecología y epidemias | Stemum',
  description:
    'Simuladores de biología: modelo depredador-presa de Lotka-Volterra, ecosistemas tróficos y modelos epidemiológicos SIR/SEIR.',
  alternates: { canonical: 'https://stemum.com/biologia/' },
};

// Apps de la disciplina Biología. Viven en meskeIA y se sirven bajo
// stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🦊',
    titulo: 'Depredador-presa (Lotka-Volterra)',
    desc: 'Oscilaciones del modelo depredador-presa con diagrama de fases, integración RK4 y modo logístico.',
    slug: 'simulador-lotka-volterra',
  },
  {
    icon: '🌿',
    titulo: 'Ecosistema trófico',
    desc: 'Cuatro ecosistemas con cascadas tróficas: introduce eventos y observa la pirámide alimentaria animada.',
    slug: 'simulador-ecosistema-trofico',
  },
  {
    icon: '🦠',
    titulo: 'Modelos epidemiológicos',
    desc: 'Simulador SIR/SEIR: ajusta Rₜ y compara la curva de cinco enfermedades resolviendo las ecuaciones por Euler.',
    slug: 'visualizador-modelos-epidemiologicos',
  },
  {
    icon: '🎲',
    titulo: 'Deriva genética',
    desc: 'Modelo de Wright-Fisher con deriva, selección, mutación y migración, y probabilidad de fijación.',
    slug: 'simulador-deriva-genetica',
  },
  {
    icon: '🟩',
    titulo: 'Cuadro de Punnett',
    desc: 'Cruces mono y dihíbridos con celdas coloreadas y proporciones 3:1 y 9:3:3:1.',
    slug: 'simulador-punnett',
  },
  {
    icon: '🔬',
    titulo: 'Mitosis y meiosis',
    desc: 'Fases de la mitosis y la meiosis en canvas 2D con crossing-over y reproducción automática.',
    slug: 'simulador-mitosis-meiosis',
  },
  {
    icon: '🌱',
    titulo: 'Factores de la fotosíntesis',
    desc: 'Ley de Blackman con luz, CO₂ y temperatura ajustables y factor limitante en tiempo real.',
    slug: 'simulador-fotosintesis-factores',
  },
  {
    icon: '✂️',
    titulo: 'CRISPR-Cas9',
    desc: 'Mecanismo de edición en 6 pasos con slider, reparación NHEJ frente a HDR y bioética.',
    slug: 'visualizador-crispr-cas9',
  },
  {
    icon: '🧪',
    titulo: 'Epigenética',
    desc: 'Nucleosoma con slider de metilación CpG, histonas clicables e imprinting genómico.',
    slug: 'visualizador-epigenetica',
  },
  {
    icon: '🥚',
    titulo: 'Embriogénesis',
    desc: 'Fecundación y segmentación con slider, gastrulación de tres capas y organogénesis.',
    slug: 'visualizador-embriogenesis',
  },
  {
    icon: '🧫',
    titulo: 'Microbiología',
    desc: 'Morfologías bacterianas clicables, curva de crecimiento logística y tinción de Gram.',
    slug: 'visualizador-microbiologia',
  },
  {
    icon: '🦴',
    titulo: 'Evolución humana',
    desc: 'Línea del tiempo clicable de 8 homínidos, anatomía comparada con barra, mapa Out of Africa interactivo y slider de 70.000 años de hitos cognitivos.',
    slug: 'visualizador-evolucion-humana',
  },
  {
    icon: '🧬',
    titulo: 'Evolución molecular',
    desc: 'Muta una secuencia de ADN viendo si cambia el aminoácido, mueve el reloj molecular d=2μt y alinea especies para construir su árbol filogenético.',
    slug: 'visualizador-evolucion-molecular',
  },
  {
    icon: '⚡',
    titulo: 'Potencial de acción',
    desc: 'Ajusta intensidad, umbral y duración del estímulo y observa en vivo en el canvas si la neurona dispara y a qué frecuencia (ley del todo o nada).',
    slug: 'simulador-potencial-accion',
  },
];

export default function StemumBiologia() {
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
