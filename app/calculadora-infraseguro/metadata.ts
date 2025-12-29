import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Infraseguro - Regla Proporcional | meskeIA',
  description: 'Calcula cuánto cobrarás en caso de siniestro si tienes infraseguro. Aplica la regla proporcional según la Ley de Contrato de Seguro (art. 30).',
  keywords: 'infraseguro, regla proporcional, seguro hogar, indemnización siniestro, capital asegurado, valor real, ley contrato seguro, artículo 30',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Infraseguro - Regla Proporcional | meskeIA',
    description: 'Calcula cuánto cobrarás en caso de siniestro si tu capital asegurado es inferior al valor real.',
    url: 'https://meskeia.com/calculadora-infraseguro/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Infraseguro - meskeIA',
    description: 'Calcula la indemnización real aplicando la regla proporcional del infraseguro.',
  },
  alternates: {
    canonical: 'https://meskeia.com/calculadora-infraseguro/',
  },
};
