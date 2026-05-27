import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Interés BCE - Cómo Afectan a Hipotecas, Bolsa y Ahorro | meskeIA',
  description:
    'Entiende cómo el BCE sube o baja tipos y la cadena de transmisión monetaria: hipotecas variables, crédito, bolsa y ahorro. Diagrama interactivo.',
  keywords: [
    'tipos interes BCE',
    'banco central europeo',
    'euribor',
    'politica monetaria',
    'hipotecas',
    'transmision monetaria',
    'inflacion BCE',
  ],
  openGraph: {
    title: 'Tipos de Interés BCE | meskeIA',
    description:
      'Cómo el BCE sube tipos y afecta a hipotecas, bolsa, crédito y economía real',
    url: 'https://meskeia.com/visualizador-tipos-interes-bce/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Tipos de Interés BCE - Transmisión Monetaria",
  description: "Entiende cómo el BCE sube o baja tipos y la cadena de transmisión monetaria: hipotecas variables, crédito, bolsa y ahorro. Diagrama interactivo.",
  url: "https://meskeia.com/visualizador-tipos-interes-bce/",
  category: 'FinanceApplication',
  features: [],
});
