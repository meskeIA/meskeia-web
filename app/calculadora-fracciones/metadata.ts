import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Fracciones Paso a Paso: Operaciones Combinadas y Simplificar | meskeIA',
  description:
    'Suma, resta, multiplica, divide y eleva fracciones con el procedimiento completo: m.c.m., jerarquía de operaciones y paréntesis. Simplifica a la irreducible, compara fracciones y practica con 12 casos corregidos.',
  keywords:
    'calculadora de fracciones, calculadora fracciones, operaciones con fracciones, operaciones combinadas con fracciones, suma de fracciones, resta de fracciones, multiplicar fracciones, dividir fracciones, simplificar fracciones, fracciones equivalentes, fracción irreducible, quebrados, calculadora de quebrados, fracciones paso a paso, problemas de fracciones, ejercicios de fracciones, primaria, secundaria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-fracciones/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Fracciones Paso a Paso | meskeIA',
    description:
      'Operaciones combinadas con fracciones resueltas como en el cuaderno: m.c.m., jerarquía, paréntesis y simplificación.',
    url: 'https://meskeia.com/calculadora-fracciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Fracciones Paso a Paso | meskeIA',
    description: 'Suma, resta, multiplica, divide y simplifica fracciones con el procedimiento completo.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Fracciones meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Fracciones Paso a Paso',
  description:
    'Calculadora de fracciones que resuelve operaciones combinadas (suma, resta, multiplicación, división, potencias y paréntesis) explicando cada paso como en el cuaderno, simplifica a la fracción irreducible, da el número mixto y el decimal con su período, y compara fracciones. Incluye 12 casos para clase con corrector.',
  url: 'https://meskeia.com/calculadora-fracciones/',
  category: 'EducationalApplication',
  features: [
    'Operaciones combinadas con fracciones respetando la jerarquía y los paréntesis',
    'Procedimiento paso a paso: m.c.m., inversa para dividir y simplificación en cada paso',
    'Potencias de fracciones, también con exponente negativo',
    'Simplificación a la irreducible con descomposición en factores primos',
    'Número mixto y decimal exacto con su período (0,8333… = 0,8(3))',
    'Fracciones equivalentes y comparación de dos fracciones',
    'Admite enteros y decimales dentro de la operación',
    '12 casos para clase con corrección y modo práctica aleatorio',
  ],
});

// FUENTE ÚNICA de la FAQ: page.tsx la pinta y faqJsonLd la publica. Texto plano.
export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo se suman fracciones con distinto denominador?',
    answer:
      'Se busca un denominador común, el mínimo común múltiplo de los denominadores, y se pasa cada fracción a ese denominador multiplicando arriba y abajo por el mismo número. Después se suman los numeradores. Por ejemplo, 2/3 + 1/4: el m.c.m. de 3 y 4 es 12, así que 8/12 + 3/12 = 11/12.',
  },
  {
    question: '¿En qué orden se resuelven las operaciones combinadas con fracciones?',
    answer:
      'Primero los paréntesis, después las potencias, luego multiplicaciones y divisiones de izquierda a derecha y por último sumas y restas de izquierda a derecha. En 1/3 + 2/5 × 5/6 se multiplica primero (2/5 × 5/6 = 1/3) y luego se suma: 1/3 + 1/3 = 2/3. Si se sumara primero, saldría 11/18, que es incorrecto.',
  },
  {
    question: '¿Cómo se dividen dos fracciones?',
    answer:
      'Se multiplica la primera por la inversa de la segunda, es decir, por la segunda dada la vuelta. 6/7 ÷ 3/14 = 6/7 × 14/3 = 84/21 = 4. Es lo mismo que el producto cruzado que se enseña en muchas escuelas: el numerador de la primera por el denominador de la segunda, y al revés.',
  },
  {
    question: '¿Cómo se simplifica una fracción hasta la irreducible?',
    answer:
      'Se dividen el numerador y el denominador entre su máximo común divisor. Para hallarlo se descomponen los dos en factores primos y se toman los comunes con su menor exponente. En 84/126, 84 = 2² · 3 · 7 y 126 = 2 · 3² · 7, así que el m.c.d. es 2 · 3 · 7 = 42 y la fracción irreducible es 2/3.',
  },
  {
    question: '¿Puedo escribir números enteros, decimales o mixtos en la calculadora?',
    answer:
      'Enteros y decimales sí: 4 ÷ 2/3 o 0,25 + 1/3 funcionan, y el decimal se pasa primero a fracción (0,25 = 1/4). Un número mixto como 1 1/2 hay que escribirlo como suma, 1 + 1/2, porque dos números seguidos sin operador son ambiguos. El resultado sí se muestra también como número mixto.',
  },
  {
    question: '¿Por qué hay que poner paréntesis para elevar una fracción a una potencia?',
    answer:
      'Porque 2/3^2 puede leerse de dos formas: (2/3)² = 4/9 o 2 entre 3² = 2/9. Para no adivinar, la calculadora pide escribir (2/3)^2 si se quiere elevar la fracción entera. Con exponente negativo se invierte la base: (2/3)^-2 = (3/2)² = 9/4.',
  },
  {
    question: '¿Qué significa el número entre paréntesis en el decimal del resultado?',
    answer:
      'Es el período: las cifras que se repiten sin fin. 5/6 = 0,8333… se escribe 0,8(3), y 1/7 = 0,142857142857… se escribe 0,(142857). Una fracción irreducible da un decimal exacto solo si su denominador no tiene más factores primos que 2 y 5, como 3/8 = 0,375.',
  },
  {
    question: '¿Sirve para que un profesor mande ejercicios?',
    answer:
      'Sí. La sección Casos para clase tiene 12 problemas numerados que son siempre los mismos, con pista y solución paso a paso, así que se puede pedir «resuelve los casos 3, 7 y 11». El corrector acepta la fracción irreducible o el número mixto, y avisa si la respuesta es equivalente pero está sin simplificar o si se ha escrito en decimal.',
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
