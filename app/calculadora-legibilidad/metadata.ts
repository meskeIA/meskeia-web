import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Legibilidad - Índices Flesch para Español | meskeIA',
  description: 'Analiza la legibilidad de tus textos en español con índices Flesch-Szigriszt, Fernández Huerta e INFLESZ. Descubre el nivel educativo de tu contenido.',
  keywords: 'legibilidad, flesch, szigriszt, fernandez huerta, inflesz, readability, texto, español, nivel lectura, seo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Legibilidad - Índices Flesch para Español',
    description: 'Analiza la legibilidad de tus textos con fórmulas adaptadas al español',
    url: 'https://meskeia.com/calculadora-legibilidad/',
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
    title: 'Calculadora de Legibilidad',
    description: 'Mide la facilidad de lectura de tus textos en español',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Legibilidad",
  description: "Analiza la legibilidad de tus textos en español con índices Flesch-Szigriszt, Fernández Huerta e INFLESZ. Descubre el nivel educativo de tu contenido.",
  url: "https://meskeia.com/calculadora-legibilidad/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el índice de legibilidad de un texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice de legibilidad es una medida numérica que estima la facilidad con la que un lector medio puede comprender un texto. Se calcula a partir de variables como la longitud media de las frases y la cantidad de sílabas por palabra. Un índice alto indica que el texto es fácil de leer, mientras que un índice bajo señala que requiere un nivel educativo más elevado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre Flesch-Szigriszt y Fernández Huerta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas son adaptaciones de la fórmula original de Rudolf Flesch para el idioma español. Szigriszt ajustó los coeficientes en 1993 para el español estándar, mientras que Fernández Huerta realizó una adaptación anterior (1959) con una escala ligeramente diferente. La fórmula INFLESZ unifica ambos enfoques y es la más utilizada en entornos académicos y sanitarios españoles para evaluar documentos de pacientes y materiales educativos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué nivel de legibilidad debo buscar para mi blog o web?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para contenido web dirigido al público general se recomienda una puntuación INFLESZ de "Normal" o "Bastante fácil", equivalente a un nivel de bachillerato. Los textos de prensa generalista suelen situarse entre 60 y 70 puntos en la escala Flesch-Szigriszt. Los documentos técnicos o científicos pueden tener puntuaciones más bajas, pero en ese caso convienen resúmenes introductorios más accesibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué profesiones es útil medir la legibilidad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para redactores de contenido, periodistas, docentes, personal sanitario que redacta consentimientos informados, y equipos de comunicación corporativa. En el ámbito SEO ayuda a mejorar el tiempo de permanencia en página, ya que los textos más legibles reducen la tasa de rebote. También se usa en accesibilidad web para garantizar que las personas con dislexia o bajo nivel educativo puedan comprender el contenido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo mejorar la legibilidad de mi texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las técnicas más efectivas son usar frases cortas (menos de 20 palabras de media), optar por palabras comunes en lugar de tecnicismos, dividir párrafos largos y emplear subtítulos frecuentes. Evitar la voz pasiva y las construcciones subordinadas largas también ayuda notablemente. Reducir la longitud media de las palabras (eligiendo sinónimos más cortos) tiene un impacto directo en el índice Flesch.',
      },
    },
  ],
};
