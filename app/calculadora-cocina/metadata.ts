import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Cocina - Conversor de Unidades y Escalador de Recetas | meskeIA',
  description: '¿Necesitas convertir tazas a gramos o ajustar una receta? Herramienta completa: conversor de unidades, escalador de ingredientes y tiempos de cocción. Perfecta para cocinar.',
  keywords: [
    'calculadora cocina',
    'conversor unidades cocina',
    'tazas a gramos',
    'ml a tazas',
    'conversor temperatura horno',
    'celsius fahrenheit',
    'escalador recetas',
    'ajustar recetas',
    'tiempos cocción',
    'sustitutos ingredientes',
    'sin lactosa',
    'sin gluten',
    'recetas veganas',
    'meskeIA'
  ],
  authors: [{ name: 'meskeIA', url: 'https://meskeia.com' }],
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cocina - Conversor y Escalador de Recetas',
    description: 'Conversor de unidades, escalador de recetas, tiempos de cocción y sustitutos de ingredientes. Todo lo que necesitas para cocinar.',
    url: 'https://meskeia.com/beta/calculadora-cocina',
    siteName: 'meskeIA',
    locale: 'es_ES'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Cocina - meskeIA',
    description: 'Conversor de unidades, escalador de recetas, tiempos de cocción. Herramienta gratuita para cocinar.'
  },
  alternates: {
    canonical: 'https://meskeia.com/beta/calculadora-cocina'
  },
  robots: {
    index: true,
    follow: true
  }
};
