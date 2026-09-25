import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { verbosIrregulares } from '@/data/verbos-irregulares';

/**
 * Verbos que el quiz PREGUNTA: el banco tiene 75, pero `show` sale del sorteo (hallazgo 316),
 * y la metadata prometía «75 verbos» (hallazgo 1840). La cifra sale del banco, no a mano.
 */
const N = verbosIrregulares.filter((v) => !v.pastSimpleRegular).length;

export const metadata: Metadata = {
  title: 'Quiz Verbos Irregulares en Inglés - Past Simple A1 a B2 | meskeIA',
  description: `Aprende los verbos irregulares en inglés con este quiz interactivo. ${N} verbos clasificados por nivel MCER (A1-B2), opción múltiple con conjugación completa. Sin registro.`,
  keywords: 'verbos irregulares ingles, quiz ingles, past simple ejercicios, past participle, aprender ingles, quiz verbos irregulares, inglés nivel A1 A2 B1 B2, ejercicios verbos irregulares',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Quiz Verbos Irregulares en Inglés | meskeIA',
    description: `Practica los verbos irregulares en inglés: ${N} verbos de A1 a B2, opción múltiple, sin registro.`,
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
    description: `Aprende los verbos irregulares en inglés: ${N} verbos, niveles A1-B2, sin publicidad.`,
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Quiz Verbos Irregulares meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Quiz Verbos Irregulares Inglés",
  description: `Aprende los verbos irregulares en inglés con este quiz interactivo. ${N} verbos clasificados por nivel MCER (A1-B2), opción múltiple con conjugación completa. Sin registro.`,
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
        // Hallazgo 1843: esta lista no coincidía con la de la página. Es la de los 10 verbos
        // más frecuentes del Oxford English Corpus, en su orden, y la página da la misma.
        text: `El inglés tiene alrededor de 200 verbos irregulares, aunque en la práctica cotidiana se utilizan principalmente unos 75-100. En el Oxford English Corpus, los 10 verbos más frecuentes del inglés son todos irregulares: be, have, do, say, get, make, go, know, take y see. Este quiz pregunta ${N} verbos clasificados por nivel MCER, desde los esenciales de A1 hasta los menos habituales de B2.`,
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
        text: 'Los verbos irregulares son imprescindibles desde el nivel A1, donde se aprenden los más básicos (be, have, go, come). A medida que se avanza hacia B1 y B2 aparecen verbos más complejos y menos frecuentes. Las tres formas (infinitivo, past simple, past participle) se evalúan en exámenes oficiales como A2 Key, B1 Preliminary o B2 First de Cambridge (antes KET, PET y FCE).',
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
        text: 'La repetición espaciada ayuda: practicar un poco cada día en lugar de estudiar muchos de una vez. Agrupar los verbos por patrones sonoros también ayuda (bring/brought, buy/bought, think/thought). Complementar la práctica con lectura y escucha de contenidos reales en inglés acelera la retención porque el cerebro asocia las formas con contextos reales.',
      },
    },
  ],
};
