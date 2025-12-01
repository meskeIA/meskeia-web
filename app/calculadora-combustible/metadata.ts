import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Consumo de Combustible - Litros/100km y Coste | meskeIA',
  description: 'Calcula el consumo de combustible de tu vehículo en L/100km. Conoce el coste por kilómetro y planifica tus viajes con precisión.',
  keywords: 'calculadora consumo combustible, litros 100km, coste por kilómetro, consumo coche, gasolina, diesel, calculadora viaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Consumo de Combustible - meskeIA',
    description: 'Calcula el consumo de tu vehículo y el coste de tus viajes',
    url: 'https://meskeia.com/calculadora-combustible',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Consumo de Combustible - meskeIA',
    description: 'Calcula el consumo de tu vehículo y el coste de tus viajes',
  },
};
