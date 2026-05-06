import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Generador de Códigos de Barras - EAN, UPC, Code128 Gratis | meskeIA',
  description: 'Genera códigos de barras gratis: EAN-13, EAN-8, UPC-A, Code128, Code39 y más. Descarga en PNG. Sin registro, 100% privado.',
  keywords: 'generador codigo de barras, crear barcode, ean-13, upc, code128, codigo barras online, barcode gratis',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Códigos de Barras Gratis - meskeIA',
    description: 'Crea códigos de barras EAN-13, UPC, Code128 y más. Descarga gratis en PNG.',
    url: 'https://meskeia.com/generador-codigos-barras',
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
    title: 'Generador de Códigos de Barras Gratis',
    description: 'Crea códigos de barras EAN-13, UPC, Code128 y más. Sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Códigos de Barras - EAN, UPC, Code128 Gratis",
  description: "Genera códigos de barras gratis: EAN-13, EAN-8, UPC-A, Code128, Code39 y más. Descarga en PNG. Sin registro, 100% privado.",
  url: 'https://meskeia.com/generador-codigos-barras/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
