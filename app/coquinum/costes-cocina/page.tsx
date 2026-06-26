// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Costes y escandallo: food cost y merma para hostelería | Coquinum',
  description:
    'Herramientas de costes para cocina profesional: escandallo y food cost para fijar el precio de tus platos, y cálculo de merma y rendimiento para conocer el coste real de la materia prima. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/costes-cocina/' },
};

// Apps de la categoría Costes y escandallo. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '💼',
    titulo: 'Escandallo y food cost',
    desc: 'Coste de la receta por ingredientes, coste por ración y precio de venta según tu food cost objetivo, con el margen bruto. Para hostelería y catering.',
    slug: 'escandallo-food-cost',
  },
  {
    icon: '📉',
    titulo: 'Calculadora de merma',
    desc: 'Peso neto, rendimiento, factor de corrección y coste real por kilo útil tras limpiar y cocinar. El coste que el precio de compra no refleja.',
    slug: 'calculadora-merma',
  },
];

export default function CoquinumCostesCocina() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-costes-cocina" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">💼</span> Costes y escandallo
          </h1>
          <p className={styles.ejeIntro}>
            El ala profesional de Coquinum: poner números a la cocina para fijar precios con
            margen y conocer el coste real de lo que compras.
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
