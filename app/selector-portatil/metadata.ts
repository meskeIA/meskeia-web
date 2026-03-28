import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Portátil y PC — ¿Cuál me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué ordenador te conviene: portátil o sobremesa, Windows o Mac, gama de rendimiento y modelos de referencia actualizados para 2025.',
  keywords: [
    'qué portátil comprar',
    'selector portátil',
    'Windows o Mac',
    'mejor ordenador 2025',
    'portátil para trabajo',
    'portátil gaming',
    'Mac o PC',
    'cuál es el mejor portátil para mí',
    'portátil estudio',
    'ordenador para diseño',
  ],
  openGraph: {
    title: '¿Qué portátil o PC te conviene? Test en 10 preguntas | meskeIA',
    description:
      'Descubre el ordenador ideal para tu perfil: formato, sistema operativo, rendimiento y modelos de referencia. Sin marcas patrocinadas.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-portatil/',
    siteName: 'meskeIA',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Windows, Mac o Linux? Test para elegir ordenador | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu portátil o PC ideal según uso, presupuesto y prioridades.',
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-portatil/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Portátil y PC',
        description:
          'Test orientativo de 10 preguntas para descubrir qué ordenador (portátil o sobremesa, Windows, Mac o Linux, y gama de rendimiento) se adapta mejor a tu uso, presupuesto y prioridades. Incluye modelos de referencia actualizados.',
        url: 'https://meskeia.com/selector-portatil/',
        features: [
          'Test de 10 preguntas sobre uso y prioridades',
          'Recomendación de formato (portátil / sobremesa / 2 en 1)',
          'Recomendación de sistema operativo (Windows / Mac / Linux)',
          'Gama de rendimiento recomendada',
          'Modelos de referencia actualizados por perfil',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
