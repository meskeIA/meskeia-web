import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Vitamina D: La Vitamina que Actúa como Hormona | meskeIA',
  description:
    'Síntesis solar paso a paso, receptores VDR en 37 tejidos, niveles óptimos y la paradoja de la deficiencia en España a pesar del sol.',
  keywords: [
    'vitamina d como funciona',
    'vitamina d deficiencia',
    'vitamina d sintesis solar',
    'VDR receptor vitamina d',
    'vitamina d calcio',
    'vitamina d inmunidad',
    'vitamina d niveles normales',
    'calcitriol calciferol',
    'vitamina d españa',
  ],
  openGraph: {
    title: 'Vitamina D: La Vitamina que Actúa como Hormona',
    description:
      'Síntesis solar paso a paso, receptores VDR en 37 tejidos y niveles óptimos',
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
  name: "Vitamina D: La Vitamina que Actúa como Hormona",
  description: "Síntesis solar paso a paso, receptores VDR en 37 tejidos, niveles óptimos y la paradoja de la deficiencia en España a pesar del sol.",
  url: "https://meskeia.com/visualizador-vitamina-d/",
  category: 'EducationalApplication',
  features: [],
});
