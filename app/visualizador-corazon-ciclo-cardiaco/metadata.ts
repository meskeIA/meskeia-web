import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Cardíaco - Sístole, Diástole, Válvulas y ECG | meskeIA',
  description:
    'Visualiza el ciclo cardíaco: sístole y diástole, las 4 válvulas del corazón, trazado ECG interactivo y cálculo de gasto cardíaco. Aprende cómo late tu corazón.',
  keywords: [
    'ciclo cardiaco',
    'sistole',
    'diastole',
    'valvulas corazon',
    'ECG electrocardiograma',
    'gasto cardiaco',
    'frecuencia cardiaca',
    'anatomia corazon',
    'fisiologia cardiaca',
  ],
  openGraph: {
    title: 'Ciclo Cardíaco | meskeIA',
    description: 'Sístole, diástole, válvulas y ECG con animaciones interactivas',
    url: 'https://meskeia.com/visualizador-corazon-ciclo-cardiaco/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ciclo Cardíaco - Sístole, Diástole y ECG",
  description: "Visualiza el ciclo cardíaco: sístole y diástole, las 4 válvulas del corazón, trazado ECG interactivo y cálculo de gasto cardíaco. Aprende cómo late tu corazón.",
  url: "https://meskeia.com/visualizador-corazon-ciclo-cardiaco/",
  category: 'EducationalApplication',
  features: [],
});
