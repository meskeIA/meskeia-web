import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Guía de Métrica y Estrofas — Poesía española | meskeIA',
  description: 'Aprende a contar sílabas en poesía española: sinalefa, acento y tipos de verso. Referencia completa de estrofas (redondilla, décima, soneto, romance, lira) con ejemplos de los grandes poetas.',
  keywords: ['métrica española', 'sinalefa', 'endecasílabo', 'octosílabo', 'alejandrino', 'estrofas', 'soneto', 'romance', 'décima', 'redondilla', 'contar sílabas poesía', 'tipos de verso'],
  openGraph: {
    title: 'Guía de Métrica y Estrofas | meskeIA',
    description: 'Contador de sílabas interactivo, tipos de verso, rima y estrofas de la poesía española clásica.',
    url: 'https://meskeia.com/guia-metrica-estrofas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de Métrica y Estrofas — Poesía española',
  description: 'Referencia completa de la métrica española: contador interactivo de sílabas con sinalefa, tipos de verso por número de sílabas, esquemas de rima, estrofas clásicas y formas poéticas con ejemplos.',
  url: 'https://meskeia.com/guia-metrica-estrofas/',
  category: 'EducationalApplication',
  features: [
    'Contador interactivo de sílabas con detección de sinalefa',
    'Tipos de verso: del tetrasílabo al alejandrino con ejemplos',
    'Rima consonante y asonante, esquemas visuales',
    'Estrofas: pareado, redondilla, cuarteto, décima, romance…',
    'Formas poéticas completas: soneto, romance, lira, haiku',
    'Reglas de métrica: sinalefa, hiato, acento y corrección silábica',
    'Ejemplos de Garcilaso, Machado, Lorca, Bécquer, Quevedo y más',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se cuentan las sílabas en un verso de poesía española?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para contar sílabas en un verso hay que dividir cada palabra en sílabas y aplicar tres correcciones métricas: la sinalefa (se fusionan en una sola sílaba la vocal final de una palabra y la vocal inicial de la siguiente), el acento esdrújulo (resta una sílaba al cómputo total del verso) y el acento oxítono o agudo (suma una sílaba). Por ejemplo, "La luna vino a la fragua" tiene 8 sílabas métricas aunque fonéticamente puedan contarse de otra forma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la sinalefa y cuándo se aplica en poesía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sinalefa es el fenómeno métrico por el que la sílaba final de una palabra y la sílaba inicial de la siguiente se unen en una sola sílaba cuando la primera termina en vocal y la segunda comienza también en vocal (o h seguida de vocal). Es la regla más frecuente del verso español y se aplica automáticamente salvo pausa sintáctica o uso expresivo del hiato. La mayoría de los versos clásicos castellanos la usan para mantener el cómputo silábico regular.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas sílabas tiene un endecasílabo y en qué poemas aparece?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El endecasílabo tiene 11 sílabas métricas y lleva acento obligatorio en la décima sílaba. Es el verso más prestigioso de la lírica española desde el Renacimiento: Garcilaso de la Vega lo introdujo siguiendo el modelo italiano de Petrarca, y posteriormente lo usaron Lope de Vega, Quevedo, Góngora y prácticamente todos los grandes poetas áureos. El soneto está compuesto íntegramente por endecasílabos (14 versos en 4 estrofas: dos cuartetos y dos tercetos).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre rima consonante y rima asonante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la rima consonante coinciden todos los sonidos a partir de la última vocal tónica: tanto las vocales como las consonantes. En la rima asonante solo coinciden las vocales a partir de la última tónica, ignorando las consonantes. Por ejemplo, "aurora/hora" es asonante (ambas terminan en o-a), mientras que "cielo/vuelo" es consonante (coinciden -elo). La rima asonante es característica del romance castellano y se considera de menor exigencia formal que la consonante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué estrofas españolas son más habituales en el bachillerato y los comentarios de texto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las estrofas más estudiadas en educación secundaria y preuniversitaria son: el soneto (14 endecasílabos, esquema ABBA ABBA CDC DCD), el romance (serie indefinida de octosílabos con rima asonante en pares), la décima (10 octosílabos, esquema abbaaccddc) y la redondilla (4 octosílabos, rima abba). También aparecen la lira (combinación de heptasílabos y endecasílabos) y la silva. Identificar la estrofa es el primer paso de cualquier comentario de texto poético.',
      },
    },
  ],
};
