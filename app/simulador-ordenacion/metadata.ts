import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Algoritmos de Ordenación - Bubble Quick Merge | meskeIA',
  description: 'Simula 7 algoritmos de ordenación paso a paso con tu propio array: Bubble, Selection, Insertion, Merge, Quick, Heap y Counting Sort. Cuenta comparaciones e intercambios y compara rendimiento.',
  keywords: 'algoritmos ordenación, bubble sort quick sort merge sort, complejidad O(n²) O(n log n), comparaciones intercambios, programación universidad, estructuras de datos, sorting algorithm',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-ordenacion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Algoritmos de Ordenación | meskeIA',
    description: '7 algoritmos paso a paso con tu propio array y comparativa de rendimiento',
    url: 'https://meskeia.com/simulador-ordenacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Algoritmos de Ordenación | meskeIA',
    description: 'Aprende algoritmos con simulaciones interactivas paso a paso',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Algoritmos de Ordenación',
  description: 'Simulador interactivo de 7 algoritmos de ordenación: Bubble, Selection, Insertion, Merge, Quick, Heap y Counting Sort. Teclea tu propio array, observa cada paso con conteo de comparaciones e intercambios, y compara hasta 4 algoritmos lado a lado.',
  url: 'https://meskeia.com/simulador-ordenacion/',
  category: 'EducationalApplication',
  features: [
    '7 algoritmos: Bubble, Selection, Insertion, Merge, Quick, Heap, Counting',
    'Array personalizable o presets (aleatorio, inverso, casi ordenado)',
    'Animación paso a paso con velocidad ajustable',
    'Conteo en vivo de comparaciones, intercambios y pasos',
    'Modo comparativa: 4 algoritmos en paralelo',
    'Indicación de complejidad temporal',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['ordenación', 'sorting', 'algoritmos', 'informática universidad'],
});
