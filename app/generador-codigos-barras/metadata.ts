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
    url: 'https://meskeia.com/generador-codigos-barras/',
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un código de barras EAN-13 y para qué se usa?',
      acceptedAnswer: { '@type': 'Answer', text: 'El EAN-13 (European Article Number) es el estándar internacional más utilizado para identificar productos comerciales. Contiene 13 dígitos que codifican el país de origen, la empresa y el producto. Se usa en supermercados, tiendas y logística para el escaneado en punto de venta.' },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre EAN-13, UPC-A y Code128?',
      acceptedAnswer: { '@type': 'Answer', text: 'EAN-13 es el estándar europeo con 13 dígitos, muy usado en retail. UPC-A es el equivalente norteamericano con 12 dígitos. Code128 es un formato de alta densidad que puede codificar letras y números, ideal para logística, envíos y uso interno en empresas.' },
    },
    {
      '@type': 'Question',
      name: '¿Puedo usar estos códigos de barras en mis productos para vender en tiendas?',
      acceptedAnswer: { '@type': 'Answer', text: 'Para vender en grandes superficies o marketplaces como Amazon, los códigos EAN deben estar registrados oficialmente en GS1 (la organización internacional). Los códigos generados online son válidos técnicamente para uso interno, prototipos o sistemas propios, pero no garantizan unicidad global sin registro oficial.' },
    },
    {
      '@type': 'Question',
      name: '¿En qué formato se puede descargar el código de barras generado?',
      acceptedAnswer: { '@type': 'Answer', text: 'Los códigos generados se pueden descargar en PNG, un formato de imagen de alta calidad compatible con editores como Word, Photoshop, Canva o cualquier sistema de impresión. El tamaño y resolución suelen ser suficientes para etiquetas estándar.' },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar algo o crear una cuenta para generar un código de barras?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. La generación se realiza completamente en el navegador, sin registro, sin instalar software y sin enviar datos a ningún servidor. Puedes crear y descargar códigos de barras de forma inmediata y privada desde cualquier dispositivo.' },
    },
  ],
};
