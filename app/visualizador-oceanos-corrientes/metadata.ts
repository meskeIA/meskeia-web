import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Océanos y Corrientes - AMOC, Corriente del Golfo y Acidificación | meskeIA',
  description: 'Visualiza la circulación termohalina oceánica, el impacto del debilitamiento del AMOC en Europa, la acidificación del mar y las zonas muertas hipóxicas.',
  keywords: ['AMOC', 'corriente del golfo', 'conveyor belt oceanico', 'acidificacion oceano', 'pH oceano', 'zonas muertas', 'hipoxia marina', 'circulacion termohalina', 'cambio climatico oceanos'],
  openGraph: {
    title: 'Océanos y Corrientes Oceánicas | meskeIA',
    description: 'AMOC, corriente del Golfo, acidificación y zonas muertas visualizadas interactivamente',
    url: 'https://meskeia.com/visualizador-oceanos-corrientes/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Océanos y Corrientes - AMOC, Corriente del Golfo y Acidificación",
  description: "Visualiza la circulación termohalina oceánica, el impacto del debilitamiento del AMOC en Europa, la acidificación del mar y las zonas muertas hipóxicas.",
  url: "https://meskeia.com/visualizador-oceanos-corrientes/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el AMOC y por qué preocupa su debilitamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El AMOC (Atlantic Meridional Overturning Circulation) es el sistema de corrientes oceánicas que transporta agua cálida desde el Atlántico tropical hacia el norte de Europa, moderando su clima. Estudios publicados en Nature señalan que se encuentra en su punto más débil en más de mil años. Su colapso podría reducir las temperaturas invernales en Europa occidental entre 5 y 15 °C en pocas décadas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la circulación termohalina oceánica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La circulación termohalina es un sistema global de corrientes impulsado por diferencias de temperatura y salinidad. El agua fría y salada del Atlántico Norte es más densa, se hunde y fluye hacia el sur por las profundidades; en los trópicos, el agua superficial más cálida y menos densa viaja hacia el norte para reemplazarla. Este "conveyor belt" oceánico distribuye calor y nutrientes por todo el planeta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué está causando la acidificación de los océanos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los océanos absorben aproximadamente el 30% del CO₂ emitido por actividades humanas. Al disolverse en agua, el CO₂ forma ácido carbónico, lo que reduce el pH oceánico. Desde la era preindustrial el pH ha bajado de 8,2 a 8,1, lo que representa un aumento de acidez del 26%. Esto dificulta la formación de conchas y esqueletos calcáreos en moluscos, corales y plancton marino.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las zonas muertas hipóxicas en el mar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las zonas muertas son áreas oceánicas con niveles de oxígeno tan bajos (menos de 2 mg/L) que la mayoría de los organismos marinos no pueden sobrevivir. Se forman cuando el exceso de nutrientes —principalmente nitratos y fosfatos de fertilizantes agrícolas— provoca proliferaciones masivas de algas que al descomponerse consumen todo el oxígeno disponible. Hoy existen más de 700 zonas hipóxicas identificadas en el mundo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el cambio climático a la corriente del Golfo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El deshielo de Groenlandia vierte grandes cantidades de agua dulce en el Atlántico Norte, reduciendo la salinidad y densidad del agua superficial. Esto frena el hundimiento que impulsa la corriente del Golfo. Un debilitamiento significativo haría que el norte de Europa y la costa este de Norteamérica experimenten inviernos más extremos, alteraciones en las precipitaciones y una subida del nivel del mar más pronunciada en el Atlántico oeste.',
      },
    },
  ],
};
