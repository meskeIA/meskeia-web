import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GABA: El Freno del Sistema Nervioso | meskeIA',
  description:
    'Visualiza cómo el GABA equilibra la excitación cerebral: GABA-A vs GABA-B, moduladores alostéricos (benzodiacepinas, alcohol, anestésicos), epilepsia y ansiedad.',
  keywords: [
    'GABA neurotransmisor',
    'GABA ansiedad',
    'GABA benzodiacepinas',
    'GABA-A GABA-B',
    'GABA epilepsia',
    'GABA alcohol',
    'glutamato GABA equilibrio',
    'GABA sueño',
  ],
  openGraph: {
    title: 'GABA: El Gran Freno del Sistema Nervioso',
    description:
      'Sin GABA, el cerebro entraría en convulsiones en segundos. Benzodiacepinas, alcohol, anestésicos: todos actúan aquí.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};
