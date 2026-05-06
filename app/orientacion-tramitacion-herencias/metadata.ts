import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientación para Tramitar una Herencia - Checklist y Plazos | meskeIA',
  description: 'Asistente interactivo para gestionar una herencia en España: checklist personalizado de documentos, orden de gestiones paso a paso, plazos críticos y costes orientativos.',
  keywords: 'tramitar herencia España, checklist herencia, documentos herencia, plazos impuesto sucesiones, gestión herencia paso a paso',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientación para Tramitar una Herencia | meskeIA',
    description: 'Checklist interactivo de documentos, timeline de gestiones y plazos críticos para tramitar una herencia en España.',
    url: 'https://meskeia.com/orientacion-tramitacion-herencias/',
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
    title: 'Orientación para Tramitar una Herencia | meskeIA',
    description: 'Checklist personalizado, orden de gestiones y plazos para tramitar una herencia en España.',
    images: ['https://meskeia.com/og-image.png']
  },
};
