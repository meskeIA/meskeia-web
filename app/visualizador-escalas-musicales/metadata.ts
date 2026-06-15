import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Escalas Musicales — Notas, Intervalos y Piano | meskeIA',
  description: 'Explora las notas de cualquier escala musical: mayor, menor, pentatónica, blues y modos griegos. Visualización en teclado de piano, grados e intervalos.',
  keywords: 'escalas musicales, escala mayor, escala menor, pentatónica, blues, modos griegos, intervalos musicales, teclado piano, teoría musical, solfeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Escalas Musicales — meskeIA',
    description: 'Selecciona nota raíz y tipo de escala para ver las notas, grados e intervalos sobre un teclado de piano interactivo.',
    url: 'https://meskeia.com/visualizador-escalas-musicales/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Escalas Musicales — meskeIA',
    description: 'Explora escalas mayor, menor, pentatónica, blues y modos griegos con visualización en teclado de piano.',
  },
  other: {
    'application-name': 'Visualizador de Escalas Musicales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Escalas Musicales',
  description: 'Herramienta interactiva para explorar escalas musicales: mayor, menor, pentatónica, blues y todos los modos griegos. Muestra las notas, intervalos, grados y su posición en el teclado de piano.',
  url: 'https://meskeia.com/visualizador-escalas-musicales/',
  category: 'EducationalApplication',
  features: [
    'Visualización de 12 tipos de escalas: mayor, menores, pentatónicas, blues y modos griegos',
    'Teclado de piano SVG con las notas de la escala resaltadas visualmente',
    'Muestra los grados de la escala (I, II, III, IV, V, VI, VII) para cada nota',
    'Acordes tríada diatónicos construidos sobre cada escala',
    'Descripción del carácter sonoro de cada escala',
    'Selector de las 12 notas cromáticas como raíz',
    'Gratuito y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una escala musical y cuántas notas tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una escala musical es una sucesión ordenada de notas separadas por intervalos definidos. La escala mayor occidental tiene 7 notas (más la octava) y sus intervalos son: tono, tono, semitono, tono, tono, tono, semitono. La escala cromática incluye los 12 semitonos de la octava. El número de notas varía según el tipo: las pentatónicas tienen 5 y la escala de blues tiene 6.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la escala mayor y la escala menor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia fundamental está en el tercer grado: en la escala mayor el intervalo es una tercera mayor (4 semitonos desde la tónica), mientras que en la menor es una tercera menor (3 semitonos). Esto da a la escala mayor un carácter brillante y alegre, y a la menor un tono más oscuro o melancólico. Existen tres variantes de la menor: natural, armónica (con el séptimo grado elevado) y melódica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los modos griegos y cómo se usan en música moderna?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modos griegos son 7 escalas que se obtienen empezando la escala mayor desde cada uno de sus grados: Jónico (igual a la mayor), Dórico, Frigio, Lidio, Mixolidio, Eólico (igual a la menor natural) y Locrio. En música moderna se usan frecuentemente: el Dórico en el jazz y funk, el Mixolidio en el blues y rock, y el Frigio en el flamenco y el metal. Cada modo tiene un carácter sonoro distinto aunque comparta las mismas notas que su escala mayor relativa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve conocer los acordes diatónicos de una escala?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los acordes diatónicos son las tríadas que se construyen usando únicamente las notas de una escala dada. Conocerlos permite saber qué acordes "suenan bien juntos" en una tonalidad sin necesidad de probar combinaciones al azar. En la escala de Do mayor, por ejemplo, los acordes diatónicos son Do, Rem, Mim, Fa, Sol, Lam y Sim(b5). Esta información es fundamental para componer, improvisar y analizar canciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la escala pentatónica y la escala de blues?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pentatónica menor tiene 5 notas (1, b3, 4, 5, b7) y es la base del rock, pop y música folk. La escala de blues añade una sexta nota llamada "blue note" (el b5, también llamado tritono), lo que le da ese sonido tenso y expresivo característico del blues y el jazz. La blue note crea una disonancia controlada que aporta carácter y permite pasar suavemente entre los acordes de dominante de una progresión de blues.',
      },
    },
  ],
};
