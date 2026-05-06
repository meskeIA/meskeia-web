import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tabla Periódica Interactiva - 118 Elementos con Propiedades | meskeIA',
  description: 'Tabla periódica interactiva con los 118 elementos químicos. Filtros por familia y estado, información detallada, calculadora de masa molar. 100% gratis para estudiantes.',
  keywords: 'tabla periodica, elementos quimicos, quimica, masa molar, propiedades elementos, metales, no metales, gases nobles, lantanidos, actinidos, educacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/tabla-periodica/',
  },
  openGraph: {
    type: 'website',
    title: 'Tabla Periódica Interactiva | meskeIA',
    description: 'Explora los 118 elementos químicos de forma interactiva. Filtros, información detallada y calculadora de masa molar incluida.',
    url: 'https://meskeia.com/tabla-periodica/',
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
    title: 'Tabla Periódica Interactiva | meskeIA',
    description: 'Explora los 118 elementos químicos de forma visual y educativa.',
    images: ['https://meskeia.com/og-image.png']
  },
};
