import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Mecánica Cuántica - Dualidad, Incertidumbre, Superposición y Efecto Túnel | meskeIA',
  description:
    'Visualiza los fenómenos cuánticos: dualidad onda-partícula, principio de incertidumbre, gato de Schrödinger y efecto túnel. Sin ecuaciones, con animaciones interactivas.',
  keywords: [
    'mecanica cuantica',
    'dualidad onda particula',
    'principio incertidumbre',
    'gato schrodinger',
    'efecto tunel',
    'superposicion cuantica',
    'doble rendija',
    'qubit',
  ],
  openGraph: {
    title: 'Mecánica Cuántica | meskeIA',
    description:
      'Dualidad, incertidumbre, superposición y efecto túnel con animaciones interactivas',
    url: 'https://meskeia.com/visualizador-mecanica-cuantica/',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mecánica Cuántica | meskeIA',
    description: 'Dualidad, incertidumbre, superposición y efecto túnel con animaciones interactivas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Mecánica Cuántica - Dualidad, Incertidumbre y Efecto Túnel",
  description: "Visualiza los fenómenos cuánticos: dualidad onda-partícula, principio de incertidumbre, gato de Schrödinger y efecto túnel. Sin ecuaciones, con animaciones interactivas.",
  url: "https://meskeia.com/visualizador-mecanica-cuantica/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la dualidad onda-partícula en mecánica cuántica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dualidad onda-partícula es el fenómeno por el cual las partículas subatómicas, como los electrones y fotones, se comportan tanto como ondas como partículas según el tipo de observación. El experimento de la doble rendija demuestra esto: sin detector, los electrones forman un patrón de interferencia propio de las ondas; con detector, actúan como partículas. Este principio fue formulado por Louis de Broglie en 1924 y es uno de los pilares de la mecánica cuántica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice el principio de incertidumbre de Heisenberg?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El principio de incertidumbre de Heisenberg (1927) establece que no es posible conocer simultáneamente con precisión arbitraria la posición y el momento lineal de una partícula: cuanto más exactamente se mide una, mayor es la incertidumbre en la otra. Esto no es una limitación tecnológica, sino una propiedad intrínseca de la naturaleza cuántica. Matemáticamente se expresa como Δx·Δp ≥ ℏ/2.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el efecto túnel cuántico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El efecto túnel es la capacidad de una partícula cuántica de atravesar una barrera de energía que, en la física clásica, sería infranqueable. Ocurre porque la partícula tiene una función de onda que se extiende al otro lado de la barrera con una probabilidad no nula. Este fenómeno es real y tiene aplicaciones prácticas: es el principio detrás del microscopio de efecto túnel (STM) y esencial para la fusión nuclear en el interior del Sol.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la superposición cuántica y el gato de Schrödinger?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La superposición cuántica es el estado en el que un sistema cuántico existe en múltiples estados a la vez hasta que se realiza una medición. El gato de Schrödinger es un experimento mental propuesto en 1935 para ilustrar la paradoja de aplicar este principio a objetos macroscópicos: un gato encerrado con un mecanismo cuántico estaría simultáneamente vivo y muerto hasta que se abriera la caja. El experimento no fue diseñado como algo literal, sino para señalar los límites de interpretar la mecánica cuántica a escala cotidiana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve entender la mecánica cuántica sin ser físico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comprender la mecánica cuántica permite entender el funcionamiento de tecnologías cotidianas como los transistores (base de todos los chips), los láseres, los paneles solares y los escáneres de resonancia magnética. Además, la computación cuántica, que usa qubits en superposición, promete resolver problemas de optimización y criptografía inabordables para los ordenadores clásicos. Conocer sus principios básicos ayuda a interpretar con criterio los avances científicos actuales.',
      },
    },
  ],
};
