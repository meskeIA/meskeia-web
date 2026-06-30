import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Árbol B (B-Tree) - Inserción, División y Borrado | meskeIA',
  description:
    'Simula un árbol B paso a paso: inserta, busca y elimina claves viendo la división de nodos (split), el préstamo entre hermanos y la fusión. Elige el orden (3, 4 o 5) y entiende cómo las bases de datos indexan millones de registros con la variante B+.',
  keywords:
    'árbol B, B-Tree, árbol B+, índices de bases de datos, división de nodos split, orden de un árbol B, estructuras de datos, grado mínimo, fusión y préstamo, FP informática, universidad, almacenamiento en disco',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-arboles-b/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Árbol B (B-Tree) | meskeIA',
    description: 'Inserción con división de nodos, búsqueda y borrado con fusión, animados paso a paso',
    url: 'https://meskeia.com/simulador-arboles-b/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Árbol B (B-Tree) | meskeIA',
    description: 'Aprende cómo los árboles B indexan bases de datos, paso a paso',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Árbol B (B-Tree)',
  description:
    'Simulador interactivo de árboles B (B-Trees), la estructura que usan las bases de datos y los sistemas de archivos para indexar grandes volúmenes de datos. Inserta, busca y elimina claves observando la división de nodos, el préstamo entre hermanos y la fusión, con el orden configurable y el recorrido inorden ordenado.',
  url: 'https://meskeia.com/simulador-arboles-b/',
  category: 'EducationalApplication',
  features: [
    'Orden configurable (3, 4 o 5)',
    'Inserción con división de nodos (split) animada',
    'Búsqueda con resaltado del camino',
    'Borrado con préstamo entre hermanos y fusión',
    'Recorrido inorden (claves ordenadas)',
    'Altura, número de claves y mínimo/máximo por nodo visibles',
    'Ejemplos preconfigurados y carga aleatoria',
    'En español',
  ],
  keywords: ['árbol B', 'B-Tree', 'B+', 'índices de bases de datos', 'estructuras de datos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un árbol B (B-Tree) y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un árbol B es una estructura de datos en árbol auto-balanceada en la que cada nodo puede contener varias claves y tener varios hijos. A diferencia de un árbol binario, donde cada nodo tiene como máximo 2 hijos, un nodo de un árbol B de orden m puede tener hasta m hijos y m-1 claves. Esto hace que el árbol sea muy "ancho" y poco "alto", lo que reduce el número de accesos a disco. Por eso es la estructura que usan los índices de las bases de datos (PostgreSQL, MySQL, Oracle) y muchos sistemas de archivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un árbol B y un árbol B+?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un árbol B las claves (y sus datos asociados) se guardan en todos los nodos, tanto internos como hojas. En un árbol B+ los datos solo están en las hojas y los nodos internos guardan únicamente claves de guía para encontrar el camino; además, las hojas se enlazan entre sí formando una lista, lo que permite recorrer rangos de valores de forma muy eficiente (por ejemplo, "todos los pedidos entre dos fechas"). Por eso la mayoría de bases de datos usan en realidad árboles B+, no árboles B clásicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el orden de un árbol B?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El orden m es el número máximo de hijos que puede tener un nodo. Un nodo de orden m almacena como máximo m-1 claves y como mínimo ceil(m/2)-1 claves (salvo la raíz, que puede tener solo 1). Por ejemplo, un árbol B de orden 5 tiene nodos con entre 2 y 4 claves y entre 3 y 5 hijos. Cuanto mayor es el orden, más ancho y bajo es el árbol: en bases de datos reales el orden es de cientos, de modo que con 3 o 4 niveles se indexan millones de registros.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre cuando un nodo se llena al insertar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando un nodo supera el máximo de claves permitido, se divide (split): la clave central (mediana) sube al nodo padre y el resto de claves se reparte en dos nodos hijos. Si el padre también se llena, la división se propaga hacia arriba. Si llega a dividirse la raíz, el árbol gana un nivel de altura. Este mecanismo de división hacia arriba es lo que mantiene el árbol siempre equilibrado, con todas las hojas a la misma profundidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las bases de datos usan árboles B en lugar de árboles binarios?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque el cuello de botella de una base de datos es el acceso a disco, mucho más lento que la memoria. Un árbol binario equilibrado (AVL o Red-Black) de un millón de elementos tiene unos 20 niveles, lo que supondría hasta 20 lecturas de disco por búsqueda. Un árbol B de orden alto agrupa cientos de claves por nodo (del tamaño de una página de disco), así que el mismo millón de registros cabe en 3 o 4 niveles. Menos niveles equivale a menos accesos a disco y consultas mucho más rápidas.',
      },
    },
  ],
};
