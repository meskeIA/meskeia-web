import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador de Hipoteca - Calcula tu Cuota Mensual | meskeIA',
  description: 'Calcula la cuota mensual de tu hipoteca. Simulador con sistema francés, tabla de amortización completa, comparador de ofertas y análisis de gastos.',
  keywords: 'simulador hipoteca, calculadora hipoteca, cuota mensual, amortización francesa, préstamo hipotecario, TAE, euríbor',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Hipoteca | meskeIA',
    description: 'Calcula tu cuota hipotecaria y visualiza la amortización completa.',
    url: 'https://meskeia.com/estimador-hipoteca/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimador de Hipoteca | meskeIA',
    description: 'Simula tu hipoteca con tabla de amortización y comparador de ofertas.',
  },
};
