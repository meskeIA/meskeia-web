import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Los Números Primos - Criba de Eratóstenes y Espiral de Ulam | meskeIA',
  description: 'Visualiza la criba de Eratóstenes animada, la espiral de Ulam, primos gemelos y por qué la criptografía RSA depende de los primos. Explicador visual interactivo.',
  keywords: 'números primos, criba eratóstenes, espiral ulam, primos gemelos, RSA, criptografía, mersenne, riemann, matemáticas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Números Primos - Explicador Visual',
    description: 'Criba de Eratóstenes animada, espiral de Ulam y criptografía RSA. Tu tarjeta de crédito depende de los primos.',
    url: 'https://meskeia.com/visualizador-numeros-primos/',
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
    title: 'Los Números Primos - Explicador Visual',
    description: 'Criba animada, espiral de Ulam y por qué RSA depende de los primos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Números Primos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Los Números Primos',
  description: 'Explicador visual de números primos: criba de Eratóstenes animada paso a paso, espiral de Ulam con patrones diagonales, primos gemelos, criptografía RSA y récords mundiales. Interactivo y educativo.',
  url: 'https://meskeia.com/visualizador-numeros-primos/',
  features: [
    'Criba de Eratóstenes animada paso a paso con velocidad ajustable',
    'Espiral de Ulam con patrones diagonales de primos',
    'Explicación visual de criptografía RSA',
    'Primos gemelos, de Mersenne y récords mundiales',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
