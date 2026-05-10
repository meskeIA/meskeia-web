import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Generador de Tonos Online - Frecuencias de Audio Gratis | meskeIA',
  description: 'Genera tonos y frecuencias de audio de 20Hz a 20000Hz. Ideal para tests de audio, calibración de altavoces, tinnitus y experimentos acústicos.',
  keywords: 'generador de tonos, generador de frecuencias, test de audio, frecuencia Hz, onda senoidal, calibración altavoces, tono puro, audio test',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/generador-tonos/',
  },
  openGraph: {
    type: 'website',
    title: 'Generador de Tonos Online - Frecuencias de Audio',
    description: 'Genera tonos de 20Hz a 20000Hz. Tests de audio, calibración y experimentos acústicos.',
    url: 'https://meskeia.com/generador-tonos/',
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
    title: 'Generador de Tonos Online - Frecuencias de Audio',
    description: 'Genera tonos de 20Hz a 20000Hz. Tests de audio, calibración y experimentos acústicos.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Generador de Tonos',
  description: 'Generador online de tonos y frecuencias de audio entre 20 Hz y 20.000 Hz. Útil para tests de audio, calibración de altavoces y auriculares, ejercicios de tinnitus y experimentos acústicos.',
  url: 'https://meskeia.com/generador-tonos/',
  category: 'UtilityApplication',
  features: [
    'Generación de tonos puros entre 20 Hz y 20.000 Hz',
    'Cuatro formas de onda: senoidal, cuadrada, triangular, sierra',
    'Control fino de frecuencia y volumen',
    'Útil para tests de audio y calibración',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
  keywords: ['generador tonos', 'frecuencias audio', 'test audio', 'calibración altavoces', 'tinnitus'],
});
