import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Boda - Checklist y Presupuesto Gratis | meskeIA',
  description: 'Organiza tu boda paso a paso con nuestra herramienta gratuita. Checklist por meses, calculadora de presupuesto, timeline del día y consejos de wedding planner.',
  keywords: 'planificador boda, wedding planner, checklist boda, presupuesto boda, organizar boda, lista tareas boda, calculadora boda, timeline boda, preparativos boda, matrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Boda Gratis - Tu Wedding Planner Digital',
    description: 'Checklist completo, calculadora de presupuesto y timeline para organizar tu boda perfecta. Todo gratis y sin registro.',
    url: 'https://meskeia.com/planificador-boda/',
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
    title: 'Planificador de Boda - Checklist y Presupuesto | meskeIA',
    description: 'Organiza tu boda paso a paso: checklist por meses, presupuesto y timeline del día.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador de Boda meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Boda",
  description: "Organiza tu boda paso a paso con nuestra herramienta gratuita. Checklist por meses, calculadora de presupuesto, timeline del día y consejos de wedding planner.",
  url: "https://meskeia.com/planificador-boda/",
  category: 'FinanceApplication',
  features: [],
});
