import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Fondo de Inversión: Por Dentro | meskeIA',
  description:
    'Cómo funciona un fondo de inversión por dentro: NAV, gestión activa vs indexada, el impacto devastador de las comisiones a largo plazo y qué significa diversificar de verdad. Educativo — sin recomendaciones de fondos concretos.',
  keywords: [
    'fondo de inversión cómo funciona',
    'NAV valor liquidativo',
    'gestión activa vs indexada',
    'comisiones fondo impacto',
    'fondo índice ventajas',
    'diversificación real inversión',
    'SPIVA estudio fondos activos',
    'ETF vs fondo inversión',
  ],
  openGraph: {
    title: 'Fondo de Inversión: Por Dentro | meskeIA',
    description:
      'El 85% de los fondos activos no baten al índice en 10 años — y las comisiones son la razón principal.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Fondo de Inversión: Por Dentro",
  description: "Cómo funciona un fondo de inversión por dentro: NAV, gestión activa vs indexada, el impacto devastador de las comisiones a largo plazo y qué significa diversificar de verdad. Educativo — sin recomenda",
  url: "https://meskeia.com/visualizador-fondo-inversion/",
  category: 'FinanceApplication',
  features: [],
});
