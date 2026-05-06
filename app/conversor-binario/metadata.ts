import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor Binario Online - Texto a Binario y Binario a Texto | meskeIA',
  description: 'Conversor binario gratuito. Convierte texto a código binario (0 y 1) y viceversa. Incluye hexadecimal, octal y ASCII. Aprende sistemas numéricos.',
  keywords: 'conversor binario, texto a binario, binario a texto, codigo binario, ascii, hexadecimal, octal, sistemas numericos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor Binario Online - meskeIA',
    description: 'Convierte texto a binario y viceversa. Con hexadecimal, octal y ASCII.',
    url: 'https://meskeia.com/conversor-binario/',
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
    title: 'Conversor Binario Online',
    description: 'Convierte texto a código binario y viceversa.',
    images: ['https://meskeia.com/og-image.png']
  },
};
