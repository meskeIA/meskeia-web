import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';
import { TOTAL_CASOS } from './casos';

// Origen: semilla S0285 (20/11/2026). Bing, 6 meses: «diptongos e hiatos» 923, «vocales
// abiertas y cerradas» 249, «hiato y diptongo» 222, «diptongos» 199, «diptongo e hiato» 178,
// «hiatos y diptongos» 159, «ejercicios de diptongos e hiatos» 75, «palabras con diptongo» 74.
// El término-núcleo que se teclea es «diptongos e hiatos»: va delante en el title y el H1.
// Las consultas «qué es un diptongo» las responde el propio buscador; la app vale por
// analizar las palabras de quien la usa, y el title lo dice.

export const metadata: Metadata = {
  title: 'Diptongos, Triptongos e Hiatos: Detector de Palabras con Diptongo o Hiato - meskeIA',
  description:
    'Escribe una palabra o pega un texto y te marca cada diptongo (creciente, decreciente u homogéneo), triptongo e hiato (simple o acentual), con sus sílabas y la regla de vocales abiertas y cerradas que se aplica. Con casos para clase.',
  keywords:
    'diptongos e hiatos, diptongo, hiato, triptongo, diptongo creciente, diptongo decreciente, diptongo homogéneo, hiato simple, hiato acentual, vocales abiertas y cerradas, palabras con diptongo, palabras con hiato, separar en sílabas, ley del hiato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/diptongos-e-hiatos/' },
  openGraph: {
    type: 'website',
    title: 'Diptongos, Triptongos e Hiatos: Detector de Palabras',
    description:
      'Marca los diptongos, triptongos e hiatos de cualquier palabra o texto y explica la regla que los decide.',
    url: 'https://meskeia.com/diptongos-e-hiatos/',
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
    title: 'Diptongos, Triptongos e Hiatos',
    description: 'Marca los diptongos, triptongos e hiatos de una palabra o un texto, con su regla.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Diptongos e Hiatos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Detector de Diptongos, Triptongos e Hiatos',
  description:
    'Separa una palabra en sílabas y marca cada encuentro de vocales: diptongo creciente, decreciente u homogéneo, triptongo, hiato simple o hiato acentual, con la regla de vocales abiertas y cerradas que lo decide. Busca también todos los diptongos, triptongos e hiatos de un texto.',
  url: 'https://meskeia.com/diptongos-e-hiatos/',
  category: 'EducationalApplication',
  features: [
    'Marca dentro de la palabra cada diptongo, triptongo e hiato',
    'Distingue diptongo creciente, decreciente y homogéneo, e hiato simple y acentual',
    'Explica la regla de vocales abiertas y cerradas que decide cada caso, incluida la ley del hiato',
    'Separa la palabra en sílabas con el silabeo de la Ortografía de 2010',
    'Busca los diptongos, triptongos e hiatos de un texto entero y los filtra',
    `${TOTAL_CASOS} casos numerados para clase con corrección y solución, y un modo práctica`,
    'Funciona 100 % en el navegador, sin registro ni instalación',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo sé si una palabra tiene diptongo o hiato?',
    answer:
      'Busca dos vocales seguidas y mira de qué tipo son. Las abiertas son a, e y o; las cerradas, i y u. Si hay una cerrada sin tilde junto a una abierta, o dos cerradas distintas, van en la misma sílaba y forman diptongo (cie-lo, ciu-dad). Si son dos abiertas, o una i o una u con tilde junto a una abierta, van en sílabas distintas y forman hiato (po-e-ta, pa-ís).',
  },
  {
    question: '¿Qué diferencia hay entre diptongo creciente, decreciente y homogéneo?',
    answer:
      'Depende del orden de las vocales. En el creciente va primero la cerrada y luego la abierta (ie de cielo, ue de nuevo). En el decreciente, al revés: primero la abierta (ai de aire, ey de rey). El homogéneo junta dos cerradas distintas (iu de ciudad, ui de ruido).',
  },
  {
    question: '¿Qué es un hiato acentual y por qué lleva tilde?',
    answer:
      'Es el que forman una i o una u tónica y una vocal abierta: pa-ís, rí-o, bú-ho. Sin la tilde esas vocales se leerían juntas, en diptongo, así que la tilde se pone siempre para separarlas, aunque la regla general de acentuación diga lo contrario. Es la ley del hiato. El hiato simple, en cambio, junta dos abiertas (le-er, hé-ro-e) o dos cerradas iguales (chi-i-ta) y no necesita tilde para separarse.',
  },
  {
    question: '¿Qué es un triptongo? ¿Me das ejemplos?',
    answer:
      'Son tres vocales en la misma sílaba: una cerrada, una abierta y otra cerrada, sin tilde en las cerradas. Ejemplos: buey, miau, guau o Uruguay. La y final cuenta como vocal cerrada porque suena como i.',
  },
  {
    question: '¿La h separa las vocales?',
    answer:
      'No. La h no suena, así que no impide el diptongo (ahu-ma-do, prohi-bir) ni crea un hiato. Por eso búho tiene hiato por la tilde de la ú, no por la h.',
  },
  {
    question: '¿Por qué «guion» sale con una sola sílaba?',
    answer:
      'Porque la Ortografía de 2010 cuenta como diptongo, a efectos de escritura, toda vocal cerrada átona junto a una abierta, aunque haya quien la pronuncie en dos sílabas. Así guion, truhan o fie son monosílabos y se escriben sin tilde. La app sigue esa norma; si tú la dices en dos sílabas, no pronuncias mal, solo que la escritura no lo refleja.',
  },
  {
    question: '¿En «queso» o «guitarra» hay diptongo?',
    answer:
      'No. En que, qui, gue y gui la u no suena: forma parte de la consonante. Cuando sí suena se escribe con diéresis, y entonces hay diptongo: pin-güi-no, ver-güen-za.',
  },
  {
    question: '¿Sirve para hacer ejercicios en clase?',
    answer: `Sí. Tiene ${TOTAL_CASOS} casos numerados, siempre los mismos y en el mismo orden, para que el profesor pueda pedir «resuelve los casos 3, 7 y 11»: unos piden decir si la palabra tiene diptongo, triptongo o hiato, otros su tipo y otros separarla en sílabas. Cada uno se corrige al momento y trae la solución paso a paso, y hay un modo práctica con palabras al azar.`,
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
