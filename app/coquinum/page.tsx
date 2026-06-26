'use client';
// @disclaimer: exempt

import Image from 'next/image';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { COQUINUM_APPS_POR_CATEGORIA, COQUINUM_TOTAL_APPS } from '@/data/coquinum';
import styles from './CoquinumHome.module.css';

// Las 5 categorías pobladas del portal. Cada una enlaza a su página de categoría,
// que sirve las apps gastro bajo coquinum.com (host-rewrite, lista en proxy.ts).
const SECCIONES = [
  {
    icon: '🍞',
    titulo: 'Panadería y repostería',
    desc: 'Porcentaje del panadero, hidratación de masa, masa madre, temperatura de masa, ganache, gelatina y punto de azúcar.',
    href: '/panaderia-reposteria',
  },
  {
    icon: '🍽️',
    titulo: 'Cocina y recetas',
    desc: 'Convierte unidades de cocina, escala recetas por raciones, planifica el menú semanal y orienta tu dieta.',
    href: '/cocina-recetas',
  },
  {
    icon: '🥄',
    titulo: 'Medidas y conversiones',
    desc: 'Pasa de tazas y cucharadas a gramos con el peso real de cada ingrediente. Precisión para recetas que vienen en tazas.',
    href: '/medidas-conversiones',
  },
  {
    icon: '🌡️',
    titulo: 'Cocción y temperatura',
    desc: 'El punto y la temperatura interna segura de la carne y el pescado, y los tiempos de cocción en agua de los alimentos del día a día.',
    href: '/coccion',
  },
  {
    icon: '🧊',
    titulo: 'Conservación',
    desc: 'Cuánto dura cada alimento en la nevera, el congelador y la despensa, y cómo conservar con seguridad.',
    href: '/conservacion',
  },
  {
    icon: '💼',
    titulo: 'Costes y escandallo',
    desc: 'El ala profesional: food cost y precio de venta de tus platos, y cálculo de merma para conocer el coste real de la materia prima.',
    href: '/costes-cocina',
  },
  {
    icon: '🥩',
    titulo: 'Ingredientes y despensa',
    desc: 'Guías para elegir y usar aceite, carne, especias, quesos, setas, arroces, pastas, vinagres y más.',
    href: '/ingredientes-despensa',
  },
  {
    icon: '🍷',
    titulo: 'Bebidas',
    desc: 'Café, té e infusiones, coctelería, cerveza y vino, con selectores para acertar con la copa.',
    href: '/bebidas',
  },
  {
    icon: '🌍',
    titulo: 'Cultura gastronómica',
    desc: 'Mapas de especias, el viaje de la comida por el mundo, la huella ambiental de los alimentos y la digestión.',
    href: '/cultura-gastronomica',
  },
];

export default function CoquinumHome() {
  return (
    <>
      <AnalyticsTracker appName="coquinum" />

      <main className={styles.container}>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLockup}>
            <Image
              src="/coquinum/simbolo.svg"
              alt=""
              aria-hidden="true"
              width={72}
              height={72}
              priority
            />
            <Image
              src="/coquinum/wordmark-light.svg"
              alt="Coquinum"
              width={260}
              height={64}
              className={styles.heroWordmarkImg}
              priority
            />
          </div>

          <p className={styles.heroEtimologia}>
            del latín <em>coquinum</em> — de la cocina
          </p>

          <p className={styles.heroLead}>
            Calculadoras y herramientas de <strong>cocina técnica</strong> para clavar
            cada receta.
          </p>
          <p className={styles.heroSecciones}>
            Panadería, recetas, medidas, cocción, conservación, costes, ingredientes, bebidas y cultura gastronómica
          </p>
          <p className={styles.heroClaim}>
            Mide, convierte y cocina con precisión.
          </p>

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            {COQUINUM_TOTAL_APPS} herramientas · En español · Sin registro · Sin coste
          </div>
        </header>

        {/* Secciones */}
        <section id="secciones" className={styles.ejeSection} aria-labelledby="titulo-secciones">
          <h2 id="titulo-secciones" className={styles.ejeTitle}>Explora por sección</h2>
          <p className={styles.ejeIntro}>
            Cada sección reúne calculadoras de precisión y guías para que la receta salga
            a la primera: las cuentas exactas detrás de la cocina.
          </p>
          <div className={styles.grid}>
            {SECCIONES.map((s) => {
              const slug = s.href.replace(/\//g, '');
              const count = COQUINUM_APPS_POR_CATEGORIA[slug] ?? 0;
              const badge = `${count} ${count === 1 ? 'app' : 'apps'}`;
              return (
                <Link key={s.titulo} href={s.href} className={styles.appCard}>
                  <div className={styles.cardHead}>
                    <span className={styles.cardIcon} aria-hidden="true">{s.icon}</span>
                    <span className={styles.cardCount}>{badge}</span>
                  </div>
                  <h3 className={styles.cardTitulo}>{s.titulo}</h3>
                  <p className={styles.cardDesc}>{s.desc}</p>
                  <span className={styles.appCardCta}>Explorar →</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Qué es Coquinum */}
        <section id="que-es" className={styles.queEs}>
          <h2 className={styles.sectionTitle}>Qué es Coquinum</h2>
          <p>
            Coquinum reúne en una sola marca las <strong>herramientas de cocina técnica</strong> de
            meskeIA: calculadoras de precisión para panadería y repostería, conversor y
            escalado de recetas, y guías de ingredientes y bebidas. No son recetas: son{' '}
            <strong>las cuentas exactas</strong> para que la receta salga. Es un servicio de{' '}
            <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte su
            compromiso: contenido claro, gratuito y sin recopilar datos personales.
          </p>
        </section>

      </main>
    </>
  );
}
