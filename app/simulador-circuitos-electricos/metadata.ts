import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Circuitos Eléctricos | meskeIA',
  description: 'Analiza circuitos eléctricos en serie y paralelo. Calcula resistencia equivalente, caídas de tensión, corrientes de rama y potencia disipada. Hasta 6 resistencias.',
  keywords: [
    'circuitos eléctricos',
    'circuito serie',
    'circuito paralelo',
    'resistencia equivalente',
    'ley de Ohm',
    'caída de tensión',
    'corriente eléctrica',
    'potencia eléctrica',
    'física eléctrica',
    'electrónica básica',
  ],
  openGraph: {
    title: 'Simulador de Circuitos Eléctricos | meskeIA',
    description: 'Analiza circuitos en serie y paralelo: resistencia equivalente, tensiones, corrientes y potencia disipada por componente.',
    url: 'https://meskeia.com/simulador-circuitos-electricos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/simulador-circuitos-electricos/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador Circuitos Eléctricos",
  description: "Analiza circuitos eléctricos en serie y paralelo. Calcula resistencia equivalente, caídas de tensión, corrientes de rama y potencia disipada. Hasta 6 resistencias.",
  url: "https://meskeia.com/simulador-circuitos-electricos/",
  category: 'EducationalApplication',
  features: [],
});
