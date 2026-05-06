import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Notas Académicas - Media Ponderada y EvAU | meskeIA',
  description: 'Calcula tu media ponderada con créditos ECTS, simula tu nota de EvAU, convierte entre escalas de calificación y descubre qué nota necesitas para aprobar.',
  keywords: 'calculadora notas, media ponderada, ECTS, EvAU, selectividad, GPA, conversor notas, expediente académico, universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-notas/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Notas Académicas | meskeIA',
    description: 'Calcula tu media ponderada, simula EvAU y convierte entre escalas de calificación.',
    url: 'https://meskeia.com/calculadora-notas/',
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
    title: 'Calculadora de Notas Académicas | meskeIA',
    description: 'Media ponderada ECTS, simulador EvAU y conversor de escalas.',
    images: ['https://meskeia.com/og-image.png']
  },
};
