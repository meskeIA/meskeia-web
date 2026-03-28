import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Vida — ¿Necesitas uno y qué cobertura? | meskeIA',
  description: 'Test de 10 preguntas para saber si necesitas un seguro de vida, qué tipo te conviene (temporal, ahorro o mixto) y qué capital asegurado necesitas. Análisis según cargas familiares, hipoteca y situación económica.',
  keywords: ['necesito seguro de vida', 'cuánto seguro de vida necesito', 'seguro vida temporal o ahorro', 'seguro vida hipoteca España', 'seguro vida con hijos', 'capital asegurado seguro vida', 'seguro vida autónomo', 'cuándo contratar seguro de vida', 'seguro vida o no', 'tipos seguro de vida España'],
  openGraph: {
    title: '¿Necesitas seguro de vida? Test orientativo | meskeIA',
    description: 'Descubre si necesitas un seguro de vida y qué tipo te conviene según tus cargas familiares, hipoteca y situación económica.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-vida/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Seguro de vida sí o no? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si necesitas seguro de vida y qué cobertura te conviene.',
  },
  alternates: { canonical: 'https://meskeia.com/selector-seguro-vida/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Seguro de Vida',
      description: 'Test orientativo para saber si se necesita seguro de vida y qué tipo conviene (temporal, ahorro, mixto o ninguno) según cargas familiares, hipoteca y situación.',
      url: 'https://meskeia.com/selector-seguro-vida/',
      features: [
        'Test de 10 preguntas sobre situación familiar y económica',
        '4 opciones: temporal, ahorro/vida entera, mixto, ninguno por ahora',
        'Análisis de cargas familiares e hipoteca',
        'Orientación de capital asegurado necesario',
        '100% en el navegador, gratuito, en español',
      ],
    })),
  },
};
