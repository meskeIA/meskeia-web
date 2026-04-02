import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Ahorro para la Jubilaci\u00f3n 2026 \u2014 Brecha, ahorro y plan de pensiones | meskeIA',
  description: 'Calcula tu brecha de jubilaci\u00f3n, cu\u00e1nto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyecci\u00f3n de capital acumulado por escenarios.',
  keywords: 'brecha jubilacion, ahorro jubilacion, plan de pensiones, diferencia pension sueldo, cuanto ahorrar jubilacion, deduccion irpf plan pensiones, pension complementaria, proyeccion capital jubilacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Ahorro para la Jubilaci\u00f3n 2026 | meskeIA',
    description: 'Brecha, ahorro necesario, ventaja fiscal del plan de pensiones y proyecci\u00f3n de capital.',
    url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planificador de Ahorro para la Jubilaci\u00f3n 2026 | meskeIA',
    description: 'Brecha, ahorro, plan de pensiones y proyecci\u00f3n de capital para tu jubilaci\u00f3n.',
  },
  other: {
    'application-name': 'Planificador Ahorro Jubilaci\u00f3n meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Ahorro para la Jubilaci\u00f3n',
  description: 'Planificador completo de ahorro para la jubilaci\u00f3n: calcula tu brecha entre sueldo y pensi\u00f3n, cu\u00e1nto necesitas ahorrar mensualmente, la ventaja fiscal del plan de pensiones (deducci\u00f3n IRPF) y la proyecci\u00f3n de capital acumulado por escenarios (conservador, moderado, agresivo).',
  url: 'https://meskeia.com/planificador-ahorro-jubilacion/',
  features: [
    'C\u00e1lculo de brecha entre sueldo y pensi\u00f3n',
    'Ahorro mensual necesario para cubrir la diferencia',
    'Ventaja fiscal del plan de pensiones (IRPF 2025)',
    'Proyecci\u00f3n de capital por 3 escenarios de rentabilidad',
    'Pensi\u00f3n complementaria estimada',
    'Funciona 100% en el navegador, sin registro ni instalaci\u00f3n',
    'Gratuito y sin publicidad',
  ],
});
