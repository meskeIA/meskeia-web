import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona la Probabilidad - Explicador Visual | meskeIA',
  description: 'Visualiza por qué tu intuición falla con la probabilidad: dados, monedas, cumpleaños y la ley de los grandes números. Simulaciones interactivas.',
  keywords: 'probabilidad, ley grandes números, paradoja cumpleaños, dados, monedas, estadística, bachillerato, matemáticas, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona la Probabilidad',
    description: 'Tu intuición falla con la probabilidad. Visualízalo con simulaciones interactivas.',
    url: 'https://meskeia.com/visualizador-probabilidad',
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
    title: 'Cómo Funciona la Probabilidad',
    description: 'Dados, monedas y la paradoja del cumpleaños. Probabilidad visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Probabilidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona la Probabilidad',
  description: 'Explicador visual de probabilidad: la falacia del jugador, la ley de los grandes números, la paradoja del cumpleaños y por qué las rachas no significan lo que crees. Simulaciones interactivas.',
  url: 'https://meskeia.com/visualizador-probabilidad/',
  features: [
    'Simulación de lanzamiento de monedas con ley de grandes números',
    'La falacia del jugador explicada visualmente',
    'Paradoja del cumpleaños interactiva',
    'Probabilidad en dados con distribución visual',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
