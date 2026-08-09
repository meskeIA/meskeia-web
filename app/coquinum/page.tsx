'use client';
// @disclaimer: exempt

import Image from 'next/image';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import {
  COQUINUM_APPS_POR_CATEGORIA,
  COQUINUM_CATEGORIAS,
  COQUINUM_CATEGORIA_INFO,
  COQUINUM_TOTAL_APPS,
} from '@/data/coquinum';
import styles from './CoquinumHome.module.css';

// Las secciones del portal se DERIVAN del catálogo, nunca se escriben a mano: cada
// una enlaza a su página de categoría, que sirve las apps gastro bajo coquinum.com
// (host-rewrite, lista en proxy.ts). Mientras fue una lista literal se quedó
// describiendo «las 5 categorías pobladas» con nueve ya publicadas, y retirar una
// habría dejado su tarjeta apuntando a un 404 sin que nada avisara.
const SECCIONES = Object.entries(COQUINUM_CATEGORIAS).map(([slug, titulo]) => ({
  slug,
  titulo,
  icon: COQUINUM_CATEGORIA_INFO[slug].icon,
  desc: COQUINUM_CATEGORIA_INFO[slug].desc,
  href: `/${slug}`,
}));

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
            Panadería, recetas, medidas, cocción y conservación, ingredientes y bebidas
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
              const count = COQUINUM_APPS_POR_CATEGORIA[s.slug] ?? 0;
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
