import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'De dónde Viene tu Camiseta - Cadena de Producción Global | meskeIA',
  description: 'Descubre el recorrido de una camiseta de 15€: 6 etapas, 4 países, costes reales y el impacto humano y ambiental de cada paso. Ideal para Bachillerato.',
  keywords: 'origen camiseta, cadena producción textil, moda rápida geografía, economía bachillerato, coste mano obra textil, impacto ambiental ropa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'De dónde Viene tu Camiseta',
    description: 'El viaje global de una camiseta de 15€: algodón, hilado, tinte, confección, transporte y tienda. Costes reales por etapa.',
    url: 'https://meskeia.com/visualizador-origen-camiseta',
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
    title: 'De dónde Viene tu Camiseta',
    description: '¿Cuánto cuesta realmente hacer una camiseta? Descubre el desglose global etapa por etapa.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Origen Camiseta meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'De dónde Viene tu Camiseta',
  description: 'Explicador visual de la cadena de producción global de una camiseta de 15€: 6 etapas, costes reales, países implicados, tiempo de producción e impacto laboral y ambiental.',
  url: 'https://meskeia.com/visualizador-origen-camiseta/',
  features: [
    'Timeline interactivo de 6 etapas de producción',
    'Desglose visual de costes por etapa (barra de composición del precio)',
    'País con bandera, coste, tiempo e impacto por cada fase',
    'Datos sobre condiciones laborales e impacto ambiental',
    'Enfocado para Geografía y Economía de Bachillerato',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
});
