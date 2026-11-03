import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { TOTAL_EJERCICIOS, rangoDe } from './motor';

export const metadata: Metadata = {
  title: 'Preposiciones en Inglés in, on, at: Ejercicios de Tiempo y Lugar | meskeIA',
  description: `Ejercicios de preposiciones en inglés in, on, at: ${TOTAL_EJERCICIOS} frases numeradas de tiempo, lugar y sin preposición, corregidas con la regla de cada caso. Sin registro.`,
  keywords: 'preposiciones en inglés, preposiciones de lugar en inglés, preposiciones de tiempo en inglés, in on at, ejercicios in on at, in on at ejercicios, preposiciones in on at, at the weekend on the weekend, prepositions of time and place',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Preposiciones en Inglés in, on, at: Ejercicios',
    description: `${TOTAL_EJERCICIOS} ejercicios numerados de in, on, at de tiempo y lugar, con la regla que explica cada respuesta.`,
    url: 'https://meskeia.com/preposiciones-ingles/',
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
    title: 'Preposiciones en Inglés in, on, at: Ejercicios',
    description: `${TOTAL_EJERCICIOS} frases de in, on, at para practicar las preposiciones de tiempo y lugar, corregidas con su regla.`,
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Preposiciones en Inglés meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Preposiciones en inglés in, on, at: ejercicios de tiempo y lugar',
  description: `Ejercicios de preposiciones en inglés: ${TOTAL_EJERCICIOS} frases numeradas con hueco para elegir o escribir in, on, at o ninguna preposición, en tiempo, lugar y los casos sin preposición. Cada respuesta se corrige con la regla que la explica, aplicada a esa frase.`,
  url: 'https://meskeia.com/preposiciones-ingles/',
  category: 'EducationalApplication',
  features: [
    'Ejercicios numerados de in, on, at para asignar por número («haz el 3, el 7 y el 11»)',
    'Categorías de tiempo, de lugar y de expresiones sin preposición (next week, every day, go home)',
    'Modo elegir entre in, on, at y ninguna, o modo escribir la preposición',
    'Corrección con la regla aplicada a cada frase y la forma correcta completa',
    'Admite las dos variantes cuando valen: at the weekend y on the weekend, in the street y on the street',
    'Tabla de reglas de tiempo y lugar siempre a la vista',
    'Resultado con el porcentaje de acierto y los ejercicios fallados por número',
  ],
});

// FAQ: fuente única de la FAQ visible (page.tsx la pinta) y del FAQPage JSON-LD.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cuándo se usa in, on y at en inglés?',
    answer: 'Van de lo más amplio a lo más concreto. In para periodos y espacios grandes o cerrados (in July, in 2026, in the morning, in Peru, in the kitchen); on para días, fechas y superficies (on Monday, on my birthday, on the table, on the bus); at para puntos exactos de tiempo y lugar (at 8 o\'clock, at night, at the bus stop, at home).',
  },
  {
    question: '¿Se dice at the weekend u on the weekend?',
    answer: 'Las dos son correctas: at the weekend es la forma británica y on the weekend la americana. Lo que no se usa en ninguna de las dos variedades es «in the weekend». En estos ejercicios se dan por buenas at y on.',
  },
  {
    question: '¿Por qué se dice on the bus pero in the car?',
    answer: 'Con los transportes en los que se puede ir de pie o caminar por dentro (bus, tren, avión, barco) se usa on, igual que con la bici y la moto. En el coche (carro o auto) y el taxi no se puede ir de pie, y se usa in. Por eso «in the bus» es un error frecuente entre hispanohablantes.',
  },
  {
    question: '¿Cuándo no se pone preposición de tiempo en inglés?',
    answer: 'Delante de next, last, this y every (next week, last year, this morning, every day) y con today, tomorrow, yesterday y tonight. Decir «on next Monday» o «in last year» es un error. Con verbos de movimiento, home tampoco lleva preposición: go home, come home.',
  },
  {
    question: '¿Cómo uso los ejercicios numerados en clase?',
    answer: `Cada frase tiene un número fijo del 1 al ${TOTAL_EJERCICIOS} que se ve en pantalla: ${rangoDe('tiempo')} son de tiempo, ${rangoDe('lugar')} de lugar y ${rangoDe('sin')} sin preposición. Escribe en «Ejercicios por número» una lista como 3, 7, 11 o un rango como 5-9 y se juegan esos, en ese orden. Al final salen los números fallados para repetirlos.`,
  },
  {
    question: '¿Por qué es at night pero in the morning?',
    answer: 'Es una excepción: las partes del día van con in (in the morning, in the afternoon, in the evening), pero la noche en general va con at y sin artículo (at night). «In the night» existe, pero solo para una noche concreta: I woke up in the night. Si delante va el día, todo pasa a on: on Monday morning, on Friday night.',
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
