import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Colesterol - Ratios y Riesgo Cardiovascular | meskeIA',
  description: 'Analiza tus niveles de colesterol: ratio CT/HDL, LDL/HDL, colesterol no-HDL y fórmula de Friedewald. Interpretación de resultados y recomendaciones. 100% gratis y privado.',
  keywords: 'colesterol, HDL, LDL, triglicéridos, ratio colesterol, riesgo cardiovascular, friedewald, colesterol bueno, colesterol malo, calculadora salud',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
    url: 'https://meskeia.com/calculadora-colesterol',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
  },
  other: {
    'application-name': 'Calculadora Colesterol meskeIA',
  },
};
