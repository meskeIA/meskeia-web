import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Electricidad - Ley de Ohm, Potencia, Circuitos | meskeIA',
  description: 'Calculadora eléctrica completa: Ley de Ohm (V=IR), potencia eléctrica, resistencias en serie y paralelo, consumo energético y costes. Ideal para estudiantes y electricistas.',
  keywords: 'calculadora electricidad, ley de ohm, potencia eléctrica, resistencias, voltaje, corriente, circuitos, consumo energético, kWh',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Electricidad | meskeIA',
    description: 'Calcula Ley de Ohm, potencia, circuitos serie/paralelo y consumo energético.',
    url: 'https://meskeia.com/calculadora-electricidad/',
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
    title: 'Calculadora de Electricidad | meskeIA',
    description: 'Calcula Ley de Ohm, potencia, circuitos serie/paralelo y consumo energético.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Electricidad - Ley de Ohm, Potencia, Circuitos",
  description: "Calculadora eléctrica completa: Ley de Ohm (V=IR), potencia eléctrica, resistencias en serie y paralelo, consumo energético y costes. Ideal para estudiantes y electricistas.",
  url: 'https://meskeia.com/calculadora-electricidad/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
