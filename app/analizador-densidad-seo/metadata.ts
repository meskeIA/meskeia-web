import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Analizador de Densidad de Palabras Clave SEO | meskeIA',
  description: 'Analiza la densidad de keywords en tu texto. Detecta sobreoptimización, calcula frecuencia de palabras y optimiza tu contenido para SEO on-page.',
  keywords: 'densidad palabras clave, keyword density, seo, on-page, analizador, frecuencia, optimizacion, contenido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador de Densidad SEO - meskeIA',
    description: 'Analiza y optimiza la densidad de palabras clave en tu contenido',
    url: 'https://meskeia.com/analizador-densidad-seo/',
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
    title: 'Analizador de Densidad SEO - meskeIA',
    description: 'Herramienta gratuita para analizar keywords y optimizar SEO on-page',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Analizador Densidad SEO meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador de Densidad SEO",
  description: "Analiza la densidad de keywords en tu texto. Detecta sobreoptimización, calcula frecuencia de palabras y optimiza tu contenido para SEO on-page.",
  url: "https://meskeia.com/analizador-densidad-seo/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la densidad de palabras clave en SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La densidad de palabras clave es el porcentaje de veces que un término aparece en un texto respecto al total de palabras. Se calcula como (número de apariciones / total de palabras) × 100. Un valor entre el 1 % y el 3 % suele considerarse natural; por encima del 4-5 % puede interpretarse como sobreoptimización y derivar en penalizaciones algorítmicas de Google.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la densidad de keywords óptima para SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No existe un valor exacto universal. Google ha indicado en múltiples ocasiones que no usa la densidad de palabras clave como factor de ranking directo. Sin embargo, el consenso de la industria SEO sugiere mantener la keyword principal entre el 1 % y el 2 % para evitar que el texto suene forzado o sea penalizado por relleno de palabras clave (keyword stuffing).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el analizador de densidad SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pega o escribe tu texto en la herramienta y esta cuenta automáticamente todas las palabras, elimina las stopwords (artículos, preposiciones y conjunciones sin valor SEO) y muestra la frecuencia y densidad de cada término. También detecta las palabras más repetidas y alerta si alguna supera umbrales de sobreoptimización.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las stopwords y por qué se excluyen del análisis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las stopwords son palabras de función gramatical sin valor semántico para los motores de búsqueda: artículos (el, la, un), preposiciones (de, en, con), conjunciones (y, o, pero) y pronombres. Los buscadores las ignoran al indexar contenido porque no aportan información sobre el tema. Excluirlas del análisis de densidad da una visión más real de las palabras clave relevantes del texto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La densidad de palabras clave afecta al posicionamiento en Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'De forma directa, Google no usa la densidad como señal de ranking. Sin embargo, un texto con densidad natural y semánticamente rico (usando sinónimos y términos relacionados) tiende a posicionar mejor que uno con una sola keyword repetida mecánicamente. El algoritmo de Google premia la relevancia semántica global del contenido, no la repetición de una palabra concreta.',
      },
    },
  ],
};
