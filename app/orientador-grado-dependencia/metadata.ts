import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador Grado de Dependencia - Baremo BVD España | meskeIA',
  description: 'Cuestionario orientativo para estimar el grado de dependencia (I, II o III) según el Baremo de Valoración de la Dependencia español. Guía para solicitar la valoración oficial y acceder a prestaciones.',
  keywords: 'grado dependencia, baremo dependencia BVD, SAAD dependencia, valoracion dependencia España, grado I II III dependencia, solicitar dependencia, LAPAD dependencia',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Grado de Dependencia | meskeIA',
    description: 'Cuestionario orientativo BVD para estimar el grado de dependencia y cómo solicitar la valoración oficial.',
    url: 'https://meskeia.com/orientador-grado-dependencia/',
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
    title: 'Orientador Grado de Dependencia | meskeIA',
    description: 'Estima el grado de dependencia según el baremo BVD y conoce los pasos para solicitarlo',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Grado Dependencia meskeIA',
  },
};
