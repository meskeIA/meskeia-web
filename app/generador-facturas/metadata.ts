import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Facturas - Crea Facturas Profesionales Gratis | meskeIA',
  description: 'Genera facturas profesionales para autónomos y pequeñas empresas. IVA automático (21%, 10%, 4%), retención IRPF, múltiples líneas, exporta a PDF. Gratis y sin registro.',
  keywords: 'factura, generador facturas, autonomo, facturar, iva, irpf, pdf, plantilla factura, factura gratis, pequeña empresa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Facturas - meskeIA',
    description: 'Crea facturas profesionales gratis con IVA automático y exportación a PDF',
    url: 'https://meskeia.com/generador-facturas/',
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
    title: 'Generador de Facturas - meskeIA',
    description: 'Genera facturas profesionales para autónomos. Gratis y sin registro',
    images: ['https://meskeia.com/og-image.png']
  },
};
