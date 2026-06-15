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
    url: 'https://meskeia.com/simulador-kmeans/',
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
    'En español',
  ],
  keywords: ['k-means', 'clustering', 'machine learning', 'IA universidad'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el algoritmo k-means y cómo funciona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'K-means es un algoritmo de aprendizaje no supervisado que agrupa un conjunto de datos en K clusters, donde cada punto queda asignado al centroide más cercano. El proceso alterna dos pasos: asignación (cada punto se asigna al centroide más próximo) y recálculo (cada centroide se mueve al promedio de los puntos de su grupo). Repite hasta que ningún punto cambia de cluster, lo que se llama convergencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo elegir el número de clusters K en k-means?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método más habitual es el "método del codo" (Elbow Method): se entrena el modelo con distintos valores de K y se representa la inercia (suma de distancias cuadráticas de cada punto a su centroide) en función de K. El punto donde la curva dobla bruscamente, como el codo de un brazo, suele indicar el K óptimo porque añadir más clusters a partir de ahí reduce poco la inercia. También existen criterios estadísticos como el índice de silueta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ventaja tiene la inicialización k-means++ frente a la aleatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La inicialización aleatoria puede colocar varios centroides muy juntos, provocando que el algoritmo converja a una solución subóptima. K-means++ elige los centroides iniciales de forma más distribuida: el primer centroide se elige al azar y cada centroide siguiente se selecciona con una probabilidad proporcional a la distancia cuadrada al centroide más cercano ya elegido. Esto reduce significativamente el riesgo de quedarse atrapado en un mínimo local y suele converger más rápido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa k-means en problemas reales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'K-means tiene aplicaciones muy variadas: segmentación de clientes según comportamiento de compra, compresión de imágenes agrupando colores similares, detección de anomalías como primer paso de preprocesado, agrupación de documentos o artículos por temática, y análisis exploratorio de datos antes de aplicar algoritmos supervisados. Es uno de los algoritmos de clustering más usados por su sencillez y velocidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las limitaciones del algoritmo k-means?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'K-means asume que los clusters tienen forma esférica y tamaños similares, lo que lo hace poco adecuado para grupos alargados, en forma de luna o con densidades muy distintas. Es sensible a valores atípicos (outliers) porque distorsionan la posición de los centroides. Requiere especificar K de antemano, lo que no siempre es evidente. Para datos con formas irregulares, algoritmos como DBSCAN o clustering espectral ofrecen mejores resultados.',
      },
    },
  ],
};
