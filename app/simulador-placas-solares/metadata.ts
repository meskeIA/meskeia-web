import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Ahorro con Placas Solares - Autoconsumo España | meskeIA',
  description:
    'Calcula el ahorro anual con placas solares en España. Estima producción fotovoltaica, período de amortización, excedentes y reducción de CO2 según tu zona y consumo.',
  keywords:
    'placas solares, simulador fotovoltaica, autoconsumo solar España, ahorro placas solares, energía solar vivienda, amortización paneles solares, excedentes compensación, instalación fotovoltaica, kWp, irradiación solar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Ahorro con Placas Solares - Autoconsumo España',
    description:
      'Estima cuánto puedes ahorrar con una instalación fotovoltaica. Producción, amortización, excedentes y CO2 evitado según tu zona geográfica.',
    url: 'https://meskeia.com/simulador-placas-solares/',
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
    title: 'Simulador de Ahorro con Placas Solares',
    description:
      'Calcula tu ahorro con autoconsumo fotovoltaico en España. Producción, amortización y CO2 evitado gratis.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador Placas Solares meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Ahorro con Placas Solares',
  description:
    'Simulador que estima el ahorro anual de una instalación fotovoltaica en España. Calcula producción solar, período de amortización, compensación de excedentes y reducción de CO2 según zona geográfica, consumo y orientación del tejado.',
  url: 'https://meskeia.com/simulador-placas-solares/',
  features: [
    'Estimación de producción solar por zona geográfica española',
    'Cálculo de ahorro anual y período de amortización',
    'Comparativa con y sin batería de almacenamiento',
    'Compensación de excedentes vertidos a red',
    'Reducción de CO2 estimada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
