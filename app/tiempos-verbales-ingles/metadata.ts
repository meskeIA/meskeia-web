import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { TOTAL_EJERCICIOS, VERBOS } from './motor';

const URL = 'https://meskeia.com/tiempos-verbales-ingles/';

export const metadata: Metadata = {
  title: 'Tiempos Verbales en Inglés: Ejercicios con Corrección | meskeIA',
  description: 'Ejercicios corregidos de tiempos verbales en inglés con la regla de cada caso: present simple, continuous, past, present perfect, will y going to. Y conjugador.',
  keywords: 'tiempos verbales en ingles, ejercicios tiempos verbales ingles, present simple vs present continuous, past simple vs present perfect, will vs going to, conjugador ingles, ejercicios de ingles con respuestas, verbos de estado ingles',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tiempos Verbales en Inglés: Ejercicios con Corrección',
    description: `${TOTAL_EJERCICIOS} ejercicios numerados de tiempos verbales en inglés, corregidos con la regla de cada caso, y un conjugador de siete tiempos.`,
    url: URL,
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tiempos Verbales en Inglés: Ejercicios con Corrección',
    description: `${TOTAL_EJERCICIOS} ejercicios numerados de tiempos verbales en inglés con corrección y explicación, y un conjugador.`,
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Tiempos Verbales en Inglés meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ejercicios de tiempos verbales en inglés',
  description: `Práctica de tiempos verbales en inglés con ${TOTAL_EJERCICIOS} ejercicios numerados de completar huecos, corregidos al momento con la forma correcta y la regla que la explica. Incluye un conjugador de ${VERBOS.length} verbos en siete tiempos y tres formas.`,
  url: URL,
  category: 'EducationalApplication',
  features: [
    `${TOTAL_EJERCICIOS} ejercicios numerados para asignar por número (por ejemplo, «3, 7, 11» o «5-9»)`,
    'Present simple frente a continuous, past simple frente a continuous, past simple frente a present perfect, y will frente a be going to',
    'Corrección que admite contracciones y formas completas (doesn\'t / does not, I\'ll / will)',
    'Explicación de cada respuesta: por qué va ese tiempo y cómo se forma',
    'Modo escribir y modo elegir entre cuatro opciones',
    `Conjugador de ${VERBOS.length} verbos en siete tiempos: afirmativa, negativa e interrogativa con los siete sujetos`,
    'Funciona en el navegador, sin registro',
  ],
});

/**
 * FAQ: FUENTE ÚNICA de la FAQ visible (page.tsx la pinta desde aquí) y del FAQPage JSON-LD.
 * Texto plano, sin marcado.
 */
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuál es la diferencia entre present simple y present continuous?',
    answer: 'El present simple habla de costumbres, hechos generales y horarios (She visits her grandmother every Sunday). El present continuous habla de lo que está pasando ahora o en esta temporada (Look! It is raining). Marcadores típicos: usually, every day, always para el simple; now, at the moment, Look! o Listen! para el continuous.',
  },
  {
    question: '¿Qué son los verbos de estado y por qué no van en continuo?',
    answer: 'Son verbos que expresan estados y no acciones: know, like, want, need, believe o have con el sentido de poseer. Se usan en present simple aunque hables de este momento: I know the answer, nunca I am knowing the answer. Algunos cambian de sentido en continuo: I have a car (poseer) frente a I am having breakfast (tomar).',
  },
  {
    question: '¿Cuándo se usa el present perfect y cuándo el past simple?',
    answer: 'El past simple va con un momento terminado y concreto: yesterday, last week, in 1975, two years ago, o una pregunta con When. El present perfect une el pasado con el presente sin decir cuándo: experiencias (I have never been to Lima), situaciones que siguen (since, for, How long) y resultados hasta ahora (so far). Nunca se dice I have seen it last week.',
  },
  {
    question: '¿Cuál es la diferencia entre will y be going to?',
    answer: 'Will se usa para decisiones tomadas en el momento de hablar, ofrecimientos y promesas (The phone is ringing. I will answer it). Be going to se usa para planes decididos antes (She is going to paint her bedroom) y predicciones basadas en lo que se ve (Look at those clouds! It is going to rain).',
  },
  {
    question: '¿Se admiten las contracciones en las respuestas?',
    answer: 'Sí. El corrector acepta la forma completa y la contraída (doesn\'t like y does not like, won\'t tell y will not tell), con mayúsculas o sin ellas y con el apóstrofo recto o tipográfico. Si la frase lleva un pronombre justo antes del hueco, también vale escribirlo con la contracción, como I\'ll answer o It\'s raining. No se admite amn\'t, que no existe: se dice I\'m not.',
  },
  {
    question: '¿Cómo puede un profesor asignar ejercicios concretos?',
    answer: `Cada ejercicio tiene un número fijo, del 1 al ${TOTAL_EJERCICIOS}, que se ve en pantalla. Basta con escribir en «Ejercicios por número» la lista que se quiere, como 3, 7, 11 o un intervalo como 5-9, y la app los presenta en ese orden. Al terminar, el resultado muestra los números de los ejercicios fallados para repasarlos.`,
  },
];

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};
