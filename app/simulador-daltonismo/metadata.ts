import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Daltonismo - Visualiza cómo perciben tus diseños | meskeIA',
  description: 'Sube una imagen o paleta de colores y visualiza al instante cómo la perciben personas con protanopia, deuteranopia, tritanopia y otras formas de daltonismo. 100% local.',
  keywords: 'daltonismo, simulador daltonismo, protanopia, deuteranopia, tritanopia, acromatopsia, accesibilidad visual, diseño accesible, WCAG, color blindness',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-daltonismo/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Daltonismo | meskeIA',
    description: 'Visualiza cómo perciben tus diseños las personas con daltonismo. 8 tipos simulados con matrices oficiales.',
    url: 'https://meskeia.com/simulador-daltonismo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Daltonismo | meskeIA',
    description: 'Verifica la accesibilidad cromática de tus diseños en segundos.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Daltonismo',
  description: 'Herramienta gratuita para diseñadores y desarrolladores: sube una imagen y visualiza cómo se percibe en los 7 tipos principales de daltonismo (protanopia, deuteranopia, tritanopia y sus formas leves, además de acromatopsia). Procesamiento 100% local con matrices oficiales de Machado et al. (2009).',
  url: 'https://meskeia.com/simulador-daltonismo/',
  category: 'UtilityApplication',
  features: [
    'Simulación de 7 tipos de daltonismo + visión normal',
    'Matrices oficiales Machado et al. (2009)',
    'Sube tu imagen o usa la paleta de prueba incluida',
    'Descarga cada simulación en PNG',
    'Procesamiento 100% local (la imagen nunca sale del navegador)',
    'Funciona sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['daltonismo', 'accesibilidad', 'diseño', 'WCAG', 'color blindness', 'protanopia', 'deuteranopia', 'tritanopia'],
});
