import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador Lotería: Primitiva, Euromillones, Bonoloto | meskeIA',
  description: 'Genera números aleatorios para Primitiva, Euromillones, Bonoloto, El Gordo y Quiniela. Combinaciones al azar, historial y estadísticas. Gratis y sin registro.',
  keywords: 'generador loteria, numeros primitiva, euromillones, bonoloto, el gordo, quiniela, numeros aleatorios, combinaciones loteria, numeros suerte',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-loteria/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Números de Lotería - Primitiva, Euromillones, Bonoloto',
    description: 'Genera combinaciones aleatorias para las principales loterías españolas. Gratis y sin registro.',
    url: 'https://meskeia.com/generador-loteria/',
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
    title: 'Generador de Números de Lotería',
    description: 'Genera números para Primitiva, Euromillones, Bonoloto y más',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Números de Lotería',
  description: 'Generador de combinaciones aleatorias para loterías españolas: Primitiva, Euromillones, Bonoloto, El Gordo y Quiniela. Genera números al azar con historial y estadísticas.',
  url: 'https://meskeia.com/generador-loteria/',
  category: 'UtilityApplication',
  features: [
    'Generador de números aleatorios para 5 loterías españolas',
    'Primitiva, Euromillones, Bonoloto, El Gordo, Quiniela',
    'Múltiples combinaciones por sorteo',
    'Historial de combinaciones generadas',
    'Estadísticas básicas de los números generados',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: ['lotería', 'números aleatorios', 'Primitiva', 'Euromillones', 'Bonoloto'],
});
