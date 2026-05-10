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
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Grafos | meskeIA',
    description: 'Aprende algoritmos de grafos con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
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
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['grafos', 'BFS DFS Dijkstra', 'algoritmia', 'informática universidad'],
});
