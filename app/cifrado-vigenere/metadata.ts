import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cifrado Vigenère Online - Cifrado Polialfabético con Clave | meskeIA',
  description: 'Cifrado Vigenère gratuito. Encripta mensajes con palabra clave usando el cifrado polialfabético histórico. Visualización de la tabla Vigenère y explicaciones detalladas.',
  keywords: 'cifrado vigenere, cifrado polialfabetico, cifrado con clave, encriptar mensaje, criptografia, bellaso, tabla vigenere',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Vigenère Online - Cifrado con Clave | meskeIA',
    description: 'Encripta mensajes con el cifrado Vigenère. Usa una palabra clave para mayor seguridad.',
    url: 'https://meskeia.com/cifrado-vigenere/',
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
    title: 'Cifrado Vigenère Online - Cifrado Polialfabético',
    description: 'Encripta y descifra mensajes con el histórico cifrado Vigenère.',
    images: ['https://meskeia.com/og-image.png']
  },
};
