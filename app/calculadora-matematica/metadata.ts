import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora Matemática Avanzada - Matrices, Ecuaciones | meskeIA',
  description: 'Calculadora científica avanzada: operaciones con matrices, determinantes, sistemas de ecuaciones, fracciones y expresiones algebraicas.',
  keywords: 'calculadora matemática, matrices, determinantes, sistemas ecuaciones, fracciones, álgebra, científica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Matemática Avanzada | meskeIA',
    description: 'Calculadora científica con matrices, determinantes y sistemas de ecuaciones.',
    url: 'https://meskeia.com/calculadora-matematica/',
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
    title: 'Calculadora Matemática Avanzada | meskeIA',
    description: 'Herramienta matemática avanzada online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Matemática Avanzada - Matrices, Ecuaciones",
  description: "Calculadora científica avanzada: operaciones con matrices, determinantes, sistemas de ecuaciones, fracciones y expresiones algebraicas.",
  url: 'https://meskeia.com/calculadora-matematica/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
