import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Guía para Comprar Casa en España - Calculadoras y Simuladores | meskeIA',
  description: 'Guía completa para comprar vivienda en España: simulador de hipoteca, gastos de compraventa (ITP, notaría, registro), alquiler vs compra y más. Herramientas gratuitas.',
  keywords: 'comprar casa españa, simulador hipoteca, gastos compraventa vivienda, ITP, notaría, registro propiedad, calculadora hipoteca, alquiler vs compra, amortización anticipada',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía para Comprar Casa en España - meskeIA',
    description: 'Todas las herramientas que necesitas para comprar vivienda: hipoteca, gastos, impuestos y decisiones financieras.',
    url: 'https://meskeia.com/guia/comprar-casa/',
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
    title: 'Guía para Comprar Casa en España',
    description: 'Calculadoras y simuladores gratuitos para tu compra de vivienda.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía para Comprar Casa en España - Calculadoras y Simuladores",
  description: "Guía completa para comprar vivienda en España: simulador de hipoteca, gastos de compraventa (ITP, notaría, registro), alquiler vs compra y más. Herramientas gratuitas.",
  url: 'https://meskeia.com/guia/comprar-casa/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
