'use client';
// @disclaimer: exempt

import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './CoquinumHome.module.css';

// Secciones del portal. De momento son tarjetas de vista previa (maqueta): el
// enlace a cada sección se activará cuando se publiquen las páginas y las apps.
const SECCIONES = [
  {
    icon: '🍞',
    titulo: 'Panadería y repostería',
    desc: 'Hidratación, porcentaje del panadero, masa madre, temperatura de masa, ganache y punto de azúcar.',
  },
  {
    icon: '🌡️',
    titulo: 'Cocción y temperatura',
    desc: 'Temperaturas internas de carne y pescado, sous-vide por grosor y tiempos de cocción ajustables.',
  },
  {
    icon: '⚖️',
    titulo: 'Conversiones y medidas',
    desc: 'Tazas a gramos por ingrediente, ajuste de recetas por altitud, hornos en °C/°F y sustituciones.',
  },
  {
    icon: '🍷',
    titulo: 'Bebidas',
    desc: 'Café, coctelería y maridaje, más guías de vino, cerveza, té e infusiones.',
  },
  {
    icon: '🧊',
    titulo: 'Conservación',
    desc: 'Caducidad real en nevera y congelador, fermentados vegetales y descongelación segura.',
  },
  {
    icon: '💼',
    titulo: 'Hostelería y food cost',
    desc: 'Escandallo, coste por ración, merma y precio de carta para cocina profesional.',
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
            Panadería, repostería, cocción, conversiones, bebidas y food cost
          </p>
          <p className={styles.heroClaim}>
            Mide, convierte y cocina con precisión.
          </p>

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Cocina y gastronomía · En español · Sin registro · Sin coste
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
            {SECCIONES.map((s) => (
              <article key={s.titulo} className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.cardIcon} aria-hidden="true">{s.icon}</span>
                </div>
                <h3 className={styles.cardTitulo}>{s.titulo}</h3>
                <p className={styles.cardDesc}>{s.desc}</p>
                <span className={styles.cardCta}>Próximamente</span>
              </article>
            ))}
          </div>
        </section>

        {/* Qué es Coquinum */}
        <section id="que-es" className={styles.queEs}>
          <h2 className={styles.sectionTitle}>Qué es Coquinum</h2>
          <p>
            Coquinum reúne en una sola marca las <strong>herramientas de cocina técnica</strong> de
            meskeIA: calculadoras de precisión para panadería, repostería y cocción,
            conversiones que de verdad funcionan —tazas a gramos por ingrediente, ajuste
            por altitud— y guías de producto. No son recetas: son <strong>las cuentas
            exactas</strong> para que la receta salga. Es un servicio de{' '}
            <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte su
            compromiso: contenido claro, gratuito y sin recopilar datos personales.
          </p>
        </section>

      </main>
    </>
  );
}
