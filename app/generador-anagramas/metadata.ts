import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Anagramas Online Gratis - Buscador de Palabras con Letras',
  description: 'Genera anagramas en español: introduce tus letras y encuentra todas las palabras posibles. Ideal para Scrabble, Apalabrados, Wordle y crucigramas. Sin registro, gratis.',
  keywords: 'anagramas, generador, palabras, letras, wordle, scrabble, apalabrados, crucigramas, español, diccionario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-anagramas/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Anagramas Online Gratis - Buscador de Palabras',
    description: 'Introduce tus letras y encuentra todas las palabras posibles. Ideal para Scrabble, Apalabrados, Wordle y crucigramas.',
    url: 'https://meskeia.com/generador-anagramas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Anagramas Online Gratis',
    description: 'Encuentra todas las palabras posibles con tus letras. Scrabble, Apalabrados, Wordle, crucigramas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Anagramas',
  description: 'Generador de anagramas en español. Encuentra todas las palabras válidas que se pueden formar con un conjunto de letras. Útil para Wordle, Scrabble, Apalabrados y crucigramas.',
  url: 'https://meskeia.com/generador-anagramas/',
  category: 'UtilityApplication',
  features: [
    'Genera anagramas a partir de letras introducidas',
    'Diccionario español integrado',
    'Filtros por longitud de palabra',
    'Útil para juegos de palabras (Wordle, Scrabble, Apalabrados)',
    'En español',
  ],
  keywords: ['anagramas', 'palabras', 'Wordle', 'Scrabble', 'crucigramas', 'juegos palabras'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un anagrama y cómo se forma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un anagrama es una palabra o frase formada reordenando todas las letras de otra palabra o frase. Por ejemplo, "amor" es un anagrama de "roma", y "seta" lo es de "tase" o "aste". Los anagramas perfectos usan exactamente las mismas letras, sin añadir ni quitar ninguna. Son habituales en juegos de palabras, literatura, criptografía y entretenimiento. En español hay miles de pares de palabras anagramáticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo usar el generador de anagramas para Scrabble o Apalabrados?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Introduce en el generador las letras que tienes en tu atril (entre 2 y 10 letras). El generador busca todas las palabras válidas que puedes formar con esas letras, ordenadas por longitud de mayor a menor. Para Scrabble o Apalabrados, las palabras más largas suelen dar más puntos. También puedes introducir las letras del tablero junto con las tuyas para encontrar combinaciones que aprovechen letras ya colocadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué palabras se pueden formar con las letras A, E, R, M, O?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con las letras A, E, R, M, O se pueden formar palabras como: MAREO (anagrama perfecto de las 5 letras), AMOR, ROMA, MORA, RAMO, MARO, OREA, MERO, REMO, entre otras. El número de combinaciones posibles depende del diccionario usado. El generador de anagramas de meskeIA comprueba automáticamente todas las permutaciones contra el diccionario español y muestra solo las palabras válidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los anagramas son útiles para el aprendizaje de vocabulario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los anagramas son una herramienta pedagógica reconocida. Ayudan a desarrollar la conciencia fonológica (identificar y manipular sonidos y letras), ampliar el vocabulario de forma lúdica, mejorar la ortografía al fijarse en la composición de las palabras y estimular la memoria de trabajo. Son especialmente útiles para niños con dislexia, ya que el trabajo consciente con las letras de una palabra mejora su reconocimiento visual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los anagramas más famosos en español?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos anagramas célebres en español: "Salvador Dalí" → "Avida Dollars" (el propio Dalí lo usó como apodo); "amor" ↔ "roma" ↔ "mora" ↔ "armo" ↔ "ramo"; "vida" ↔ "diva"; "pelo" ↔ "pole"; "seta" ↔ "tase" ↔ "aste". En nombres propios son populares para seudónimos literarios. En criptografía histórica se usaban como firma oculta en textos.',
      },
    },
  ],
};
