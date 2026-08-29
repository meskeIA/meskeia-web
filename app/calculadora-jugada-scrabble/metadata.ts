import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Jugada Óptima en Scrabble - Mejor Palabra y Puntuación | meskeIA',
  description: 'Introduce tus 7 fichas y la letra del tablero en la que quieres apoyarte: la calculadora busca todas las palabras posibles, las puntúa con los valores oficiales del Scrabble en español y las ordena de mayor a menor. Con multiplicadores de casilla, comodines y bonificación por usar las 7 fichas.',
  keywords: 'calculadora scrabble, mejor jugada scrabble, puntuacion scrabble, valor fichas scrabble, trucos scrabble, palabras scrabble español, juegos de palabras, anagramas, comodin scrabble',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Jugada Óptima en Scrabble',
    description: 'Tus fichas + la letra del tablero = la palabra que más puntúa. Valores oficiales del español, multiplicadores de casilla y bonificación por usar las 7 fichas.',
    url: 'https://meskeia.com/calculadora-jugada-scrabble/',
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
    title: 'Calculadora de Jugada Óptima en Scrabble',
    description: 'Encuentra la palabra que más puntúa con tus fichas y calcula el tanteo exacto.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora de Jugada Óptima en Scrabble meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Jugada Óptima en Scrabble',
  description: 'Busca la palabra que más puntúa con las fichas de tu atril, apoyándose opcionalmente en una letra ya colocada en el tablero. Aplica los valores oficiales de las fichas del Scrabble en español, los multiplicadores de casilla, los comodines y la bonificación de 50 puntos por colocar las siete fichas. Valida contra más de 87.000 lemas del español.',
  url: 'https://meskeia.com/calculadora-jugada-scrabble/',
  category: 'EducationalApplication',
  features: [
    'Atril de hasta 7 fichas con teclado visual, comodines incluidos',
    'Letra gancho: obliga a que la palabra se apoye en una ficha ya colocada',
    'Valores oficiales de las fichas del Scrabble en español, con dígrafos CH, LL y RR',
    'Modo sin dígrafos para juegos de palabras que tratan CH, LL y RR como letras sueltas',
    'Multiplicadores de casilla: doble y triple letra, doble y triple palabra',
    'Bonificación automática de 50 puntos al colocar las siete fichas del atril',
    'Desglose de puntuación ficha a ficha en cada jugada propuesta',
    'Validación contra más de 87.000 lemas del español, sin enviar datos a ningún servidor',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la puntuación de una palabra en Scrabble?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se suma el valor de cada ficha de la palabra, aplicando primero los multiplicadores de letra (casilla de doble o triple letra) y multiplicando después el total por los multiplicadores de palabra (doble o triple palabra). El orden importa: la casilla de palabra se aplica al final, sobre la suma ya bonificada por las casillas de letra. Si en la misma jugada se colocan las siete fichas del atril, se añaden 50 puntos al final, después de todos los multiplicadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto vale cada ficha en el Scrabble en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Valen 1 punto A, E, O, I, S, N, R, U, L y T; 2 puntos D y G; 3 puntos C, B, M y P; 4 puntos H, F, V e Y; 5 puntos CH y Q; 8 puntos J, LL, Ñ, RR y X; y 10 puntos la Z. Los dos comodines valen 0. La edición española no incluye fichas de K ni de W, de modo que las palabras que las contienen no se pueden formar salvo cubriéndolas con un comodín.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los multiplicadores de casilla cuentan para las letras que ya estaban en el tablero?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Las casillas de bonificación solo puntúan para las fichas que se colocan en ese turno. Si una palabra se apoya en una letra que ya estaba en el tablero, esa ficha suma su valor normal pero no se multiplica, y su casilla de bonificación (aunque la tuviera) ya se consumió en el turno en que se colocó. Es uno de los errores de conteo más frecuentes entre jugadores ocasionales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuándo se ganan los 50 puntos extra y cómo se llama esa jugada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se ganan al colocar en un solo turno las siete fichas del atril, jugada conocida como "scrabble" o "bingo". No basta con quedarse sin fichas: si al final de la partida quedan cuatro en el atril y se colocan todas, no hay bonificación, porque no son siete. Los 50 puntos se suman después de aplicar los multiplicadores de casilla, así que no se ven afectados por una casilla de triple palabra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una calculadora de jugada y un generador de anagramas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un generador de anagramas devuelve todas las palabras que pueden formarse con unas letras, ordenadas alfabéticamente o por longitud. Una calculadora de jugada va un paso más allá: puntúa cada opción con los valores reales de las fichas, tiene en cuenta la casilla en la que vas a jugar y ordena por puntuación, de modo que la palabra más larga no siempre encabeza la lista. En muchas posiciones, una palabra corta con la Z sobre una casilla de triple letra supera a una de siete letras.',
      },
    },
  ],
};
