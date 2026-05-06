import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Checklist VeriFactu — Prepara tu Negocio para la Facturación Electrónica | meskeIA',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu (facturación electrónica obligatoria en 2027). Requisitos, plazos, software certificado y sanciones.',
  keywords: 'verifactu, facturación electrónica, factura electrónica España, checklist verifactu, autónomo verifactu, obligaciones fiscales 2027, RD 1007/2023',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Checklist VeriFactu — Facturación Electrónica 2027 | meskeIA',
    description: 'Prepara tu negocio para VeriFactu: requisitos técnicos, software certificado, formatos de factura, plazos y sanciones.',
    url: 'https://meskeia.com/checklist-preparar-verifactu/',
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
    title: 'Checklist VeriFactu 2027 | meskeIA',
    description: 'Prepara tu negocio para la facturación electrónica obligatoria. Requisitos, plazos, software y sanciones.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Checklist VeriFactu meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Checklist VeriFactu — Prepara tu Negocio',
  description: 'Checklist interactivo para preparar tu negocio para VeriFactu, el sistema de facturación electrónica obligatorio en España desde enero 2027. Cubre requisitos técnicos, software certificado, formatos de factura, plazos y sanciones.',
  url: 'https://meskeia.com/checklist-preparar-verifactu/',
  features: [
    'Checklist de 14 puntos organizados en 4 secciones',
    'Progreso guardado automáticamente en el navegador',
    'Información detallada sobre cada requisito VeriFactu',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
