import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Contrato Mercantil - Qué Contrato Necesito | meskeIA',
  description:
    'Descubre qué tipo de contrato mercantil necesitas en España: servicios, arrendamiento de obra, agencia, NDA, distribución o colaboración. Cláusulas esenciales y errores a evitar.',
  keywords:
    'contratos mercantiles, contrato de servicios, NDA confidencialidad, arrendamiento de obra, contrato de agencia, qué contrato necesito, cláusulas esenciales contrato, contratos entre empresas España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Contrato Mercantil | meskeIA',
    description:
      'Identifica qué tipo de contrato mercantil necesitas según tu situación y conoce las cláusulas esenciales para protegerte.',
    url: 'https://meskeia.com/orientador-contrato-mercantil',
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
    title: 'Orientador de Contrato Mercantil | meskeIA',
    description:
      'Descubre qué contrato mercantil necesitas: servicios, obra, agencia, NDA, distribución o colaboración.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Contrato Mercantil meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Contrato Mercantil',
  description:
    'Herramienta interactiva para identificar el tipo de contrato mercantil más adecuado según tu situación: servicios, arrendamiento de obra, compraventa, agencia, NDA, distribución o colaboración. Incluye cláusulas esenciales, tabla comparativa y guía paso a paso.',
  url: 'https://meskeia.com/orientador-contrato-mercantil/',
  features: [
    'Selector interactivo por situación (3-4 preguntas)',
    'Recomendación del tipo de contrato más adecuado',
    'Cláusulas esenciales para cada tipo de contrato',
    'Tabla comparativa de los 7 tipos de contrato mercantil',
    'Errores frecuentes a evitar en contratos mercantiles',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
