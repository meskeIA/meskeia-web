import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Coche Nuevo o Usado — ¿Qué te conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber si te conviene más un coche nuevo, seminuevo (1-3 años) o de segunda mano. Análisis según presupuesto, uso, garantías y etiqueta DGT.',
  keywords: [
    'coche nuevo o usado',
    'comprar coche nuevo o segunda mano',
    'seminuevo o nuevo',
    'segunda mano o nuevo coche España',
    'cuándo comprar coche usado',
    'ventajas coche nuevo',
    'coche de segunda mano fiable',
    'comprar coche 2025',
    'etiqueta DGT coche usado',
    'financiar coche nuevo o usado',
  ],
  openGraph: {
    title: '¿Coche nuevo, seminuevo o segunda mano? Test en 10 preguntas | meskeIA',
    description:
      'Descubre qué tipo de coche te conviene comprar según presupuesto, km esperados, importancia de la garantía y etiqueta medioambiental.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-coche-nuevo-usado/',
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
    title: '¿Nuevo, seminuevo o segunda mano? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para elegir entre coche nuevo, seminuevo o de segunda mano según tu perfil.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-coche-nuevo-usado/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Coche Nuevo o Usado',
        description:
          'Test orientativo para saber si conviene comprar un coche nuevo, seminuevo o de segunda mano según presupuesto, uso y prioridades.',
        url: 'https://meskeia.com/selector-coche-nuevo-usado/',
        features: [
          'Test de 10 preguntas sobre perfil y prioridades',
          '3 recomendaciones: nuevo, seminuevo, segunda mano',
          'Análisis de etiqueta DGT y ZBE',
          'Consideración de garantías y fiabilidad',
          'Orientación sobre coste total de propiedad',
          '100% en el navegador, sin registro',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Selector de Coche Nuevo o Usado",
  description: "Test de 10 preguntas para saber si te conviene más un coche nuevo, seminuevo (1-3 años) o de segunda mano. Análisis según presupuesto, uso, garantías y etiqueta DGT.",
  url: "https://meskeia.com/selector-coche-nuevo-usado/",
  category: 'FinanceApplication',
  features: [],
});
