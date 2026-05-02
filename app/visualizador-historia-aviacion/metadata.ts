import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Aviación | Cronología Interactiva de los Wright a la Aviación Eléctrica | meskeIA',
  description: 'Explora 125 años de historia de la aviación: de los hermanos Wright a los drones, el Concorde, el Jumbo y la aviación eléctrica. 14 períodos interactivos.',
  keywords: ['historia aviación', 'hermanos Wright', 'Boeing 747', 'Concorde', 'aviación eléctrica', 'drones', 'historia del vuelo'],
  openGraph: {
    title: 'Historia de la Aviación — Cronología Interactiva',
    description: 'De los Wright al vuelo eléctrico — 14 períodos con pioneros, hitos tecnológicos y contexto histórico de 125 años de aviación.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Aviación',
  description: 'Cronología interactiva de la historia de la aviación con 14 períodos históricos.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
