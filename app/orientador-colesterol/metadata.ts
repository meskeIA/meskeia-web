import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador Colesterol - Ratios y Riesgo Cardiovascular | meskeIA',
  description: 'Analiza tus niveles de colesterol: ratio CT/HDL, LDL/HDL, colesterol no-HDL y fórmula de Friedewald. Interpretación de resultados y recomendaciones. 100% gratis y privado.',
  keywords: 'colesterol, HDL, LDL, triglicéridos, ratio colesterol, riesgo cardiovascular, friedewald, colesterol bueno, colesterol malo, calculadora salud',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
    url: 'https://meskeia.com/orientador-colesterol/',
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
    title: 'Orientador Colesterol | meskeIA',
    description: 'Analiza tus niveles de colesterol: ratios, riesgo cardiovascular y recomendaciones personalizadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Colesterol meskeIA',
  },
};
