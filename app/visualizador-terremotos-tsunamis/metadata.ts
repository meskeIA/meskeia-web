import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Terremotos y Tsunamis: Cómo Funcionan | meskeIA',
  description:
    'Visualiza cómo se generan los terremotos (fallas normales, inversas y en desgarre), los tres tipos de ondas sísmicas (P, S, superficiales), cómo se forman y propagan los tsunamis y cómo funcionan los sistemas de alerta temprana.',
  keywords: [
    'cómo se forman terremotos',
    'ondas sísmicas P S',
    'tsunami cómo se forma',
    'escala Richter',
    'escala Mercalli',
    'alerta temprana tsunami',
    'fallas geológicas',
    'sismología explicada',
  ],
  openGraph: {
    title: 'Terremotos y Tsunamis: Cómo Funcionan | meskeIA',
    description:
      'De la falla geológica al tsunami en 800 km/h: todos los principios de la sismología y la alerta temprana.',
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
  name: "Terremotos y Tsunamis: De la Falla al Impacto",
  description: "Visualiza cómo se generan los terremotos (fallas normales, inversas y en desgarre), los tres tipos de ondas sísmicas (P, S, superficiales), cómo se forman y propagan los tsunamis y cómo funcionan los ",
  url: "https://meskeia.com/visualizador-terremotos-tsunamis/",
  category: 'EducationalApplication',
  features: [],
});
