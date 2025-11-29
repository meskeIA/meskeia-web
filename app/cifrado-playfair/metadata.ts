import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cifrado Playfair Online - Cifrado por Digramas | meskeIA',
  description: 'Cifra textos con el método Playfair usando una matriz 5x5. Cifrado por pares de letras usado en guerras mundiales. Visualización interactiva de la matriz.',
  keywords: 'cifrado playfair, digrama, matriz 5x5, criptografia, cifrado clasico, pares letras, wheatstone, primera guerra mundial',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cifrado Playfair Online | meskeIA',
    description: 'Cifra textos por pares de letras con matriz 5x5 visual.',
    url: 'https://meskeia.com/cifrado-playfair/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cifrado Playfair | meskeIA',
    description: 'Cifrado por digramas con visualización de matriz',
  },
};
