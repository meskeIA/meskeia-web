import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Conversor de Unidades Científico - Longitud, Masa, Temperatura y más | meskeIA',
  description: 'Conversor de unidades completo con 13 categorías: longitud, masa, temperatura, área, volumen, tiempo, velocidad, datos, química, presión, energía, fuerza y potencia. Conversiones instantáneas y precisas.',
  keywords: 'conversor unidades, conversión metros, kilogramos, celsius fahrenheit, área, volumen, presión, energía, fuerza, potencia, química, mol',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de Unidades Científico | meskeIA',
    description: 'Convierte entre unidades de longitud, masa, temperatura, presión, energía y más. 13 categorías disponibles.',
    url: 'https://meskeia.com/conversor-unidades/',
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
    title: 'Conversor de Unidades Científico | meskeIA',
    description: 'Convierte entre unidades de longitud, masa, temperatura, presión, energía y más.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Conversor de Unidades Científico - Longitud, Masa, Temperatura y más",
  description: "Conversor de unidades completo con 13 categorías: longitud, masa, temperatura, área, volumen, tiempo, velocidad, datos, química, presión, energía, fuerza y potencia. Conversiones instantáneas y precisas.",
  url: 'https://meskeia.com/conversor-unidades/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
