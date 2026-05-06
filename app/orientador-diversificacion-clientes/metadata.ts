import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
  description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
  keywords: 'diversificación clientes, concentración cartera, Herfindahl, falso autónomo, freelance, dependencia cliente, TRADE, HHI',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
    description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
    url: 'https://meskeia.com/orientador-diversificacion-clientes',
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
    title: 'Orientador de Diversificación de Clientes Freelance | meskeIA',
    description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl. Detecta dependencia excesiva y riesgo de falso autónomo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Diversificación Clientes meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Diversificación de Clientes Freelance',
  description: 'Analiza la concentración de tu cartera de clientes con el índice Herfindahl-Hirschman (HHI). Detecta dependencia excesiva, riesgo de falso autónomo (TRADE) y sugiere estrategias de diversificación.',
  url: 'https://meskeia.com/orientador-diversificacion-clientes/',
  features: [
    'Cálculo del índice Herfindahl-Hirschman (HHI) para freelancers',
    'Detección de riesgo de falso autónomo (TRADE, art. 11 LETA)',
    'Gráfico donut de distribución de clientes',
    'Escenarios comparativos (actual, ideal, sin cliente principal)',
    'Estrategias personalizadas de diversificación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
