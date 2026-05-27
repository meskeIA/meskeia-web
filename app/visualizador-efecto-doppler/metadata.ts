import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Efecto Doppler: Visualizador Interactivo | meskeIA',
  description: 'Visualiza el efecto Doppler: ondas sonoras comprimidas y expandidas, fórmula matemática, radar de velocidad, ecografía Doppler y redshift de galaxias.',
  keywords: ['efecto Doppler', 'ondas sonoras', 'frecuencia', 'redshift', 'radar velocidad', 'ecografía Doppler', 'física'],
  openGraph: {
    title: 'Efecto Doppler: Visualizador Interactivo | meskeIA',
    description: 'Por qué suenan diferente las sirenas cuando se acercan y se alejan — y cómo esto mide galaxias.',
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
  name: "Efecto Doppler: De las Sirenas al Redshift de Galaxias",
  description: "Visualiza el efecto Doppler: ondas sonoras comprimidas y expandidas, fórmula matemática, radar de velocidad, ecografía Doppler y redshift de galaxias.",
  url: "https://meskeia.com/visualizador-efecto-doppler/",
  category: 'EducationalApplication',
  features: [],
});
