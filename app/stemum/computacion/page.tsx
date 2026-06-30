// @disclaimer: exempt

import type { Metadata } from 'next';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../StemumHome.module.css';

export const metadata: Metadata = {
  title: 'Computación interactiva: algoritmos, autómatas y estructuras | Stemum',
  description:
    'Simuladores interactivos de computación: algoritmos de ordenación, autómatas finitos, máquina de Turing, grafos, árboles BST/AVL, JOINs de SQL y cómo funciona un LLM.',
  alternates: { canonical: 'https://stemum.com/computacion/' },
};

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
    icon: '🌲',
    titulo: 'Árbol B (B-Tree)',
    desc: 'Inserción con división de nodos, borrado con préstamo y fusión, y orden configurable: la estructura que indexa las bases de datos.',
    slug: 'simulador-arboles-b',
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
  {
    icon: '📊',
    titulo: 'Planificador de procesos',
    desc: 'FCFS, SJF, SRTF, Round Robin y prioridades con diagrama de Gantt y métricas de espera y turnaround.',
    slug: 'simulador-planificador-procesos',
  },
  {
    icon: '🔀',
    titulo: 'Concurrencia y semáforos',
    desc: 'Ejecuta hilos paso a paso: provoca condiciones de carrera, resuelve el productor-consumidor y reproduce el deadlock de los filósofos comensales.',
    slug: 'simulador-concurrencia',
  },
  {
    icon: '📄',
    titulo: 'Reemplazo de páginas',
    desc: 'FIFO, LRU, Óptimo, Clock y LFU con tabla matricial, comparativa y detección de la anomalía de Belady.',
    slug: 'simulador-reemplazo-paginas',
  },
  {
    icon: '🌀',
    titulo: 'Recursión paso a paso',
    desc: 'Seis funciones recursivas como factorial, Fibonacci o Hanoi con la pila de llamadas viva en cada paso.',
    slug: 'simulador-recursion',
  },
  {
    icon: '📈',
    titulo: 'Regresión',
    desc: 'Regresión lineal, polinómica y logística con mínimos cuadrados o gradiente animado y métricas R², MSE y accuracy.',
    slug: 'simulador-regresion',
  },
  {
    icon: '🎯',
    titulo: 'Clustering K-means',
    desc: 'Animación de asignación y recálculo de centroides, inicialización k-means++ y método del codo para elegir k.',
    slug: 'simulador-kmeans',
  },
  {
    icon: '🔌',
    titulo: 'Puertas lógicas',
    desc: 'Puertas lógicas, tablas de verdad y circuitos digitales para construir y probar combinaciones.',
    slug: 'simulador-puertas-logicas',
  },
  {
    icon: '📚',
    titulo: 'Estructuras de datos',
    desc: 'Arrays, pilas, colas, listas enlazadas y árboles BST con operaciones visualizadas en tiempo real.',
    slug: 'visualizador-estructuras-datos',
  },
  {
    icon: '🧮',
    titulo: 'Lógica proposicional',
    desc: 'Tablas de verdad AND, OR, NOT y XOR, evaluador de fórmulas y mapas de Karnaugh para simplificar.',
    slug: 'visualizador-logica-proposicional',
  },
  {
    icon: '📡',
    titulo: 'Teoría de la información',
    desc: 'Entropía de Shannon con sliders, codificación Huffman animada y el teorema de Shannon-Hartley.',
    slug: 'visualizador-teoria-informacion',
  },
  {
    icon: '🖥️',
    titulo: 'Arquitectura del computador',
    desc: 'Modelo de Von Neumann, CPU con ALU y registros y el ciclo de instrucción animado paso a paso.',
    slug: 'visualizador-arquitectura-computador',
  },
  {
    icon: '🗂️',
    titulo: 'Hashing y colisiones',
    desc: 'Tabla hash con tres funciones, resolución por encadenamiento y sondeo lineal, y factor de carga.',
    slug: 'simulador-hashing-colisiones',
  },
  {
    icon: '🔐',
    titulo: 'Cifrado César',
    desc: 'Rueda del alfabeto con slider de desplazamiento, histograma de frecuencias y ataque automático.',
    slug: 'simulador-cifrado-cesar',
  },
  {
    icon: '🤝',
    titulo: 'Handshake TCP',
    desc: 'Diagrama de secuencia SYN, SYN-ACK y ACK y el cierre FIN, con números de secuencia configurables.',
    slug: 'simulador-tcp-handshake',
  },
  {
    icon: '🧠',
    titulo: 'Redes neuronales',
    desc: 'Ajusta pesos, bias y entradas de un perceptrón con 4 funciones de activación; explora capas clicables y simula épocas viendo caer la curva de pérdida.',
    slug: 'visualizador-ia-redes-neuronales',
  },
  {
    icon: '⚛️',
    titulo: 'Computación cuántica',
    desc: 'Esfera de Bloch con slider de superposición y medición que colapsa el qubit, paralelismo 2ⁿ, puertas cuánticas y línea temporal de la amenaza a RSA.',
    slug: 'visualizador-computacion-cuantica',
  },
  {
    icon: '🔀',
    titulo: 'Ordenación a medida',
    desc: 'Introduce tu propio array y compara hasta 4 de los 7 algoritmos a la vez, con presets (inverso, casi ordenado, duplicados), slider de velocidad y conteo de operaciones.',
    slug: 'simulador-ordenacion',
  },
  {
    icon: '🗄️',
    titulo: 'Playground SQL',
    desc: 'Editor SQL que corre en el navegador con datasets de ejemplo, ejercicios guiados y resultados en vivo. Practica SELECT, JOIN y GROUP BY sin instalar nada.',
    slug: 'playground-sql',
  },
  {
    icon: '🎮',
    titulo: 'Pathfinding A*',
    desc: 'Simula cómo los enemigos de un videojuego encuentran el camino. Compara A*, Dijkstra y BFS paso a paso sobre una rejilla con muros, terreno costoso y diagonales.',
    slug: 'simulador-pathfinding',
  },
  {
    icon: '🏔️',
    titulo: 'Ruido Perlin',
    desc: 'Genera ruido de Perlin en tiempo real con octavas, persistencia y semilla, y pinta un mapa de biomas. La base de los terrenos y texturas procedimentales tipo Minecraft.',
    slug: 'visualizador-ruido-perlin',
  },
  {
    icon: '🎨',
    titulo: 'Espacios de color',
    desc: 'Selector interactivo que muestra el mismo color en RGB, HSV, HSL y HEX a la vez. Elige tono y saturación/valor o ajusta los canales RGB y copia cualquier formato.',
    slug: 'visualizador-espacios-color',
  },
  {
    icon: '🐦',
    titulo: 'Boids (bandada)',
    desc: 'Simulación animada de bandada: cada agente sigue tres reglas (separación, alineación y cohesión) y de ellas emerge el movimiento colectivo. Ajusta los pesos y obsérvalo.',
    slug: 'simulador-boids',
  },
  {
    icon: '🦠',
    titulo: 'Autómatas celulares',
    desc: 'El Juego de la Vida de Conway y la generación de cuevas. Pinta células, carga patrones clásicos y observa cómo de reglas simples emerge un comportamiento complejo.',
    slug: 'simulador-automatas-celulares',
  },
  {
    icon: '🖼️',
    titulo: 'Convolución y kernels',
    desc: 'Aplica kernels 3×3 a una imagen (desenfoque, enfoque, bordes, Sobel) y compara antes y después. La operación que está detrás de los filtros y de las redes neuronales.',
    slug: 'visualizador-convolucion-kernels',
  },
  {
    icon: '💡',
    titulo: 'Iluminación (Phong)',
    desc: 'Ilumina una esfera en tiempo real con el modelo de Phong: ajusta las componentes ambiente, difusa y especular y mueve la luz. La base del render 3D y los shaders.',
    slug: 'visualizador-iluminacion-phong',
  },
  {
    icon: '🗂️',
    titulo: 'Quadtree',
    desc: 'Añade puntos y observa cómo el espacio se subdivide en cuadrantes. Lanza una consulta de rango y compara el coste frente a la fuerza bruta. Acelera las colisiones.',
    slug: 'visualizador-quadtree',
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
