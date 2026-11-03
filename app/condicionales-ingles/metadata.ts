import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { TOTAL_EJERCICIOS } from './motor';

/** La cifra de ejercicios sale del banco del motor, no a mano. */
const N = TOTAL_EJERCICIOS;

export const metadata: Metadata = {
  title: 'Condicionales en Inglés (Conditionals): Ejercicios con Corrección | meskeIA',
  description: 'Ejercicios de condicionales en inglés: zero, first, second y third conditional y unless. Escribe o elige la forma, y cada respuesta se corrige con su regla.',
  keywords: 'condicionales inglés, condicionales en inglés ejercicios, conditionals, first conditional, second conditional, third conditional, zero conditional, unless, if clauses, ejercicios de inglés, gramática inglesa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Condicionales en Inglés: Ejercicios con Corrección',
    description: `${N} ejercicios numerados de zero, first, second y third conditional, corregidos con la regla de cada caso.`,
    url: 'https://meskeia.com/condicionales-ingles/',
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
    title: 'Condicionales en Inglés: Ejercicios con Corrección',
    description: `${N} ejercicios de conditionals (tipos 0, 1, 2 y 3) con la regla explicada en cada respuesta.`,
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Condicionales en Inglés meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Condicionales en Inglés: Ejercicios con Corrección',
  description: `Ejercicios de condicionales en inglés (zero, first, second y third conditional, con unless). ${N} ejercicios numerados para completar el hueco o decir qué tipo es, con corrección inmediata y la regla aplicada a cada caso.`,
  url: 'https://meskeia.com/condicionales-ingles/',
  category: 'EducationalApplication',
  features: [
    'Condicionales tipo 0, 1, 2 y 3 (zero, first, second y third conditional), con unless',
    `${N} ejercicios numerados que se pueden asignar por número («3, 7, 11» o «5-9»)`,
    'Completar el hueco escribiendo el verbo o eligiendo entre cuatro opciones',
    '¿Qué tipo es?: identificar el condicional de una frase completa',
    "Corrección que admite contracciones y formas completas (won't / will not, 'd / would)",
    'Explicación de la regla aplicada a cada ejercicio tras responder',
    'Tabla con las cuatro estructuras, su uso y un ejemplo',
  ],
});

// FUENTE ÚNICA de la FAQ: la pinta page.tsx y la lee el FAQPage JSON-LD de abajo.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuántos tipos de condicionales hay en inglés?',
    answer: 'Los libros de gramática enseñan cuatro: zero conditional (verdades generales: If you heat ice, it melts), first conditional (futuro probable: If it rains, we will stay at home), second conditional (hipótesis en el presente o el futuro: If I had more time, I would learn Japanese) y third conditional (pasado que no ocurrió: If I had known, I would have come). Existen además los condicionales mixtos, que combinan el 2 y el 3 y se ven en niveles avanzados.',
  },
  {
    question: '¿Cómo sé qué tipo de condicional tengo que usar?',
    answer: 'Mira el tiempo verbal de la otra cláusula. Si la principal lleva will, la cláusula con if va en present simple (tipo 1); si lleva would + infinitivo, en past simple (tipo 2); si lleva would have + participio, en past perfect (tipo 3). Si las dos van en present simple y hablan de algo que siempre se cumple, es el tipo 0.',
  },
  {
    question: '¿Por qué no se pone will después de if?',
    answer: 'Porque en inglés la cláusula con if expresa el futuro con el present simple: If it rains tomorrow, no If it will rain tomorrow. El will va en la otra cláusula: we will stay at home. Lo mismo pasa con would: If I had money, nunca If I would have money. Es el error más frecuente en los exámenes de condicionales.',
  },
  {
    question: '¿Se dice If I were o If I was?',
    answer: 'En el second conditional, con I, he, she o it valen las dos formas. En los exámenes y en el registro formal se prefiere were, y la expresión para dar consejos es fija: If I were you. Was es habitual en el inglés hablado e informal. En los ejercicios de esta página se aceptan las dos, con una nota que lo recuerda.',
  },
  {
    question: '¿Qué significa unless y cómo se usa?',
    answer: 'Unless significa «if… not», «a menos que». Unless you study, you will not pass equivale a If you do not study, you will not pass. Como unless ya es negativo, el verbo que lo sigue va en afirmativa: Unless you study, no Unless you don\'t study. Sigue las mismas reglas de tiempos que if.',
  },
  {
    question: '¿Cómo puede un profesor asignar ejercicios concretos?',
    answer: `Cada uno de los ${N} ejercicios tiene un número fijo que se ve en pantalla. En el campo «Ejercicios por número» se escriben los números separados por comas (3, 7, 11) o un intervalo (5-9), y la práctica juega exactamente esos, en ese orden. Al terminar, el resultado lista por número los ejercicios fallados.`,
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
