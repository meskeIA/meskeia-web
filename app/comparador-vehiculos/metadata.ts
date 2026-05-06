import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador Compra Vehículo: Contado vs Financiación vs Renting vs Leasing | meskeIA',
  description: 'Compara las 4 formas de adquirir un coche: contado, financiación, renting y leasing. Calcula el coste total real de cada opción y descubre cuál te conviene más.',
  keywords: 'comparador coche, financiar coche, renting vs compra, leasing vehiculo, comprar coche contado, financiacion coche, calculadora renting, coste total vehiculo, TAE coche',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador Compra Vehículo: Contado vs Financiación vs Renting vs Leasing',
    description: 'Compara las 4 formas de adquirir un coche y descubre cuál te conviene más según tu situación.',
    url: 'https://meskeia.com/comparador-vehiculos',
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
    title: 'Comparador Compra Vehículo',
    description: 'Contado vs Financiación vs Renting vs Leasing: calcula el coste total real.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Vehículos meskeIA',
  },
};
