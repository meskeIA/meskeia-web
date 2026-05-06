import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparador de Formas Jurídicas - Autónomo vs SL vs Cooperativa | meskeIA',
  description: 'Compara las diferentes formas jurídicas para emprender en España: autónomo, sociedad limitada, cooperativa, asociación, comunidad de bienes. Capital, fiscalidad, responsabilidad y trámites.',
  keywords: 'formas juridicas, autonomo vs sl, comparador empresas, sociedad limitada, cooperativa, asociacion, comunidad de bienes, emprender, constituir empresa, responsabilidad limitada, capital social, fiscalidad autonomo, irpf, impuesto sociedades',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Descubre qué forma jurídica te conviene más: autónomo, SL, cooperativa o asociación. Comparativa completa.',
    url: 'https://meskeia.com/comparador-formas-juridicas',
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
    title: 'Comparador de Formas Jurídicas - meskeIA',
    description: 'Autónomo vs SL vs Cooperativa: encuentra la mejor opción para tu negocio.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Comparador Formas Jurídicas meskeIA',
  },
};
