import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Escala de pH: Ácidos y Bases - Explicador Visual | meskeIA',
  description: 'Explora la escala de pH de 0 a 14 con colores. Sustancias cotidianas, neutralización, indicadores naturales, lluvia ácida. Explicador visual interactivo.',
  keywords: 'escala pH, ácidos bases, neutralización, lluvia ácida, indicadores pH, limón vinagre, jabón lejía, química cotidiana, donantes protones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Escala de pH: Ácidos y Bases - Explicador Visual',
    description: 'La escala de pH de 0 a 14 con colores, sustancias cotidianas y neutralización. Interactivo y gratuito.',
    url: 'https://meskeia.com/visualizador-ph-acidos-bases',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escala de pH: Ácidos y Bases - Explicador Visual',
    description: 'Descubre el pH de lo que te rodea: del limón a la lejía, pasando por el agua pura.',
  },
  other: { 'application-name': 'pH Ácidos y Bases meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Escala de pH: Ácidos y Bases - Explicador Visual',
  description: 'Explicador visual interactivo sobre la escala de pH, ácidos, bases, neutralización, indicadores naturales y lluvia ácida. Con sustancias cotidianas y slider de pH.',
  url: 'https://meskeia.com/visualizador-ph-acidos-bases/',
  category: 'EducationalApplication',
  features: [
    'Escala de pH interactiva con slider y colores arcoíris',
    'Más de 15 sustancias cotidianas con su pH exacto',
    'Ácidos y bases: fuertes vs débiles con ejemplos',
    'Neutralización y aplicaciones prácticas',
    'Curiosidades: lluvia ácida, pH del estómago, escala logarítmica',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
