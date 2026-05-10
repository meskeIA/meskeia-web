import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora de Calorías Quemadas por Ejercicio | meskeIA',
  description: 'Calcula las calorías quemadas según tu actividad física. Usa valores MET científicos para correr, nadar, ciclismo, caminar y más de 30 ejercicios.',
  keywords: 'calorias quemadas, calculadora ejercicio, MET, actividad fisica, deporte, quemar calorias, running, natacion, ciclismo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Calorías Quemadas por Ejercicio',
    description: 'Calcula las calorías quemadas según tu actividad física con valores MET científicos.',
    url: 'https://meskeia.com/calculadora-calorias-ejercicio/',
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
    title: 'Calculadora de Calorías Quemadas por Ejercicio',
    description: 'Calcula las calorías quemadas según tu actividad física.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora de Calorías Quemadas por Ejercicio",
  description: "Calcula las calorías quemadas según tu actividad física. Usa valores MET científicos para correr, nadar, ciclismo, caminar y más de 30 ejercicios.",
  url: 'https://meskeia.com/calculadora-calorias-ejercicio/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
