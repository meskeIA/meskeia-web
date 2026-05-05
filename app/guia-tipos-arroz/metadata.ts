import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Tipos de Arroz del Mundo | meskeIA',
  description:
    'Guía de referencia de 30 variedades de arroz: basmati, jazmín, bomba, arborio, sushi y más. Tipo de grano, origen, cocción y uso ideal.',
  keywords: [
    'tipos de arroz',
    'variedades arroz',
    'basmati jazmin bomba',
    'arborio carnaroli risotto',
    'arroz sushi',
    'como cocinar arroz',
    'arroz paella',
  ],
  openGraph: {
    title: 'Guía de Tipos de Arroz del Mundo | meskeIA',
    description:
      'Guía de referencia de 30 variedades de arroz del mundo: tipo de grano, origen, tiempo de cocción, proporción de agua y uso culinario ideal.',
    type: 'website',
    url: 'https://meskeia.com/guia-tipos-arroz',
    locale: 'es_ES',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Tipos de Arroz del Mundo',
    description:
      'Aprende a elegir el arroz correcto para cada plato: 30 variedades del mundo, su origen, características y uso ideal.',
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-tipos-arroz',
  },
  robots: {
    index: true,
    follow: true,
  },
};
