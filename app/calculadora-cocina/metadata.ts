import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Cocina: Recetas, Tiempos y Conversor | meskeIA',
  description: 'Calculadora de cocina online: convierte unidades (tazas, gramos, ml), escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes. Gratis y sin registro.',
  keywords: 'calculadora cocina, conversor unidades cocina, tazas a gramos, escalador recetas, tiempos coccion, sustitutos ingredientes, medidas cocina, recetas, conversion, temperatura horno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/calculadora-cocina/',
  },
  openGraph: {
    type: 'website',
    title: 'Calculadora de Cocina - Conversor y Escalador de Recetas',
    description: 'Convierte unidades de cocina, escala recetas, consulta tiempos de cocción y encuentra sustitutos de ingredientes.',
    url: 'https://meskeia.com/calculadora-cocina',
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
    title: 'Calculadora de Cocina | meskeIA',
    description: 'Conversor de unidades, escalador de recetas, tiempos de cocción y sustitutos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora de Cocina meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Cocina',
  description: 'Calculadora de cocina online con conversor de unidades (tazas, gramos, ml, onzas), escalador de recetas, tabla de tiempos de cocción y buscador de sustitutos de ingredientes.',
  url: 'https://meskeia.com/calculadora-cocina/',
  category: 'UtilityApplication',
  features: [
    'Conversor de unidades de cocina (volumen, peso, temperatura)',
    'Escalador de recetas según número de comensales',
    'Tabla de tiempos de cocción por alimento y método',
    'Buscador de sustitutos de ingredientes',
    'Conversor de temperaturas de horno (°C, °F, gas)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['calculadora cocina', 'conversor unidades', 'escalador recetas', 'tiempos cocción', 'sustitutos ingredientes'],
});
