import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Acetilcolina: Cómo Funciona | meskeIA',
  description:
    'El primer neurotransmisor descubierto. Visualiza la unión neuromuscular, sistema parasimpático, receptores nicotínicos vs muscarínicos, Botox, Alzheimer y organofosforados.',
  keywords: [
    'acetilcolina como funciona',
    'acetilcolina Alzheimer',
    'receptores nicotinicos muscarinicos',
    'acetilcolina union neuromuscular',
    'acetilcolinesterasa',
    'botox acetilcolina',
    'acetilcolina memoria',
  ],
  openGraph: {
    title: 'Acetilcolina: El Primer Neurotransmisor Descubierto',
    description:
      'Músculos, memoria y órganos: tres sistemas, dos receptores, un neurotransmisor.',
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
  name: "Acetilcolina: El Primer Neurotransmisor Descubierto",
  description: "El primer neurotransmisor descubierto. Visualiza la unión neuromuscular, sistema parasimpático, receptores nicotínicos vs muscarínicos, Botox, Alzheimer y organofosforados.",
  url: "https://meskeia.com/visualizador-acetilcolina/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la acetilcolina y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La acetilcolina es el primer neurotransmisor descubierto por Otto Loewi en 1921. Actúa en la unión neuromuscular para contraer los músculos esqueléticos, en el sistema nervioso parasimpático para regular funciones como la frecuencia cardíaca y la digestión, y en el sistema nervioso central para procesos de memoria y atención. Es indispensable tanto para el movimiento voluntario como para el aprendizaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre receptores nicotínicos y muscarínicos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los receptores nicotínicos son canales iónicos que se activan rápidamente; se encuentran en la unión neuromuscular y en ganglios autonómicos. Los receptores muscarínicos son receptores acoplados a proteínas G de acción más lenta; predominan en órganos internos regulados por el sistema parasimpático, como el corazón, pulmones y tracto gastrointestinal. Cada tipo responde a toxinas distintas: la nicotina activa los primeros y la muscarina activa los segundos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la acetilcolina es importante en el Alzheimer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la enfermedad de Alzheimer se produce una pérdida progresiva de neuronas colinérgicas en el núcleo basal de Meynert, lo que reduce drásticamente los niveles de acetilcolina en la corteza cerebral. Esta caída está asociada al deterioro de la memoria y la atención. Los inhibidores de la acetilcolinesterasa, como el donepezilo, son la principal estrategia farmacológica aprobada para ralentizar los síntomas al impedir la degradación de la acetilcolina disponible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo actúa el Botox sobre la acetilcolina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La toxina botulínica (Botox) bloquea la liberación de acetilcolina en la unión neuromuscular al degradar las proteínas SNARE necesarias para que las vesículas sinápticas fusionen con la membrana y liberen el neurotransmisor. Esto produce una parálisis muscular local reversible que dura entre 3 y 6 meses. Médicamente se usa para espasticidad, migraña crónica y hiperhidrosis, además de sus aplicaciones estéticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los organofosforados y por qué son peligrosos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los organofosforados son compuestos presentes en plaguicidas (paratión, malatión) y agentes nerviosos de guerra (sarín, tabún). Inhiben de forma irreversible la enzima acetilcolinesterasa, impidiendo la degradación de la acetilcolina en las sinapsis. La acumulación masiva del neurotransmisor provoca hiperactivación muscular continua que puede desembocar en convulsiones, parálisis respiratoria y muerte. El tratamiento de emergencia incluye atropina y pralidoxima.',
      },
    },
  ],
};
