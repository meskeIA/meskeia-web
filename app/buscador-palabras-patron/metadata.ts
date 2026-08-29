import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Buscador de Palabras por Patrón - Crucigramas y Juegos de Letras | meskeIA',
  description: 'Encuentra palabras del español a partir de un patrón con huecos: introduce "_A_A_O" y obtén CASADO, NARRADO, BAÑADO... Ideal para crucigramas, Scrabble, Wordle y aprender vocabulario.',
  keywords: 'buscador palabras patrón, crucigramas, palabras con huecos, autodefinidos, scrabble, wordle, palabras cruzadas, español, completar palabras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Buscador de Palabras por Patrón en Español',
    description: 'Encuentra palabras del español con un patrón de huecos. Ej.: "_A_A_O" → CASADO, NARRADO. Más de 87.000 palabras del lemario.',
    url: 'https://meskeia.com/buscador-palabras-patron/',
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
    title: 'Buscador de Palabras por Patrón en Español',
    description: 'Encuentra palabras con huecos, perfecto para crucigramas y Scrabble.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Buscador de Palabras por Patrón meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Buscador de Palabras por Patrón',
  description: 'Encuentra palabras del español que coinciden con un patrón de letras y huecos. Útil para resolver crucigramas, autodefinidos, Scrabble, Wordle y completar palabras parciales. Más de 87.000 lemas indexados por longitud.',
  url: 'https://meskeia.com/buscador-palabras-patron/',
  category: 'UtilityApplication',
  features: [
    'Búsqueda por patrón con guiones bajos como comodines (ej. "_A_A_O")',
    'Filtro opcional de letras que deben aparecer en la palabra',
    'Filtro opcional de letras a excluir',
    'Resultados agrupados por longitud y ordenados alfabéticamente',
    'Más de 87.000 lemas del español validados (Lemario de Olea, dominio público)',
    'Útil para crucigramas, Wordle, Scrabble y retos lingüísticos: busca por longitud exacta y letras conocidas',
    'Diccionario completo con lemas del español sin distinción regional para hispanohablantes de todo el mundo',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se usa un buscador de palabras por patrón para resolver crucigramas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para resolver una casilla de crucigrama, introduce el patrón usando un guion bajo (_) por cada letra desconocida y las letras que ya conoces en su posición correcta. Por ejemplo, si tienes una palabra de 6 letras cuya tercera letra es "C" y la quinta es "O", escribe "__C_O_". El buscador devuelve todas las palabras del español que encajan con ese patrón, ordenadas por longitud y alfabéticamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un buscador de patrones y un anagramador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un buscador de patrones encuentra palabras que cumplen una posición exacta de letras: "_A_O" devuelve palabras donde la segunda letra es A y la cuarta es O, como GATO o RARO. Un anagramador, en cambio, reorganiza un conjunto de letras para formar otras palabras, sin importar el orden. Son herramientas complementarias: el patrón es útil para crucigramas y Wordle; el anagramador, para Scrabble cuando tienes fichas sueltas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué juegos de letras sirve el buscador de patrones además de los crucigramas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para Wordle y sus variantes en español (cuando ya sabes la posición de algunas letras), autodefinidos, Scrabble (para colocar letras sobre las ya puestas en el tablero), pasatiempos de palabras cruzadas en revistas y para aprender vocabulario buscando todas las palabras que siguen un esquema concreto. También puede usarse para estudiar morfología española: buscar todos los verbos que terminan en un patrón determinado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas palabras incluye el diccionario y de dónde provienen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El buscador utiliza más de 87.000 lemas del Lemario de Olea, un recurso léxico del español de dominio público que recoge formas canónicas (infinitivos, singulares masculinos) sin conjugaciones ni plurales. Esto significa que la búsqueda trabaja con vocabulario estándar del español, adecuado para juegos y pasatiempos, aunque puede no incluir formas flexionadas o palabras de registro muy coloquial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Funciona el buscador sin conexión o necesita internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El buscador procesa las consultas completamente en el navegador: una vez cargada la página, el diccionario y el motor de búsqueda se ejecutan de forma local sin enviar datos a ningún servidor. Esto significa que funciona sin conexión activa una vez cargado, no requiere registro y no almacena las búsquedas realizadas.',
      },
    },
  ],
};
