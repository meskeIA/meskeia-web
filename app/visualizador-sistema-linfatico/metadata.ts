import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Linfático — El Sistema Olvidado | meskeIA',
  description: 'Visualizador educativo del sistema linfático: drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos primarios y secundarios, flujo de la linfa y qué ocurre cuando falla.',
  keywords: 'sistema linfático, linfa, ganglios linfáticos, timo, bazo, linfedema, linfoma, linfocitos, drenaje linfático, inmunidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: { canonical: 'https://meskeia.com/visualizador-sistema-linfatico/' },
  openGraph: {
    type: 'website',
    title: 'El Sistema Linfático — El Sistema Olvidado',
    description: 'Drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos, flujo de la linfa y qué ocurre cuando falla.',
    url: 'https://meskeia.com/visualizador-sistema-linfatico/',
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
    title: 'El Sistema Linfático — Explicador Visual',
    description: 'El sistema olvidado: drenaje, inmunidad y equilibrio de fluidos explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema Linfático meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Linfático — El Sistema Olvidado',
  description: 'Visualizador educativo del sistema linfático: drenaje de fluidos, inmunidad y absorción de grasas. Órganos linfáticos primarios y secundarios, flujo de la linfa y patologías.',
  url: 'https://meskeia.com/visualizador-sistema-linfatico/',
  category: 'EducationalApplication',
  features: [
    '3 funciones principales del sistema linfático',
    'Selector de 6 órganos linfáticos (primarios y secundarios)',
    'Flujo de la linfa paso a paso',
    'Qué ocurre cuando el sistema falla',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
