import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Visualizador de Estructuras de Datos - Arrays, Pilas, Colas, Árboles | meskeIA',
  description: 'Visualiza operaciones en estructuras de datos: arrays, pilas (stacks), colas (queues), listas enlazadas y árboles binarios de búsqueda. Animaciones paso a paso para entender cada operación.',
  keywords: 'estructuras de datos, array, pila, stack, cola, queue, lista enlazada, árbol binario, BST, push, pop, enqueue, dequeue, insertar, eliminar, buscar, programación, algoritmos, universidad',
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
  description: "Visualiza operaciones en 5 estructuras de datos: array, pila (stack), cola (queue), lista enlazada y árbol binario de búsqueda (BST). Animaciones paso a paso para entender push, pop, enqueue, insert y search.",
  url: 'https://meskeia.com/visualizador-estructuras-datos/',
  category: 'EducationalApplication',
  features: [
      "5 estructuras interactivas: array, pila (stack), cola (queue), lista enlazada y árbol BST",
      "Animaciones paso a paso de push, pop, enqueue, dequeue, insertar, eliminar y buscar",
      "Tabla de complejidad temporal O(n) integrada con resaltado de la operación activa",
      "Panel de mensajes que describe cada operación ejecutada en lenguaje natural",
      "Sección educativa con escenarios reales de uso de cada estructura",
      "Gratuito, sin registro ni instalación",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una estructura de datos y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una estructura de datos es una forma organizada de almacenar y gestionar información en memoria para que pueda usarse de manera eficiente. Cada tipo —array, pila, cola, lista enlazada, árbol— tiene sus propias ventajas según el problema a resolver. Elegir la estructura correcta puede reducir el tiempo de ejecución de un algoritmo de forma drástica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una pila (stack) y una cola (queue)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pila sigue el principio LIFO (Last In, First Out): el último elemento añadido es el primero en salir, como una pila de platos. La cola sigue el principio FIFO (First In, First Out): el primer elemento añadido es el primero en salir, como la cola de un cajero. Las pilas se usan en llamadas a funciones y deshacer acciones; las colas en sistemas de espera y procesamiento de tareas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un árbol binario de búsqueda (BST)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol binario de búsqueda (BST) es una estructura en la que cada nodo tiene como máximo dos hijos: todos los valores del subárbol izquierdo son menores que el nodo, y todos los del subárbol derecho son mayores. Esto permite búsquedas, inserciones y eliminaciones en tiempo O(log n) en el caso promedio. Es la base de muchos algoritmos de ordenación y búsqueda eficientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar una lista enlazada en lugar de un array?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lista enlazada es preferible cuando se realizan frecuentes inserciones o eliminaciones en el medio de la colección, ya que estas operaciones son O(1) si ya se tiene el nodo, frente a O(n) en un array. Sin embargo, el acceso aleatorio a un elemento es O(n) en la lista enlazada, mientras que en un array es O(1). El array también ocupa menos memoria al no necesitar punteros adicionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil visualizar estructuras de datos de forma interactiva?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para estudiantes de informática, ingeniería de software o ciclos formativos que preparan exámenes de algoritmos y estructuras de datos. También ayuda a programadores que quieren refrescar o consolidar conceptos, o a cualquier persona que aprende mejor de forma visual. Ver las operaciones push, pop, enqueue o insert animadas paso a paso facilita la comprensión frente a leer pseudocódigo.',
      },
    },
  ],
};
