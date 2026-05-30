import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Algoritmos de Ordenación: Visualizador Paso a Paso | meskeIA',
  description: 'Visualiza paso a paso cómo ordenan Burbuja, Inserción, Selección, Quicksort y Mergesort. Complejidad O(n), O(n log n) y O(n²), comparativa de velocidad y cuándo usar cada algoritmo en la práctica.',
  keywords: ['algoritmos de ordenación', 'bubble sort visualizador', 'quicksort cómo funciona', 'mergesort animado', 'complejidad algoritmos Big O', 'ordenación inserción selección', 'algoritmo ordenar lista', 'comparativa algoritmos velocidad'],
  openGraph: {
    title: 'Algoritmos de Ordenación: Visualizador Paso a Paso | meskeIA',
    description: 'Por qué Quicksort es 100 veces más rápido que Burbuja en listas grandes — visualizado paso a paso.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Algoritmos de Ordenación: Visualizador Paso a Paso",
  description: "Visualiza paso a paso cómo ordenan Burbuja, Inserción, Selección, Quicksort y Mergesort. Complejidad O(n), O(n log n) y O(n²), comparativa de velocidad y cuándo usar cada algoritmo en la práctica.",
  url: "https://meskeia.com/visualizador-algoritmos-ordenacion/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Quicksort y Mergesort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Quicksort y Mergesort tienen la misma complejidad promedio O(n log n), pero difieren en comportamiento real. Quicksort es más rápido en la práctica por su menor uso de memoria (ordena en el propio array) y mejor aprovechamiento de la caché del procesador, aunque en el peor caso degrada a O(n²). Mergesort siempre garantiza O(n log n) y es estable (preserva el orden relativo de elementos iguales), lo que lo hace preferible para ordenar objetos o datos externos en disco.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la complejidad O(n²) de un algoritmo de ordenación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La notación O(n²) indica que el número de operaciones crece con el cuadrado del tamaño de la lista. Para 100 elementos implica ~10.000 comparaciones; para 1.000 elementos, ~1.000.000. Algoritmos como Burbuja, Inserción y Selección tienen esta complejidad en el caso promedio o peor. Son aceptables para listas pequeñas (menos de 1.000 elementos) pero inviables para conjuntos de datos grandes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo conviene usar el algoritmo de Inserción en lugar de Quicksort?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El algoritmo de Inserción es más eficiente que Quicksort cuando la lista ya está casi ordenada, porque en ese caso su complejidad se acerca a O(n). También es preferible para listas muy pequeñas (menos de 10-20 elementos) por su bajo overhead. De hecho, muchas implementaciones de Quicksort en lenguajes modernos cambian automáticamente a Inserción para sublistas pequeñas durante la recursión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el ordenamiento de burbuja es considerado ineficiente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bubble Sort compara pares adyacentes y los intercambia repetidamente hasta que no quedan inversiones. Su complejidad O(n²) en el caso promedio y peor lo hace muy lento para listas medianas o grandes. Para 10.000 elementos puede requerir hasta 50 millones de comparaciones, frente a los ~133.000 de Quicksort. Su única ventaja es la simplicidad de implementación y la detección temprana de listas ya ordenadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué algoritmo de ordenación usa Python o JavaScript internamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Python usa Timsort, un híbrido de Mergesort e Inserción diseñado por Tim Peters en 2002, con complejidad O(n log n) garantizada y estabilidad. JavaScript (motores V8 y SpiderMonkey) también adoptó Timsort desde 2019, sustituyendo implementaciones anteriores basadas en Quicksort. Timsort detecta secuencias ya ordenadas en los datos reales y las aprovecha, lo que lo hace muy eficiente en datos del mundo real.',
      },
    },
  ],
};
