import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Robótica | Cronología Interactiva de Unimate a los Humanoides con IA | meskeIA',
  description: 'Explora 100 años de historia de la robótica: de Karel Čapek y Unimate a ASIMO, Boston Dynamics, Tesla Optimus y nanorobots. 14 períodos interactivos con cobots, drones y IA.',
  keywords: [
    'historia robótica cronología robots visualizador',
    'Unimate primer robot industrial General Motors',
    'Boston Dynamics Atlas Spot humanoides',
    'Tesla Optimus Figure humanoides IA',
    'cobots Universal Robots automatización pymes',
    'nanorobots medicina IBEC Barcelona',
  ],
  openGraph: {
    title: 'Historia de la Robótica — Cronología Interactiva de Unimate a los Humanoides con IA',
    description: 'De Karel Čapek y Unimate a ASIMO, Boston Dynamics, Tesla Optimus y nanorobots. 14 períodos con cobots, drones y IA.',
    type: 'website',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'Historia de la Robótica',
  description: 'Cronología interactiva de la robótica con 14 períodos históricos: de la ciencia ficción a la IA encarnada.',
  provider: { '@type': 'Organization', name: 'meskeIA' },
};
