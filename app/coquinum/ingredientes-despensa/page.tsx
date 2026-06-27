// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../CoquinumHome.module.css';

export const metadata: Metadata = {
  title: 'Ingredientes y despensa: guías para elegir y usar producto | Coquinum',
  description:
    'Guías de producto para elegir y aprovechar la despensa: aceite de oliva, cortes de carne, especias, hierbas, quesos, setas, frutas exóticas, vinagres, arroces, pastas, superalimentos y aditivos. En español y sin coste.',
  alternates: { canonical: 'https://coquinum.com/ingredientes-despensa/' },
};

// Apps de la categoría Ingredientes y despensa. Viven físicamente en meskeIA y se
// sirven bajo coquinum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🫒',
    titulo: 'Aceite de oliva',
    desc: 'Virgen extra, virgen, refinado y variedades de aceituna: cómo distinguirlos, leer la etiqueta y elegir según el uso.',
    slug: 'guia-aceite-oliva',
  },
  {
    icon: '🥩',
    titulo: 'Cortes de carne',
    desc: 'Mapa de los cortes de vacuno, cerdo, cordero y aves, con la cocción que mejor le va a cada pieza.',
    slug: 'guia-cortes-carne',
  },
  {
    icon: '🌶️',
    titulo: 'Especias',
    desc: 'Aromas, usos y combinaciones de las especias del mundo para condimentar con criterio y sin desperdiciar.',
    slug: 'guia-especias',
  },
  {
    icon: '🌿',
    titulo: 'Hierbas aromáticas',
    desc: 'Albahaca, tomillo, cilantro y compañía: con qué platos casan y cuándo añadirlas para que aporten al máximo.',
    slug: 'guia-hierbas-aromaticas',
  },
  {
    icon: '🧀',
    titulo: 'Quesos',
    desc: 'Familias de queso por leche, curación y textura, con ideas de maridaje y de tabla.',
    slug: 'guia-quesos',
  },
  {
    icon: '🍄',
    titulo: 'Setas',
    desc: 'Variedades comestibles, temporada y cómo cocinarlas para sacarles sabor sin estropear la textura.',
    slug: 'guia-setas',
  },
  {
    icon: '🥭',
    titulo: 'Frutas exóticas',
    desc: 'Qué son, cómo elegirlas en su punto y cómo prepararlas, de la pitaya al maracuyá.',
    slug: 'guia-frutas-exoticas',
  },
  {
    icon: '🍶',
    titulo: 'Vinagres del mundo',
    desc: 'De Módena al de arroz: perfiles de acidez y aroma y para qué brilla cada vinagre en la cocina.',
    slug: 'guia-vinagres-mundo',
  },
  {
    icon: '🍚',
    titulo: 'Tipos de arroz',
    desc: 'Redondo, bomba, basmati, jazmín o arborio: qué arroz pide cada plato según su almidón y su grano.',
    slug: 'guia-tipos-arroz',
  },
  {
    icon: '🍝',
    titulo: 'Tipos de pasta',
    desc: 'Formas de pasta y la salsa que mejor agarra cada una, para que el plato funcione de verdad.',
    slug: 'guia-tipos-pasta',
  },
  {
    icon: '🥑',
    titulo: 'Superalimentos',
    desc: 'Qué aportan realmente los alimentos de moda y cómo incorporarlos sin caer en exageraciones.',
    slug: 'guia-superalimentos',
  },
  {
    icon: '🧪',
    titulo: 'Aditivos E',
    desc: 'Qué significan los números E de las etiquetas: conservantes, colorantes y espesantes explicados con claridad.',
    slug: 'aditivos-e-alimentarios',
  },
  {
    icon: '🌶️',
    titulo: 'Chiles y pimientos',
    desc: 'Los chiles del mundo ordenados por picor (escala Scoville), con su origen y usos. Filtro por nivel de picante.',
    slug: 'guia-chiles',
  },
  {
    icon: '🌾',
    titulo: 'Harinas',
    desc: 'Qué harina usar para cada cosa, con su fuerza (W), su proteína y sus mejores usos.',
    slug: 'guia-harinas',
  },
  {
    icon: '🧂',
    titulo: 'Tipos de sal',
    desc: 'De la sal fina a la flor de sal: texturas, usos y diferencias para acertar con cada una.',
    slug: 'guia-tipos-sal',
  },
  {
    icon: '🍫',
    titulo: 'Chocolate y cacao',
    desc: 'Qué significa el porcentaje y qué chocolate usar para cada cosa en repostería.',
    slug: 'guia-chocolate',
  },
  {
    icon: '🍬',
    titulo: 'Azúcares y endulzantes',
    desc: 'Tipos de endulzante, su poder dulce y sus usos. Filtro por tipo.',
    slug: 'guia-azucares',
  },
];

export default function CoquinumIngredientesDespensa() {
  return (
    <>
      <AnalyticsTracker appName="coquinum-ingredientes-despensa" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-categoria">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Coquinum
          </Link>
          <h1 id="titulo-categoria" className={styles.ejeTitle}>
            <span aria-hidden="true">🥩</span> Ingredientes y despensa
          </h1>
          <p className={styles.ejeIntro}>
            Conocer el producto es media cocina. Guías para elegir bien en la compra y
            sacarle todo el partido a lo que tienes en la despensa.
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
