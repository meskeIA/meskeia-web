import { Metadata } from 'next';

import { generateWebAppSchema, generateFAQSchema } from '@/lib/schema-templates';
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

export const faqJsonLd = generateFAQSchema({
  url: 'https://meskeia.com/guia/comprar-casa/',
  mainEntity: [
    {
      question: '¿Cuánto dinero necesito ahorrado para comprar una vivienda?',
      answer: 'Necesitas aproximadamente el 30% del precio de la vivienda: 20% para la entrada (los bancos suelen financiar máximo 80%) y un 10% adicional para los gastos de compraventa (ITP/IVA, notaría, registro, gestoría).',
    },
    {
      question: '¿Qué es mejor para una hipoteca, tipo fijo o variable?',
      answer: 'Depende de tu perfil de riesgo. El tipo fijo da estabilidad y previsibilidad en la cuota. El variable puede ser más barato inicialmente pero fluctúa con el Euríbor. Si prefieres seguridad, fijo; si crees que los tipos bajarán o necesitas una cuota inicial baja, variable.',
    },
    {
      question: '¿Qué impuestos se pagan al comprar una vivienda en España?',
      answer: 'Si es vivienda nueva: IVA (10%) + AJD (0,5-1,5% según comunidad autónoma). Si es de segunda mano: ITP (6-11% según comunidad autónoma). Además, siempre se pagan notaría, registro y gestoría.',
    },
    {
      question: '¿Se puede deducir la hipoteca en la declaración de la renta?',
      answer: 'Solo si la vivienda habitual se compró antes del 1 de enero de 2013 y ya se aplicaba la deducción. Para compras posteriores no hay deducción estatal por vivienda habitual, aunque algunas comunidades autónomas tienen deducciones propias por alquiler.',
    },
    {
      question: '¿Cuándo conviene amortizar la hipoteca anticipadamente?',
      answer: 'Generalmente cuando se dispone de ahorros extra y la hipoteca tiene un tipo de interés alto. Antes de amortizar conviene asegurarse de contar con un fondo de emergencia y comprobar que no se cobra comisión por amortización anticipada excesiva.',
    },
  ],
});
