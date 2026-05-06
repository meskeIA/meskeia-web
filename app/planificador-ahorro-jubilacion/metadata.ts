import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Ahorro para la Jubilación 2026 — Brecha, ahorro y plan de pensiones | meskeIA',
  description: 'Calcula tu brecha de jubilación, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyección de capital acumulado por escenarios.',
  keywords: 'brecha jubilacion, ahorro jubilacion, plan de pensiones, diferencia pension sueldo, cuanto ahorrar jubilacion, deduccion irpf plan pensiones, pension complementaria, proyeccion capital jubilacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Ahorro para la Jubilación 2026 | meskeIA',
    description: 'Brecha, ahorro necesario, ventaja fiscal del plan de pensiones y proyección de capital.',
    url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
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
    title: 'Planificador de Ahorro para la Jubilación 2026 | meskeIA',
    description: 'Brecha, ahorro, plan de pensiones y proyección de capital para tu jubilación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Ahorro Jubilación meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Ahorro para la Jubilación',
  description: 'Planificador completo de ahorro para la jubilación: calcula tu brecha entre sueldo y pensión, cuánto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones (deducción IRPF) y la proyección de capital acumulado por escenarios (conservador, moderado, agresivo).',
  url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
  features: [
    'Cálculo de brecha entre sueldo y pensión',
    'Ahorro mensual necesario para cubrir la diferencia',
    'Ventaja fiscal del plan de pensiones (IRPF 2025)',
    'Proyección de capital por 3 escenarios de rentabilidad',
    'Pensión complementaria estimada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
