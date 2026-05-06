import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Generador de Gradientes CSS - Lineales, Radiales, Cónicos | meskeIA',
  description: 'Crea gradientes CSS profesionales: lineales, radiales y cónicos. Editor visual con múltiples colores, ángulos personalizables y código listo para copiar.',
  keywords: 'generador gradientes, CSS gradient, linear-gradient, radial-gradient, conic-gradient, degradados CSS, diseño web',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Gradientes CSS - meskeIA',
    description: 'Crea gradientes CSS profesionales con editor visual',
    url: 'https://meskeia.com/generador-gradientes/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Gradientes CSS - Lineales, Radiales, Cónicos",
  description: "Crea gradientes CSS profesionales: lineales, radiales y cónicos. Editor visual con múltiples colores, ángulos personalizables y código listo para copiar.",
  url: 'https://meskeia.com/generador-gradientes/',
  category: 'UtilityApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
