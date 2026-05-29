import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Complejidad Algorítmica — Big O, Ordenación y Estructuras de Datos | meskeIA',
  description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa de algoritmos. Con explicaciones técnicas. Para entrevistas y exámenes.',
  keywords: 'complejidad algorítmica, notación Big O, ordenación algoritmos, estructuras datos, entrevistas técnicas, quiz algoritmia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Complejidad Algorítmica — Big O, Ordenación y Estructuras de Datos | meskeIA',
    description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa de algoritmos. Con explicaciones técnicas.',
    url: 'https://meskeia.com/quiz-complejidad-algoritmos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiz Complejidad Algorítmica — Big O | meskeIA',
    description: 'Practica notación Big O con 25 preguntas: análisis de código, ordenación, estructuras de datos y comparativa. Explicaciones técnicas detalladas.',
  },
  other: {
    'application-name': 'Quiz Complejidad Algorítmica meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Quiz Complejidad Algorítmica — Big O',
  description: 'Quiz de complejidad algorítmica y notación Big O con 25 preguntas en 5 categorías: notación, búsqueda/ordenación, estructuras de datos, análisis de código y comparativa. Ideal para preparar entrevistas técnicas y exámenes de algoritmia.',
  url: 'https://meskeia.com/quiz-complejidad-algoritmos/',
  category: 'EducationalApplication',
  features: [
    '25 preguntas en 5 categorías: notación, ordenación, estructuras, análisis de código, comparativa',
    'Snippets de código reales para analizar su complejidad',
    'Explicaciones técnicas detalladas tras cada respuesta',
    'Ideal para entrevistas técnicas y asignaturas de algoritmia',
    'Modo práctica por categoría y examen completo',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la notación Big O y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La notación Big O describe cómo crece el tiempo de ejecución o el uso de memoria de un algoritmo en función del tamaño de la entrada. Permite comparar algoritmos independientemente del hardware o el lenguaje de programación. Por ejemplo, O(n log n) es más eficiente que O(n²) para entradas grandes. Es fundamental en entrevistas técnicas y en el diseño de software escalable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las complejidades más comunes en algoritmos de ordenación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los algoritmos de ordenación más eficientes como Merge Sort y Heap Sort tienen complejidad O(n log n) en el caso promedio y peor caso. Quick Sort también es O(n log n) en promedio, aunque O(n²) en el peor caso. Algoritmos simples como Bubble Sort, Insertion Sort y Selection Sort son O(n²). Counting Sort y Radix Sort pueden alcanzar O(n) bajo condiciones específicas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre O(n) y O(log n)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O(n) significa que el tiempo crece linealmente con el tamaño de la entrada: si la entrada se duplica, el tiempo también se duplica. O(log n) crece de forma logarítmica: si la entrada se duplica, el tiempo aumenta en una cantidad constante. La búsqueda binaria en un array ordenado es O(log n), mientras que la búsqueda lineal es O(n). Para entradas grandes, O(log n) es significativamente más rápido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué complejidad tienen las operaciones básicas en estructuras de datos como arrays, listas enlazadas y tablas hash?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un array, el acceso por índice es O(1) pero la inserción o eliminación en posición arbitraria es O(n). En una lista enlazada, la inserción o eliminación al inicio es O(1), pero el acceso a un elemento por posición es O(n). Las tablas hash ofrecen búsqueda, inserción y eliminación en O(1) amortizado en el caso promedio, aunque O(n) en el peor caso por colisiones. Los árboles balanceados (BST) realizan estas operaciones en O(log n).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se analiza la complejidad de un fragmento de código con bucles anidados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para analizar un bucle simple que recorre n elementos, la complejidad es O(n). Cuando hay dos bucles anidados, cada uno de n iteraciones, la complejidad es O(n²). Si el bucle interno no depende del externo sino que siempre recorre k elementos fijos, sigue siendo O(n). La regla general es multiplicar las complejidades de los niveles de anidamiento dependientes y sumar las de los bloques secuenciales, quedándose con el término dominante.',
      },
    },
  ],
};
