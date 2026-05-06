import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Tipo de Ahorro — ¿Cuenta, depósito o fondo indexado? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué vehículo de ahorro te conviene: cuenta remunerada, depósito a plazo fijo, fondo indexado o una combinación. Análisis según liquidez, horizonte y perfil de riesgo.',
  keywords: [
    'cuenta remunerada o depósito',
    'fondo indexado o depósito',
    'dónde poner mis ahorros',
    'mejor forma de ahorrar España',
    'ahorro sin riesgo España',
    'depósito a plazo fijo 2025',
    'fondo indexado para principiantes',
    'rentabilidad ahorro conservador',
    'dónde invertir ahorros pequeños',
    'ahorro a corto o largo plazo',
  ],
  openGraph: {
    title: '¿Cuenta, depósito o fondo indexado? Test de ahorro | meskeIA',
    description:
      'Descubre qué vehículo de ahorro se adapta mejor a tu perfil de riesgo, horizonte temporal y necesidades de liquidez.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-tipo-ahorro/',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Dónde poner mis ahorros? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para saber si te conviene una cuenta remunerada, depósito a plazo o fondo indexado.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-tipo-ahorro/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Tipo de Ahorro',
        description:
          'Test orientativo para descubrir qué vehículo de ahorro (cuenta remunerada, depósito, fondo indexado o combinación) se adapta mejor al perfil y necesidades.',
        url: 'https://meskeia.com/selector-tipo-ahorro/',
        features: [
          'Test de 10 preguntas sobre perfil y objetivos',
          '4 opciones: cuenta remunerada, depósito, fondo indexado, combinación',
          'Análisis de liquidez, horizonte y tolerancia al riesgo',
          'Explicación fiscal de cada vehículo',
          'Sin mención de entidades o productos comerciales concretos',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
