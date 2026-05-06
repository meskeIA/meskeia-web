import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Geometría - Áreas, Perímetros y Volúmenes | meskeIA',
  description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas 2D y 3D. Triángulos, círculos, polígonos, esferas, cilindros y más.',
  keywords: 'geometría, área, perímetro, volumen, triángulo, círculo, esfera, cilindro, polígono, figuras',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-geometria/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Calcula áreas, perímetros y volúmenes de figuras geométricas.',
    url: 'https://meskeia.com/calculadora-geometria/',
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
    title: 'Calculadora de Geometría | meskeIA',
    description: 'Herramienta completa de cálculos geométricos online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Geometría',
  description: 'Calculadora de geometría online: áreas, perímetros y volúmenes de figuras 2D y 3D. Triángulos, círculos, polígonos regulares, esferas, cilindros, conos y prismas con visualización interactiva.',
  url: 'https://meskeia.com/calculadora-geometria/',
  category: 'EducationalApplication',
  features: [
    'Áreas y perímetros de figuras 2D (triángulo, círculo, polígonos)',
    'Volúmenes y áreas superficiales de figuras 3D',
    'Visualización interactiva de cada figura',
    'Fórmulas explicadas paso a paso',
    'Soporte para polígonos regulares e irregulares',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['geometría', 'área', 'perímetro', 'volumen', 'figuras geométricas', 'estudiantes'],
});
