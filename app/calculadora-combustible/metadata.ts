import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
    url: 'https://meskeia.com/calculadora-combustible/',
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
    title: 'Calculadora de Consumo de Combustible - meskeIA',
    description: 'Calcula el consumo de tu vehículo y el coste de tus viajes',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Consumo Combustible",
  description: "Calcula el consumo de combustible de tu vehículo en L/100km. Conoce el coste por kilómetro y planifica tus viajes con precisión.",
  url: "https://meskeia.com/calculadora-combustible/",
  category: 'FinanceApplication',
  features: [],
});
