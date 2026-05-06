import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Falacias Lógicas - Detecta Errores de Razonamiento | meskeIA',
  description:
    'Aprende a detectar las 12 falacias lógicas más comunes: ad hominem, hombre de paja, falso dilema, pendiente resbaladiza y más. Ejemplos reales de política, publicidad y debate.',
  keywords: [
    'falacias logicas',
    'ad hominem',
    'hombre de paja',
    'falso dilema',
    'pendiente resbaladiza',
    'pensamiento critico',
    'errores de razonamiento',
    'logica informal',
    'argumentacion',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Falacias Lógicas | meskeIA',
    description:
      'Detecta los 12 errores de razonamiento más comunes con ejemplos interactivos',
    url: 'https://meskeia.com/visualizador-falacias-logicas/',
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
    title: 'Falacias Lógicas | meskeIA',
    description:
      'Detecta los 12 errores de razonamiento más comunes con ejemplos interactivos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Visualizador Falacias Lógicas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Falacias Lógicas',
  description:
    'Explora las 12 falacias lógicas más comunes con ejemplos interactivos de política, publicidad y debate cotidiano. Incluye detector de falacias y constructor de argumentos sólidos.',
  url: 'https://meskeia.com/visualizador-falacias-logicas/',
  features: [
    'Las 5 familias de falacias organizadas por tipo',
    '12 falacias explicadas con ejemplos reales',
    'Detector interactivo: adivina la falacia antes de ver la respuesta',
    'Constructor de argumentos sólidos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
