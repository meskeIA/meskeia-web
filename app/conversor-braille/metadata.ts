import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Traductor Braille a Español y Texto a Braille Online - Bidireccional',
  description: 'Convierte texto a Braille y traduce Braille a español al instante. Alfabeto completo con ñ y tildes (á, é, í, ó, ú). Visualización de celdas Unicode. Gratis.',
  keywords: 'braille, conversor, texto, accesibilidad, alfabeto braille, español, discapacidad visual, unicode, celdas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/conversor-braille/',
  },
  openGraph: {
    type: 'website',
    title: 'Traductor Braille a Español y Texto a Braille - Bidireccional',
    description: 'Convierte texto a Braille y traduce Braille a español al instante. Alfabeto completo con ñ y tildes. Visualización de celdas Unicode.',
    url: 'https://meskeia.com/conversor-braille/',
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
    title: 'Traductor Braille a Español y Texto a Braille',
    description: 'Bidireccional, alfabeto completo con ñ y tildes. Celdas Unicode.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de Código Braille',
  description: 'Convierte texto a código Braille y viceversa con el alfabeto Braille español completo, incluyendo ñ y acentos. Visualización interactiva con celdas Unicode.',
  url: 'https://meskeia.com/conversor-braille/',
  category: 'UtilityApplication',
  features: [
    'Conversión bidireccional texto ↔ Braille',
    'Alfabeto Braille español completo (ñ, vocales acentuadas)',
    'Visualización con celdas Braille Unicode',
    'Soporte para números y signos de puntuación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['Braille', 'accesibilidad', 'discapacidad visual', 'conversor texto Braille'],
});
