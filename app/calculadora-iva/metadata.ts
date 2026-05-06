import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de IVA Online - Calcula IVA 21%, 10%, 4% | meskeIA',
  description: 'Calculadora de IVA española gratuita. Añade o quita IVA al 21%, 10% o 4%. Calcula base imponible, cuota de IVA y total con un clic.',
  keywords: 'calculadora iva, calcular iva, quitar iva, añadir iva, iva 21, iva 10, iva 4, base imponible, impuestos españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de IVA Online - meskeIA',
    description: 'Calcula el IVA español fácilmente. Añade o quita IVA al 21%, 10% o 4%.',
    url: 'https://meskeia.com/calculadora-iva/',
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
    title: 'Calculadora de IVA Online',
    description: 'Calcula el IVA español fácilmente. Añade o quita IVA al 21%, 10% o 4%.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de IVA Online - Calcula IVA 21%, 10%, 4%",
  description: "Calculadora de IVA española gratuita. Añade o quita IVA al 21%, 10% o 4%. Calcula base imponible, cuota de IVA y total con un clic.",
  url: 'https://meskeia.com/calculadora-iva/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
