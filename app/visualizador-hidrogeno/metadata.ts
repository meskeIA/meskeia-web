import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Hidrógeno: Del Big Bang a la Pila de Combustible | meskeIA',
  description:
    'El elemento más abundante del universo que alimenta el sol por fusión nuclear y podría descarbonizar el transporte mediante pilas de combustible. Hidrógeno verde, gris y azul.',
  keywords: [
    'hidrogeno elemento',
    'pila de combustible hidrogeno',
    'hidrogeno verde',
    'fusion nuclear hidrogeno',
    'hidrogeno como vector energetico',
    'electrolisis hidrogeno',
    'ITER fusion',
  ],
  openGraph: {
    title: 'El Hidrógeno: Del Big Bang a la Pila de Combustible',
    description:
      'El elemento más abundante del universo que alimenta las estrellas y podría descarbonizar la economía',
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
  name: "El Hidrógeno: Del Big Bang a la Pila de Combustible",
  description: "El elemento más abundante del universo que alimenta el sol por fusión nuclear y podría descarbonizar el transporte mediante pilas de combustible. Hidrógeno verde, gris y azul.",
  url: "https://meskeia.com/visualizador-hidrogeno/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el hidrógeno verde, gris y azul?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La clasificación por colores describe el método de producción y sus emisiones. El hidrógeno gris se obtiene del gas natural mediante reformado con vapor, liberando CO₂; es el más barato y el más producido actualmente. El hidrógeno azul usa el mismo proceso pero captura y almacena el CO₂ (CCS), reduciendo emisiones. El hidrógeno verde se produce por electrólisis del agua usando electricidad de fuentes renovables, sin emisiones directas; es el único plenamente sostenible, aunque todavía el más caro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona una pila de combustible de hidrógeno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una pila de combustible convierte la energía química del hidrógeno directamente en electricidad mediante una reacción electroquímica. El hidrógeno entra por el ánodo, se separa en protones y electrones; los electrones recorren el circuito externo generando corriente, y los protones atraviesan una membrana hasta el cátodo, donde se combinan con oxígeno y los electrones para producir agua. El único residuo es vapor de agua. La eficiencia eléctrica ronda el 50-60 %, superior a la del motor de combustión interna.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el hidrógeno es el elemento más abundante del universo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hidrógeno se formó minutos después del Big Bang cuando el universo era suficientemente frío para que protones y electrones se combinaran en átomos neutros. Representa aproximadamente el 75 % de la masa bariónica del universo. Las estrellas, incluido el Sol, son en su mayor parte hidrógeno que se funde en helio en sus núcleos, liberando la energía que percibimos como luz y calor. En la Tierra no existe libre en grandes cantidades porque su bajo peso le permite escapar de la atmósfera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro el hidrógeno como combustible para coches o autobuses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hidrógeno es inflamable en un rango de concentraciones en aire (4-75 %) más amplio que la gasolina, pero también es 14 veces más ligero que el aire: en caso de fuga al aire libre se dispersa hacia arriba muy rápido en lugar de acumularse. Los vehículos de hidrógeno llevan depósitos certificados para soportar impactos severos y sensores de detección de fugas. Los análisis de seguridad de Toyota, Honda y Hyundai concluyen que el riesgo global es comparable al de los vehículos de gas natural comprimido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puede el hidrógeno reemplazar al gas natural en la calefacción doméstica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Técnicamente es posible: el hidrógeno puede quemarse en calderas adaptadas y se están pilotando redes de distribución mezcladas (hasta un 20 % de hidrógeno en la red de gas existente). Sin embargo, para calefacción doméstica la bomba de calor eléctrica es actualmente más eficiente por factor 3-4 en términos de energía primaria renovable necesaria. El hidrógeno verde tiene más sentido en usos industriales de alta temperatura o en transporte pesado donde la electrificación directa es más difícil.',
      },
    },
  ],
};
