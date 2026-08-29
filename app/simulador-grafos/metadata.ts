import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Grafos - BFS DFS Dijkstra A* | meskeIA',
  description: 'Simula algoritmos de búsqueda en grafos paso a paso: BFS, DFS, Dijkstra y A*. Editor visual de nodos y aristas, presets (grid, árbol, laberinto) y comparación de complejidad. Algoritmia.',
  keywords: 'algoritmos grafos, BFS DFS Dijkstra A*, búsqueda en grafos, camino más corto, recorrido grafo, algoritmia universidad, FP informática, estructuras de datos, heap cola pila',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-grafos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Grafos - BFS DFS Dijkstra A* | meskeIA',
    description: 'Algoritmos de grafos paso a paso con editor visual y estructuras auxiliares vivas',
    url: 'https://meskeia.com/simulador-grafos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Grafos | meskeIA',
    description: 'Aprende algoritmos de grafos con simulaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Algoritmos de Grafos',
  description:
    'Simulador interactivo de algoritmos de búsqueda en grafos: BFS, DFS, Dijkstra y A*. Editor visual de nodos y aristas con drag & drop, presets clásicos (cuadrícula, árbol, laberinto) y visualización viva de cola/pila/heap.',
  url: 'https://meskeia.com/simulador-grafos/',
  category: 'EducationalApplication',
  features: [
    '4 algoritmos: BFS, DFS, Dijkstra, A*',
    'Editor visual de grafos con drag & drop',
    'Aristas dirigidas/no dirigidas con pesos',
    'Estructura auxiliar viva (cola, pila, heap, tabla A*)',
    '4 presets: grid 5x5, árbol binario, grafo denso, laberinto',
    'Animación paso a paso con velocidad ajustable',
    'Camino encontrado destacado y métricas de complejidad',
    'En español',
  ],
  keywords: ['grafos', 'BFS DFS Dijkstra', 'algoritmia', 'informática universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un algoritmo de búsqueda en grafos y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un algoritmo de búsqueda en grafos recorre los nodos y aristas de una red para encontrar caminos o explorar su estructura. BFS (búsqueda en anchura) encuentra el camino con menos saltos, DFS (profundidad) explora ramas completas, Dijkstra halla el camino de menor coste con pesos, y A* usa una heurística para guiar la búsqueda de forma eficiente. Se aplican en GPS, redes de ordenadores, videojuegos y optimización de rutas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre BFS y DFS en un grafo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BFS (Breadth-First Search) usa una cola y explora todos los vecinos de un nodo antes de avanzar al siguiente nivel; garantiza el camino mínimo en grafos no ponderados. DFS (Depth-First Search) usa una pila y se adentra lo máximo posible por una rama antes de retroceder; consume menos memoria pero no garantiza el camino más corto. La complejidad de ambos es O(V + E) donde V son vértices y E aristas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el algoritmo de Dijkstra paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dijkstra mantiene una tabla de distancias mínimas desde el nodo origen y un montículo (heap) de prioridad. En cada paso extrae el nodo no visitado con menor distancia acumulada, actualiza las distancias de sus vecinos si encuentra un camino más corto y lo marca como visitado. El proceso se repite hasta llegar al destino o visitar todos los nodos. Su complejidad es O((V + E) log V) con heap binario.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este simulador de grafos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de informática, ingeniería de software y matemáticas que estudian estructuras de datos y algoritmia en grados universitarios o ciclos formativos. También sirve a desarrolladores que quieran repasar estos conceptos antes de entrevistas técnicas o al abordar problemas de optimización de rutas. Al ser visual e interactivo, facilita entender la diferencia práctica entre algoritmos que sobre el papel parecen similares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene A* sobre Dijkstra para encontrar el camino más corto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A* añade una función heurística h(n) que estima el coste restante hasta el destino; en cuadrículas suele usarse la distancia Manhattan o euclidiana. Esto permite descartar ramas prometedoras, visitando menos nodos que Dijkstra en grafos grandes. Si la heurística es admisible (nunca sobreestima), A* garantiza la solución óptima con un coste de búsqueda menor. Dijkstra es preferible cuando no hay información espacial o la heurística es difícil de definir.',
      },
    },
  ],
};
