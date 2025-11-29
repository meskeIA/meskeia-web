import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Código Braille - Texto a Braille en Español | meskeIA',
  description: 'Convierte texto a código Braille y viceversa. Alfabeto Braille español completo con ñ y acentos. Visualización con celdas y caracteres Unicode.',
  keywords: 'braille, conversor, texto, accesibilidad, alfabeto braille, español, discapacidad visual, unicode, celdas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Código Braille en Español',
    description: 'Convierte texto a Braille y viceversa con alfabeto español completo',
    url: 'https://meskeia.com/conversor-braille/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de Código Braille',
    description: 'Texto a Braille en español con visualización interactiva',
  },
};
