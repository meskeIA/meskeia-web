import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lector de Texto en Voz Alta - Text to Speech en español | meskeIA',
  description: 'Lee en voz alta cualquier texto en español con resaltado de palabras en tiempo real. Ajusta velocidad, tono y voz. Ideal para personas con discapacidad visual, dislexia o dificultades de lectura.',
  keywords: 'lector texto voz, text to speech, voz alta, leer texto, discapacidad visual, dislexia, accesibilidad, sintetizador voz, resaltado palabras, lectura asistida',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lector de Texto en Voz Alta | meskeIA',
    description: 'Pega cualquier texto y escúchalo en español con resaltado de palabras. Velocidad y tono ajustables. Gratis y sin registro.',
    url: 'https://meskeia.com/lector-texto-voz/',
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
    title: 'Lector de Texto en Voz Alta | meskeIA',
    description: 'Text-to-speech en español con resaltado de palabras en tiempo real. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};
