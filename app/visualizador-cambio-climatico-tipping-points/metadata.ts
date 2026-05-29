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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un tipping point climático?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un tipping point o punto de inflexión climático es un umbral crítico del sistema climático a partir del cual se produce un cambio brusco e irreversible sin necesidad de más forzamiento externo. Una vez cruzado, el sistema se retroalimenta a sí mismo hacia un nuevo estado. Un ejemplo es el deshielo del Ártico: al reducirse el hielo marino, disminuye el albedo y el océano absorbe más calor, acelerando el propio deshielo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son los principales tipping points identificados por el IPCC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El informe IPCC AR6 y estudios asociados identifican al menos 9 tipping points relevantes: deshielo del Ártico, deshielo de la capa de hielo de Groenlandia, colapso del manto de hielo de la Antártida Occidental, desestabilización del permafrost de Siberia, debilitamiento de la AMOC (Circulación Atlántica de Retorno), deforestación del Amazonas, blanqueamiento masivo de arrecifes de coral, monzón de África Occidental y expansión de la sabana africana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la AMOC y por qué su colapso sería tan grave?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La AMOC (Atlantic Meridional Overturning Circulation) es el sistema de corrientes oceánicas que transporta agua cálida superficial desde el trópico hacia el norte y agua fría profunda de vuelta al sur. Su debilitamiento o colapso redistribuiría drásticamente el calor en el planeta: enfriaría Europa del Norte varios grados, alteraría el régimen de lluvias en el Sahel y el Amazonas, y elevaría el nivel del mar en la costa atlántica de Norteamérica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las cascadas de tipping points?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una cascada ocurre cuando cruzar un tipping point desencadena otro u otros, incluso si el calentamiento global no ha alcanzado sus umbrales individuales. Por ejemplo, el deshielo del permafrost libera metano y CO₂, lo que acelera el calentamiento global y puede desestabilizar el hielo de Groenlandia. Estudios publicados en Nature (Lenton et al., 2018) alertan de que superar los 1,5-2°C podría activar cascadas con consecuencias irreversibles a escala de siglos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A cuántos grados de calentamiento se activan estos puntos de inflexión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los umbrales varían según el tipping point. Según Armstrong McKay et al. (2022, Science), varios pueden activarse por debajo de 2°C: el deshielo de Groenlandia podría iniciarse entre 1,1 y 3,8°C; el colapso del manto antártico occidental entre 1,5 y 3°C; y el debilitamiento de la AMOC en torno a 1,4-8°C. La incertidumbre es alta, pero el Acuerdo de París (objetivo 1,5°C) se diseñó precisamente para minimizar este riesgo.',
      },
    },
  ],
};
