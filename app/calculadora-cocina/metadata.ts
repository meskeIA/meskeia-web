import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Cocina - Conversor, Escalador de Recetas y Tiempos | meskeIA',
  description: 'Calculadora de cocina online: convierte unidades (tazas, gramos, ml), escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes. Gratis y sin registro.',
  keywords: 'calculadora cocina, conversor unidades cocina, tazas a gramos, escalador recetas, tiempos coccion, sustitutos ingredientes, medidas cocina, recetas, conversion, temperatura horno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cocina - Conversor y Escalador de Recetas',
    description: 'Convierte unidades de cocina, escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes.',
    url: 'https://next.meskeia.com/calculadora-cocina',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Cocina | meskeIA',
    description: 'Conversor de unidades, escalador de recetas, tiempos de cocción y sustitutos',
  },
  other: {
    'application-name': 'Calculadora de Cocina meskeIA',
  },
};
