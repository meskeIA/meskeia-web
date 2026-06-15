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
    url: 'https://meskeia.com/simulador-ordenacion/',
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué algoritmos de ordenación incluye el simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye 7 algoritmos: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort y Counting Sort. Para cada uno muestra la animación paso a paso, el número de comparaciones, el número de intercambios y la complejidad temporal teórica (O(n²) para los simples, O(n log n) para los avanzados).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Bubble Sort y Quick Sort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bubble Sort compara elementos adyacentes repetidamente y los intercambia si están en orden incorrecto; su complejidad es O(n²), lo que lo hace lento con arrays grandes. Quick Sort elige un pivote, divide el array en dos partes y ordena cada mitad de forma recursiva; su complejidad media es O(n log n), aunque en el peor caso (pivote mal elegido) puede degradarse a O(n²).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve comparar varios algoritmos en paralelo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modo comparativa permite ejecutar hasta 4 algoritmos a la vez sobre el mismo array inicial, de forma que se puede ver en directo cómo cada uno avanza, cuántas operaciones realiza y cuál termina primero. Es muy útil para entender de forma intuitiva las diferencias de rendimiento que las fórmulas de complejidad expresan de forma teórica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué casos conviene usar Merge Sort en lugar de Quick Sort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Merge Sort garantiza O(n log n) en todos los casos (mejor, medio y peor), por lo que es preferible cuando necesitas rendimiento predecible o cuando ordenas listas enlazadas. Quick Sort es más rápido en la práctica con arrays aleatorios porque tiene mejor localidad de caché, pero puede degradarse a O(n²) sin una buena estrategia de pivote.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué asignaturas y niveles educativos es útil este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para asignaturas de Programación, Algoritmos y Estructuras de Datos en ciclos de FP de informática, Bachillerato tecnológico y primeros cursos universitarios de informática o ingeniería. También lo usan personas que preparan entrevistas técnicas de programación donde los algoritmos de ordenación son un tema frecuente.',
      },
    },
  ],
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
    'En español',
  ],
  keywords: ['ordenación', 'sorting', 'algoritmos', 'informática universidad'],
});
