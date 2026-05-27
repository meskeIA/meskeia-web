import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Puntos de Inflexión Climáticos | Tipping Points y Retroalimentaciones | meskeIA',
  description: 'Los 9 tipping points climáticos: deshielo Ártico, Groenlandia, Amazonas, permafrost de Siberia y AMOC. Retroalimentaciones, cascadas y escenarios IPCC AR6.',
  keywords: ['tipping points', 'puntos inflexion climaticos', 'cambio climatico', 'AMOC', 'Amazonas', 'permafrost', 'Groenlandia', 'retroalimentacion', 'IPCC'],
  openGraph: {
    title: 'Puntos de Inflexión Climáticos | meskeIA',
    description: 'Los umbrales irreversibles del sistema climático: 9 tipping points, retroalimentaciones y cascadas.',
    url: 'https://meskeia.com/visualizador-cambio-climatico-tipping-points/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Puntos de Inflexión Climáticos - Tipping Points",
  description: "Los 9 tipping points climáticos: deshielo Ártico, Groenlandia, Amazonas, permafrost de Siberia y AMOC. Retroalimentaciones, cascadas y escenarios IPCC AR6.",
  url: "https://meskeia.com/visualizador-cambio-climatico-tipping-points/",
  category: 'EducationalApplication',
  features: [],
});
