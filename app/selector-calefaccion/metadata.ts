import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Selector de Sistema de Calefacción — ¿Cuál me conviene? | meskeIA',
  description:
    'Test de 10 preguntas para saber qué sistema de calefacción te conviene: caldera de gas, bomba de calor, aerotermia, suelo radiante o pellet. Según vivienda, uso y subvenciones disponibles.',
  keywords: [
    'qué calefacción instalar',
    'aerotermia o caldera de gas',
    'bomba de calor o gas natural',
    'selector calefacción',
    'mejor sistema de calefacción España',
    'cambiar caldera gas',
    'aerotermia precio España',
    'subvenciones calefacción 2025',
    'calefacción eficiente hogar',
    'bomba de calor aerotermia diferencia',
  ],
  openGraph: {
    title: '¿Qué sistema de calefacción te conviene? Test gratuito | meskeIA',
    description:
      'Aerotermia, bomba de calor, caldera de gas, pellet o suelo radiante. Descubre cuál se adapta mejor a tu vivienda, uso y presupuesto.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://meskeia.com/selector-calefaccion/',
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
    title: '¿Aerotermia o caldera? Test para elegir calefacción | meskeIA',
    description:
      'Test de 10 preguntas para encontrar tu sistema de calefacción ideal según vivienda, uso y subvenciones disponibles.',
    images: ['https://meskeia.com/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/selector-calefaccion/',
  },
  other: {
    'schema:WebApplication': JSON.stringify(
      generateWebAppSchema({
        name: 'Selector de Sistema de Calefacción',
        description:
          'Test orientativo de 10 preguntas para descubrir qué sistema de calefacción (aerotermia, bomba de calor, caldera de gas, pellet o suelo radiante) se adapta mejor a tu vivienda, uso y presupuesto. Incluye información sobre subvenciones disponibles.',
        url: 'https://meskeia.com/selector-calefaccion/',
        features: [
          'Test de 10 preguntas sobre vivienda y uso',
          'Recomendación de sistema principal y alternativa',
          'Estimación de coste de instalación orientativa',
          'Información sobre subvenciones PERTE y Next Generation EU',
          'Pros y contras de cada tecnología',
          '100% en el navegador, sin registro ni instalación',
          'Gratuito y sin publicidad',
          'En español',
        ],
      })
    ),
  },
};
