import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Chequeos Médicos Preventivos - Qué Revisiones Hacerte según tu Edad | meskeIA',
  description: 'Descubre qué revisiones médicas preventivas te corresponden según tu edad y sexo. Basado en las recomendaciones del Ministerio de Sanidad y la SEMFyC.',
  keywords: 'chequeos medicos, revisiones preventivas, salud preventiva, analítica sangre, mamografía, citología, colonoscopia, revisión médica, calendario chequeos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Chequeos Médicos Preventivos según Edad | meskeIA',
    description: 'Filtra por edad y sexo y consulta qué revisiones médicas preventivas te recomiendan las guías clínicas españolas.',
    url: 'https://meskeia.com/planificador-chequeos-medicos/',
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
    title: 'Chequeos Médicos Preventivos según Edad | meskeIA',
    description: 'Consulta qué revisiones preventivas te corresponden según tu edad y sexo. Guías clínicas españolas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Chequeos Médicos Preventivos meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Chequeos Médicos Preventivos",
  description: "Descubre qué revisiones médicas preventivas te corresponden según tu edad y sexo. Basado en las recomendaciones del Ministerio de Sanidad y la SEMFyC.",
  url: "https://meskeia.com/planificador-chequeos-medicos/",
  category: 'FinanceApplication',
  features: [],
});
