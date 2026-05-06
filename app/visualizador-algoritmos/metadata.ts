import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Algoritmos de Ordenación Paso a Paso | meskeIA',
  description: 'Visualiza paso a paso cómo funcionan los algoritmos: Bubble, Selection, Insertion, Quick y Merge Sort. Herramienta interactiva para estudiantes de informática.',
  keywords: 'algoritmos ordenación, bubble sort, quick sort, merge sort, selection sort, insertion sort, visualizador algoritmos, estructuras datos, informática, programación, universidad, aprender algoritmos, complejidad algoritmos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-algoritmos/',
  },
  openGraph: {
    type: 'website',
    title: 'Visualizador de Algoritmos de Ordenación - meskeIA',
    description: 'Aprende algoritmos de ordenación con visualizaciones interactivas paso a paso. Bubble Sort, Quick Sort, Merge Sort y más.',
    url: 'https://meskeia.com/visualizador-algoritmos',
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
    title: 'Visualizador de Algoritmos - meskeIA',
    description: 'Visualiza y aprende algoritmos de ordenación de forma interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador de Algoritmos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Algoritmos de Ordenación',
  description: 'Visualizador interactivo paso a paso de algoritmos de ordenación: Bubble Sort, Selection Sort, Insertion Sort, Quick Sort y Merge Sort. Herramienta educativa para estudiantes de informática y programación.',
  url: 'https://meskeia.com/visualizador-algoritmos/',
  category: 'EducationalApplication',
  features: [
    'Visualización paso a paso de 5 algoritmos de ordenación',
    'Bubble Sort, Selection Sort, Insertion Sort, Quick Sort, Merge Sort',
    'Control de velocidad de la animación',
    'Comparación de complejidad temporal de cada algoritmo',
    'Conjuntos de datos personalizables',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['algoritmos', 'ordenación', 'sorting', 'estructuras de datos', 'informática', 'universidad', 'FP'],
});
