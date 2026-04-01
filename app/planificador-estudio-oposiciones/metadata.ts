import { Metadata } from 'next';

const title = 'Planificador de Estudio para Oposiciones — Organiza tu temario | meskeIA';
const description = 'Organiza tu estudio de oposiciones: distribuye temas en semanas, programa repasos espaciados, marca días de descanso y visualiza tu progreso. Adaptable a cualquier convocatoria.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'planificar estudio oposiciones, organizar temario oposiciones, plan de estudio oposiciones, repasos espaciados, calendario oposiciones, distribuir temas semanas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Estudio para Oposiciones | meskeIA',
    description,
    url: 'https://meskeia.com/planificador-estudio-oposiciones/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planificador de Estudio para Oposiciones | meskeIA',
    description: 'Distribuye tu temario en semanas con repasos espaciados y progreso visual',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Planificador de Estudio para Oposiciones',
  description,
  url: 'https://meskeia.com/planificador-estudio-oposiciones/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
