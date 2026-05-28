import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Palabras Clave SEO - Ideas Long Tail | meskeIA',
  description: 'Genera ideas de palabras clave long-tail a partir de una semilla. Variaciones, preguntas, comparativas y sugerencias organizadas por categoría.',
  keywords: 'palabras clave, keywords, seo, long tail, generador, ideas, contenido, semrush, ahrefs, google',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Palabras Clave SEO - meskeIA',
    description: 'Genera cientos de ideas de keywords long-tail para tu estrategia SEO',
    url: 'https://meskeia.com/generador-palabras-clave/',
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
    title: 'Generador de Palabras Clave SEO - meskeIA',
    description: 'Herramienta gratuita para generar ideas de keywords y long-tails',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador Palabras Clave meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Palabras Clave",
  description: "Genera ideas de palabras clave long-tail a partir de una semilla. Variaciones, preguntas, comparativas y sugerencias organizadas por categoría.",
  url: "https://meskeia.com/generador-palabras-clave/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las palabras clave long-tail y por qué son importantes para el SEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las palabras clave long-tail son frases de búsqueda específicas con 3 o más palabras, como "mejores zapatillas para correr en asfalto". Tienen menor volumen de búsqueda que las keywords genéricas, pero mayor intención de compra y menos competencia, lo que facilita posicionarse en los primeros resultados de Google. Estudios de Ahrefs indican que el 92% de todas las búsquedas son long-tail.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona un generador de palabras clave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de palabras clave toma una palabra semilla (por ejemplo, "yoga") y produce variaciones sistemáticas: preguntas (¿cómo empezar yoga en casa?), comparativas (yoga vs pilates), modificadores de intención (yoga para principiantes, yoga online gratis) y combinaciones con términos de búsqueda frecuentes. El resultado es una lista estructurada de ideas para tu estrategia de contenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil un generador de palabras clave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para creadores de contenido que buscan ideas para artículos de blog, para responsables de SEO que planifican estrategias de contenido, para gestores de publicidad de pago (Google Ads, Meta) que necesitan ampliar grupos de palabras, y para emprendedores que quieren entender qué buscan sus clientes potenciales antes de crear un producto o servicio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un generador de palabras clave y herramientas como Semrush o Ahrefs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Herramientas como Semrush o Ahrefs ofrecen datos reales de volumen de búsqueda, dificultad de posicionamiento y coste por clic (CPC) con suscripciones de pago que parten de 100-130 €/mes. Un generador de palabras clave gratuito proporciona ideas y variaciones sin datos cuantitativos, lo que lo hace ideal para la fase de brainstorming o para quienes están comenzando con el SEO sin presupuesto para herramientas premium.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras clave debería usar en un artículo para posicionar bien?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La práctica recomendada es enfocarse en una keyword principal por artículo y complementarla con 3-5 variaciones semánticas o sinónimos relacionados. No se trata de repetir la misma frase muchas veces (keyword stuffing), sino de cubrir el tema con profundidad para que Google entienda de qué trata el contenido. Lo más importante es responder la intención de búsqueda del usuario de forma completa.',
      },
    },
  ],
};
