import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora IMC - Índice de Masa Corporal | meskeIA',
  description: 'Calcula tu Índice de Masa Corporal (IMC) gratis. Conoce tu clasificación según la OMS: bajo peso, normal, sobrepeso u obesidad. Fórmula peso/altura².',
  keywords: 'calculadora imc, indice masa corporal, imc online, calcular imc, peso ideal, clasificacion oms, sobrepeso, obesidad, bajo peso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS. Herramienta rápida y precisa.',
    url: 'https://meskeia.com/calculadora-imc',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora IMC - Índice de Masa Corporal',
    description: 'Calcula tu IMC gratis y conoce tu clasificación según la OMS.',
  },
};
