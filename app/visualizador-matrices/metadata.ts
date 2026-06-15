import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Matrices - El Lenguaje Secreto de las Transformaciones | meskeIA',
  description: 'Descubre qué son las matrices, sus operaciones y cómo transforman figuras en el plano: rotación, escala, reflexión. Explicador visual interactivo.',
  keywords: 'matrices, transformaciones 2D, álgebra lineal, rotación, escala, reflexión, determinante, multiplicación matrices, matemáticas visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Matrices - El Lenguaje Secreto de las Transformaciones',
    description: 'Qué son las matrices y cómo transforman el mundo: rotación, escala, reflexión explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-matrices/',
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
    title: 'Matrices - Explicador Visual Interactivo',
    description: 'El álgebra lineal cobra vida: matrices que rotan, escalan y reflejan figuras ante tus ojos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Matrices Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Matrices - El Lenguaje Secreto de las Transformaciones',
  description: 'Explicador visual interactivo sobre matrices: definición, operaciones (suma, multiplicación, determinante), transformaciones geométricas 2D y aplicaciones en la vida real.',
  url: 'https://meskeia.com/visualizador-matrices/',
  category: 'EducationalApplication',
  features: [
    'Matrices interactivas con operaciones paso a paso',
    'Transformaciones 2D visualizadas en plano cartesiano',
    'Rotación, escala, reflexión y cizalladura animadas',
    'Aplicaciones reales: IA, videojuegos, PageRank, GPS',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una matriz en matemáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una matriz es una tabla rectangular de números organizados en filas y columnas. Se usa para representar datos, transformaciones geométricas y sistemas de ecuaciones. Por ejemplo, una matriz 2×2 puede describir cómo rotar o escalar una figura en el plano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven las matrices en la vida real?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las matrices tienen aplicaciones en inteligencia artificial (redes neuronales), videojuegos (transformaciones 3D), motores de búsqueda (algoritmo PageRank de Google), economía (modelos de input-output) y GPS (correcciones de posición). Son una herramienta fundamental del álgebra lineal moderna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se multiplican dos matrices?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para multiplicar dos matrices A y B, el número de columnas de A debe coincidir con el número de filas de B. Cada elemento del resultado se obtiene multiplicando los elementos de una fila de A por los de una columna de B y sumando los productos. La multiplicación de matrices no es conmutativa: A×B generalmente no es igual a B×A.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el determinante de una matriz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El determinante es un número que resume propiedades clave de una matriz cuadrada. Si el determinante es cero, la matriz no tiene inversa y la transformación que representa colapsa el espacio (aplana figuras). Si es distinto de cero, la transformación preserva la dimensionalidad y el valor indica cuánto cambia el área o volumen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una matriz y un vector?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un vector es un caso especial de matriz con una sola fila o una sola columna (por ejemplo, una matriz 2×1 o 1×3). Las matrices pueden interpretarse como colecciones de vectores o como operadores que transforman vectores: al multiplicar una matriz por un vector se obtiene un nuevo vector con diferente dirección y magnitud.',
      },
    },
  ],
};
