import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Niño y La Niña: ENSO Explicado | meskeIA',
  description:
    'Visualiza el fenómeno El Niño/La Niña: circulación Walker, desplazamiento del agua cálida, teleconexiones globales y predicción ENSO. Por qué afecta al clima de España, Australia y Sudamérica.',
  keywords: [
    'el niño fenómeno',
    'la niña clima',
    'ENSO explicado',
    'circulación Walker',
    'corrientes Pacífico',
    'teleconexiones climáticas',
    'predicción clima',
    'anomalía temperatura océano',
  ],
  openGraph: {
    title: 'El Niño y La Niña: ENSO Explicado | meskeIA',
    description:
      'Por qué El Niño en el Pacífico causa sequías en Australia, lluvias en Perú e inviernos más cálidos en Europa.',
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
  name: "El Niño y La Niña: ENSO Explicado",
  description: "Visualiza el fenómeno El Niño/La Niña: circulación Walker, desplazamiento del agua cálida, teleconexiones globales y predicción ENSO. Por qué afecta al clima de España, Australia y Sudamérica.",
  url: "https://meskeia.com/visualizador-el-nino/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es El Niño y por qué se llama así?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Niño es un calentamiento anómalo de las aguas superficiales del Pacífico tropical central y oriental que ocurre de forma irregular cada 2-7 años. Los pescadores peruanos del siglo XIX lo llamaron "El Niño" porque solía aparecer alrededor de Navidad, en referencia al Niño Jesús. Forma parte del ciclo climático más amplio conocido como ENSO (El Niño-Oscilación del Sur).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre El Niño y La Niña?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Niño implica el calentamiento anómalo del Pacífico ecuatorial oriental, mientras que La Niña es la fase opuesta: enfriamiento de esas mismas aguas. La Niña tiende a intensificar los patrones climáticos normales (más lluvias donde ya llueve, más sequía donde ya es seco), mientras que El Niño los invierte parcialmente. Ambos duran entre 9 y 18 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta El Niño al clima de España y Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El impacto de El Niño en Europa es indirecto, a través de las teleconexiones atmosféricas. En España, los años de El Niño tienden a asociarse con inviernos más cálidos y húmedos en la mitad norte y condiciones más variables en el sur. Sin embargo, la señal es menos clara que en regiones como América del Sur o Australia, donde el fenómeno tiene efectos más directos y predecibles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la circulación Walker y cómo se rompe durante El Niño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La circulación Walker es la célula de convección atmosférica en el Pacífico tropical: el aire sube sobre el Pacífico occidental (cálido y húmedo) y desciende sobre el oriental (frío y seco), impulsado por los vientos alisios. Durante El Niño, los vientos alisios se debilitan, el agua cálida migra hacia el este y la célula Walker se colapsa, alterando los patrones de precipitación en todo el trópico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuánta antelación se puede predecir El Niño?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los modelos climáticos actuales permiten predecir El Niño con 6-9 meses de antelación con cierta fiabilidad, y hasta 12-18 meses con mayor incertidumbre. La "barrera de predictabilidad de primavera" hace que las predicciones emitidas en febrero-abril sean menos fiables. Organismos como NOAA y el IRI publican actualizaciones mensuales del estado del ENSO.',
      },
    },
  ],
};
