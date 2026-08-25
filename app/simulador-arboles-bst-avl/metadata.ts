import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Árboles BST y AVL - Inserción Borrado Rotaciones | meskeIA',
  description: 'Simula árboles binarios de búsqueda y AVL paso a paso. Inserta y elimina nodos, observa rotaciones LL, RR, LR, RL y los 4 recorridos (inorden, preorden, postorden, niveles). Estructuras de Datos.',
  keywords: 'BST árbol binario búsqueda, árbol AVL, rotaciones LL RR LR RL, factor balance, recorridos árbol inorden preorden, estructuras datos universidad, FP informática, algoritmia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-arboles-bst-avl/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Árboles BST y AVL | meskeIA',
    description: 'Inserciones, borrados y rotaciones AVL, con búsqueda animada e historial de rotaciones paso a paso',
    url: 'https://meskeia.com/simulador-arboles-bst-avl/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Árboles BST y AVL | meskeIA',
    description: 'Aprende árboles binarios con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Árboles BST y AVL',
  description:
    // La animación es la de la BÚSQUEDA, que sí recorre el camino paso a paso, y la del
    // destello del nodo nuevo. La inserción y el borrado se aplican de golpe, y la rotación se
    // sigue en el historial numerado, no viéndola desplegarse: prometer «rotaciones animadas»
    // hacía esperar algo que la app no hace (hallazgo 322).
    'Simulador interactivo de árboles binarios de búsqueda (BST) y AVL auto-balanceados. Inserta, elimina y busca nodos con la búsqueda animada nodo a nodo, y sigue las rotaciones LL/RR/LR/RL en un historial numerado, junto con los 4 recorridos clásicos.',
  url: 'https://meskeia.com/simulador-arboles-bst-avl/',
  category: 'EducationalApplication',
  features: [
    'Modos BST simple y AVL auto-balanceado',
    'Búsqueda animada nodo a nodo, con velocidad regulable',
    'Rotaciones LL, RR, LR, RL en un historial numerado',
    'Factor de balance visible en cada nodo (AVL)',
    '4 recorridos: inorden, preorden, postorden, niveles',
    '4 ejemplos clásicos (inserción ordenada, rotación simple/doble, balanceado)',
    'En español',
  ],
  keywords: ['BST', 'AVL', 'árboles binarios', 'estructuras de datos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un árbol binario de búsqueda (BST) y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un BST (Binary Search Tree) es una estructura de datos en la que cada nodo tiene como máximo dos hijos. La regla fundamental es que todos los nodos del subárbol izquierdo tienen valores menores que el nodo raíz, y todos los del subárbol derecho tienen valores mayores. Esto permite buscar, insertar y eliminar elementos en O(log n) de media, ya que en cada paso se descarta la mitad del árbol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un BST y un árbol AVL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un BST estándar puede degenerar en una lista enlazada si se insertan elementos en orden, lo que convierte las operaciones en O(n). El árbol AVL (Adelson-Velsky y Landis, 1962) es un BST auto-balanceado que mantiene un factor de balance de -1, 0 o +1 en cada nodo. Cuando una inserción o borrado desequilibra el árbol, realiza rotaciones (simple o doble) para restaurar el equilibrio, garantizando O(log n) siempre.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las rotaciones LL, RR, LR y RL en un árbol AVL?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las rotaciones reequilibran el árbol tras inserciones o borrados. La rotación LL (simple derecha) corrige un desequilibrio izquierdo-izquierdo; la RR (simple izquierda) corrige uno derecho-derecho. Las rotaciones dobles LR y RL se aplican cuando el desequilibrio ocurre en la dirección opuesta al hijo problemático: LR combina una rotación izquierda sobre el hijo y luego una derecha sobre el nodo desbalanceado; RL hace lo inverso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué recorridos se pueden hacer sobre un árbol binario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los cuatro recorridos clásicos son: inorden (izquierdo → raíz → derecho), que devuelve los elementos ordenados en un BST; preorden (raíz → izquierdo → derecho), útil para serializar el árbol; postorden (izquierdo → derecho → raíz), usado para liberar memoria o evaluar expresiones; y por niveles (BFS), que visita nodo a nodo de arriba a abajo. El simulador permite ejecutar los cuatro de forma animada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas es útil este simulador de árboles?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para las asignaturas de Estructuras de Datos y Algoritmia de grados en Informática, Ingeniería del Software, Matemáticas e Ingeniería de Telecomunicaciones. También lo usan preparadores de entrevistas técnicas en empresas de software, ya que los árboles BST y AVL son uno de los temas más habituales en pruebas de código de selección. El simulador visual ayuda a memorizar el comportamiento de las rotaciones, que en papel resultan difíciles de seguir.',
      },
    },
  ],
};
