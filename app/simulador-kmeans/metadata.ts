import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de K-Means Clustering | meskeIA',
  description: 'Simula el algoritmo k-means clustering paso a paso: añade puntos al plano, elige K y observa las iteraciones de asignación y recálculo de centroides. Incluye método del codo. Machine Learning.',
  keywords: 'k-means, clustering, agrupamiento, machine learning, IA, centroides, método del codo, elbow method, k-means++, IA universidad, FP informática, análisis no supervisado',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-kmeans/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de K-Means Clustering | meskeIA',
    description: 'Iteraciones de k-means animadas con método del codo',
    url: 'https://meskeia.com/simulador-kmeans',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de K-Means | meskeIA',
    description: 'Aprende ML con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de K-Means Clustering',
  description: 'Simulador interactivo del algoritmo k-means clustering. Añade puntos al plano, elige K, inicializa centroides (aleatorio o k-means++) y observa la iteración asignación-recálculo hasta la convergencia. Incluye método del codo.',
  url: 'https://meskeia.com/simulador-kmeans/',
  category: 'EducationalApplication',
  features: [
    'Editor de puntos con clic y arrastre',
    'K configurable de 2 a 8 clusters',
    'Inicialización aleatoria o k-means++',
    'Animación paso a paso o ejecución hasta convergencia',
    '4 datasets predefinidos (gaussianas, solape, alargado, tamaños distintos)',
    'Método del codo (Elbow Method)',
    'Métricas: inertia, tamaños, convergencia, trayectoria centroides',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['k-means', 'clustering', 'machine learning', 'IA universidad'],
});
