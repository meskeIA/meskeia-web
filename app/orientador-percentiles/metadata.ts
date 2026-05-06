import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador Percentiles Infantiles - Peso y Talla OMS | meskeIA',
  description: 'Calcula el percentil de peso y talla de tu bebé o niño según las tablas de crecimiento de la OMS. Compara con niños de su misma edad y sexo.',
  keywords: 'calculadora percentiles, percentil peso bebé, percentil talla niño, tablas OMS, crecimiento infantil, curvas crecimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
    url: 'https://meskeia.com/orientador-percentiles',
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
    title: 'Orientador Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
    images: ['https://meskeia.com/og-image.png']
  },
};
