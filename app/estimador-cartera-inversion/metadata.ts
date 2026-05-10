import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Estimador de Cartera de Inversión - Monte Carlo | meskeIA',
  description: 'Simula la evolución de tu cartera de inversión con Monte Carlo. Visualiza escenarios, calcula Sharpe, volatilidad y probabilidad de alcanzar tus objetivos financieros.',
  keywords: 'simulador cartera, monte carlo inversión, backtesting, sharpe ratio, volatilidad, simulador inversiones, cartera indexada, proyección patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Cartera de Inversión | meskeIA',
    description: 'Simula 1000 escenarios para tu cartera. Visualiza la evolución probable de tu patrimonio con análisis Monte Carlo.',
    url: 'https://meskeia.com/estimador-cartera-inversion/',
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
    title: 'Estimador de Cartera de Inversión | meskeIA',
    description: 'Proyecta tu cartera con simulación Monte Carlo. Sharpe, volatilidad y escenarios.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Cartera de Inversión - Monte Carlo",
  description: "Simula la evolución de tu cartera de inversión con Monte Carlo. Visualiza escenarios, calcula Sharpe, volatilidad y probabilidad de alcanzar tus objetivos financieros.",
  url: 'https://meskeia.com/estimador-cartera-inversion/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
