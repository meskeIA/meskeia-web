import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador de Teoría de Grafos - Dijkstra, Euler, Hamilton | meskeIA',
  description: 'Explora la teoría de grafos de forma interactiva: algoritmo de Dijkstra animado, caminos de Euler y Hamilton, detector de propiedades de grafos y grafos famosos como los Puentes de Königsberg.',
  keywords: 'teoría grafos, algoritmo dijkstra, camino euler, circuito hamilton, puentes königsberg, grafo conexo, árbol, grafo completo k5, visualizador grafos, matemáticas discretas, redes, informática, programación, matemáticas universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Teoría de Grafos - meskeIA',
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
    title: 'Visualizador de Teoría de Grafos - meskeIA',
    description: 'Explora grafos, algoritmo de Dijkstra y caminos de Euler de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Teoría de Grafos meskeIA',
  },
};
