'use client';
// @disclaimer: exempt

import Image from 'next/image';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import {
  CRONOLOGIAS_POR_PUERTA,
  CRONICUM_TOTAL_CRONOLOGIAS,
} from '@/data/cronicum/puertas';
import styles from './CronicumHome.module.css';

// Devuelve el texto del badge de una tarjeta a partir de su href (= /<slug-puerta>).
function badgeCronologias(href: string): string {
  const count = CRONOLOGIAS_POR_PUERTA[href.replace(/\//g, '')] ?? 0;
  return `${count} ${count === 1 ? 'cronología' : 'cronologías'}`;
}

// Eje 1 — El mundo: civilizaciones, países y regiones
const EL_MUNDO = [
  {
    icon: '🏛️',
    titulo: 'Mundo Antiguo',
    desc: 'Grecia, Roma, Egipto, Mesopotamia, Persia, Bizancio… las civilizaciones que pusieron los cimientos.',
    href: '/mundo-antiguo',
  },
  {
    icon: '🏯',
    titulo: 'Asia',
    desc: 'China, Japón, India, Corea y el mundo otomano y mongol: milenios de historia oriental.',
    href: '/asia',
  },
  {
    icon: '🏰',
    titulo: 'Europa',
    desc: 'De la Edad Media a la época contemporánea: reinos, imperios y naciones europeas.',
    href: '/europa',
  },
  {
    icon: '🌎',
    titulo: 'América',
    desc: 'Estados Unidos, Canadá y toda Latinoamérica, de la conquista a los países modernos.',
    href: '/america',
  },
  {
    icon: '🗿',
    titulo: 'Civilizaciones precolombinas',
    desc: 'Mayas, aztecas, incas, olmecas y toltecas: las grandes culturas de América antes de 1492.',
    href: '/precolombinas',
  },
  {
    icon: '🌍',
    titulo: 'África y Oceanía',
    desc: 'El continente africano y el mundo del Pacífico: una historia menos contada.',
    href: '/africa-oceania',
  },
];

// Eje 2 — La historia de las cosas: temática transversal
const LAS_COSAS = [
  {
    icon: '🔬',
    titulo: 'Ciencia y tecnología',
    desc: 'Astronomía, física, matemáticas, medicina, la electricidad o la inteligencia artificial.',
    href: '/ciencia-tecnologia',
  },
  {
    icon: '📡',
    titulo: 'Comunicación y mundo digital',
    desc: 'De la imprenta y la radio a internet, los videojuegos y las redes sociales.',
    href: '/comunicacion-digital',
  },
  {
    icon: '🎭',
    titulo: 'Arte, cultura y deporte',
    desc: 'Cine, música, arquitectura, moda, fotografía y la historia del deporte.',
    href: '/arte-cultura',
  },
  {
    icon: '⚖️',
    titulo: 'Economía, derecho e ideas',
    desc: 'Banca, capitalismo, comercio, trabajo, constituciones y pensamiento político.',
    href: '/economia-ideas',
  },
  {
    icon: '🏺',
    titulo: 'Vida cotidiana y salud',
    desc: 'Gastronomía, vivienda, urbanismo, epidemias y salud pública a lo largo del tiempo.',
    href: '/vida-cotidiana',
  },
];

export default function CronicumHome() {
  return (
    <>
      <AnalyticsTracker appName="cronicum" />

      <main className={styles.container}>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLockup}>
            <Image
              src="/cronicum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={84}
              height={84}
              priority
            />
            <span className={styles.heroWordmark}>Cronicum</span>
          </div>
          <p className={styles.heroSubtitle}>
            La historia de la humanidad, contada de forma <strong>interactiva</strong>.
            Civilizaciones, países y la historia de las grandes ideas e inventos —
            para entender las raíces del presente.
          </p>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            {CRONICUM_TOTAL_CRONOLOGIAS} cronologías · Navegable · Sin registro · Sin coste
          </div>
        </header>

        {/* Eje 1 — El mundo */}
        <section id="el-mundo" className={styles.ejeSection} aria-labelledby="titulo-el-mundo">
          <h2 id="titulo-el-mundo" className={styles.ejeTitle}>El mundo</h2>
          <p className={styles.ejeIntro}>
            Recorre la historia por civilizaciones, países y regiones, desde la Antigüedad
            hasta hoy.
          </p>
          <div className={styles.grid}>
            {EL_MUNDO.map((p) => (
              <Link key={p.titulo} href={p.href} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon} aria-hidden="true">{p.icon}</span>
                  <span className={styles.cardCount}>{badgeCronologias(p.href)}</span>
                </div>
                <h3 className={styles.cardTitulo}>{p.titulo}</h3>
                <p className={styles.cardDesc}>{p.desc}</p>
                <span className={styles.cardCta}>Explorar →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Eje 2 — La historia de las cosas */}
        <section id="las-cosas" className={styles.ejeSection} aria-labelledby="titulo-las-cosas">
          <h2 id="titulo-las-cosas" className={styles.ejeTitle}>La historia de las cosas</h2>
          <p className={styles.ejeIntro}>
            La otra forma de mirar el pasado: cómo evolucionaron la ciencia, la cultura,
            la economía y la vida cotidiana a través de los siglos.
          </p>
          <div className={styles.grid}>
            {LAS_COSAS.map((p) => (
              <Link key={p.titulo} href={p.href} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon} aria-hidden="true">{p.icon}</span>
                  <span className={styles.cardCount}>{badgeCronologias(p.href)}</span>
                </div>
                <h3 className={styles.cardTitulo}>{p.titulo}</h3>
                <p className={styles.cardDesc}>{p.desc}</p>
                <span className={styles.cardCta}>Explorar →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Banda transversal — Grandes acontecimientos */}
        <section id="grandes-acontecimientos" className={styles.banda}>
          <div className={styles.bandaInner}>
            <span className={styles.bandaIcon} aria-hidden="true">📜</span>
            <div className={styles.bandaTexto}>
              <h2 className={styles.bandaTitulo}>
                Grandes acontecimientos
                <span className={styles.bandaCount}>
                  {badgeCronologias('/grandes-acontecimientos')}
                </span>
              </h2>
              <p className={styles.bandaDesc}>
                Los momentos que cambiaron el rumbo de la humanidad: la Revolución Francesa,
                las guerras napoleónicas, las dos guerras mundiales, la Guerra Fría, el
                Renacimiento, la Reforma, las Cruzadas o la Ilustración.
              </p>
            </div>
            <Link href="/grandes-acontecimientos" className={styles.bandaCta}>
              Ver todos →
            </Link>
          </div>
        </section>

        {/* Qué es Cronicum */}
        <section className={styles.queEs}>
          <h2 className={styles.sectionTitle}>Qué es Cronicum</h2>
          <p>
            Cronicum reúne en una sola marca la historia de la humanidad explicada de forma{' '}
            <strong>visual e interactiva</strong>: cronologías navegables que puedes recorrer{' '}
            por <strong>civilizaciones y regiones del mundo</strong> o por{' '}
            <strong>materias</strong> —la historia de la ciencia, el arte, la economía o la
            vida cotidiana—. Cada cronología es una línea del tiempo explorable, con sus
            períodos, hitos y contexto. Es un servicio de{' '}
            <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte su
            compromiso: contenido claro, gratuito y sin recopilar datos personales.
          </p>
        </section>

      </main>
    </>
  );
}
