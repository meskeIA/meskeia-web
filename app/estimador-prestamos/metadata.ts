import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Estimador de Préstamos - Francés, Alemán y Americano | meskeIA',
  description: 'Compara sistemas de amortización: francés (cuota fija), alemán (amortización constante) y americano. Cuadro completo, TAE vs TIN y comisiones.',
  keywords: 'prestamo, simulador, amortizacion, frances, aleman, americano, cuota, interes, TAE, TIN, cuadro amortizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Préstamos - Compara Sistemas de Amortización',
    description: 'Calcula y compara préstamos con sistema francés, alemán y americano',
    url: 'https://meskeia.com/estimador-prestamos/',
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
    title: 'Estimador de Préstamos',
    description: 'Compara sistemas de amortización y calcula tu préstamo ideal',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Préstamos - Francés, Alemán y Americano",
  description: "Compara sistemas de amortización: francés (cuota fija), alemán (amortización constante) y americano. Cuadro completo, TAE vs TIN y comisiones.",
  url: 'https://meskeia.com/estimador-prestamos/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
