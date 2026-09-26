import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números de la Música - Matemáticas del Sonido y la Armonía | meskeIA',
  description: 'Descubre las matemáticas detrás de la música: frecuencias, intervalos pitagóricos, acordes mayores y menores, ritmo, compases y la proporción áurea en composiciones famosas.',
  keywords: 'matemáticas música, frecuencia sonido, intervalos pitagóricos, acordes mayor menor, escala temperada, ritmo BPM, proporción áurea música, 440 Hz, consonancia disonancia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números de la Música - Matemáticas del Sonido y la Armonía',
    description: 'Frecuencias, ratios pitagóricos, acordes y ritmo: toda la música es matemáticas. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-matematicas-musica/',
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
    title: 'Los Números de la Música - Explicador Visual',
    description: 'La música es matemáticas: frecuencias, intervalos, acordes y ritmo explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Matemáticas Música meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números de la Música - Matemáticas del Sonido y la Armonía',
  description: 'Explicador visual interactivo sobre las matemáticas detrás de la música: ondas sonoras y frecuencias, la escala de 12 notas y los ratios pitagóricos, acordes y armonía, ritmo y la proporción áurea en composiciones clásicas.',
  url: 'https://meskeia.com/visualizador-matematicas-musica/',
  category: 'EducationalApplication',
  features: [
    'Visualización de ondas sonoras: frecuencia, amplitud y forma de onda',
    'Ratios pitagóricos e intervalos musicales explicados visualmente',
    'Acordes mayores y menores: por qué suenan alegre o triste',
    'Ritmo, compases y BPM por género musical',
    'Proporción áurea y Fibonacci en composiciones de Debussy y Tool',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué relación tienen las matemáticas y la música?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La música se basa completamente en matemáticas: cada nota es una frecuencia en hercios, los intervalos entre notas son ratios numéricos simples y el ritmo se organiza con fracciones (compás de 4/4, 3/4…). Pitágoras ya describía los intervalos consonantes como razones de números enteros pequeños, como 2:1 para la octava o 3:2 para la quinta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el La estándar está afinado a 440 Hz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El La4 a 440 Hz se acordó como referencia en una conferencia internacional celebrada en Londres en 1939, y la ISO lo adoptó en 1955 y lo reafirmó en la norma ISO 16:1975, para facilitar una afinación común entre músicos y fabricantes de instrumentos. Antes, el La de referencia variaba mucho según la época y el país. Hoy no es universal: muchas orquestas afinan a 442-443 Hz y la interpretación historicista de música barroca suele usar 415 Hz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué los acordes mayores suenan alegres y los menores tristes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La diferencia reside en la tercera del acorde: el acorde mayor tiene una tercera mayor (4 semitonos) que genera un ratio de frecuencias próximo a 5:4, considerado consonante y "brillante". El acorde menor usa una tercera menor (3 semitonos), con un ratio algo más tenso. Esta distinción perceptiva tiene base en la serie armónica natural y en el condicionamiento cultural occidental.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la proporción áurea en música?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Algunos análisis proponen que la proporción áurea (φ ≈ 1,618) organiza la estructura de ciertas obras: Ernő Lendvai la vio en Bartók y Roy Howat en Debussy, situando el clímax cerca del punto que divide la pieza según esa razón. Son lecturas analíticas discutidas, no intenciones documentadas de los compositores. En otros casos sí es deliberado, como en Lateralus de Tool, cuyas sílabas siguen la secuencia de Fibonacci (1, 1, 2, 3, 5, 8…).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este explicador visual de matemáticas y música?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está pensado para estudiantes de bachillerato, conservatorio o universidad que quieran entender la base física y matemática del sonido, para músicos con curiosidad teórica y para cualquier persona interesada en saber por qué ciertas combinaciones de notas suenan bien o mal. No se necesitan conocimientos previos de solfeo ni de matemáticas avanzadas.',
      },
    },
  ],
};
