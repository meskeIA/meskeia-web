'use client';
// @disclaimer: exempt

import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

// Apps de la disciplina Computación. Viven físicamente en meskeIA y se sirven
// bajo stemum.com mediante el host-rewrite (lista blanca en proxy.ts).
const APPS = [
  {
    icon: '🔢',
    titulo: 'Algoritmos de ordenación',
    desc: 'Burbuja, inserción, quicksort y mergesort animados paso a paso, con su complejidad Big O y cuándo usar cada uno.',
    slug: 'visualizador-algoritmos-ordenacion',
  },
  {
    icon: '🔁',
    titulo: 'Autómatas finitos',
    desc: 'Diseña autómatas DFA y NFA con un editor visual y valida cadenas con animación y modo por lotes.',
    slug: 'simulador-automatas-finitos',
  },
  {
    icon: '⚙️',
    titulo: 'Máquina de Turing',
    desc: 'Cinta animada y tabla de reglas con programas clásicos: incrementador binario, duplicador y palíndromos.',
    slug: 'simulador-maquina-turing',
  },
  {
    icon: '🕸️',
    titulo: 'Grafos y caminos',
    desc: 'Editor visual de grafos con BFS, DFS, Dijkstra y A*, mostrando la cola, la pila y el heap en vivo.',
    slug: 'simulador-grafos',
  },
  {
    icon: '🌳',
    titulo: 'Árboles BST y AVL',
    desc: 'Inserta, elimina y busca nodos viendo las rotaciones de equilibrado AVL y los cuatro recorridos.',
    slug: 'simulador-arboles-bst-avl',
  },
  {
    icon: '🤖',
    titulo: 'Cómo funciona un LLM',
    desc: 'Tokens, embeddings, el mecanismo de atención de los transformers y el efecto de la temperatura, explicados al detalle.',
    slug: 'visualizador-llm-funcionamiento',
  },
  {
    icon: '🔗',
    titulo: 'JOINs de SQL',
    desc: 'INNER, LEFT, RIGHT y FULL OUTER con tablas editables, diagrama de Venn animado y el SQL generado.',
    slug: 'simulador-sql-join',
  },
];

export default function StemumComputacion() {
  return (
    <>
      <AnalyticsTracker appName="stemum-computacion" />

      <main className={styles.container}>
        <section className={styles.ejeSection} aria-labelledby="titulo-computacion">
          <Link href="/" className={styles.backLink}>
            <span aria-hidden="true">←</span> Stemum
          </Link>
          <h1 id="titulo-computacion" className={styles.ejeTitle}>
            <span aria-hidden="true">💻</span> Computación
          </h1>
          <p className={styles.ejeIntro}>
            Algoritmos, estructuras de datos, modelos de cómputo e inteligencia artificial,
            para manipular en tiempo real. Mueve un control y observa cómo responde el sistema.
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
