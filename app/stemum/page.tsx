'use client';
// @disclaimer: exempt

import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './StemumHome.module.css';

// Las 6 disciplinas del portal. De momento son tarjetas de vista previa (maqueta):
// el enlace a cada disciplina se activará cuando se publiquen las páginas y las apps.
const DISCIPLINAS = [
  {
    icon: '💻',
    titulo: 'Computación',
    desc: 'Algoritmos de ordenación, autómatas, máquinas de Turing, grafos, estructuras de datos y cómo funciona la IA.',
    n: '24+',
  },
  {
    icon: '⚛️',
    titulo: 'Física',
    desc: 'Campos eléctricos, ondas e interferencias, péndulos, colisiones, gases y el efecto Doppler en movimiento.',
    n: '25+',
  },
  {
    icon: '📐',
    titulo: 'Matemáticas',
    desc: 'Cálculo visual, derivadas e integrales, distribución normal, transformada de Fourier y probabilidad.',
    n: '22+',
  },
  {
    icon: '🧪',
    titulo: 'Química',
    desc: 'Equilibrio químico, titulaciones ácido-base, geometría molecular VSEPR, estequiometría y cinética.',
    n: '15+',
  },
  {
    icon: '🧬',
    titulo: 'Biología',
    desc: 'Genética de Punnett, depredador-presa, ecosistemas tróficos, modelos epidemiológicos y evolución.',
    n: '12+',
  },
  {
    icon: '🌍',
    titulo: 'Tierra y Espacio',
    desc: 'Exoplanetas, terremotos y tsunamis, el ciclo del carbono, El Niño y los agujeros negros.',
    n: '6+',
  },
];

const ACRONIMO = [
  { letra: 'S', palabra: 'Science' },
  { letra: 'T', palabra: 'Technology' },
  { letra: 'E', palabra: 'Engineering' },
  { letra: 'M', palabra: 'Mathematics' },
];

export default function StemumHome() {
  return (
    <>
      <AnalyticsTracker appName="stemum" />

      <main className={styles.container}>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLockup}>
            <Image
              src="/stemum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={72}
              height={72}
              priority
            />
            <span className={styles.heroWordmark}>Stemum</span>
          </div>

          <ul className={styles.acronimo} aria-label="Significado de STEM">
            {ACRONIMO.map((a) => (
              <li key={a.letra} className={styles.acronimoItem}>
                <span className={styles.acronimoLetra}>{a.letra}</span>
                <span className={styles.acronimoPalabra}>{a.palabra}</span>
              </li>
            ))}
          </ul>

          <p className={styles.heroSubtitle}>
            Visualizadores y simuladores <strong>interactivos</strong> para experimentar
            con la ciencia. Física, matemáticas, química, computación y biología —
            toca, ajusta y descubre cómo funciona el mundo.
          </p>

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            100+ simuladores · En español · Sin registro · Sin coste
          </div>
        </header>

        {/* Disciplinas */}
        <section id="disciplinas" className={styles.ejeSection} aria-labelledby="titulo-disciplinas">
          <h2 id="titulo-disciplinas" className={styles.ejeTitle}>Explora por disciplina</h2>
          <p className={styles.ejeIntro}>
            Cada disciplina reúne simuladores y visualizadores que puedes manipular en
            tiempo real. Mueve un control y observa cómo responde el sistema.
          </p>
          <div className={styles.grid}>
            {DISCIPLINAS.map((d) => (
              <article key={d.titulo} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon} aria-hidden="true">{d.icon}</span>
                  <span className={styles.cardCount}>{d.n}</span>
                </div>
                <h3 className={styles.cardTitulo}>{d.titulo}</h3>
                <p className={styles.cardDesc}>{d.desc}</p>
                <span className={styles.cardCta}>Próximamente</span>
              </article>
            ))}
          </div>
        </section>

        {/* Qué es Stemum */}
        <section id="que-es" className={styles.queEs}>
          <h2 className={styles.sectionTitle}>Qué es Stemum</h2>
          <p>
            Stemum reúne en una sola marca los <strong>visualizadores y simuladores
            interactivos</strong> de ciencia: herramientas que no se limitan a explicar,
            sino que te dejan <strong>experimentar</strong>. Ajusta una variable —la masa
            de un péndulo, la temperatura de una reacción, el tamaño de un array— y observa
            cómo cambia el resultado al instante. Es la diferencia entre leer sobre algo y
            verlo funcionar con tus propias manos. Es un servicio de{' '}
            <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte su
            compromiso: contenido claro, gratuito y sin recopilar datos personales.
          </p>
        </section>

      </main>
    </>
  );
}
