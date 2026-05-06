import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulador de Baja Visión | meskeIA',
  description: 'Simula cómo ven las personas con cataratas, miopía severa, glaucoma, degeneración macular y daltonismo. Herramienta para diseñadores y desarrolladores.',
  keywords: [
    'simulador baja visión',
    'accesibilidad visual',
    'daltonismo simulador',
    'cataratas diseño',
    'glaucoma UX',
    'discapacidad visual',
    'diseño accesible',
    'WCAG accesibilidad',
    'protanopia deuteranopia',
  ],
  openGraph: {
    title: 'Simulador de Baja Visión | meskeIA',
    description: 'Simula cómo ven las personas con distintas condiciones visuales. Ideal para diseñadores y desarrolladores.',
    url: 'https://meskeia.com/simulador-baja-vision/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-baja-vision/',
  },
};
