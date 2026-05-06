import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora Álgebra Abstracta - Grupos, Anillos, Cuerpos | meskeIA',
  description: 'Explora estructuras algebraicas: grupos, anillos y cuerpos. Operaciones modulares, tablas de Cayley y propiedades algebraicas.',
  keywords: 'álgebra abstracta, grupos, anillos, cuerpos, aritmética modular, tabla Cayley, estructuras algebraicas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Álgebra Abstracta | meskeIA',
    description: 'Grupos, anillos, cuerpos y estructuras algebraicas.',
    url: 'https://meskeia.com/calculadora-algebra-abstracta/',
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
    title: 'Calculadora Álgebra Abstracta | meskeIA',
    description: 'Herramienta de álgebra abstracta online.',
    images: ['https://meskeia.com/og-image.png']
  },
};
