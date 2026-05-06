import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía del Té - Variedades, origen y preparación | meskeIA',
  description: '40 variedades de té del mundo: familia, temperatura, tiempo de infusión, notas de sabor y nivel de cafeína. Verdes, negros, oolong, blancos, pu-erh y rooibos.',
  keywords: 'guia te variedades, te verde japones, te negro darjeeling, oolong taiwan, te blanco china, pu-erh, rooibos, infusion temperatura, te especialidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía del Té | meskeIA',
    description: '40 variedades de té: familia, temperatura de infusión, tiempo, notas de sabor y nivel de cafeína.',
    url: 'https://meskeia.com/guia-te/',
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
    title: 'Guía del Té | meskeIA',
    description: '40 variedades de té del mundo: temperatura, tiempo de infusión, notas de sabor y cafeína.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Guía del Té meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía del Té',
  description: 'Directorio de 40 variedades de té del mundo con familia (verde, negro, oolong, blanco, pu-erh, amarillo, rooibos), país y región de origen, temperatura de infusión, tiempo, cantidad, nivel de cafeína, notas de sabor y curiosidades históricas. Filtros por familia y búsqueda libre.',
  url: 'https://meskeia.com/guia-te/',
  features: [
    '40 variedades de té con perfil completo',
    'Filtros por familia de té',
    'Búsqueda por nombre, país, región o notas de sabor',
    'Temperatura y tiempo de infusión exactos por variedad',
    'Indicador visual de nivel de cafeína',
    'Nombres originales en su idioma de procedencia',
    'Curiosidades históricas y culturales',
    'Funciona 100% en el navegador, sin registro',
  ],
});
