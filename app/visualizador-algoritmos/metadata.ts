import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Algoritmos de Ordenación Paso a Paso | meskeIA',
  description: 'Visualiza paso a paso los 7 algoritmos de ordenación: Bubble, Selection, Insertion, Quick, Merge, Heap y Counting Sort. Con el pseudocódigo resaltado línea a línea, contador de comparaciones e intercambios y tu propio array.',
  keywords: 'algoritmos ordenación, metodos de ordenamiento, bubble sort, quick sort, merge sort, selection sort, insertion sort, heap sort, counting sort, visualizador algoritmos, simulador ordenacion, estructuras datos, informática, programación, universidad, aprender algoritmos, complejidad algoritmos, big O',
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
    description: 'Aprende los 7 algoritmos de ordenación con animaciones paso a paso: Bubble, Quick, Merge, Heap, Counting y más, con el pseudocódigo resaltado.',
    url: 'https://meskeia.com/visualizador-algoritmos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Algoritmos - meskeIA',
    description: 'Visualiza y aprende algoritmos de ordenación de forma interactiva.',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
  other: {
    'application-name': 'Visualizador de Algoritmos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Algoritmos de Ordenación',
  description: 'Visualizador interactivo paso a paso de los 7 algoritmos de ordenación: Bubble, Selection, Insertion, Quick, Merge, Heap y Counting Sort. Muestra el pseudocódigo resaltado línea a línea mientras se anima, cuenta comparaciones e intercambios, y admite tu propio array. Para estudiantes de informática y programación.',
  url: 'https://meskeia.com/visualizador-algoritmos/',
  category: 'EducationalApplication',
  features: [
    'Visualización paso a paso de 7 algoritmos de ordenación',
    'Bubble, Selection, Insertion, Quick, Merge, Heap y Counting Sort',
    'Pseudocódigo resaltado línea a línea mientras avanza la animación',
    'Contador en vivo de comparaciones, intercambios y accesos al array',
    'Control de velocidad, modo paso a paso y pausa',
    'Tu propio array: prueba casos ya ordenados, invertidos o con repetidos',
    'Tabla comparativa de complejidad, memoria y estabilidad de los 7',
    'En español',
  ],
  keywords: ['algoritmos', 'ordenación', 'sorting', 'estructuras de datos', 'informática', 'universidad', 'FP', 'heap sort', 'counting sort', 'big O'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un algoritmo de ordenación y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un algoritmo de ordenación es un procedimiento que organiza una lista de elementos en un orden determinado (ascendente o descendente). Son fundamentales en informática porque muchas operaciones, como la búsqueda binaria, requieren datos previamente ordenados. También se usan constantemente en bases de datos, sistemas operativos y aplicaciones web.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Bubble Sort, Quick Sort y Merge Sort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bubble Sort es el más sencillo de entender pero el menos eficiente: compara pares adyacentes y tiene complejidad O(n²). Quick Sort divide el array en torno a un pivote y alcanza O(n log n) de media, aunque su peor caso es O(n²). Merge Sort siempre garantiza O(n log n) usando división y fusión, pero necesita memoria adicional proporcional al tamaño del array.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la complejidad temporal O(n log n) en algoritmos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La notación Big-O describe cómo crece el tiempo de ejecución al aumentar el tamaño de la entrada. O(n log n) indica que, para ordenar n elementos, el algoritmo realiza aproximadamente n multiplicado por el logaritmo de n operaciones. Esto es mucho más eficiente que O(n²) para listas grandes: ordenar 1.000.000 de elementos con O(n²) requeriría ~10¹² operaciones, mientras que O(n log n) solo ~20.000.000.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil visualizar algoritmos de ordenación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Principalmente para estudiantes de informática, ingeniería del software o ciclos de FP que estudian estructuras de datos y necesitan entender el funcionamiento interno de cada algoritmo antes de implementarlos. También es útil para docentes que preparan material didáctico y para programadores que quieren refrescar conceptos antes de una entrevista técnica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué algoritmo de ordenación debo usar en la práctica al programar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la mayoría de lenguajes modernos (Python, Java, JavaScript, C++) la función de ordenación estándar implementa variantes de Timsort o Introsort, que combinan Merge Sort e Insertion Sort para obtener el mejor rendimiento en casos reales. En la práctica, lo más sensato es usar la función nativa del lenguaje. Implementar un algoritmo propio solo tiene sentido en casos muy específicos de optimización.',
      },
    },
  ],
};
