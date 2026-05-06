import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Económico - Expansión, Recesión y Curva de Rendimientos | meskeIA',
  description:
    'Visualiza las fases del ciclo económico: expansión, pico, recesión y recuperación. Indicadores leading y lagging, curva de rendimientos invertida y su valor predictivo.',
  keywords: [
    'ciclo economico',
    'expansion economica',
    'recesion',
    'indicadores economicos',
    'curva rendimientos',
    'yield curve invertida',
    'PIB',
    'PMI',
    'indicadores leading',
    'indicadores lagging',
    'economia bachillerato',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ciclo Económico | meskeIA',
    description:
      'Fases del ciclo, indicadores leading/lagging y curva de rendimientos explicados visualmente',
    url: 'https://meskeia.com/visualizador-ciclo-economico/',
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
    title: 'Ciclo Económico — Expansión, Recesión y Yield Curve | meskeIA',
    description:
      'Fases del ciclo económico, indicadores líderes y curva de rendimientos invertida como predictor de recesión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Ciclo Económico meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Ciclo Económico',
  description:
    'Herramienta educativa interactiva para comprender las fases del ciclo económico, los indicadores leading, coincident y lagging, la curva de rendimientos y su valor predictivo en recesiones.',
  url: 'https://meskeia.com/visualizador-ciclo-economico/',
  features: [
    'Animación SVG de las 4 fases del ciclo económico (expansión, pico, recesión, valle)',
    'Indicadores leading, coincident y lagging explicados con datos reales',
    'Curva de rendimientos normal, plana e invertida con animación',
    'Simulador interactivo para estimar la fase económica actual',
    'Ejemplos históricos de España y economías globales',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
