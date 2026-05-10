import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Peso de los Números - Escalas Numéricas Visuales | meskeIA',
  description: 'Visualiza qué significa realmente un millón, un billón o la deuda pública. Comparaciones visuales que hacen tangibles cifras abstractas.',
  keywords: 'escalas numéricas, un millón, un billón, deuda pública, comparaciones, perspectiva numérica, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Peso de los Números',
    description: '¿Qué significa realmente un billón? Comparaciones que hacen tangibles las grandes cifras.',
    url: 'https://meskeia.com/visualizador-peso-numeros/',
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
    title: 'El Peso de los Números',
    description: 'Escalas numéricas que desafían la intuición: de un euro a un billón.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Peso Números meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Peso de los Números',
  description: 'Explicador visual de escalas numéricas: qué significa un millón, mil millones, un billón. Comparaciones con objetos cotidianos, PIB, deuda pública y salarios que hacen tangibles cifras abstractas.',
  url: 'https://meskeia.com/visualizador-peso-numeros/',
  features: [
    'Escalas de 1 € a 1 billón € visualizadas',
    'Comparaciones con objetos y conceptos cotidianos',
    'Visualización de la deuda pública española',
    'Cuánto tardarías en contar cada cifra',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
