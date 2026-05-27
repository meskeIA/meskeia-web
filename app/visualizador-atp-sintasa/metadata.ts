import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'ATP Sintasa - El Motor Molecular que Produce tu Energía | meskeIA',
  description: 'Cómo funciona la ATP sintasa: el motor molecular rotante que produce ATP, la quimioósmosis de Mitchell, el gradiente de protones, y cuánto ATP fabrica tu cuerpo cada día.',
  keywords: ['ATP sintasa motor molecular', 'quimiosmosis Mitchell', 'gradiente protones ATP', 'mitocondria ATP', 'fosforilacion oxidativa', 'Nobel quimiosmosis', 'cuanto ATP produce cuerpo', 'F0F1 ATP sintasa'],
  openGraph: {
    title: 'ATP Sintasa - El Motor Molecular | meskeIA',
    description: 'La máquina molecular rotante que produce la energía de tus células.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "ATP Sintasa - El Motor Molecular que te da Energía",
  description: "Cómo funciona la ATP sintasa: el motor molecular rotante que produce ATP, la quimioósmosis de Mitchell, el gradiente de protones, y cuánto ATP fabrica tu cuerpo cada día.",
  url: "https://meskeia.com/visualizador-atp-sintasa/",
  category: 'EducationalApplication',
  features: [],
});
