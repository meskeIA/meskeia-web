import { Metadata } from 'next';

const title = 'Test de Bienestar WHO-5 — Índice de Bienestar de la OMS | meskeIA';
const description = 'Escala WHO-5 de la Organización Mundial de la Salud: 5 preguntas para evaluar tu bienestar subjetivo en las últimas 2 semanas. Gratuito, validado y con recursos de ayuda.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'test bienestar WHO-5, escala bienestar OMS, indice bienestar subjetivo, como estoy emocionalmente, test bienestar emocional, WHO-5 español, evaluacion bienestar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Bienestar WHO-5 | meskeIA',
    description,
    url: 'https://meskeia.com/test-bienestar-who5/',
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
    title: 'Test de Bienestar WHO-5 | meskeIA',
    description: 'Escala de bienestar de la OMS: 5 preguntas, 2 minutos, con recursos de ayuda',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Test de Bienestar WHO-5',
  description,
  url: 'https://meskeia.com/test-bienestar-who5/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el test WHO-5 y qué mide exactamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El WHO-5 (Índice de Bienestar de la OMS) es una escala de 5 preguntas desarrollada por la Organización Mundial de la Salud para medir el bienestar subjetivo de las últimas dos semanas. Evalúa estado de ánimo positivo, calma, vitalidad, sueño reparador y actividades cotidianas. La puntuación va de 0 a 100: por debajo de 50 indica malestar significativo y por debajo de 28 sugiere depresión probable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es el WHO-5 un test clínico oficial o solo orientativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El WHO-5 es una herramienta de cribado validada científicamente y utilizada en investigación y atención primaria en más de 30 países. No es un diagnóstico clínico: sirve para detectar señales de alerta y decidir si consultar con un profesional de salud mental. Una puntuación baja no confirma ningún trastorno, igual que una puntuación alta no descarta problemas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpreta la puntuación del WHO-5?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada pregunta se puntúa de 0 (nunca) a 5 (siempre). La suma de las 5 preguntas (máximo 25) se multiplica por 4 para obtener un índice de 0 a 100. Puntuaciones de 76-100 indican buen bienestar; 51-75, bienestar moderado; 26-50, malestar significativo; y 0-25, probable depresión. Ante cualquier duda, se recomienda consultar a un médico o psicólogo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil hacer el test de bienestar WHO-5?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cualquier persona adulta puede usar el WHO-5 para hacer un seguimiento periódico de su bienestar emocional. Es especialmente útil en momentos de estrés laboral, cambios vitales importantes, dificultades para dormir o sensación persistente de cansancio o tristeza. También se usa en empresas, centros de salud y estudios de investigación como herramienta de seguimiento colectivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia se recomienda hacer el test WHO-5?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La OMS recomienda aplicarlo con una periodicidad mínima de dos semanas, ya que las preguntas se refieren a ese período concreto. Para seguimiento personal es habitual hacerlo cada 4-6 semanas y comparar las puntuaciones a lo largo del tiempo. En contextos clínicos suele administrarse en cada consulta de seguimiento para evaluar la evolución del paciente.',
      },
    },
  ],
};
