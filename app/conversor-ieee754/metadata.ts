import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor IEEE 754 - Punto Flotante 32/64 bits | meskeIA',
  description: 'Convierte números decimales a formato IEEE 754 (punto flotante) y viceversa. Visualiza signo, exponente y mantisa en binario. Soporta precisión simple (32 bits) y doble (64 bits).',
  keywords: 'IEEE 754, punto flotante, float, double, binario, exponente, mantisa, signo, 32 bits, 64 bits, precisión simple, precisión doble, arquitectura computadores, representación numérica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor IEEE 754 - Punto Flotante | meskeIA',
    description: 'Convierte decimales a IEEE 754 y visualiza signo, exponente y mantisa. Precisión simple y doble.',
    url: 'https://meskeia.com/conversor-ieee754',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor IEEE 754 | meskeIA',
    description: 'Convierte decimales a punto flotante IEEE 754 con visualización binaria.',
  },
  other: {
    'application-name': 'Conversor IEEE 754 meskeIA',
  },
};
