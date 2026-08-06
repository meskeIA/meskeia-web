import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Plano Inclinado - Diagrama de Cuerpo Libre y Rozamiento | meskeIA',
  description:
    'Calcula si un bloque desliza por un plano inclinado: normal, componentes del peso, rozamiento estático y cinético, aceleración y ángulo crítico. Con diagrama de cuerpo libre y animación.',
  keywords:
    'plano inclinado, diagrama de cuerpo libre, rozamiento, coeficiente de rozamiento, ángulo crítico, fuerza normal, leyes de Newton, dinámica, física, aceleración',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-plano-inclinado/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Plano Inclinado | meskeIA',
    description:
      'Ajusta masa, ángulo y coeficientes de rozamiento y comprueba si el bloque desliza, con todas las fuerzas dibujadas',
    url: 'https://meskeia.com/simulador-plano-inclinado/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Plano Inclinado | meskeIA',
    description: 'Dinámica con rozamiento: ¿desliza el bloque? Diagrama de cuerpo libre interactivo',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Plano Inclinado',
  description:
    'Simulador interactivo de dinámica en un plano inclinado con rozamiento. Ajusta masa, ángulo, coeficientes estático y cinético y una fuerza aplicada, y obtén la normal, las componentes del peso, la fuerza de rozamiento real, la aceleración y el ángulo crítico, con el diagrama de cuerpo libre dibujado y la animación del bloque.',
  url: 'https://meskeia.com/simulador-plano-inclinado/',
  category: 'EducationalApplication',
  features: [
    'Decide si el bloque permanece en reposo o desliza',
    'Diagrama de cuerpo libre con todas las fuerzas y sus componentes',
    'Coeficientes estático y cinético independientes',
    'Ángulo crítico de deslizamiento a partir del coeficiente estático',
    'Animación del bloque con tiempo y velocidad final',
    'Balance de energía con el trabajo del rozamiento',
    'Materiales de referencia predefinidos',
    'En español',
  ],
  keywords: ['plano inclinado', 'rozamiento', 'diagrama de cuerpo libre', 'dinámica', 'leyes de Newton'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo se sabe si un bloque desliza por un plano inclinado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se compara la componente del peso paralela al plano (m·g·sen θ) con la fuerza de rozamiento estático máxima (μₛ·N, donde N = m·g·cos θ). Si m·g·sen θ es menor o igual que μₛ·m·g·cos θ, el bloque permanece en reposo. Si la supera, empieza a deslizar y a partir de ese momento actúa el rozamiento cinético, que es menor. Fíjate en que la masa se cancela: el resultado depende solo del ángulo y del coeficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el ángulo crítico de un plano inclinado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ángulo crítico o ángulo de deslizamiento es la inclinación a partir de la cual el bloque empieza a moverse por sí solo, y vale θc = arctg(μₛ). Por debajo de ese ángulo el rozamiento estático basta para equilibrar al peso; por encima, no. Como no depende de la masa, inclinar una tabla hasta que el objeto resbala es el método clásico para medir experimentalmente el coeficiente de rozamiento estático entre dos materiales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la fuerza normal no es igual al peso en un plano inclinado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La normal es perpendicular a la superficie de apoyo, no vertical. En un plano inclinado un ángulo θ, la superficie solo tiene que sostener la componente del peso perpendicular a ella, que vale m·g·cos θ. La otra componente, m·g·sen θ, es paralela al plano y es la que tiende a hacer deslizar el bloque. Por eso, cuanto más inclinado está el plano, menor es la normal y menor es también el rozamiento máximo que puede ofrecer.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre rozamiento estático y cinético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El rozamiento estático actúa mientras el cuerpo no se mueve y es una fuerza variable: vale exactamente lo necesario para equilibrar el resto de fuerzas, hasta un máximo de μₛ·N. El cinético actúa cuando ya hay deslizamiento, tiene un valor prácticamente constante de μₖ·N y se opone al movimiento. Para casi todos los pares de materiales μₖ es menor que μₛ, y por eso cuesta más iniciar el movimiento de un objeto que mantenerlo en marcha.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la aceleración de un bloque que desliza con rozamiento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se aplica la segunda ley de Newton sobre el eje paralelo al plano. Si el bloque baja sin fuerza aplicada, a = g·(sen θ − μₖ·cos θ). Si hay una fuerza F paralela al plano, la expresión general es a = (F − m·g·sen θ ∓ μₖ·m·g·cos θ)/m, con el signo del rozamiento siempre opuesto al movimiento. La aceleración es constante mientras no cambien el ángulo ni los coeficientes, así que el movimiento resultante es uniformemente acelerado.',
      },
    },
  ],
};
