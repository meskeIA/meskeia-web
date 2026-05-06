import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora Amortización Anticipada Hipoteca | meskeIA',
  description: 'Calcula el ahorro al amortizar anticipadamente tu hipoteca. Compara reducir cuota vs reducir plazo. Nuevo cuadro de amortización actualizado.',
  keywords: 'amortizacion anticipada, hipoteca, reducir cuota, reducir plazo, ahorro intereses, cancelacion parcial, prestamo vivienda',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Amortización Anticipada Hipoteca',
    description: 'Simula amortizaciones anticipadas: reducir cuota o reducir plazo',
    url: 'https://meskeia.com/amortizacion-hipoteca/',
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
    title: 'Amortización Anticipada Hipoteca',
    description: 'Calcula cuánto ahorras amortizando tu hipoteca anticipadamente',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Amortización Anticipada Hipoteca",
  description: "Calcula el ahorro al amortizar anticipadamente tu hipoteca. Compara reducir cuota vs reducir plazo. Nuevo cuadro de amortización actualizado.",
  url: 'https://meskeia.com/amortizacion-hipoteca/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
