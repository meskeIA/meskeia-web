import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Geometría - Áreas, Perímetros y Volúmenes | meskeIA',
  description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas 2D y 3D. Triángulos, círculos, polígonos, esferas, cilindros y más.',
  keywords: 'geometría, área, perímetro, volumen, triángulo, círculo, esfera, cilindro, polígono, figuras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas.',
    url: 'https://meskeia.com/calculadora-geometria/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Herramienta completa de cálculos geométricos online.',
  },
};
