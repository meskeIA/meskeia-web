import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Carruseles para Redes Sociales - Instagram y LinkedIn | meskeIA',
  description: 'Crea carruseles profesionales para Instagram y LinkedIn gratis. Diseña slides con texto, elige entre 5 plantillas, personaliza colores y descarga como imágenes PNG. Sin registro.',
  keywords: 'generador carruseles, carrusel instagram, carrusel linkedin, crear slides redes sociales, posts instagram, contenido linkedin, marketing visual, gratis, sin registro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Carruseles para Redes Sociales | meskeIA',
    description: 'Crea carruseles profesionales para Instagram y LinkedIn. Diseña slides, personaliza colores y descarga como imágenes PNG gratis.',
    url: 'https://meskeia.com/generador-carruseles/',
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
    title: 'Generador de Carruseles para Redes Sociales | meskeIA',
    description: 'Crea carruseles profesionales para Instagram y LinkedIn gratis. Sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Generador de Carruseles meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Carruseles",
  description: "Crea carruseles profesionales para Instagram y LinkedIn gratis. Diseña slides con texto, elige entre 5 plantillas, personaliza colores y descarga como imágenes PNG. Sin registro.",
  url: "https://meskeia.com/generador-carruseles/",
  category: 'UtilityApplication',
  features: [],
});
