import { Metadata } from 'next';

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
    url: 'https://meskeia.com/planificador-chequeos-medicos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chequeos Médicos Preventivos según Edad | meskeIA',
    description: 'Consulta qué revisiones preventivas te corresponden según tu edad y sexo. Guías clínicas españolas.',
  },
  other: {
    'application-name': 'Chequeos Médicos Preventivos meskeIA',
  },
};
