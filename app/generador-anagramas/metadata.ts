import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Anagramas en Español - Anagramas Perfectos de Frases y Nombres',
  description: 'Genera anagramas perfectos de una frase o un nombre (usando todas las letras), busca palabras formables con tus letras y verifica si dos textos son anagramas exactos. Gratis y sin registro.',
  keywords: 'anagramas, anagrama de frase, anagrama de mi nombre, generador, palabras, letras, wordle, scrabble, apalabrados, crucigramas, español, diccionario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-anagramas/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Anagramas en Español - Frases, Nombres y Palabras',
    description: 'Anagramas perfectos de una frase o un nombre, palabras formables con tus letras y verificador de anagramas exactos.',
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
    title: 'Generador de Anagramas en Español',
    description: 'Anagramas perfectos de frases y nombres, palabras formables con tus letras y verificador exacto.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Anagramas',
  description: 'Generador de anagramas en español con tres modos: anagramas perfectos de una frase o nombre (reparte todas las letras entre varias palabras), búsqueda de palabras formables con un conjunto de letras y verificador de anagramas exactos.',
  url: 'https://meskeia.com/generador-anagramas/',
  category: 'UtilityApplication',
  features: [
    'Anagramas perfectos de frases y nombres: usa todas las letras, sin sobrar ninguna',
    'Reparte las letras entre 2 y 5 palabras del diccionario',
    'Busca todas las palabras formables con un conjunto de letras',
    'Verificador: comprueba si dos textos son anagramas exactos e indica qué letras sobran',
    'Diccionario español integrado de 87.000 lemas',
    'Filtros por longitud de palabra y por número de palabras',
    'Ignora tildes, espacios y puntuación al repartir letras',
    'Útil para juegos de palabras (Wordle, Scrabble, Apalabrados)',
  ],
  keywords: ['anagramas', 'anagrama de frase', 'anagrama de nombre', 'palabras', 'Wordle', 'Scrabble', 'crucigramas', 'juegos palabras'],
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
      name: '¿Cómo hacer un anagrama con mi nombre completo o con una frase?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un anagrama de nombre o frase debe repartir TODAS las letras entre varias palabras reales, sin sobrar ni faltar ninguna: es un reparto exacto, no una búsqueda de palabras parecidas. Escribe el nombre completo en el modo "anagrama perfecto", elige cuántas palabras admites como máximo (entre 2 y 5) y la longitud mínima de cada una. El programa recorre el diccionario español y devuelve solo las combinaciones que consumen exactamente tus letras. Las tildes, los espacios y los signos de puntuación se ignoran, así que "Salvador Dalí" y "salvador dali" dan el mismo resultado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo saber si dos frases son anagramas exactos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dos textos son anagramas exactos si tienen exactamente las mismas letras con las mismas repeticiones, ignorando espacios, tildes y puntuación. Comprobarlo a ojo es poco fiable en cuanto pasan de diez o doce letras, porque basta con que sobre una sola letra repetida para que deje de serlo. El modo verificador compara ambos textos letra a letra y, cuando no coinciden, indica qué letras sobran en cada lado y cuántas veces, que es justo el dato necesario para corregir la propuesta.',
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
