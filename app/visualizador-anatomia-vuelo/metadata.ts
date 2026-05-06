import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado | meskeIA',
  description: 'Entiende por que vuelan los aviones: principio de Bernoulli, las 7 fases del vuelo, datos reales Madrid-Londres y como funciona la cabina. Explicador visual interactivo.',
  keywords: 'como vuela un avion, principio de Bernoulli, fases del vuelo, sustentacion, aerodinamica, cabina piloto, altimetro, vuelo Madrid Londres, aviacion, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado',
    description: 'Aerodinamica, fases del vuelo, datos reales y la cabina del piloto explicados visualmente.',
    url: 'https://meskeia.com/visualizador-anatomia-vuelo',
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
    title: 'Anatomia de un Vuelo - Explicador Visual',
    description: 'Por que vuelan los aviones, las 7 fases de un vuelo y datos reales de un Madrid-Londres.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Anatomia Vuelo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomia de un Vuelo - Como Vuela un Avion Explicado',
  description: 'Explicador visual interactivo sobre como funcionan los aviones: principio de Bernoulli, las 4 fuerzas del vuelo, las 7 fases de despegue a aterrizaje, datos reales de un Madrid-Londres y los instrumentos de la cabina.',
  url: 'https://meskeia.com/visualizador-anatomia-vuelo/',
  category: 'EducationalApplication',
  features: [
    'Diagrama interactivo de las 4 fuerzas del vuelo (sustentacion, peso, empuje, resistencia)',
    'Las 7 fases del vuelo con perfil de altitud y velocidades reales',
    'Datos reales del vuelo Madrid-Londres: distancia, combustible, CO2, comparativas',
    'Instrumentos de cabina explicados: altimetro, horizonte artificial, velocimetro',
    'Funciona 100% en el navegador, sin registro ni instalacion',
    'Gratuito y sin publicidad',
    'Disponible en espanol',
  ],
});
