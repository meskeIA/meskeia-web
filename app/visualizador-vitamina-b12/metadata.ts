import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Vitamina B12: Ciclo de Metilación y Factor Intrínseco | meskeIA',
  description: 'Ciclo de metilación, sistema de absorción por factor intrínseco, grupos de riesgo (veganos, mayores de 50, metformina) y síntomas neurológicos de la deficiencia.',
  keywords: [
    'vitamina b12 como funciona',
    'deficiencia vitamina b12',
    'factor intrinseco b12',
    'b12 veganos',
    'anemia perniciosa',
    'ciclo metilacion b12',
    'b12 homocisteina',
    'b12 neurologia',
  ],
  openGraph: {
    title: 'Vitamina B12: Ciclo de Metilación y Factor Intrínseco',
    description: 'Sistema de absorción especial, grupos de riesgo y síntomas neurológicos',
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
  name: "Vitamina B12: Ciclo de Metilación y Factor Intrínseco",
  description: "Ciclo de metilación, sistema de absorción por factor intrínseco, grupos de riesgo (veganos, mayores de 50, metformina) y síntomas neurológicos de la deficiencia.",
  url: "https://meskeia.com/visualizador-vitamina-b12/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la vitamina B12 y en qué alimentos se encuentra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La vitamina B12 (cobalamina) es una vitamina hidrosoluble imprescindible para la síntesis de ADN, la formación de glóbulos rojos y el mantenimiento del sistema nervioso. Se encuentra exclusivamente en alimentos de origen animal: carnes (especialmente hígado), pescados, mariscos, huevos y lácteos. Las algas y los alimentos fermentados contienen formas análogas que no tienen actividad biológica equivalente en humanos, por lo que la suplementación es necesaria en dietas veganas estrictas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el factor intrínseco y por qué es necesario para absorber la B12?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor intrínseco es una glicoproteína producida por las células parietales del estómago. Se une a la vitamina B12 en el estómago y el complejo resultante es reconocido por receptores específicos en el íleon terminal, donde se produce la absorción. Sin factor intrínseco funcional, la mayor parte de la B12 ingerida no puede absorberse. La falta de factor intrínseco, ya sea por autoinmunidad (anemia perniciosa) o por cirugía gástrica, causa deficiencia severa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué síntomas produce la deficiencia de vitamina B12?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La deficiencia de B12 afecta principalmente a dos sistemas. En la sangre provoca anemia megaloblástica, con glóbulos rojos anormalmente grandes y reducción de la capacidad de transporte de oxígeno. En el sistema nervioso causa degeneración subaguda combinada de la médula espinal, con síntomas como parestesias (hormigueos), pérdida de sensibilidad, debilidad muscular, problemas de equilibrio y, en casos avanzados, deterioro cognitivo. El daño neurológico puede ser irreversible si la deficiencia se prolonga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las personas que toman metformina tienen más riesgo de déficit de B12?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La metformina, fármaco de primera línea para la diabetes tipo 2, interfiere con la absorción de vitamina B12 en el íleon al alterar la captación del complejo B12-factor intrínseco dependiente de calcio. El riesgo aumenta con la dosis y la duración del tratamiento. Se estima que entre el 10 y el 30% de los pacientes en tratamiento prolongado desarrollan niveles insuficientes. Las guías clínicas recomiendan monitorizar los niveles de B12 periódicamente en estos pacientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué forma de suplemento de B12 es más efectiva: cianocobalamina o metilcobalamina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas formas son eficaces para corregir la deficiencia. La cianocobalamina es la forma más estable, barata y estudiada clínicamente; el organismo la convierte en las formas activas (metilcobalamina e hidroxicobalamina). La metilcobalamina es una coenzima activa directamente utilizable, preferida por algunas personas con variantes genéticas en la vía MTHFR. En dosis altas (500-1000 µg/día), ambas formas se absorben bien incluso sin factor intrínseco gracias a la difusión pasiva.',
      },
    },
  ],
};
