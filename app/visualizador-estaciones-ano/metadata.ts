import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo | meskeIA',
  description: 'Explora por qué existen las estaciones: inclinación de 23,5°, solsticios, equinoccios, horas de luz por latitud y mitos comunes. Explicador visual interactivo.',
  keywords: 'estaciones del año, inclinación eje terrestre, 23.5 grados, solsticio, equinoccio, horas de luz, latitud, órbita terrestre, perihelio, afelio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo',
    description: 'La Tierra no está más cerca del Sol en verano. La clave son 23,5° de inclinación. Explora la órbita, horas de luz y mitos.',
    url: 'https://meskeia.com/visualizador-estaciones-ano/',
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
    title: 'Las Estaciones del Año - Explicador Visual Interactivo',
    description: 'Por qué 23,5° de inclinación explican las estaciones. Solsticios, equinoccios, horas de luz y mitos desmontados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estaciones del Año meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Estaciones del Año - Por qué la Inclinación de 23,5° lo Cambia Todo',
  description: 'Explicador visual interactivo sobre las estaciones: la inclinación del eje terrestre de 23,5°, la órbita en 4 posiciones clave, horas de luz por latitud, solsticios y equinoccios, y mitos desmontados como que estamos más cerca del Sol en verano.',
  url: 'https://meskeia.com/visualizador-estaciones-ano/',
  category: 'EducationalApplication',
  features: [
    'Diagrama SVG de la órbita terrestre con las 4 posiciones clave (solsticios y equinoccios)',
    'Slider de latitud: horas de luz desde el ecuador hasta los polos en cada estación',
    'Fechas exactas de solsticios y equinoccios con explicación de cada fenómeno',
    'Mitos desmontados: perihelio en enero, afelio en julio, estaciones en otros planetas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
