import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Percentiles Infantiles - Peso y Talla OMS | meskeIA',
  description: 'Calcula el percentil de peso y talla de tu bebé o niño según las tablas de crecimiento de la OMS. Compara con niños de su misma edad y sexo.',
  keywords: 'calculadora percentiles, percentil peso bebé, percentil talla niño, tablas OMS, crecimiento infantil, curvas crecimiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
    url: 'https://meskeia.com/calculadora-percentiles',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Percentiles Infantiles - meskeIA',
    description: 'Calcula el percentil de peso y talla de tu hijo según tablas OMS',
  },
};
