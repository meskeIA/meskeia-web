import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mercado Inmobiliario: Burbuja, Accesibilidad y Ciudades — meskeIA',
  description:
    'Visualizador del mercado de vivienda español. Curvas oferta/demanda interactivas, burbuja 2008, ratio precio/renta por ciudad, accesibilidad generacional y alquiler vs compra.',
  keywords: [
    'mercado inmobiliario España',
    'burbuja inmobiliaria 2008',
    'precio vivienda por ciudad',
    'ratio precio renta vivienda',
    'accesibilidad vivienda millennials',
    'alquiler vs compra España',
    'oferta demanda vivienda',
    'precio vivienda Madrid Barcelona',
  ],
  openGraph: {
    title: 'Mercado Inmobiliario: Burbuja, Accesibilidad y Ciudades — meskeIA',
    description:
      'La economía del mercado de vivienda en España: de la burbuja 2008 a los nuevos máximos.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
