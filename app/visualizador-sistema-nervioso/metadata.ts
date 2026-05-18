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
