import { Metadata } from 'next';
import { generateWebAppSchema, type FAQItem } from '@/lib/schema-templates';

// 🌎 Latam-friendly: «llana» (España y parte de América) y «grave» (Argentina, Chile, México,
// Colombia…) son la misma clase. El término-núcleo que se teclea es «agudas, llanas y
// esdrújulas», así que «graves» va de apoyo en el title y el H1, nunca en su lugar.
// Origen: semilla S0279 (17/11/2026). Bing, 6 meses: «palabras agudas» 701, «agudas llanas y
// esdrújulas» 518, «palabras agudas llanas y esdrújulas» 377, «wordwall agudas llanas y
// esdrújulas» 248 (profesores buscando actividad de aula).

export const metadata: Metadata = {
  title: 'Palabras Agudas, Llanas (Graves) y Esdrújulas: Clasificador y Tildes - meskeIA',
  description:
    'Escribe una palabra y te dice si es aguda, llana (grave), esdrújula o sobresdrújula, si lleva tilde y por qué. Toca la sílaba que suena más fuerte y te dice cómo se escribe. Con 12 casos para clase.',
  keywords:
    'palabras agudas, palabras llanas, palabras graves, palabras esdrújulas, sobresdrújulas, agudas llanas y esdrújulas, clasificador de palabras, sílaba tónica, reglas de acentuación, cuándo lleva tilde, ley del hiato, ortografía',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/palabras-agudas-llanas-esdrujulas/' },
  openGraph: {
    type: 'website',
    title: 'Palabras Agudas, Llanas (Graves) y Esdrújulas',
    description:
      'Clasifica cualquier palabra, encuentra su sílaba tónica y comprueba si lleva tilde con la regla que se aplica.',
    url: 'https://meskeia.com/palabras-agudas-llanas-esdrujulas/',
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
    title: 'Palabras Agudas, Llanas (Graves) y Esdrújulas',
    description: 'Clasifica una palabra, encuentra su sílaba tónica y comprueba si lleva tilde.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Palabras Agudas, Llanas y Esdrújulas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Clasificador de Palabras Agudas, Llanas (Graves), Esdrújulas y Sobresdrújulas',
  description:
    'Separa una palabra en sílabas, localiza la sílaba tónica, la clasifica como aguda, llana (grave), esdrújula, sobresdrújula o monosílaba y explica si lleva tilde con la regla de acentuación que se aplica. Permite elegir la sílaba que suena más fuerte para saber cómo se escribe una palabra sin tilde, y clasifica todas las palabras de un texto.',
  url: 'https://meskeia.com/palabras-agudas-llanas-esdrujulas/',
  category: 'EducationalApplication',
  features: [
    'Separación en sílabas y localización de la sílaba tónica',
    'Clasificación en aguda, llana (grave), esdrújula, sobresdrújula o monosílaba',
    'Dice si la palabra lleva tilde y la regla que se aplica, incluida la ley del hiato',
    'Eliges la sílaba que suena más fuerte y te da la palabra bien escrita',
    'Clasifica todas las palabras de un texto y avisa de las tildes que sobran',
    '12 casos numerados para clase con corrección y solución, y un modo práctica',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    question: '¿Cómo sé si una palabra es aguda, llana o esdrújula?',
    answer:
      'Sepárala en sílabas y busca la que suena más fuerte, la sílaba tónica, contando desde el final. Si es la última, la palabra es aguda (camión, reloj); si es la penúltima, llana o grave (lápiz, casa); si es la antepenúltima, esdrújula (música), y si está antes, sobresdrújula (dígamelo).',
  },
  {
    question: '¿Cuándo llevan tilde las agudas, las llanas y las esdrújulas?',
    answer:
      'Las agudas llevan tilde cuando acaban en vocal, n o s (sofá, canción, compás). Las llanas, al revés: cuando NO acaban en vocal, n o s (árbol, lápiz, carácter). Las esdrújulas y sobresdrújulas la llevan siempre (pájaro, cómpratelo).',
  },
  {
    question: '¿Es lo mismo una palabra llana que una grave?',
    answer:
      'Sí. Es la misma clase con dos nombres: en España y parte de América se dice llana, y en Argentina, Chile, México, Colombia y otros países se dice grave. En lingüística también se llama paroxítona.',
  },
  {
    question: '¿Por qué la app no sabe que «arbol» lleva tilde?',
    answer:
      'Porque sin tilde nada en la escritura dice cómo suena la palabra: «arbol» podría pronunciarse con la fuerza en la última sílaba, y entonces sería aguda y sin tilde. Para eso puedes tocar la sílaba que oyes más fuerte, «ar», y la app te dice que es llana terminada en l y que se escribe árbol. Las tildes que sobran, en cambio, sí las detecta sola.',
  },
  {
    question: '¿Qué es la ley del hiato?',
    answer:
      'Cuando una i o una u tónica va junto a una vocal abierta (a, e, o) en otra sílaba, lleva tilde siempre, aunque la regla general diga lo contrario. Por eso maíz lleva tilde aunque sea aguda terminada en z, y búho aunque sea llana terminada en vocal.',
  },
  {
    question: '¿Los monosílabos son agudos?',
    answer:
      'Tienen una sola sílaba, así que esa es la tónica, y algunos libros los cuentan como agudos; otros los tratan aparte. Lo que no cambia es la tilde: no la llevan (fue, dio, vio, guion), salvo la tilde diacrítica que distingue palabras iguales como tú y tu o sí y si.',
  },
  {
    question: '¿Cómo se acentúan los adverbios terminados en -mente?',
    answer:
      'Se pronuncian con dos acentos, el del adjetivo y el de -men-, y conservan la tilde del adjetivo del que vienen: rápido da rápidamente y fácil da fácilmente, mientras que lento da lentamente, sin tilde.',
  },
  {
    question: '¿Sirve para hacer ejercicios en clase?',
    answer:
      'Sí. Tiene 12 casos numerados, siempre los mismos y en el mismo orden, para que el profesor pueda pedir «resuelve los casos 3, 7 y 11»: unos piden clasificar una palabra y otros escribirla con su tilde. Cada uno se corrige al momento y trae solución paso a paso, y hay un modo práctica con palabras al azar.',
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
