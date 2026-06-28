import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Quadtree - Partición Espacial y Colisiones | meskeIA',
  description:
    'Construye un quadtree interactivo sobre un lienzo: añade puntos con el ratón o el dedo y observa cómo el árbol subdivide el espacio en 4 cuadrantes cuando un nodo supera su capacidad. Arrastra un rectángulo de consulta de rango y compara cuántos nodos visita el quadtree frente a la fuerza bruta. Estructura de datos clave para detección de colisiones en videojuegos.',
  keywords:
    'quadtree, partición espacial, detección de colisiones, estructura de datos espacial, consulta de rango, videojuegos, octree, broad-phase, árbol cuádruple, optimización de colisiones, subdivisión del espacio, programación de videojuegos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-quadtree/',
  },
  openGraph: {
    type: 'website',
    title: 'Visualizador de Quadtree - Partición Espacial y Colisiones | meskeIA',
    description:
      'Cómo un quadtree subdivide el espacio para acelerar las colisiones: añade puntos, mira cómo se reparten en 4 cuadrantes y consulta un rango comparando nodos visitados frente a la fuerza bruta.',
    url: 'https://meskeia.com/visualizador-quadtree/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Quadtree | meskeIA',
    description: 'Partición espacial paso a paso: cómo un quadtree acelera las colisiones y las consultas de rango',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Quadtree (Partición Espacial)',
  description:
    'Visualizador interactivo de un quadtree, la estructura de datos que divide el espacio en cuadrantes para acelerar la detección de colisiones y las consultas espaciales en videojuegos y mapas. Añade puntos con el ratón, ajusta la capacidad por nodo y observa cómo el árbol subdivide en 4 (NO, NE, SO, SE) cuando un nodo se llena. Arrastra un rectángulo de consulta de rango y compara los nodos que visita el quadtree frente a comprobar todos los puntos por fuerza bruta.',
  url: 'https://meskeia.com/visualizador-quadtree/',
  category: 'EducationalApplication',
  features: [
    'Construcción interactiva: añade puntos con clic o arrastre',
    'Subdivisión automática en 4 cuadrantes al superar la capacidad',
    'Slider de capacidad por nodo (1 a 8) que reconstruye el árbol',
    'Consulta de rango arrastrando un rectángulo de selección',
    'Compara nodos visitados frente a la fuerza bruta O(n)',
    'Contadores: puntos, nodos del árbol y profundidad máxima',
    'Botones para añadir puntos aleatorios y limpiar',
    'En español',
  ],
  keywords: ['quadtree', 'partición espacial', 'detección de colisiones', 'consulta de rango', 'videojuegos'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un quadtree y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un quadtree es una estructura de datos en forma de árbol que divide una región del plano en cuatro cuadrantes iguales (noroeste, noreste, suroeste y sureste). Cada nodo almacena hasta un número fijo de puntos llamado capacidad; cuando se supera, el nodo se subdivide en cuatro hijos y reparte sus puntos entre ellos. Sirve para acelerar consultas espaciales: en lugar de comparar un punto con todos los demás, solo se examinan los nodos de la zona relevante. Es muy habitual en videojuegos para la detección de colisiones y en sistemas de información geográfica (SIG).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo acelera un quadtree la detección de colisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comprobar colisiones comparando cada objeto con todos los demás cuesta O(n²): con 1.000 objetos son cerca de un millón de comprobaciones por fotograma. Un quadtree agrupa los objetos por zonas del espacio, así que cada objeto solo se compara con los que comparten su cuadrante o los vecinos. Esta fase de descarte rápido se llama broad-phase: reduce muchísimo el número de parejas candidatas antes de hacer la comprobación precisa. En la mayoría de los casos el coste baja a aproximadamente O(n log n).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la capacidad de un nodo y cómo elegirla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La capacidad es el número máximo de puntos que un nodo guarda antes de subdividirse. Con una capacidad muy baja (por ejemplo 1) el árbol se vuelve muy profundo y crea muchos nodos casi vacíos, lo que gasta memoria y obliga a recorrer más niveles. Con una capacidad muy alta cada nodo guarda demasiados puntos y se pierde la ventaja de la partición. Suelen funcionar bien valores de 4 a 8. En este visualizador puedes mover el slider de capacidad y ver cómo cambian el número de nodos y la profundidad del árbol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es una consulta de rango en un quadtree?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una consulta de rango busca todos los puntos que caen dentro de una región rectangular. El quadtree la resuelve de forma eficiente: si un nodo no se solapa con el rectángulo de búsqueda, se descarta entero junto con todos sus descendientes sin examinar sus puntos. Solo se desciende por las ramas que intersecan la zona consultada. Por eso un quadtree visita muchos menos nodos que comprobar uno por uno todos los puntos (fuerza bruta), y la diferencia crece a medida que hay más puntos en el espacio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre un quadtree y un octree?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son la misma idea en distinta dimensión. El quadtree trabaja en 2D y divide cada región en 4 cuadrantes. El octree es su equivalente en 3D: divide cada caja en 8 octantes. Se usa un quadtree para juegos en 2D, mapas y tiles, y un octree para mundos 3D, motores de física, renderizado de voxels o nubes de puntos. También existen alternativas como la rejilla uniforme (grid) y el árbol k-d, cada uno con ventajas según la distribución de los objetos.',
      },
    },
  ],
};
