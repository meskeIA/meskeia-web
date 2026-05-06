import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía para Montar un Negocio en España - Validación, Finanzas y Gestión | meskeIA',
  description: 'Guía completa para emprender: genera el nombre de tu empresa, calcula el punto de equilibrio, planifica el cashflow, fija tu tarifa y emite tus primeras facturas. Gratis.',
  keywords: 'montar negocio españa, emprender, generador nombres empresa, break even punto equilibrio, cashflow negocio, tarifa freelance, facturas autónomo, roi marketing, presupuestos profesionales',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Guía para Montar un Negocio en España - meskeIA',
    description: 'Herramientas gratuitas para validar tu idea, planificar finanzas y gestionar tu negocio desde el primer día.',
    url: 'https://meskeia.com/guia/montar-negocio/',
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
    title: 'Guía para Montar un Negocio en España',
    description: 'Calculadoras de break-even, cashflow, ROI y generador de nombres para emprendedores.',
    images: ['https://meskeia.com/og-image.png']
  },
};
