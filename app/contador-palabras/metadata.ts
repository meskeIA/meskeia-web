import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contador de Palabras - Análisis de Texto Online | meskeIA',
  description: 'Contador de palabras, caracteres, párrafos y frases online. Calcula tiempo de lectura, densidad de palabras clave y estadísticas de texto. Gratis, privado y sin registro.',
  keywords: 'contador palabras, contar caracteres, contador letras, analisis texto, tiempo lectura, densidad palabras, estadisticas texto, word counter, character count',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Contador de Palabras y Caracteres Online',
    description: 'Analiza tu texto: cuenta palabras, caracteres, párrafos. Calcula tiempo de lectura y densidad de palabras clave.',
    url: 'https://next.meskeia.com/contador-palabras',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contador de Palabras | meskeIA',
    description: 'Cuenta palabras, caracteres, párrafos y tiempo de lectura',
  },
  other: {
    'application-name': 'Contador de Palabras meskeIA',
  },
};
