import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Quiz Verbos Irregulares en Inglés - Past Simple A1 a B2 | meskeIA',
  description: 'Aprende los verbos irregulares en inglés con este quiz interactivo. 75 verbos clasificados por nivel MCER (A1-B2), opción múltiple con conjugación completa. Sin registro.',
  keywords: 'verbos irregulares ingles, quiz ingles, past simple ejercicios, past participle, aprender ingles, quiz verbos irregulares, inglés nivel A1 A2 B1 B2, ejercicios verbos irregulares',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Verbos Irregulares en Inglés | meskeIA',
    description: 'Practica los verbos irregulares en inglés: 75 verbos de A1 a B2, opción múltiple, sin registro.',
    url: 'https://meskeia.com/quiz-verbos-irregulares/',
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
    title: 'Quiz Verbos Irregulares en Inglés | meskeIA',
    description: 'Aprende los verbos irregulares en inglés: 75 verbos, niveles A1-B2, sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Verbos Irregulares meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Verbos Irregulares Inglés",
  description: "Aprende los verbos irregulares en inglés con este quiz interactivo. 75 verbos clasificados por nivel MCER (A1-B2), opción múltiple con conjugación completa. Sin registro.",
  url: "https://meskeia.com/quiz-verbos-irregulares/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos verbos irregulares hay en inglés y cuáles son los más importantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El inglés tiene alrededor de 200 verbos irregulares de uso frecuente, aunque en la práctica cotidiana se utilizan principalmente unos 75-100. Los más importantes por frecuencia de uso son: be, have, do, go, say, get, make, know, think y come. Este quiz incluye 75 verbos clasificados por nivel MCER, desde los esenciales de A1 hasta los menos habituales de B2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el Past Simple y el Past Participle de los verbos irregulares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Past Simple se usa para acciones completadas en un momento específico del pasado (I went to school yesterday). El Past Participle se combina con auxiliares para formar tiempos compuestos como el Present Perfect (I have gone) o la voz pasiva (It was written). Para muchos verbos irregulares ambas formas coinciden (bought / bought), pero en otros son distintas (go → went → gone).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel de inglés es útil practicar los verbos irregulares?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los verbos irregulares son imprescindibles desde el nivel A1, donde se aprenden los más básicos (be, have, go, come). A medida que se avanza hacia B1 y B2 aparecen verbos más complejos y menos frecuentes. Dominar las tres formas (infinitivo, past simple, past participle) es obligatorio para superar exámenes oficiales como Cambridge KET, PET o FCE.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el quiz de verbos irregulares?',
      acceptedAnswer: {
        '@type': 'Answer',
        // Hallazgo 313: esta respuesta prometía que el quiz pregunta «Past Simple o Past
        // Participle», y solo pregunta el pasado simple. Es la señal estructurada que leen
        // Bing Copilot, ChatGPT y Perplexity, así que la promesa falsa viajaba lejos.
        text: 'El quiz muestra el verbo en infinitivo y pide seleccionar su Past Simple entre cuatro opciones. Al responder se indica si es correcta y se muestra la conjugación completa del verbo —infinitivo, pasado y participio—, de modo que el participio se estudia en el repaso aunque no sea lo que se pregunta. Puedes filtrar por nivel MCER (A1, A2, B1, B2) para adaptar la dificultad a tu nivel actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la mejor forma de memorizar los verbos irregulares en inglés?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La repetición espaciada es el método más eficaz: practicar un poco cada día en lugar de estudiar muchos de una vez. Agrupar los verbos por patrones sonoros también ayuda (bring/brought, buy/bought, think/thought). Complementar la práctica con lectura y escucha de contenidos reales en inglés acelera la retención porque el cerebro asocia las formas con contextos reales.',
      },
    },
  ],
};
