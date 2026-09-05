import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Montículo Binario (Heap) - Heapify, Insertar, Heapsort | meskeIA',
  description:
    'Simula un montículo binario (heap) de máximos o de mínimos paso a paso: construcción por heapify, inserción con sift-up, extracción de la raíz con sift-down y heapsort completo. Árbol dibujado y arreglo con índices, sincronizados.',
  keywords:
    'montículo binario, heap, max-heap, min-heap, montículo de máximos, montículo de mínimos, heapify, heapsort, cola de prioridad, sift-up sift-down, estructuras de datos, algoritmia, árbol binario en arreglo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-monticulo-binario/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Montículo Binario (Heap) | meskeIA',
    description:
      'Heapify, inserción, extracción de la raíz y heapsort paso a paso, con el árbol y el arreglo de índices sincronizados.',
    url: 'https://meskeia.com/simulador-monticulo-binario/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/stemum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Montículo Binario (Heap) | meskeIA',
    description: 'Construye, inserta, extrae y ordena con un heap de máximos o de mínimos, paso a paso',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Montículo Binario (Heap)',
  description:
    'Simulador interactivo de montículos binarios de máximos y de mínimos. Construye el montículo por heapify, inserta valores con sift-up, extrae la raíz con sift-down y ejecuta un heapsort completo, siguiendo cada comparación y cada intercambio sobre el árbol dibujado y sobre el arreglo con sus índices.',
  url: 'https://meskeia.com/simulador-monticulo-binario/',
  category: 'EducationalApplication',
  features: [
    'Montículo de máximos y de mínimos, con reconstrucción al cambiar de tipo',
    'Construcción por heapify de Floyd, paso a paso',
    'Inserción con sift-up y extracción de la raíz con sift-down',
    'Heapsort completo, con la parte ya fijada marcada aparte',
    'Árbol dibujado y arreglo con índices, sincronizados en cada paso',
    'Reproductor de pasos con velocidad regulable',
    'Comprobador de la propiedad de montículo que señala el índice que falla',
  ],
  keywords: ['montículo binario', 'heap', 'heapsort', 'cola de prioridad', 'estructuras de datos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un montículo binario (heap) y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un montículo binario es un árbol binario casi completo en el que cada padre cumple una relación fija con sus hijos: en un montículo de máximos todo padre es mayor o igual que sus hijos, y en uno de mínimos, menor o igual. Se guarda en un arreglo sin punteros: para el índice i, el padre está en ⌊(i−1)/2⌋, el hijo izquierdo en 2i+1 y el derecho en 2i+2. Es la implementación estándar de una cola de prioridad, porque deja el elemento más prioritario siempre en el índice 0 y permite sacarlo en O(log n).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un montículo y un árbol binario de búsqueda?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un montículo NO está ordenado: su recorrido en inorden no devuelve los valores en orden, a diferencia del árbol binario de búsqueda (BST). El montículo solo garantiza la relación entre cada padre y sus hijos, no entre hermanos ni entre ramas distintas, así que buscar un valor cualquiera cuesta O(n). A cambio, siempre sabe dónde está el máximo (o el mínimo) sin buscarlo, se mantiene equilibrado por construcción y cabe en un arreglo, mientras que un BST puede degenerar en una lista si se inserta en orden.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Construir un montículo cuesta O(n) o O(n log n)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del método. Insertar los n valores uno a uno cuesta O(n log n). El método de Floyd —recorrer desde el último nodo con hijos, el índice ⌊n/2⌋−1, hacia la raíz hundiendo cada nodo— cuesta O(n), porque la mitad de los nodos son hojas y no bajan nada, y solo un nodo puede recorrer los log n niveles completos. Insertar y extraer la raíz cuestan O(log n) cada una; consultar la raíz sin sacarla, O(1).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el heapsort y por qué un montículo de máximos ordena de menor a mayor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El heapsort construye primero el montículo y después repite n−1 veces la misma jugada: intercambia la raíz con el último elemento del tramo activo, reduce ese tramo en uno y hunde la nueva raíz. Con un montículo de máximos la raíz es el mayor valor, así que cada vuelta deja el mayor de los que quedan al final del arreglo: el resultado queda ascendente, que es lo que sorprende la primera vez. Ordena en O(n log n) en el peor caso y sin memoria extra, aunque en la práctica suele ser más lento que quicksort por su acceso disperso a memoria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde se usa un montículo binario en la práctica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el algoritmo de Dijkstra y en A*, donde la cola de prioridad decide qué nodo se explora antes y baja el coste de O(V²) a O((V+E)·log V). En los planificadores de tareas de un sistema operativo y en los temporizadores del núcleo, para saber qué proceso o qué alarma toca ahora. En problemas de top-k sobre flujos de datos, manteniendo un montículo de mínimos de tamaño k. Y en la compresión de Huffman, para elegir repetidamente los dos símbolos menos frecuentes.',
      },
    },
  ],
};
