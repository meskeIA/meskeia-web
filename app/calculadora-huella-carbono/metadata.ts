import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Huella de Carbono Personal - meskeIA',
  description: 'Calcula tu huella de carbono anual. Analiza el impacto de tu transporte, hogar, alimentación y consumo. Compara con la media española y obtén consejos para reducirla.',
  keywords: 'huella de carbono, calculadora CO2, emisiones personales, sostenibilidad, cambio climático, medio ambiente, huella ecológica, carbono personal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Huella de Carbono Personal - meskeIA',
    description: 'Calcula tu huella de carbono anual y descubre cómo reducir tu impacto ambiental.',
    url: 'https://meskeia.com/calculadora-huella-carbono',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Huella de Carbono Personal',
    description: 'Calcula tu huella de carbono anual y descubre cómo reducir tu impacto ambiental.',
  },
  other: {
    'application-name': 'Calculadora Huella de Carbono meskeIA',
  },
};
