import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diccionario de Rimas Online - Rimario en Español | meskeIA',
  description:
    'Busca palabras que riman en español: rima consonante y asonante sobre 87.000 palabras. Filtra por sílabas y acentuación, con opción de seseo para Latinoamérica.',
  keywords:
    'diccionario de rimas, rimario, palabras que riman, buscar rimas, rimas consonantes, rimas asonantes, rimador, rimas en español, buscador de rimas, rimas para canciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diccionario de Rimas Online - Rimario en Español',
    description:
      'Palabras que riman en consonante y asonante, con filtro por número de sílabas y acentuación. 87.000 palabras del español.',
    url: 'https://meskeia.com/diccionario-rimas',
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
    title: 'Diccionario de Rimas Online - Rimario en Español',
    description:
      'Rima consonante y asonante sobre 87.000 palabras, con filtro por sílabas para que el verso te cuadre.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Diccionario de Rimas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diccionario de Rimas',
  description:
    'Rimario del español que busca palabras que riman con la que escribas, distinguiendo rima consonante (todos los sonidos desde la vocal tónica) de rima asonante (solo las vocales). Trabaja sobre 87.000 palabras y permite filtrar por número de sílabas y por acentuación para encontrar la que encaja en el verso.',
  url: 'https://meskeia.com/diccionario-rimas/',
  features: [
    'Rima consonante y rima asonante calculadas por fonemas, no por letras',
    'Comparación fonética: b=v, c=qu, g=j, ll=y, h muda',
    'Opción de seseo para Latinoamérica y Canarias (taza rima con casa)',
    'Filtro por número de sílabas y por palabra aguda, llana o esdrújula',
    '87.000 palabras del español, sin registro',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre rima consonante y rima asonante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la rima consonante coinciden todos los sonidos desde la vocal tónica: «cielo» y «vuelo». En la asonante solo coinciden las vocales, mientras las consonantes pueden variar: «campo» y «pájaro». La consonante es más exigente y suena más marcada; la asonante da mucha más libertad y es la que usa el romance tradicional español.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué «vaca» rima con «flaca» si se escriben distinto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque la rima es de sonido, no de ortografía. Antes de comparar, cada palabra se convierte a fonemas: la b y la v suenan igual, la c ante a/o/u suena como qu, la g ante e/i suena como j, la h es muda y la ll se pronuncia como y en casi todo el ámbito hispánico. Por eso «tuvo» rima con «cubo» y «calló» con «cayó».',
      },
    },
    {
      '@type': 'Question',
      name: '¿«Taza» rima con «casa»?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de dónde se hable. En Latinoamérica, Canarias y buena parte de Andalucía se sesea (la z suena como s) y sí riman. En el español peninsular con distinción, la z suena distinta de la s y no riman. El buscador tiene un interruptor de seseo para que el resultado se ajuste a la pronunciación de quien lo lee.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Desde dónde se cuenta la rima de una palabra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Desde la vocal tónica, es decir, la vocal de la sílaba que se pronuncia con más fuerza. En «corazón» es la ó final, así que rima a partir de «-ón»; en «cabeza» es la e de la penúltima sílaba, así que rima a partir de «-eza»; en «pájaro» es la a de la primera, y rima a partir de «-ájaro». Contar solo las últimas letras da falsos positivos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve filtrar las rimas por número de sílabas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para que la palabra encaje en el verso. Si estás escribiendo un octosílabo y ya llevas seis sílabas, necesitas una rima de dos, no de cuatro. El filtro por acentuación cumple una función parecida: en el cómputo métrico un verso que acaba en palabra aguda suma una sílaba y uno que acaba en esdrújula resta una.',
      },
    },
  ],
};
