import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estadística Inferencial: p-valor, Errores Tipo I/II e Intervalos de Confianza | meskeIA',
  description: 'Visualiza en tiempo real los conceptos más malinterpretados en ciencia: el p-valor, errores tipo I y tipo II, intervalos de confianza y potencia estadística. Entiende por qué p<0.05 no es suficiente.',
  keywords: [
    'p-valor', 'valor p', 'estadistica inferencial', 'error tipo I', 'error tipo II',
    'intervalo de confianza', 'potencia estadistica', 'hipotesis nula', 'test hipotesis',
    'nivel significacion', 'estadistica tests', 'crisis replicacion', 'estadistica ciencia',
    'inferencia estadistica', 'distribuccion normal contraste',
  ],
  openGraph: {
    title: 'Estadística Inferencial: p-valor e Intervalos de Confianza | meskeIA',
    description: 'Visualizador interactivo de los conceptos más malinterpretados en estadística científica.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
