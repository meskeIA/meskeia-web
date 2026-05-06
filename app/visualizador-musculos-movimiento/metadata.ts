import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Músculos y Movimiento - Contracción, Articulaciones y ATP | meskeIA',
  description: 'Sarcómero, actina/miosina, tipos de músculo (esquelético, liso, cardíaco), articulaciones y palancas. Explicador visual interactivo.',
  keywords: 'musculos, contraccion muscular, sarcomero, actina, miosina, articulaciones, ATP, musculo esqueletico, musculo liso, musculo cardiaco',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Músculos y Movimiento - Contracción, Articulaciones y ATP',
    description: 'Tipos de músculo, sarcómero, modelo de filamentos deslizantes y articulaciones del cuerpo humano explicados visualmente.',
    url: 'https://meskeia.com/visualizador-musculos-movimiento',
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
    title: 'Músculos y Movimiento - Explicador Visual',
    description: 'Del sarcómero a las articulaciones: cómo se mueve el cuerpo humano.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Músculos y Movimiento meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Músculos y Movimiento - Contracción, Articulaciones y ATP',
  description: 'Explicador visual interactivo de músculos: tipos de tejido muscular, contracción del sarcómero (actina/miosina), articulaciones y palancas, datos y curiosidades.',
  url: 'https://meskeia.com/visualizador-musculos-movimiento/',
  category: 'EducationalApplication',
  features: [
    'Tipos de músculo con SVG de fibras',
    'Sarcómero y modelo de filamentos deslizantes',
    'Articulaciones y sistema de palancas',
    'Datos y curiosidades musculares',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
