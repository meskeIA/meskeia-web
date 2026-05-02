import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Energía | Cronología Interactiva del Fuego a la Fusión Nuclear | meskeIA',
  description: 'Explora 17.000 años de historia energética: del fuego prehistórico a la fusión nuclear. Carbón, petróleo, energía nuclear, solar y eólica en 14 períodos interactivos.',
  keywords: ['historia energía', 'energía renovable', 'combustibles fósiles', 'transición energética', 'fusión nuclear', 'historia petróleo', 'carbón revolución industrial'],
  openGraph: {
    title: 'Historia de la Energía — Cronología Interactiva del Fuego a la Fusión Nuclear',
    description: 'Del fuego prehistórico a la fusión nuclear — 14 períodos de historia energética con hitos, inventores y contexto geopolítico.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-energia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-energia/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Energía',
  description: 'Cronología interactiva de la energía con 14 períodos históricos, desde el fuego prehistórico hasta la fusión nuclear.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
