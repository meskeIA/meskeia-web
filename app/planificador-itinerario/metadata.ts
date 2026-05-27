import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Itinerario de Viaje - Organiza Días y Actividades | meskeIA',
  description: 'Crea y organiza tu itinerario de viaje día a día. Añade actividades, tiempos, notas y exporta tu plan de viaje. 100% gratis y sin registro.',
  keywords: 'planificador itinerario, organizar viaje, itinerario viaje, agenda viaje, actividades viaje, plan de viaje, dias viaje, organizador vacaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Itinerario de Viaje | meskeIA',
    description: 'Organiza tu viaje día a día con actividades, horarios y notas. Exporta tu itinerario completo.',
    url: 'https://meskeia.com/planificador-itinerario/',
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
    title: 'Planificador de Itinerario de Viaje | meskeIA',
    description: 'Organiza tu viaje día a día con actividades, horarios y notas. Gratis y sin registro.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Itinerario Viaje meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador de Itinerario",
  description: "Crea y organiza tu itinerario de viaje día a día. Añade actividades, tiempos, notas y exporta tu plan de viaje. 100% gratis y sin registro.",
  url: "https://meskeia.com/planificador-itinerario/",
  category: 'UtilityApplication',
  features: [],
});
