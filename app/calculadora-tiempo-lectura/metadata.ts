import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Tiempo de Lectura - Estima Minutos de Lectura | meskeIA',
  description: 'Calcula el tiempo de lectura y escucha de tus textos. Estadísticas de estructura, densidad y recomendaciones por tipo de contenido.',
  keywords: 'tiempo lectura, reading time, minutos lectura, palabras por minuto, ppm, blog, articulo, contenido',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Tiempo de Lectura',
    description: 'Estima cuánto tardarán tus lectores en consumir tu contenido',
    url: 'https://meskeia.com/calculadora-tiempo-lectura/',
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
    title: 'Calculadora de Tiempo de Lectura',
    description: 'Calcula minutos de lectura y escucha de tus textos',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Tiempo de Lectura",
  description: "Calcula el tiempo de lectura y escucha de tus textos. Estadísticas de estructura, densidad y recomendaciones por tipo de contenido.",
  url: "https://meskeia.com/calculadora-tiempo-lectura/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿A cuántas palabras por minuto lee una persona adulta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La velocidad media de lectura de un adulto en español se sitúa entre 200 y 250 palabras por minuto (ppm) en lectura silenciosa comprensiva. Los lectores habituales pueden alcanzar entre 300 y 400 ppm, mientras que quienes practican técnicas de lectura rápida superan las 600 ppm, aunque con menor retención. Para lectura en voz alta, la velocidad cae a unos 130-150 ppm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto debe durar un artículo de blog para posicionar bien en Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estudios de SEO sitúan la longitud ideal de un artículo que aspira a posicionar entre 1.500 y 2.500 palabras, lo que equivale a unos 6-12 minutos de lectura. Sin embargo, la longitud óptima depende de la intención de búsqueda: para consultas informativas complejas conviene más extensión, mientras que para búsquedas de respuesta rápida un texto de 500-800 palabras puede rendir mejor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer el tiempo de lectura de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Conocer el tiempo de lectura ayuda a gestionar las expectativas del lector y puede aumentar el tiempo de permanencia en la página. Publicar el tiempo estimado al inicio del artículo (como hacen medios como Medium o El País) reduce la tasa de rebote porque el lector decide si tiene tiempo antes de empezar. También es útil para planificar newsletters, guiones de vídeo y presentaciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el tiempo de escucha de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tiempo de escucha se calcula dividiendo el número de palabras del texto entre la velocidad media de locución, que habitualmente se estima en 130 palabras por minuto para presentaciones y 150 ppm para podcasts y audiolibros. Esta cifra es orientativa, ya que locutores profesionales pueden hablar a 160-180 ppm. Es especialmente útil para adaptar guiones a duración fija (spots publicitarios, conferencias).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Varía el tiempo de lectura según el tipo de contenido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el tiempo de lectura real varía según la complejidad del texto. Un texto técnico con terminología especializada puede tardar el doble que un artículo periodístico de igual extensión. Los lectores también ralentizan ante tablas, listas o gráficos que requieren interpretación. Por eso las calculadoras de tiempo de lectura más precisas ajustan la estimación según la densidad léxica y la estructura del contenido.',
      },
    },
  ],
};
