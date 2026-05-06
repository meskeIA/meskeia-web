import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Retenciones IRPF en Facturas - Autónomos 2025 | meskeIA',
  description:
    'Descubre qué retención de IRPF aplicar en tus facturas como autónomo: 15%, 7% inicio actividad, arrendamientos, administradores. Modelo 111 y 190.',
  keywords:
    'retención IRPF facturas autónomos, cuando aplicar retención factura, 15% retención autónomo, 7% inicio actividad, modelo 111 retenciones, retención arrendamiento local, IRPF factura profesional',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Retenciones IRPF en Facturas para Autónomos | meskeIA',
    description:
      'Consulta qué retención aplicar en tus facturas: 15% general, 7% inicio actividad, 19% arrendamiento. Guía completa con modelos 111 y 190.',
    url: 'https://meskeia.com/orientador-facturacion-retencion/',
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
    title: 'Orientador de Retenciones IRPF - Autónomos 2025 | meskeIA',
    description:
      'Descubre qué retención IRPF aplicar en tus facturas como autónomo. 15%, 7% inicio de actividad, arrendamientos y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Orientador Facturación Retención meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador de Retenciones IRPF en Facturas',
  description:
    'Herramienta interactiva que orienta a autónomos y profesionales sobre qué retención de IRPF aplicar en sus facturas según su perfil y situación: profesionales generales (15%), inicio de actividad (7%), arrendamientos de locales (19%), administradores y consejeros (35%), actividades agrícolas y forestales. Incluye guía de declaración con modelos 111 y 190.',
  url: 'https://meskeia.com/orientador-facturacion-retencion/',
  features: [
    'Selector de perfil para determinar la retención aplicable',
    'Tipos actualizados para 2025: 15%, 7%, 19%, 35%, 2%',
    'Explicación de cuándo NO se aplica retención (clientes particulares)',
    'Guía de declaración: modelo 111 trimestral y 190 anual',
    'Errores frecuentes y cómo evitarlos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
