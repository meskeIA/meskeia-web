import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { TOTAL_EJERCICIOS } from './motor';

const DESCRIPCION =
  'Escribe una cifra y mira cómo se dice en inglés: palabras, ordinal, año y decimales, en inglés americano y británico. Con ejercicios numerados y corrección.';

export const metadata: Metadata = {
  title: 'Números en Inglés: Conversor a Palabras, Ordinales y Práctica | meskeIA',
  description: DESCRIPCION,
  keywords:
    'números en inglés, números ordinales en inglés, números en inglés del 1 al 100, cómo se escriben los números en inglés, números en inglés en letras, años en inglés, decimales en inglés, billion en español, ejercicios de números en inglés',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Números en Inglés: conversor y ejercicios',
    description: 'Cómo se escribe y se lee cualquier cifra en inglés: cardinal, ordinal, año y decimales, con ejercicios numerados.',
    url: 'https://meskeia.com/numeros-en-ingles/',
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
    title: 'Números en Inglés: conversor y ejercicios',
    description: 'Cómo se escribe y se lee cualquier cifra en inglés, en americano y británico, con ejercicios corregidos.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Números en Inglés meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Números en Inglés: conversor a palabras y práctica',
  description:
    'Convierte cualquier cifra de 0 a 999.999.999.999, con decimales, a palabras en inglés americano (one hundred five) y británico (one hundred and five), con su ordinal (21st, twenty-first), su lectura como año (nineteen oh five) y su notación inglesa (1,234.5). Incluye ejercicios numerados de cardinales, ordinales, años, decimales y grandes cifras, con corrección y la regla de cada caso.',
  url: 'https://meskeia.com/numeros-en-ingles/',
  category: 'EducationalApplication',
  features: [
    'Conversor de cifras a palabras en inglés americano y británico, de 0 a 999.999.999.999 y con decimales',
    'Ordinal en cifra y en palabras (1st, 2nd, 3rd, 11th, twenty-first, one hundredth)',
    'Lectura de los años de 1100 a 2099 (nineteen ninety-nine, nineteen oh five, twenty ten)',
    'Notación inglesa de la cifra (coma de millares y punto decimal) y aviso de que billion son mil millones',
    `${TOTAL_EJERCICIOS} ejercicios numerados para que un profesor los asigne por número`,
    'Modo escribir con corrección que admite las variantes válidas, y modo de elegir entre cuatro opciones',
    'Explicación de la regla aplicada a cada ejercicio tras responder',
  ],
});

// FAQ: fuente única de la FAQ visible (page.tsx la pinta) y del FAQPage JSON-LD. Texto plano.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo se escriben los números del 21 al 99 en inglés?',
    answer:
      'Con la decena y la unidad unidas por un guion: twenty-one, thirty-five, ninety-nine. Las decenas exactas van solas (twenty, forty, ninety). Ojo con forty, que se escribe sin u aunque four y fourteen la llevan.',
  },
  {
    question: '¿Se dice «one hundred five» o «one hundred and five»?',
    answer:
      'Las dos son correctas. El inglés británico pone and delante de las decenas y unidades (one hundred and five, two thousand and ten); el americano suele omitirlo (one hundred five). Al empezar el número también vale a en lugar de one: a hundred, a thousand.',
  },
  {
    question: '¿Cómo se forman los números ordinales en inglés?',
    answer:
      'Se añade -th al número (fourth, sixth, hundredth), con excepciones: first, second y third son irregulares; fifth y twelfth cambian -ve por -f; eighth lleva una sola t; ninth pierde la e, y las decenas cambian -y por -ieth (twentieth). En los compuestos solo la última palabra es ordinal: twenty-first. Abreviados, copian las dos últimas letras: 1st, 2nd, 3rd, 4th, y 11th, 12th y 13th van con -th.',
  },
  {
    question: '¿Un billion en inglés es un billón en español?',
    answer:
      'No. El inglés usa la escala corta: a billion son mil millones (10⁹), y un billón español (un millón de millones, 10¹²) es a trillion. Es una de las confusiones más frecuentes al traducir cifras de economía o de población.',
  },
  {
    question: '¿Cómo se leen los años en inglés?',
    answer:
      'Por parejas de cifras: 1999 es nineteen ninety-nine y 1865 eighteen sixty-five. Si acaba en 00 se dice hundred (1900, nineteen hundred) y si la segunda pareja va del 01 al 09 el cero se lee oh (1905, nineteen oh five). El 2000 es two thousand; del 2001 al 2009 se leen como el número (two thousand and five), y desde 2010 se oyen las dos formas: twenty ten o two thousand and ten.',
  },
  {
    question: '¿Por qué en inglés se escribe 1,234.5 y no 1.234,5?',
    answer:
      'Porque el inglés usa la coma para separar los millares y el punto para los decimales, al revés que el español. 1.234,5 en español se escribe 1,234.5 en inglés, y la coma decimal se lee point: three point five. Las cifras detrás del punto se dicen una a una: 0.25 es zero point two five.',
  },
  {
    question: '¿Cómo puede un profesor asignar ejercicios concretos?',
    answer: `Los ${TOTAL_EJERCICIOS} ejercicios tienen un número fijo que se ve en pantalla. Basta con indicar, por ejemplo, «haz los ejercicios 3, 7 y 11» o «del 26 al 34»: el alumno los escribe en el campo Ejercicios por número y la práctica le pone exactamente esos, en ese orden, con la lista de los que falla al terminar.`,
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
