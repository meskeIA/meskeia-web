import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estrógenos - Las Hormonas del Ciclo y la Salud Ósea | meskeIA',
  description: 'Entiende los estrógenos: los tres tipos (E1, E2, E3), su papel en el ciclo menstrual, efectos en hueso, corazón y cerebro, la menopausia como transición fisiológica, y los estrógenos en los hombres.',
  keywords: ['estrogenos como funcionan', 'estradiol estriol estrona', 'estrogenos ciclo menstrual', 'menopausia estrogenos', 'estrogenos hueso osteoporosis', 'estrogenos hombres', 'estrogenos cerebro', 'FSH LH estrogenos'],
  openGraph: {
    title: 'Estrógenos - Hormonas del Ciclo y la Salud | meskeIA',
    description: 'Fisiología de los estrógenos: tipos, ciclo menstrual, menopausia y efectos en el cuerpo.',
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
  name: "Estrógenos - Las Hormonas del Ciclo y la Salud Ósea",
  description: "Entiende los estrógenos: los tres tipos (E1, E2, E3), su papel en el ciclo menstrual, efectos en hueso, corazón y cerebro, la menopausia como transición fisiológica, y los estrógenos en los hombres.",
  url: "https://meskeia.com/visualizador-estrogenos/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los estrógenos y cuáles son sus tipos principales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estrógenos son hormonas esteroideas producidas principalmente en los ovarios, aunque también en menor medida en el tejido adiposo y las glándulas suprarrenales. Existen tres tipos principales: estradiol (E2), el más potente y predominante en edad reproductiva; estrona (E1), que aumenta su proporción tras la menopausia; y estriol (E3), producido principalmente durante el embarazo por la placenta. Cada uno tiene diferente afinidad por los receptores estrogénicos y distintos efectos fisiológicos según el tejido diana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juegan los estrógenos en el ciclo menstrual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Durante el ciclo menstrual, los estrógenos alcanzan su primer pico justo antes de la ovulación (día 12-14), lo que desencadena el pico de LH que libera el óvulo. En la fase folicular, los estrógenos estimulan el engrosamiento del endometrio para preparar la implantación. Tras la ovulación, la progesterona toma el relevo en la fase lútea. Si no hay embarazo, ambas hormonas caen bruscamente y se produce la menstruación. Los estrógenos también modulan el estado de ánimo y la libido a lo largo del ciclo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta la menopausia a los niveles de estrógenos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La menopausia marca el cese definitivo de la menstruación y se confirma tras 12 meses sin ciclo. Los ovarios dejan de producir estradiol de forma significativa, y los niveles de esta hormona caen entre un 85 y un 90%. El estradiol es reemplazado parcialmente por la estrona, producida a partir de andrógenos en el tejido adiposo. Esta caída hormonal está detrás de síntomas como los sofocos, el insomnio, la sequedad vaginal y la pérdida acelerada de densidad ósea que puede derivar en osteoporosis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los hombres también producen estrógenos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los hombres producen estrógenos en cantidades mucho menores que las mujeres, principalmente mediante la conversión de testosterona en estradiol por la enzima aromatasa, que se encuentra en el tejido adiposo, el hígado y el cerebro. El estradiol en los hombres es esencial para la salud ósea, la libido, la función eréctil y la regulación del sistema nervioso central. Niveles excesivamente bajos o altos de estradiol en hombres pueden causar disfunción sexual, pérdida ósea o problemas metabólicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué efectos tienen los estrógenos sobre los huesos y el corazón?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los estrógenos son protectores clave del tejido óseo: inhiben la actividad de los osteoclastos (células que degradan hueso) y favorecen la acción de los osteoblastos (que forman hueso), manteniendo la densidad mineral ósea. Por eso, la caída estrogénica en la menopausia acelera la pérdida ósea y aumenta el riesgo de osteoporosis. A nivel cardiovascular, los estrógenos tienen efectos vasodilatadores, mejoran el perfil lipídico (aumentan HDL y reducen LDL) y tienen propiedades antiinflamatorias, lo que explica el menor riesgo cardiovascular en mujeres antes de la menopausia respecto a hombres de la misma edad.',
      },
    },
  ],
};
