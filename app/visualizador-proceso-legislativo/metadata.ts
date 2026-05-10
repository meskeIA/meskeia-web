import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Viaje de una Ley - Proceso Legislativo en España | meskeIA',
  description: 'Cómo se hace una ley en España paso a paso: iniciativa, debate en el Congreso, revisión en el Senado, sanción real y publicación en el BOE. Explicador visual interactivo.',
  keywords: 'proceso legislativo, cómo se hace una ley, congreso diputados, senado, BOE, ley españa, proposición de ley, proyecto de ley, iniciativa legislativa popular',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Viaje de una Ley - Proceso Legislativo en España',
    description: 'De la idea a la ley: cómo funciona el proceso legislativo en España explicado de forma visual.',
    url: 'https://meskeia.com/visualizador-proceso-legislativo/',
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
    title: 'El Viaje de una Ley - Proceso Legislativo en España',
    description: 'Cómo nace, se debate, se aprueba y se publica una ley en España. Explicador visual interactivo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Proceso Legislativo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Viaje de una Ley - Proceso Legislativo en España',
  description: 'Explicador visual interactivo del proceso legislativo español: quién puede proponer una ley, cómo se debate en el Congreso y el Senado, sanción real, publicación en el BOE y entrada en vigor.',
  url: 'https://meskeia.com/visualizador-proceso-legislativo/',
  features: [
    'Orígenes de una ley: Gobierno, Congreso, Senado, CCAA, ciudadanos',
    'Flujo visual del debate parlamentario en el Congreso',
    'Caminos del Senado: aprobar, enmendar o vetar',
    'Cronología real desde propuesta hasta entrada en vigor',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
