import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Asesor de Smartphone — ¿Qué móvil me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué smartphone te conviene según tu uso, presupuesto y prioridades. iOS o Android, gama alta, media o básica. Modelos de referencia actualizados.',
  keywords: [
    'qué móvil comprar',
    'asesor smartphone',
    'test móvil ideal',
    'iOS o Android',
    'gama alta o media',
    'mejor smartphone 2025',
    'qué teléfono comprar España',
    'cuál es el mejor móvil para mí',
    'comparativa smartphones',
    'iPhone o Samsung',
  ],
  openGraph: {
    title: '¿Qué smartphone te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre el tipo de móvil ideal para tu perfil: sistema operativo, gama y modelos de referencia. Sin marcas patrocinadas, solo tu uso real.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/asesor-smartphone/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué móvil te conviene? Test gratuito | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu smartphone ideal según presupuesto, uso y prioridades.',
  },
  alternates: {
    canonical: 'https://meskeia.com/asesor-smartphone/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Asesor de Smartphone',
        description:
          'Test orientativo de 10 preguntas para descubrir qué tipo de smartphone (sistema operativo, gama y perfil de uso) se adapta mejor a tus necesidades reales. Incluye modelos de referencia actualizados.',
        url: 'https://meskeia.com/asesor-smartphone/',
        features: [
          'Test de 10 preguntas sobre uso y prioridades',
          'Recomendación de sistema operativo (iOS / Android)',
          'Recomendación de gama (básica, media, alta, pro)',
          'Modelos de referencia actualizados por perfil',
          'Consejos sobre cuándo comprar y dónde',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
