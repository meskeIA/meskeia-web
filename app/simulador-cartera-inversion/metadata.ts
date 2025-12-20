import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Cartera de Inversión - Monte Carlo | meskeIA',
  description: 'Simula la evolución de tu cartera de inversión con Monte Carlo. Visualiza escenarios, calcula Sharpe, volatilidad y probabilidad de alcanzar tus objetivos financieros.',
  keywords: 'simulador cartera, monte carlo inversión, backtesting, sharpe ratio, volatilidad, simulador inversiones, cartera indexada, proyección patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Cartera de Inversión | meskeIA',
    description: 'Simula 1000 escenarios para tu cartera. Visualiza la evolución probable de tu patrimonio con análisis Monte Carlo.',
    url: 'https://meskeia.com/simulador-cartera-inversion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Cartera de Inversión | meskeIA',
    description: 'Proyecta tu cartera con simulación Monte Carlo. Sharpe, volatilidad y escenarios.',
  },
};
