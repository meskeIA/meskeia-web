import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Derivadas — Pendiente de la Tangente Visual | meskeIA',
  description: 'Visualiza la derivada como pendiente de la recta tangente. Arrastra el punto sobre la curva y observa cómo cambia f\'(x) en tiempo real. Funciones, secante y derivada como curva.',
  keywords: 'derivada, pendiente, tangente, secante, límite, cálculo diferencial, función derivada, máximo, mínimo, EBAU, selectividad, Bachillerato, matemáticas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-derivada-pendiente/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Derivadas | meskeIA',
    description: 'Mueve el punto sobre la curva y mira la tangente girar. Aprende qué es la derivada visualmente.',
    url: 'https://meskeia.com/simulador-derivada-pendiente/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Derivadas | meskeIA',
    description: 'Pendiente de la tangente, derivada como curva y aproximación de la secante en tiempo real.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Derivadas (pendiente de la tangente)',
  description: 'Simulador interactivo del concepto de derivada como pendiente de la recta tangente. Manipula el punto sobre la curva y observa el valor de f\'(x), el ángulo de la tangente y cómo la secante tiende a la tangente cuando los puntos se acercan.',
  url: 'https://meskeia.com/simulador-derivada-pendiente/',
  category: 'EducationalApplication',
  features: [
    '8 funciones predefinidas: polinomios, trigonométricas, exponencial, logaritmo y racionales',
    'Punto P arrastrable sobre la curva con tangente en tiempo real',
    'Visualización de la función derivada f\'(x) superpuesta',
    'Modo secante: ver cómo Q→P transforma secante en tangente (concepto de límite)',
    'Display de pendiente, ángulo y valor numérico',
    'Detección automática de máximos, mínimos y puntos de inflexión',
  ],
  keywords: ['derivada', 'tangente', 'cálculo diferencial', 'EBAU', 'matemáticas', 'Bachillerato'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la derivada de una función y qué representa geométricamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La derivada f\'(x) en un punto mide la tasa de cambio instantánea de la función en ese punto. Geométricamente, es la pendiente de la recta tangente a la curva en ese punto: un valor positivo indica que la función crece, un valor negativo que decrece, y cero señala un posible máximo, mínimo o punto de inflexión. Esta interpretación geométrica es la base del cálculo diferencial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la recta secante y la recta tangente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La recta secante une dos puntos distintos de la curva y su pendiente representa la tasa de cambio media entre ellos. La recta tangente es el caso límite cuando esos dos puntos se acercan hasta coincidir: su pendiente es la tasa de cambio instantánea, es decir, la derivada. El paso de secante a tangente ilustra el concepto de límite que define formalmente la derivada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se relacionan los máximos y mínimos de una función con su derivada?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En un máximo o mínimo local la recta tangente es horizontal, por lo que la derivada vale cero en esos puntos (condición necesaria). Para distinguir si es máximo, mínimo o punto de inflexión se analiza el signo de la derivada a ambos lados: si cambia de positivo a negativo es un máximo local; de negativo a positivo, un mínimo local; si no cambia de signo es un punto de inflexión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este simulador de derivadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador es útil desde el último curso de secundaria hasta primer año de universidad. Es especialmente adecuado para estudiantes de Bachillerato que preparan la selectividad o el examen de admisión universitaria, y también para cursos introductorios de cálculo en ingeniería, física o economía. No requiere conocimientos previos de cálculo: el enfoque es completamente visual e intuitivo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se interpreta la curva de la función derivada f\'(x) superpuesta sobre f(x)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La curva de f\'(x) muestra en cada punto x el valor de la pendiente de f en ese punto. Cuando f\'(x) > 0, la función original f crece; cuando f\'(x) < 0, decrece; cuando f\'(x) = 0, hay un extremo o punto de inflexión. Los cruces de f\'(x) con el eje horizontal corresponden exactamente a los máximos y mínimos de f(x), lo que permite leer la geometría de f a partir de la forma de su derivada.',
      },
    },
  ],
};
