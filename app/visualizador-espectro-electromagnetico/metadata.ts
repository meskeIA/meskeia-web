import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Espectro Electromagnético - De Radio a Rayos Gamma | meskeIA',
  description: 'Explora el espectro electromagnético completo: radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X y gamma. Descubre que tu móvil, un horno y una radiografía usan el mismo fenómeno.',
  keywords: 'espectro electromagnético, ondas electromagnéticas, luz visible, radio, microondas, infrarrojo, ultravioleta, rayos X, gamma, frecuencia, longitud de onda, radiación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Espectro Electromagnético - De Radio a Rayos Gamma',
    description: 'Explora las 7 bandas del espectro EM: radio, microondas, infrarrojo, visible, UV, rayos X y gamma. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-espectro-electromagnetico',
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
    title: 'Espectro Electromagnético - Explicador Visual Interactivo',
    description: 'Radio, microondas, infrarrojo, visible, UV, rayos X y gamma: el mismo fenómeno a distinta frecuencia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Espectro Electromagnético meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Espectro Electromagnético - De Radio a Rayos Gamma',
  description: 'Explicador visual interactivo del espectro electromagnético: barra logarítmica con las 7 bandas, detalle de cada tipo de radiación con aplicaciones reales, escala de energía y peligro, y curiosidades históricas desde Maxwell hasta el fondo cósmico de microondas.',
  url: 'https://meskeia.com/visualizador-espectro-electromagnetico/',
  category: 'EducationalApplication',
  features: [
    'Barra logarítmica del espectro EM completo con 7 bandas clickables',
    'Detalle de cada banda: radio, microondas, infrarrojo, visible, UV, rayos X, gamma',
    'Escala de energía y peligro: radiación ionizante vs no ionizante',
    'Relación c = λ × f y E = h × f explicada visualmente',
    'Curiosidades: Maxwell, Hertz, fondo cósmico de microondas',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
