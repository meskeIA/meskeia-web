import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
  description:
    'Simula la evolución de frecuencias alélicas: deriva genética, selección natural, mutación y migración. Compara con el equilibrio de Hardy-Weinberg. Biología y genética de poblaciones Universidad.',
  keywords:
    'deriva genética, selección natural, frecuencias alélicas, Hardy-Weinberg, evolución poblaciones, fitness, mutación, fijación alelo, biología universidad, genética poblaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-deriva-genetica/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Deriva Genética y Selección Natural | meskeIA',
    description: 'Genética de poblaciones interactiva: deriva, selección, Hardy-Weinberg',
    url: 'https://meskeia.com/simulador-deriva-genetica/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Deriva Genética | meskeIA',
    description: 'Aprende genética de poblaciones con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Deriva Genética y Selección Natural',
  description:
    'Simulador de genética de poblaciones que combina deriva, selección, mutación y migración. Ajusta el tamaño poblacional, los fitness por genotipo y las tasas de mutación; compara las trayectorias de frecuencias alélicas con el equilibrio de Hardy-Weinberg.',
  url: 'https://meskeia.com/simulador-deriva-genetica/',
  category: 'EducationalApplication',
  features: [
    'Modelo Wright-Fisher con selección, mutación y deriva',
    'Hasta 50 simulaciones independientes superpuestas',
    'Cálculo automático de probabilidad de fijación y pérdida',
    'Comparación con Hardy-Weinberg',
    '4 modos preestablecidos (deriva pura, selección direccional, equilibradora, HW)',
    'Histograma de frecuencias finales',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['deriva genética', 'selección natural', 'Hardy-Weinberg', 'biología universidad'],
});
