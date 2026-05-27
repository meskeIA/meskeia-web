import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Juego del Ahorcado en Español - Adivina la Palabra | meskeIA',
  description: 'Juega al clásico juego del ahorcado en español. 4 categorías: animales, países, profesiones y vocabulario. Sin registro, sin publicidad, 100% local.',
  keywords: 'ahorcado, juego ahorcado, adivinar palabra, juego letras, juego español, juego educativo, vocabulario',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad, sin registro.',
    url: 'https://meskeia.com/juego-ahorcado/',
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
    title: 'Juego del Ahorcado en Español | meskeIA',
    description: 'Adivina la palabra letra a letra. 4 categorías temáticas, sin publicidad.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Juego del Ahorcado meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Juego del Ahorcado",
  description: "Juega al clásico juego del ahorcado en español. 4 categorías: animales, países, profesiones y vocabulario. Sin registro, sin publicidad, 100% local.",
  url: "https://meskeia.com/juego-ahorcado/",
  category: 'EducationalApplication',
  features: [],
});
