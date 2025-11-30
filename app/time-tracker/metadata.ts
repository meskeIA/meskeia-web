import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Time Tracker - Registro de Horas por Proyecto | meskeIA',
  description: 'Registra y gestiona el tiempo dedicado a cada proyecto y cliente. Informes, tarifas por hora y exportación. Ideal para freelancers y autónomos.',
  keywords: 'time tracker, registro horas, proyecto, cliente, freelance, autonomo, facturacion, tiempo, productividad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Time Tracker - meskeIA',
    description: 'Controla el tiempo por proyecto y cliente. Perfecto para freelancers',
    url: 'https://meskeia.com/time-tracker/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Tracker - meskeIA',
    description: 'Registro de horas por proyecto para freelancers y autónomos',
  },
  other: {
    'application-name': 'Time Tracker meskeIA',
  },
};
