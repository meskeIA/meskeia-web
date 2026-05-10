import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Productividad Freelance - Ingresos por Hora Real | meskeIA',
  description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva de trabajo descontando reuniones, gestión y tiempo no facturable. 100% gratis.',
  keywords: 'productividad freelance, ingresos por hora, rentabilidad proyectos, tiempo efectivo, calculadora freelance, eficiencia trabajo, autonomo productividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Productividad Freelance | meskeIA',
    description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva descontando tiempo no facturable.',
    url: 'https://meskeia.com/calculadora-productividad/',
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
    title: 'Calculadora de Productividad Freelance | meskeIA',
    description: 'Calcula tu productividad real como freelance. Analiza ingresos por hora efectiva descontando tiempo no facturable.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Productividad meskeIA',
  },
};
