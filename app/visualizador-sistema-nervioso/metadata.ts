import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'El Sistema Nervioso - Neurona, Sinapsis y Neurotransmisores | meskeIA',
  description:
    'Visualiza el sistema nervioso: neurona interactiva, SNC vs SNP, sinapsis química y los 6 neurotransmisores principales. Bachillerato y anatomía básica.',
  keywords: [
    'sistema nervioso',
    'neurona interactiva',
    'neurotransmisores',
    'sinapsis química',
    'SNC SNP',
    'arco reflejo',
    'biología bachillerato',
    'anatomía',
  ],
  openGraph: {
    title: 'El Sistema Nervioso — Neurona, Sinapsis y Neurotransmisores | meskeIA',
    description:
      'Neurona interactiva con partes clicables, SNC vs SNP, sinapsis química paso a paso y 6 neurotransmisores principales. Ideal para Bachillerato.',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Sistema Nervioso',
  description:
    'Visualizador interactivo del sistema nervioso: neurona con partes clicables, división SNC vs SNP, sinapsis química animada paso a paso, 6 neurotransmisores principales y arco reflejo con ejemplos cotidianos.',
  url: 'https://meskeia.com/visualizador-sistema-nervioso/',
  category: 'EducationalApplication',
  features: [
    'Neurona interactiva: partes clicables con descripción detallada',
    'SNC vs SNP: encéfalo, médula, sistema autónomo simpático y parasimpático',
    'Sinapsis química animada paso a paso',
    '6 neurotransmisores principales: dopamina, serotonina, GABA y más',
    'Arco reflejo con ejemplos cotidianos',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el sistema nervioso central y el periférico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema nervioso central (SNC) comprende el encéfalo (cerebro, cerebelo y tronco encefálico) y la médula espinal; es el centro de procesamiento y toma de decisiones. El sistema nervioso periférico (SNP) incluye todos los nervios que conectan el SNC con el resto del cuerpo: los nervios craneales, los raquídeos y el sistema autónomo, que regula funciones involuntarias como el ritmo cardíaco, la digestión y la respiración.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué partes tiene una neurona y qué función cumple cada una?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La neurona tiene tres partes principales: el soma o cuerpo celular, que contiene el núcleo y los orgánulos; las dendritas, prolongaciones cortas y ramificadas que reciben señales de otras neuronas; y el axón, una prolongación larga que conduce el impulso eléctrico hacia la neurona siguiente o hacia un músculo. Muchos axones están envueltos en mielina, una capa aislante que acelera la conducción hasta 120 m/s. En el extremo del axón están los terminales sinápticos, donde se libera el neurotransmisor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la sinapsis química entre neuronas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cuando el impulso eléctrico llega al terminal sináptico, activa canales de calcio que provocan la fusión de vesículas llenas de neurotransmisores con la membrana. Los neurotransmisores se liberan al espacio sináptico (la hendidura entre las dos neuronas) y se unen a receptores específicos de la neurona postsináptica, generando un nuevo potencial eléctrico. El proceso tarda entre 0,5 y 1 milisegundo. Después, los neurotransmisores sobrantes se degradan o son recaptados por la neurona presináptica para reutilizarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace la dopamina y en qué se diferencia de la serotonina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dopamina actúa principalmente en los circuitos de recompensa y motivación: se libera en anticipación de una recompensa y refuerza conductas. También regula el movimiento voluntario; su déficit en la sustancia negra causa el Parkinson. La serotonina regula el estado de ánimo, el sueño, el apetito y la impulsividad; la mayoría se produce en el intestino, no en el cerebro. Los antidepresivos ISRS actúan inhibiendo la recaptación de serotonina para aumentar su disponibilidad en la sinapsis.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el arco reflejo y por qué actúa sin que pensemos en ello?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El arco reflejo es un circuito neural que procesa una respuesta automática sin pasar por el cerebro: el estímulo (por ejemplo, tocar algo caliente) activa neuronas sensoriales que van a la médula espinal, donde interneuronas conectan directamente con neuronas motoras que ordenan la respuesta (retirar la mano). Todo ocurre en milisegundos, mucho antes de que la señal llegue al córtex para generar la sensación consciente de dolor. Este diseño protege el cuerpo de daños mientras el cerebro aún procesa la información.',
      },
    },
  ],
};
