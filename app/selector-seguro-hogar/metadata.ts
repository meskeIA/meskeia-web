import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Seguro de Hogar — ¿Qué cobertura necesitas? | meskeIA',
  description: 'Test de 10 preguntas para saber qué tipo de seguro de hogar te conviene: cobertura básica, multirriesgo estándar o completa. Según vivienda, zona, contenido y prioridades.',
  keywords: [
    'qué seguro de hogar contratar',
    'selector seguro hogar',
    'seguro hogar básico o completo',
    'multirriesgo hogar España',
    'cobertura seguro vivienda',
    'seguro hogar propietario inquilino',
    'qué cubre el seguro de hogar',
    'seguro hogar piso',
    'contratar seguro hogar España',
    'cobertura mínima seguro hogar',
  ],
  openGraph: {
    title: '¿Qué seguro de hogar necesitas? Test en 10 preguntas | meskeIA',
    description: 'Básico, multirriesgo o completo: descubre la cobertura adecuada para tu vivienda, zona y situación personal en 10 preguntas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-seguro-hogar/',
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
    title: '¿Qué seguro de hogar te conviene? Test gratuito | meskeIA',
    description: 'Test de 10 preguntas para saber si necesitas cobertura básica, multirriesgo o completa para tu vivienda.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: { canonical: 'https://meskeia.com/selector-seguro-hogar/' },
  other: {
    'schema:WebApplication': JSON.stringify(generateWebAppSchema({
      name: 'Selector de Seguro de Hogar',
      description: 'Test orientativo para determinar qué tipo de seguro de hogar conviene según tipo de vivienda, régimen de tenencia, zona geográfica, valor del contenido y prioridades del usuario.',
      url: 'https://meskeia.com/selector-seguro-hogar/',
      features: [
        'Test de 10 preguntas sobre vivienda y perfil',
        '3 niveles de cobertura analizados',
        'Considera régimen propietario/inquilino',
        'Análisis de zona y riesgos',
        'Coberturas recomendadas detalladas',
        '100% en el navegador, sin registro',
        'Gratuito y sin publicidad',
        'En español',
      ],
    })),
  },
};
