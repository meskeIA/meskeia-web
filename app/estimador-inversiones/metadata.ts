import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Inversiones - Asignación de Activos | meskeIA',
  description: 'Calcula y optimiza tu cartera de inversión. Asignación de activos según tu perfil de riesgo, análisis de diversificación y rebalanceo de portfolio.',
  keywords: 'calculadora inversiones, asset allocation, diversificación cartera, perfil inversor, rebalanceo portfolio, renta variable, renta fija',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Inversiones | meskeIA',
    description: 'Optimiza tu cartera con asignación de activos según tu perfil.',
    url: 'https://meskeia.com/estimador-inversiones/',
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
    title: 'Estimador de Inversiones | meskeIA',
    description: 'Calcula tu distribución óptima de activos de inversión.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Inversiones",
  description: "Calcula y optimiza tu cartera de inversión. Asignación de activos según tu perfil de riesgo, análisis de diversificación y rebalanceo de portfolio.",
  url: "https://meskeia.com/estimador-inversiones/",
  category: 'FinanceApplication',
  features: [],
});
