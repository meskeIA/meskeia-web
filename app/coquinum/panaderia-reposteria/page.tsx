// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Panadería y repostería: calculadoras de masa y dulce | Coquinum',
  description:
    'Calculadoras de panadería y repostería: porcentaje del panadero, hidratación de masa, masa madre, temperatura del agua de amasado, ganache, gelatina y punto del azúcar. En español, sin registro y sin coste.',
  alternates: { canonical: 'https://coquinum.com/panaderia-reposteria/' },
};

// Apps de la categoría Panadería y repostería. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🥖',
    titulo: 'Porcentaje del panadero',
    desc: 'Expresa cada ingrediente como porcentaje de la harina para escalar fórmulas de pan sin perder las proporciones.',
    slug: 'calculadora-porcentaje-panadero',
  },
  {
    icon: '💧',
    titulo: 'Hidratación de la masa',
    desc: 'Calcula el agua según el porcentaje de hidratación que buscas, o averigua la hidratación de una masa ya hecha.',
    slug: 'calculadora-hidratacion-pan',
  },
  {
    icon: '🫙',
    titulo: 'Masa madre',
    desc: 'Sustituye levadura comercial por masa madre ajustando harina y agua del refresco para que cuadre la fórmula.',
    slug: 'calculadora-masa-madre',
  },
  {
    icon: '🌡️',
    titulo: 'Temperatura del agua',
    desc: 'Halla la temperatura del agua de amasado para llegar a la temperatura final de masa que necesita la fermentación.',
    slug: 'calculadora-temperatura-masa',
  },
  {
    icon: '⏳',
    titulo: 'Fermentación por temperatura',
    desc: 'Calcula cuánto tarda el levado a la temperatura real de tu masa: la levadura va más rápido en verano y más lento en invierno.',
    slug: 'fermentacion-temperatura',
  },
  {
    icon: '🍕',
    titulo: 'Masa de pizza',
    desc: 'Harina, agua, sal, levadura y aceite en gramos para tus bolas, según el estilo: napolitana, romana, americana o focaccia.',
    slug: 'calculadora-masa-pizza',
  },
  {
    icon: '🍯',
    titulo: 'Almíbar',
    desc: 'Azúcar y agua según el uso —emborrachar, sorbetes, cócteles— con el °Brix resultante.',
    slug: 'calculadora-almibar',
  },
  {
    icon: '🍥',
    titulo: 'Merengue',
    desc: 'Claras y azúcar para merengue francés, suizo o italiano, con la proporción 1:2.',
    slug: 'calculadora-merengue',
  },
  {
    icon: '🍮',
    titulo: 'Crema pastelera',
    desc: 'Yemas, azúcar y maicena según la leche, para crema pastelera, ligera o inglesa.',
    slug: 'calculadora-crema-pastelera',
  },
  {
    icon: '🌈',
    titulo: 'Macarons',
    desc: 'Almendra, azúcar glas, granulado y claras por el método francés (tant pour tant).',
    slug: 'calculadora-macarons',
  },
  {
    icon: '🎨',
    titulo: 'Glaseado real',
    desc: 'Azúcar glas y claras para tu glasa según la consistencia: contorno, media o relleno.',
    slug: 'calculadora-royal-icing',
  },
  {
    icon: '🍫',
    titulo: 'Ganache',
    desc: 'Ratios de chocolate y nata según el uso —cobertura, relleno, trufa o batida— y el tipo de chocolate.',
    slug: 'calculadora-ganache',
  },
  {
    icon: '🍮',
    titulo: 'Gelatina',
    desc: 'Convierte entre hojas, polvo y otros gelificantes y ajusta la dosis al volumen y la firmeza que quieres.',
    slug: 'calculadora-gelatina',
  },
  {
    icon: '🍬',
    titulo: 'Puntos del azúcar',
    desc: 'Temperaturas de cada punto del almíbar —hebra, bola, caramelo— para clavar merengues, confituras y dulces.',
    slug: 'calculadora-puntos-azucar',
  },
  {
    icon: '🍞',
    titulo: 'Tipos de pan',
    desc: 'Guía de panes del mundo por masa, miga y corteza para entender qué los diferencia y cuándo usar cada uno.',
    slug: 'guia-tipos-pan',
  },
];

export default function CoquinumPanaderiaReposteria() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-panaderia-reposteria" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🍞</span> Panadería y repostería
          </h1>
          <p className={styles.ejeIntro}>
            Las calculadoras de precisión que diferencian a Coquinum: masa, fermentación y
            dulce con las cuentas exactas para que salga a la primera.
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
