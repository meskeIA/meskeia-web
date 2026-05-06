import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador de la Deuda Pública | Bonos, Prima de Riesgo y Sostenibilidad | meskeIA',
  description:
    'Cómo funciona la deuda soberana: emisión de bonos (Letras, Bonos, Obligaciones), prima de riesgo, quién financia la deuda española y sostenibilidad (ratio r vs g).',
  keywords: [
    'deuda publica',
    'bonos soberanos',
    'prima de riesgo',
    'bono español',
    'yield',
    'Tesoro Publico',
    'sostenibilidad deuda',
    'deficit publico',
  ],
  openGraph: {
    title: 'Visualizador de la Deuda Pública | meskeIA',
    description:
      'Deuda soberana explicada: bonos, prima de riesgo, quién la financia y sostenibilidad.',
    url: 'https://meskeia.com/visualizador-deuda-publica/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
