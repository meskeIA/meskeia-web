import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Teoría de Grafos: Euler, Hamilton y Puentes de Königsberg | meskeIA',
  description: 'Teoría de grafos paso a paso: caminos de Euler y ciclos de Hamilton, propiedades de un grafo (grado, conexidad, bipartito), grafos famosos como los Puentes de Königsberg y aplicaciones reales en redes.',
  keywords: 'teoría grafos, algoritmo dijkstra, camino euler, circuito hamilton, puentes königsberg, grafo conexo, árbol, grafo completo k5, visualizador grafos, matemáticas discretas, redes, informática, programación, matemáticas universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Teoría de Grafos: Euler, Hamilton y Königsberg',
    description: 'Aprende teoría de grafos con visualizaciones interactivas: Dijkstra animado, Euler, Hamilton y los Puentes de Königsberg.',
    url: 'https://meskeia.com/visualizador-teoria-grafos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Teoría de Grafos',
    description: 'Explora grafos, algoritmo de Dijkstra y caminos de Euler de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Teoría de Grafos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Teoría de Grafos: Euler, Hamilton y Königsberg",
  description: "Teoría de grafos paso a paso: caminos de Euler y ciclos de Hamilton, propiedades de un grafo (grado, conexidad, bipartito), grafos famosos como los Puentes de Königsberg y aplicaciones reales en redes.",
  url: "https://meskeia.com/visualizador-teoria-grafos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la teoría de grafos y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La teoría de grafos es una rama de las matemáticas discretas que estudia estructuras formadas por nodos (vértices) y conexiones (aristas). Se aplica en redes de transporte, redes sociales, circuitos electrónicos, planificación de rutas y algoritmos de búsqueda. Muchos problemas de informática y logística se modelan con grafos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el algoritmo de Dijkstra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El algoritmo de Dijkstra encuentra el camino más corto entre dos nodos de un grafo con pesos no negativos. Parte del nodo origen y expande siempre el nodo con menor coste acumulado hasta llegar al destino. Tiene complejidad O((V + E) log V) con una cola de prioridad, donde V son vértices y E aristas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un camino de Euler y un camino de Hamilton?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un camino de Euler recorre cada arista del grafo exactamente una vez; existe si el grafo tiene exactamente 0 o 2 vértices de grado impar. Un camino de Hamilton visita cada vértice exactamente una vez. Aunque visualmente parecidos, determinar si existe un camino hamiltoniano es un problema NP-completo, mientras que el euleriano se resuelve en tiempo polinomial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los Puentes de Königsberg y por qué son famosos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El problema de los Puentes de Königsberg (actual Kaliningrado) preguntaba si era posible recorrer los 7 puentes de la ciudad cruzando cada uno solo una vez. En 1736, Leonhard Euler demostró que era imposible porque más de 2 vértices del grafo tenían grado impar. Este análisis fundó formalmente la teoría de grafos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Quién debería estudiar teoría de grafos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es fundamental para estudiantes de informática, matemáticas e ingeniería. También resulta útil para quienes trabajan en análisis de redes sociales, ciberseguridad, bases de datos (SQL y NoSQL de grafos como Neo4j) y optimización logística. Es materia habitual en grados universitarios de ciencias e ingeniería.',
      },
    },
  ],
};
