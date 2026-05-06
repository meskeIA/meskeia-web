import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador IMC - Índice de Masa Corporal | meskeIA',
  description: 'Calcula tu Índice de Masa Corporal (IMC) gratis. Conoce tu clasificación según la OMS: bajo peso, normal, sobrepeso u obesidad. Fórmula peso/altura².',
  keywords: 'calculadora imc, indice masa corporal, imc online, calcular imc, peso ideal, clasificacion oms, sobrepeso, obesidad, bajo peso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS. Herramienta rápida y precisa.',
    url: 'https://meskeia.com/orientador-imc',
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
    title: 'Orientador IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS.',
    images: ['https://meskeia.com/og-image.png']
  },
};
