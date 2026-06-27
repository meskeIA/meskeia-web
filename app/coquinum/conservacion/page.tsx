// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Conservación de alimentos: caducidad, congelado y conservas | Coquinum',
  description:
    'Herramientas de conservación de alimentos: cuánto dura cada alimento en la nevera, el congelador y la despensa, y cómo conservar con seguridad. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/conservacion/' },
};

const APPS = [
  {
    icon: '🧊',
    titulo: 'Cuánto dura cada alimento',
    desc: 'Tiempos de conservación en nevera, congelador y despensa para carnes, pescados, lácteos, verduras y sobras, con buscador y filtro.',
    slug: 'calculadora-caducidad',
  },
  {
    icon: '❄️',
    titulo: 'Qué se puede congelar',
    desc: 'Qué alimentos aguantan bien el congelador, cuáles no y cuánto duran, con buscador y filtro por categoría.',
    slug: 'calculadora-congelacion',
  },
  {
    icon: '🧊',
    titulo: 'Descongelación segura',
    desc: 'Cuánto tarda en descongelarse un alimento según el peso y el método: nevera, agua fría o microondas. Nunca al ambiente.',
    slug: 'descongelacion-segura',
  },
  {
    icon: '🍓',
    titulo: 'Mermelada',
    desc: 'Azúcar y limón para tu mermelada según la fruta y el dulzor, con aviso de cuándo necesita pectina.',
    slug: 'calculadora-mermelada',
  },
  {
    icon: '🥒',
    titulo: 'Encurtidos',
    desc: 'Vinagre, agua, sal y azúcar para tu líquido de encurtido según el estilo y el volumen.',
    slug: 'calculadora-encurtidos',
  },
  {
    icon: '🥬',
    titulo: 'Fermentados vegetales',
    desc: 'La sal exacta para fermentar verduras en seco (chucrut, kimchi) o en salmuera, la clave de una fermentación segura.',
    slug: 'fermentados-vegetales',
  },
];

export default function CoquinumConservacion() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-conservacion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🧊</span> Conservación
          </h1>
          <p className={styles.ejeIntro}>
            Que nada se eche a perder y nada te juegue un disgusto: tiempos de conservación y
            seguridad alimentaria para la nevera, el congelador y la despensa.
          </p>
          <div className={styles.grid}>
            {APPS.map((a) => (
              <Link key={a.slug} href={`/${a.slug}/`} className={styles.appCard}>
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
