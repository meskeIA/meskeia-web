import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Tracker - meskeIA',
    description: 'Registro de horas por proyecto para freelancers y autónomos',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Time Tracker meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Time Tracker",
  description: "Registra y gestiona el tiempo dedicado a cada proyecto y cliente. Informes, tarifas por hora y exportación. Ideal para freelancers y autónomos.",
  url: "https://meskeia.com/time-tracker/",
  category: 'BusinessApplication',
  features: [],
});
