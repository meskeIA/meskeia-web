import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Plantas de Interior - Cuidados, luz y toxicidad | meskeIA',
  description: '40 plantas de interior: nivel de luz, frecuencia de riego, humedad, toxicidad para mascotas y cuidados específicos. Filtros por luz, dificultad y aptitud para mascotas.',
  keywords: 'plantas de interior, cuidado de plantas, luz para plantas, riego plantas interior, plantas aptas mascotas, plantas tóxicas gatos, plantas fáciles, decoración con plantas, plantas para principiantes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía de Plantas de Interior - meskeIA',
    description: '40 plantas de interior con cuidados detallados, toxicidad para mascotas y filtros por luz y dificultad.',
    url: 'https://meskeia.com/guia-plantas-interior/',
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
    title: 'Guía de Plantas de Interior',
    description: '40 plantas con nivel de luz, riego, toxicidad para mascotas y consejos de cuidado.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-plantas-interior/',
  },
};
