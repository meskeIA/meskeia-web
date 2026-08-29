import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Relatividad Especial - Dilatación del Tiempo, E=mc² y Paradoja de los Gemelos | meskeIA',
  description:
    'Visualiza la dilatación del tiempo, contracción de longitud y E=mc² con sliders interactivos. La relatividad especial de Einstein sin matemáticas complejas.',
  keywords: [
    'relatividad especial',
    'einstein',
    'dilatacion del tiempo',
    'contraccion de longitud',
    'E=mc2',
    'paradoja gemelos',
    'velocidad de la luz',
    'factor gamma',
    'fisica relativista',
    'teoria relatividad',
  ],
  openGraph: {
    title: 'Relatividad Especial | meskeIA',
    description:
      'Dilatación del tiempo, E=mc² y paradoja de los gemelos con sliders interactivos',
    url: 'https://meskeia.com/visualizador-relatividad-especial/',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relatividad Especial | meskeIA',
    description: 'Dilatación del tiempo, E=mc² y paradoja de los gemelos con sliders interactivos',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Relatividad Especial - Dilatación del Tiempo y E=mc²",
  description: "Visualiza la dilatación del tiempo, contracción de longitud y E=mc² con sliders interactivos. La relatividad especial de Einstein sin matemáticas complejas.",
  url: "https://meskeia.com/visualizador-relatividad-especial/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la dilatación del tiempo en la relatividad especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dilatación del tiempo es el fenómeno por el cual un reloj que se mueve a alta velocidad tick más lento que uno en reposo. Según la relatividad especial de Einstein, el tiempo transcurre más despacio para un objeto en movimiento respecto a un observador estático. A velocidades cotidianas el efecto es imperceptible, pero a velocidades próximas a la luz (c ≈ 300.000 km/s) se vuelve significativo. Los relojes atómicos en satélites GPS deben corregirse por este efecto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la ecuación E=mc² en términos prácticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'E=mc² establece que la energía (E) y la masa (m) son equivalentes: una pequeña masa contiene una cantidad enorme de energía al multiplicarse por el cuadrado de la velocidad de la luz (c² ≈ 9×10¹⁶ m²/s²). En términos prácticos, 1 gramo de materia equivale a unos 90 terajulios de energía. Este principio explica la energía liberada en reacciones nucleares y es la base teórica de la fisión y la fusión atómica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué consiste la paradoja de los gemelos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La paradoja de los gemelos es un experimento mental en el que uno de dos gemelos viaja en nave espacial a velocidad relativista y regresa a la Tierra. Debido a la dilatación del tiempo, el gemelo viajero ha envejecido menos que el que permaneció en reposo. No es una paradoja real sino una consecuencia de que los dos gemelos no son sistemas de referencia equivalentes: solo uno de ellos acelera y desacelera, rompiendo la simetría.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el factor gamma (γ) en la relatividad especial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El factor de Lorentz o factor gamma (γ) es el parámetro clave de la relatividad especial: γ = 1/√(1−v²/c²). Cuando la velocidad v es pequeña frente a c, γ ≈ 1 y los efectos relativistas son despreciables. A v = 0,87c, γ ≈ 2, lo que significa que el tiempo se dilata al doble y la longitud se contrae a la mitad. A v = 0,99c, γ ≈ 7. El factor gamma aparece en todas las transformaciones relativistas de tiempo, longitud, masa y energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre relatividad especial y relatividad general?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La relatividad especial (1905) describe el comportamiento del espacio y el tiempo en sistemas de referencia inerciales (sin aceleración) y en ausencia de gravedad. La relatividad general (1915) extiende la teoría para incluir la gravedad, describiendo esta como una curvatura del espacio-tiempo producida por la masa. Mientras que la especial es suficiente para partículas de alta energía y GPS, la general es necesaria para fenómenos gravitacionales como agujeros negros y la cosmología.',
      },
    },
  ],
};
