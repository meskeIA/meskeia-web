import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tablero de Comunicación AAC - Comunicación Aumentativa | meskeIA',
  description: 'Tablero de comunicación aumentativa y alternativa (AAC) con símbolos visuales y voz. Para personas no verbales, autismo, parálisis cerebral o afasia. Categorías de necesidades, emociones, comida, acciones, personas y lugares.',
  keywords: 'tablero comunicacion, AAC, comunicacion aumentativa, comunicacion alternativa, autismo, no verbal, parálisis cerebral, afasia, pictogramas, PECS, simbolos comunicacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tablero de Comunicación AAC | meskeIA',
    description: 'Tablero de comunicación con símbolos visuales y voz para personas no verbales. Categorías de necesidades, emociones, comida y más.',
    url: 'https://meskeia.com/tablero-comunicacion/',
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
    title: 'Tablero de Comunicación AAC | meskeIA',
    description: 'Comunicación aumentativa con símbolos y voz. Ideal para autismo y personas no verbales.',
    images: ['https://meskeia.com/og-image.png']
  },
};
