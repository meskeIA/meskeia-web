import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist Trámites de Dependencia - Documentación y Pasos | meskeIA',
  description: 'Lista de comprobación interactiva para solicitar la valoración de dependencia en España. Documentos necesarios, pasos del proceso y plazos orientativos.',
  keywords: 'tramites dependencia, documentacion dependencia, solicitar dependencia España, pasos valoracion dependencia, checklist dependencia SAAD',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist Trámites de Dependencia | meskeIA',
    description: 'Guía paso a paso con checklist interactivo para solicitar la valoración de dependencia.',
    url: 'https://meskeia.com/checklist-tramites-dependencia/',
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
    title: 'Checklist Trámites de Dependencia | meskeIA',
    description: 'Documentación y pasos para solicitar la dependencia en España',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Checklist Trámites Dependencia meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist Trámites de Dependencia',
  description: 'Lista de comprobación interactiva para gestionar los trámites de solicitud de valoración de dependencia en España. Incluye documentos, pasos y plazos orientativos.',
  url: 'https://meskeia.com/checklist-tramites-dependencia/',
  features: [
    'Checklist interactivo con progreso guardado',
    'Documentación necesaria detallada',
    '6 fases del proceso de valoración',
    'Plazos orientativos por fase',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
