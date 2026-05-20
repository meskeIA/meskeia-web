import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Filtro ND para Vídeo - Regla de los 180° | meskeIA',
  description: 'Descubre qué filtro de densidad neutra necesitas para cumplir la regla de los 180° en vídeo. Introduce tu fps y velocidad de obturación actual y obtén el ND exacto.',
  keywords: 'filtro ND, densidad neutra, regla 180 grados, videografía, obturador vídeo, ND2 ND4 ND8 ND16 ND64 ND1000, motion blur natural',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Filtro ND para Vídeo | meskeIA',
    description: 'Encuentra el filtro ND necesario para cumplir la regla de los 180° en videografía. Tabla comparativa de ND2 a ND1000.',
    url: 'https://meskeia.com/calculadora-filtro-nd-video',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Filtro ND para Vídeo | meskeIA',
    description: 'Encuentra el filtro ND necesario para cumplir la regla de los 180° en videografía.',
  },
  other: {
    'application-name': 'Calculadora Filtro ND Vídeo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Filtro ND para Vídeo',
  description: 'Calculadora de filtro de densidad neutra para videografía. Introduce tu frame rate y velocidad de obturación actual para saber exactamente qué filtro ND necesitas para cumplir la regla de los 180°.',
  url: 'https://meskeia.com/calculadora-filtro-nd-video/',
  category: 'UtilityApplication',
  features: [
    'Cálculo exacto de paradas ND necesarias',
    'Tabla comparativa de opciones ND2 a ND1000',
    'Obturador resultante con cada filtro',
    'Filtro recomendado destacado automáticamente',
    'Basado en la regla de los 180° para motion blur natural',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
