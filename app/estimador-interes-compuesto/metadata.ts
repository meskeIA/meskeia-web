import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Interés Compuesto - Simula tu Inversión | meskeIA',
  description: 'Calcula el interés compuesto de tus inversiones. Simula el crecimiento de tu capital con aportaciones periódicas y visualiza la evolución año a año.',
  keywords: 'interés compuesto, calculadora inversión, simulador ahorro, rentabilidad, capital final, aportaciones periódicas, fórmula interés compuesto',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Interés Compuesto | meskeIA',
    description: 'Simula el crecimiento de tu inversión con interés compuesto.',
    url: 'https://meskeia.com/estimador-interes-compuesto/',
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
    title: 'Estimador Interés Compuesto | meskeIA',
    description: 'Calcula cuánto crecerá tu dinero con el poder del interés compuesto.',
    images: ['https://meskeia.com/og-image.png']
  },
};
