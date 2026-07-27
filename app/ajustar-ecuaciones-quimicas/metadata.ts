import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ajustar y Balancear Ecuaciones Químicas: Redox por Ion-Electrón | meskeIA',
  description: 'Ajusta (balancea) cualquier ecuación química y resuelve reacciones redox por el método del ion-electrón en medio ácido y básico, paso a paso. Incluye calculadora de números de oxidación. Para Bachillerato, EBAU, preparatoria y educación media.',
  keywords: 'ajustar ecuaciones químicas, balancear ecuaciones químicas, método ion-electrón, redox, semirreacciones, número de oxidación, estado de oxidación, medio ácido, medio básico, agente oxidante, agente reductor, coeficientes estequiométricos, EBAU, Bachillerato, preparatoria, educación media, química',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/ajustar-ecuaciones-quimicas/',
  },
  openGraph: {
    type: 'website',
    title: 'Ajustar y Balancear Ecuaciones Químicas: Redox por Ion-Electrón | meskeIA',
    description: 'Escribe la ecuación sin coeficientes y obtén los coeficientes enteros mínimos, o resuelve una redox por ion-electrón con todos los pasos desarrollados.',
    url: 'https://meskeia.com/ajustar-ecuaciones-quimicas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ajustar y Balancear Ecuaciones Químicas: Redox por Ion-Electrón | meskeIA',
    description: 'Ajusta cualquier ecuación química y desarrolla el método del ion-electrón paso a paso, en medio ácido y básico.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Ajustar y Balancear Ecuaciones Químicas: Redox por Ion-Electrón',
  description: 'Herramienta de química que ajusta cualquier ecuación química resolviendo el sistema de conservación de átomos y carga con aritmética exacta de fracciones, y devuelve los coeficientes enteros mínimos junto con la comprobación átomo a átomo. Incluye además una calculadora de números de oxidación que explica la regla aplicada a cada elemento, y un desarrollo completo del método del ion-electrón para reacciones redox en medio ácido y básico: ajuste de la especie principal, de los oxígenos con agua, de los hidrógenos con protones o hidroxilos, de la carga con electrones, igualación de electrones entre semirreacciones y ecuación iónica global simplificada. Pensado para Bachillerato y EBAU (España), preparatoria y educación media (Latinoamérica) y primeros cursos de universidad.',
  url: 'https://meskeia.com/ajustar-ecuaciones-quimicas/',
  category: 'EducationalApplication',
  features: [
    'Ajuste automático de cualquier ecuación química con coeficientes enteros mínimos',
    'Aritmética exacta con fracciones: sin errores de redondeo',
    'Comprobación átomo a átomo y de carga en ambos lados',
    'Método del ion-electrón desarrollado paso a paso en medio ácido y básico',
    'Igualación de electrones entre semirreacciones y ecuación iónica global',
    'Calculadora de números de oxidación con la regla aplicada a cada elemento',
    'Catálogo de reacciones redox clásicas listas para desarrollar',
    'Admite iones, paréntesis anidados y cargas en la fórmula',
  ],
  keywords: ['ajustar ecuaciones químicas', 'balancear ecuaciones', 'ion-electrón', 'redox', 'semirreacciones', 'número de oxidación', 'medio ácido', 'medio básico', 'química'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se ajusta o balancea una ecuación química paso a paso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ajustar una ecuación consiste en encontrar los coeficientes que hacen que haya el mismo número de átomos de cada elemento a ambos lados, y la misma carga total si intervienen iones. El método de tanteo funciona empezando por los elementos que aparecen en una sola especie a cada lado y dejando para el final el oxígeno y el hidrógeno. El método general consiste en plantear una ecuación de conservación por elemento, resolver el sistema y multiplicar la solución hasta obtener los enteros más pequeños posibles. Nunca deben modificarse los subíndices de las fórmulas: solo los coeficientes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste el método del ion-electrón para ajustar reacciones redox?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El método del ion-electrón separa la reacción en dos semirreacciones, la de oxidación y la de reducción, y ajusta cada una por separado en cuatro pasos: primero los átomos del elemento que cambia de estado de oxidación, después los oxígenos añadiendo moléculas de agua, luego los hidrógenos añadiendo iones H⁺, y por último la carga añadiendo electrones. Después se multiplica cada semirreacción por el factor necesario para que los electrones cedidos igualen a los ganados, se suman y se simplifican las especies repetidas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cambia al ajustar una redox en medio básico en lugar de medio ácido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El procedimiento es el mismo hasta el ajuste de la carga. La diferencia es que en medio básico no puede haber H⁺ libre en la ecuación final: se añaden tantos iones OH⁻ a ambos lados como H⁺ haya, de modo que en el lado del H⁺ cada par H⁺ + OH⁻ se combina formando H₂O, y en el otro lado quedan los OH⁻. Por último se simplifican las moléculas de agua que aparezcan en ambos lados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el número de oxidación de un elemento en un compuesto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se aplican reglas por orden de prioridad: un elemento libre vale 0; el flúor siempre −1; los metales alcalinos +1 y los alcalinotérreos +2; el hidrógeno +1 salvo en los hidruros metálicos, donde vale −1; el oxígeno −2 salvo en peróxidos (−1), superóxidos y compuestos con flúor. El elemento que queda sin asignar se despeja imponiendo que la suma de todos los números de oxidación, multiplicados por el número de átomos, sea igual a la carga de la especie: cero en un compuesto neutro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre agente oxidante y agente reductor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El agente oxidante es la especie que se reduce, es decir, la que gana electrones y baja su número de oxidación, provocando la oxidación de la otra. El agente reductor es la que se oxida: cede electrones y sube su número de oxidación. Son papeles complementarios y siempre aparecen juntos, porque los electrones cedidos por el reductor son exactamente los que capta el oxidante. Ejemplos habituales de oxidante son el permanganato y el dicromato en medio ácido.',
      },
    },
  ],
};
