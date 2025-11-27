import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Jubilación - Planifica tu Retiro | meskeIA',
  description: 'Calcula cuánto necesitas ahorrar para tu jubilación. Simulador con diferentes escenarios de rentabilidad, aportaciones periódicas y proyección del capital.',
  keywords: 'calculadora jubilación, planificación retiro, ahorro jubilación, pensión, plan pensiones, FIRE, independencia financiera',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Jubilación | meskeIA',
    description: 'Planifica tu jubilación y calcula cuánto necesitas ahorrar.',
    url: 'https://meskeia.com/calculadora-jubilacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Jubilación | meskeIA',
    description: 'Simula tu retiro y planifica tu independencia financiera.',
  },
};
