import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Descuentos Online - Calcula Rebajas y Ofertas | meskeIA',
  description: 'Calculadora de descuentos gratuita. Calcula el precio final con descuento, ahorro en euros y descuentos encadenados. Ideal para rebajas, Black Friday y ofertas.',
  keywords: 'calculadora descuentos, calcular rebaja, precio final, ahorro, black friday, rebajas, ofertas, porcentaje descuento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Descuentos Online - meskeIA',
    description: 'Calcula el precio final con descuento y cuánto ahorras. Perfecta para rebajas y ofertas.',
    url: 'https://meskeia.com/calculadora-descuentos/',
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
    title: 'Calculadora de Descuentos Online',
    description: 'Calcula el precio final con descuento y cuánto ahorras.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Descuentos Online - Calcula Rebajas y Ofertas",
  description: "Calculadora de descuentos gratuita. Calcula el precio final con descuento, ahorro en euros y descuentos encadenados. Ideal para rebajas, Black Friday y ofertas.",
  url: 'https://meskeia.com/calculadora-descuentos/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
