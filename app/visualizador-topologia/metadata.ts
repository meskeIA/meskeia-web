import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Topología — Superficies, Nudos y Homeomorfismos | meskeIA',
  description: 'Explora topología interactivamente: superficies (esfera, toro, banda de Möbius, botella de Klein), homeomorfismos, genus, nudos y la característica de Euler. La geometría que estudia propiedades invariantes bajo deformación.',
  keywords: 'topología, superficies topológicas, toro, banda de Möbius, botella de Klein, homeomorfismo, genus, característica de Euler, nudos topológicos, matemáticas, geometría',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador de Topología — Superficies y Homeomorfismos',
    description: '¿Por qué una taza de café y un donut son lo mismo para las matemáticas? Explora topología: superficies, genus, nudos y la característica de Euler.',
    url: 'https://meskeia.com/visualizador-topologia/',
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
    title: 'Visualizador de Topología',
    description: 'La geometría que estudia propiedades invariantes bajo deformación continua. Superficies, nudos y homeomorfismos interactivos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Topología meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Topología',
  description: 'Visualizador interactivo de topología: galería de superficies (esfera, toro, doble toro, banda de Möbius, botella de Klein), clasificación por genus, nudos topológicos y tabla de propiedades con la característica de Euler.',
  url: 'https://meskeia.com/visualizador-topologia/',
  features: [
    'Galería de superficies topológicas con SVG y propiedades',
    'Clasificación por genus (0 a 3) con visualización progresiva',
    'Nudos topológicos: trivial, trébol y figura-8',
    'Tabla comparativa con característica de Euler χ = V − E + F',
    'Equivalencia taza-donut explicada paso a paso',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y en español',
  ],
  category: 'EducationalApplication',
});
