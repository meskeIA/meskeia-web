import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'El Cerebro Emocional | Amígdala, Dopamina y Circuitos de Emoción | meskeIA',
  description:
    'Cómo el cerebro procesa las emociones: amígdala (circuito del miedo), corteza prefrontal (regulación), dopamina/serotonina/oxitocina y las 4 estrategias de regulación emocional.',
  keywords: [
    'cerebro emocional',
    'amigdala',
    'dopamina',
    'serotonina',
    'sistema limbico',
    'regulacion emocional',
    'corteza prefrontal',
    'neurotransmisores',
    'emociones',
  ],
  openGraph: {
    title: 'El Cerebro Emocional | meskeIA',
    description:
      'Amígdala, dopamina, circuito del miedo y regulación emocional: la neurociencia de las emociones explicada visualmente.',
    url: 'https://meskeia.com/visualizador-cerebro-emociones/',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'El Cerebro Emocional',
  description:
    'Visualizador interactivo sobre el sistema límbico, neurotransmisores emocionales y regulación emocional.',
  url: 'https://meskeia.com/visualizador-cerebro-emociones/',
  provider: { '@type': 'Organization', name: 'meskeIA' },
  educationalLevel: 'secondary',
  learningResourceType: 'interactive',
  inLanguage: 'es',
};
