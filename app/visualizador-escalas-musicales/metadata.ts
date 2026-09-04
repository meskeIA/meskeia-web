import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escalas Musicales en Piano y Guitarra: Notas, Intervalos y Acordes | meskeIA',
  description: 'Explora las notas de cualquier escala musical: mayor, menor, pentatónica, blues y modos griegos. Visualización en teclado de piano y en el diapasón de guitarra, bajo y ukelele, con grados e intervalos.',
  keywords: 'escalas musicales, escalas guitarra, diapason guitarra, escala mayor, escala menor, pentatónica, blues, modos griegos, intervalos musicales, teclado piano, bajo, ukelele, teoría musical, solfeo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Escalas Musicales en Piano y Guitarra',
    description: 'Selecciona nota raíz y tipo de escala para ver las notas, grados e intervalos sobre un teclado de piano y sobre el diapasón de guitarra, bajo o ukelele.',
    url: 'https://meskeia.com/visualizador-escalas-musicales/',
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
    title: 'Escalas Musicales',
    description: 'Explora escalas mayor, menor, pentatónica, blues y modos griegos sobre el piano y sobre el mástil de guitarra, bajo o ukelele.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Visualizador de Escalas Musicales meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escalas Musicales en Piano y Guitarra',
  description: 'Herramienta interactiva para explorar escalas musicales: mayor, menor, pentatónica, blues y todos los modos griegos. Muestra las notas, intervalos, grados y su posición tanto en el teclado de piano como en el diapasón de guitarra, bajo y ukelele.',
  url: 'https://meskeia.com/visualizador-escalas-musicales/',
  category: 'EducationalApplication',
  features: [
    'Visualización de 12 tipos de escalas: mayor, menores, pentatónicas, blues y modos griegos',
    'Teclado de piano SVG con las notas de la escala resaltadas visualmente',
    'Diapasón interactivo de 12 trastes con la escala sobre el mástil, y la tónica destacada',
    'Cuatro afinaciones: guitarra en Mi estándar, guitarra en Drop D, bajo de 4 cuerdas y ukelele',
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
      name: '¿Cómo se lee una escala sobre el mástil de la guitarra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diagrama representa el mástil visto de frente: cada línea horizontal es una cuerda (la más grave abajo) y cada columna, un traste. La columna 0 son las cuerdas al aire. Cada punto marca una nota de la escala y el destacado es la tónica, que sirve de referencia para colocar la mano. A partir del traste 12 el patrón se repite igual una octava más agudo, por eso ese traste lleva doble marca. El mismo dibujo cambia por completo según la afinación: en Drop D, en un bajo de 4 cuerdas o en un ukelele las posiciones no coinciden con las de la guitarra en Mi estándar.',
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
