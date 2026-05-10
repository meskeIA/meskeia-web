import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona el Clima - Efecto Invernadero, Corrientes y Calentamiento Global | meskeIA',
  description: 'Entiende la ciencia del clima: diferencia entre tiempo y clima, efecto invernadero, corrientes oceánicas y consecuencias del calentamiento global a +1°C, +2°C y +4°C. Explicador visual interactivo.',
  keywords: 'clima, efecto invernadero, calentamiento global, CO2, corrientes oceánicas, Gulf Stream, El Niño, cambio climático, temperatura global, París 2015',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona el Clima - Efecto Invernadero y Calentamiento Global',
    description: 'La ciencia del clima explicada visualmente: efecto invernadero, corrientes oceánicas y qué pasa a +1°C, +2°C y +4°C de calentamiento.',
    url: 'https://meskeia.com/visualizador-clima/',
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
    title: 'Cómo Funciona el Clima - Explicador Visual',
    description: 'Efecto invernadero, corrientes oceánicas y calentamiento global explicados con datos y visualizaciones.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Clima meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona el Clima - Efecto Invernadero y Calentamiento Global',
  description: 'Explicador visual interactivo sobre la ciencia del clima: diferencia entre tiempo y clima, cómo funciona el efecto invernadero, el papel de las corrientes oceánicas, y las consecuencias del calentamiento global a distintos niveles de temperatura.',
  url: 'https://meskeia.com/visualizador-clima/',
  category: 'EducationalApplication',
  features: [
    'Diferencia visual entre tiempo meteorológico y clima',
    'Diagrama del efecto invernadero y balance energético de la Tierra',
    'Evolución histórica del CO2 atmosférico (280 → 425 ppm)',
    'Corrientes oceánicas: Gulf Stream, El Niño/La Niña',
    'Slider de calentamiento: consecuencias a +1°C, +2°C y +4°C',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
