import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo | meskeIA',
  description: 'Descubre la secuencia de Fibonacci y la proporción áurea en la naturaleza: espirales, girasoles, piñas, pétalos, arte y diseño. Explicador visual interactivo.',
  keywords: 'Fibonacci, proporción áurea, número áureo, espiral dorada, naturaleza, girasol, filotaxis, 1.618, phi, matemáticas naturaleza, golden ratio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo',
    description: 'La secuencia de Fibonacci y la proporción áurea explicadas visualmente: de los pétalos a las galaxias.',
    url: 'https://meskeia.com/visualizador-fibonacci-naturaleza/',
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
    title: 'Fibonacci en la Naturaleza - Explicador Visual',
    description: '1, 1, 2, 3, 5, 8, 13... La secuencia que gobierna pétalos, conchas, galaxias y obras de arte.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Fibonacci Naturaleza meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Fibonacci en la Naturaleza - La Secuencia que Lo Conecta Todo',
  description: 'Explicador visual interactivo sobre la secuencia de Fibonacci y la proporción áurea (φ = 1,618...) en la naturaleza, el arte y el diseño. Espirales, girasoles, pétalos, conchas y más.',
  url: 'https://meskeia.com/visualizador-fibonacci-naturaleza/',
  category: 'EducationalApplication',
  features: [
    'Secuencia de Fibonacci interactiva: genera números paso a paso',
    'Espiral dorada dibujada con CSS a partir de cuadrados de Fibonacci',
    'Fibonacci en plantas: girasoles, piñas, piñones, pétalos',
    'Proporción áurea en arte, arquitectura y diseño',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la secuencia de Fibonacci?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La secuencia de Fibonacci es una serie numérica en la que cada término es la suma de los dos anteriores: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34… Fue descrita por el matemático italiano Leonardo de Pisa (Fibonacci) en el siglo XIII. Al dividir un término entre el anterior, la razón se aproxima cada vez más a φ (phi) = 1,618…, conocido como número o proporción áurea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué aparece Fibonacci en las plantas y flores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las plantas disponen sus hojas, semillas y pétalos según números de Fibonacci porque esa distribución maximiza la exposición a la luz y minimiza el solapamiento. En los girasoles, las espirales de semillas se cuentan en parejas de números de Fibonacci consecutivos —típicamente 34 y 55, o 55 y 89— lo que permite el empaquetado más eficiente posible. Este fenómeno se llama filotaxis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la proporción áurea y para qué se usa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La proporción áurea (φ ≈ 1,618) es la relación entre dos cantidades tal que la mayor es a la menor como la suma de ambas es a la mayor. Se aplica en arquitectura (Partenón, pirámides), pintura (obras de Da Vinci), diseño gráfico y tipografía para crear composiciones visualmente equilibradas. También aparece en la espiral logarítmica de conchas de nautilus y galaxias.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Aparece la secuencia de Fibonacci solo en la naturaleza o también en matemáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Fibonacci tiene una presencia profunda en las matemáticas puras: los números de Fibonacci son coprimos consecutivos, aparecen en la identidad de Cassini, en la teoría de números y en algoritmos de búsqueda (Fibonacci search). En la naturaleza se observan en piñas, alcachofas, conchas y poblaciones de conejos, que fue el ejemplo original con el que Fibonacci formuló la serie.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se dibuja la espiral dorada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La espiral dorada se construye dibujando cuadrados cuyos lados son números de Fibonacci consecutivos (1, 1, 2, 3, 5, 8…) y trazando un arco de cuarto de círculo en cada uno. Al encadenarse, los arcos forman una espiral logarítmica cuyo factor de crecimiento por vuelta es φ. Es una aproximación a la espiral equiangular que aparece en conchas de nautilus y en el enrrollamiento de las galaxias espirales.',
      },
    },
  ],
};
