import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Planificador de Mudanzas - Organiza tu Mudanza Paso a Paso | meskeIA',
  description: 'Planifica tu mudanza con checklist de tareas, inventario de objetos por habitación y control de presupuesto. Herramienta gratuita para organizar mudanzas sin estrés.',
  keywords: 'planificador mudanzas, checklist mudanza, inventario mudanza, presupuesto mudanza, organizar mudanza, lista tareas mudanza, calculadora mudanza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Mudanzas - Organiza tu Mudanza | meskeIA',
    description: 'Checklist de tareas, inventario por habitación y control de presupuesto para tu mudanza. Herramienta gratuita online.',
    url: 'https://meskeia.com/planificador-mudanzas',
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
    title: 'Planificador de Mudanzas | meskeIA',
    description: 'Organiza tu mudanza paso a paso: tareas, inventario y presupuesto en una sola herramienta.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Mudanzas meskeIA',
  },
};
