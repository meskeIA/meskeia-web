import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Visualizador de Estructuras de Datos - Arrays, Pilas, Colas, Árboles | meskeIA',
  description: 'Visualiza operaciones en estructuras de datos: arrays, pilas (stacks), colas (queues), listas enlazadas, árboles binarios y grafos. Animaciones paso a paso para entender cada operación.',
  keywords: 'estructuras de datos, array, pila, stack, cola, queue, lista enlazada, árbol binario, grafo, BST, push, pop, enqueue, dequeue, insertar, eliminar, buscar, programación, algoritmos, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Estructuras de Datos | meskeIA',
    description: 'Visualiza arrays, pilas, colas, listas enlazadas y árboles binarios con animaciones paso a paso.',
    url: 'https://meskeia.com/visualizador-estructuras-datos/',
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
    title: 'Visualizador de Estructuras de Datos | meskeIA',
    description: 'Aprende estructuras de datos con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador de Estructuras de Datos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Visualizador de Estructuras de Datos - Arrays, Pilas, Colas, Árboles",
  description: "Visualiza operaciones en estructuras de datos: arrays, pilas (stacks), colas (queues), listas enlazadas, árboles binarios y grafos. Animaciones paso a paso para entender cada operación.",
  url: 'https://meskeia.com/visualizador-estructuras-datos/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
