import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Analizador GEO/AEO - Optimiza tu Contenido para IAs | meskeIA',
  description: 'Analiza y optimiza tu contenido para ser citado por ChatGPT, Perplexity, Gemini y Google AI Overviews. Puntuación GEO, análisis E-E-A-T, estructura y citabilidad.',
  keywords: 'GEO, AEO, optimización IA, ChatGPT SEO, Perplexity, Gemini, AI Overviews, E-E-A-T, citabilidad, contenido para IAs, generative engine optimization, answer engine optimization',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Analizador GEO/AEO - Optimiza para IAs - meskeIA',
    description: 'Analiza tu contenido para ser citado por ChatGPT, Perplexity y otras IAs. Puntuación GEO y recomendaciones.',
    url: 'https://meskeia.com/analizador-geo/',
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
    title: 'Analizador GEO/AEO - Optimiza para IAs',
    description: 'Analiza y mejora tu contenido para ser citado por ChatGPT, Perplexity y Google AI.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Analizador GEO/AEO meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Analizador GEO/AEO",
  description: "Analiza y optimiza tu contenido para ser citado por ChatGPT, Perplexity, Gemini y Google AI Overviews. Puntuación GEO, análisis E-E-A-T, estructura y citabilidad.",
  url: "https://meskeia.com/analizador-geo/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es GEO (Generative Engine Optimization) y en qué se diferencia del SEO tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'GEO (Generative Engine Optimization) es la disciplina de optimizar contenido para que sea citado o resumido por motores de respuesta basados en inteligencia artificial como ChatGPT, Perplexity, Gemini o los AI Overviews de Google. A diferencia del SEO tradicional, que busca posicionar páginas en una lista de resultados clásica, el GEO persigue que la IA seleccione tu contenido como fuente de sus respuestas. Los factores clave son la autoridad demostrable (E-E-A-T), la estructura clara, la densidad de datos verificables y la citabilidad directa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es AEO (Answer Engine Optimization)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AEO, o Answer Engine Optimization, es el conjunto de técnicas orientadas a que un contenido aparezca como respuesta directa en motores de búsqueda y asistentes de IA. Incluye la optimización de fragmentos destacados (featured snippets), posición cero en Google, respuestas en Bing Chat y citas en sistemas como Perplexity. Es un término más amplio que GEO pero ambos comparten el objetivo de ser la fuente que responde preguntas de usuarios, no solo la que aparece en el ranking.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo mejorar la puntuación GEO de mi contenido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores que más influyen en la citabilidad por IAs son: usar estructura clara con encabezados descriptivos (H2/H3), incluir datos concretos con fuentes atribuibles, responder preguntas directas al inicio de cada sección, añadir marcado Schema.org relevante (FAQPage, HowTo, Article), mantener actualizado el contenido y demostrar experiencia o autoría experta (E-E-A-T). También ayuda tener una buena reputación de dominio y enlaces entrantes de calidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de contenido es más útil este analizador GEO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para artículos de blog, páginas de servicio, guías explicativas, FAQs y landing pages informativas. Cualquier contenido cuyo objetivo sea responder preguntas de usuarios y aparecer citado en resúmenes de IA se beneficia del análisis. No es relevante para páginas de tienda, fichas de producto sin contenido textual o páginas de inicio puramente de marca.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es E-E-A-T y por qué lo tienen en cuenta las IAs para citar contenido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'E-E-A-T son las siglas de Experience (Experiencia), Expertise (Pericia), Authoritativeness (Autoridad) y Trustworthiness (Confiabilidad), un marco de calidad introducido por Google en sus directrices de evaluación. Las IAs generativas tienden a priorizar contenido de fuentes con alta puntuación E-E-A-T porque reduce el riesgo de citar información errónea. Para mejorarla: muestra la autoría con nombres reales y credenciales, cita fuentes primarias, actualiza el contenido regularmente y consigue menciones en medios de referencia.',
      },
    },
  ],
};
