import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asistente Constitución Sociedad (SL, SLU, SA) - Checklist y Costes | meskeIA',
  description: 'Guía paso a paso para constituir una Sociedad Limitada, Sociedad Limitada Unipersonal o Sociedad Anónima en España. Checklist de 20 trámites, estimación de costes y formulario de datos sociales.',
  keywords: 'constituir sociedad limitada, crear SL, alta sociedad limitada, costes constitucion sl, registrar empresa, asistente sl españa, crear sociedad anonima',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Asistente Constitución Sociedad - meskeIA',
    description: 'Checklist de trámites, costes estimados y formulario de datos para constituir una SL, SLU o SA en España.',
    url: 'https://meskeia.com/asistente-constitucion-sociedad/',
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
    title: 'Asistente Constitución Sociedad | meskeIA',
    description: 'Guía completa para crear una SL, SLU o SA: trámites, costes y documentación necesaria.',
    images: ['https://meskeia.com/og-image.png']
  },
};
