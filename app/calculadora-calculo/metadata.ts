import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cálculo - Derivadas, Integrales y Límites | meskeIA',
  description: 'Calculadora de cálculo diferencial e integral: deriva e integra funciones, calcula límites con explicaciones paso a paso. Funciona en el navegador. Gratis.',
  keywords: 'derivadas, integrales, límites, cálculo diferencial, cálculo integral, funciones, análisis matemático',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cálculo | meskeIA',
    description: 'Deriva e integra funciones, calcula límites con explicaciones paso a paso.',
    url: 'https://meskeia.com/calculadora-calculo/',
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
    title: 'Calculadora de Cálculo | meskeIA',
    description: 'Herramienta de cálculo diferencial e integral online.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Cálculo",
  description: "Calculadora de cálculo diferencial e integral: deriva e integra funciones, calcula límites con explicaciones paso a paso. Funciona en el navegador. Gratis.",
  url: "https://meskeia.com/calculadora-calculo/",
  category: 'EducationalApplication',
  features: [],
});
