import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Turnos de Cuidadores - Organizar Cuidado Familiar | meskeIA',
  description: 'Organiza los turnos de cuidado entre familiares. Calendario semanal visual con reparto equitativo de horas de cuidado para personas dependientes.',
  keywords: 'turnos cuidadores, planificador cuidado familiar, organizar cuidadores, calendario cuidadores dependencia, reparto cuidado familiar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Turnos de Cuidadores | meskeIA',
    description: 'Organiza los turnos de cuidado entre familiares con un calendario semanal visual.',
    url: 'https://meskeia.com/planificador-turnos-cuidadores/',
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
    title: 'Planificador de Turnos de Cuidadores | meskeIA',
    description: 'Calendario visual para organizar turnos de cuidado familiar',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Planificador Turnos Cuidadores meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Turnos de Cuidadores',
  description: 'Herramienta visual para organizar los turnos de cuidado entre familiares. Calendario semanal con reparto equitativo de horas y alertas de desbalance.',
  url: 'https://meskeia.com/planificador-turnos-cuidadores/',
  features: [
    'Calendario semanal visual de turnos',
    'Reparto de horas entre cuidadores',
    'Alertas de desbalance en la carga',
    'Turnos de mañana, tarde y noche',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
