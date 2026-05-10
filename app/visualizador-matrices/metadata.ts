import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Matrices - El Lenguaje Secreto de las Transformaciones | meskeIA',
  description: 'Descubre qué son las matrices, sus operaciones y cómo transforman figuras en el plano: rotación, escala, reflexión. Explicador visual interactivo.',
  keywords: 'matrices, transformaciones 2D, álgebra lineal, rotación, escala, reflexión, determinante, multiplicación matrices, matemáticas visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Matrices - El Lenguaje Secreto de las Transformaciones',
    description: 'Qué son las matrices y cómo transforman el mundo: rotación, escala, reflexión explicadas visualmente.',
    url: 'https://meskeia.com/visualizador-matrices/',
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
    title: 'Matrices - Explicador Visual Interactivo',
    description: 'El álgebra lineal cobra vida: matrices que rotan, escalan y reflejan figuras ante tus ojos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Matrices Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Matrices - El Lenguaje Secreto de las Transformaciones',
  description: 'Explicador visual interactivo sobre matrices: definición, operaciones (suma, multiplicación, determinante), transformaciones geométricas 2D y aplicaciones en la vida real.',
  url: 'https://meskeia.com/visualizador-matrices/',
  category: 'EducationalApplication',
  features: [
    'Matrices interactivas con operaciones paso a paso',
    'Transformaciones 2D visualizadas en plano cartesiano',
    'Rotación, escala, reflexión y cizalladura animadas',
    'Aplicaciones reales: IA, videojuegos, PageRank, GPS',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
