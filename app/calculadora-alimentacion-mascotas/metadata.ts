import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Alimentación para Perros y Gatos | meskeIA',
  description: 'Calcula la cantidad diaria de comida para tu perro o gato según peso, edad y actividad. Incluye detector de alimentos tóxicos y guía de transición de pienso.',
  keywords: 'alimentación perro, comida gato, cantidad pienso, gramos diarios, ración perro, dieta mascota, alimentos tóxicos perros, chocolate perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Alimentación para Perros y Gatos',
    description: 'Calcula cuánto debe comer tu mascota según su peso, edad y nivel de actividad',
    url: 'https://meskeia.com/calculadora-alimentacion-mascotas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Alimentación para Mascotas',
    description: 'Calcula la ración diaria ideal para tu perro o gato',
  },
};
