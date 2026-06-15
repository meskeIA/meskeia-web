import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Funciones que Gobiernan el Mundo - Matemáticas Visuales | meskeIA',
  description: 'Lineal, exponencial, logarítmica y cuadrática: las 4 funciones que explican el mundo real. Cada una con ejemplo cotidiano, gráfico interactivo y slider.',
  keywords: 'funciones matemáticas, lineal, exponencial, logarítmica, cuadrática, bachillerato, matemáticas visual, gráficos interactivos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Funciones que Gobiernan el Mundo',
    description: 'Las 4 funciones matemáticas que explican la realidad, con ejemplos cotidianos.',
    url: 'https://meskeia.com/visualizador-funciones-mundo/',
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
    title: 'Funciones que Gobiernan el Mundo',
    description: 'Lineal, exponencial, logarítmica y cuadrática con ejemplos reales.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Funciones Mundo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Funciones que Gobiernan el Mundo',
  description: 'Explicador visual de las 4 funciones matemáticas fundamentales: lineal (crecimiento salarial), exponencial (virus, interés compuesto), logarítmica (Richter, decibelios) y cuadrática (trayectorias). Gráficos interactivos con sliders.',
  url: 'https://meskeia.com/visualizador-funciones-mundo/',
  features: [
    '4 funciones con ejemplos del mundo real',
    'Gráficos Chart.js interactivos con sliders',
    'Comparativa visual de las 4 funciones superpuestas',
    'Explicación intuitiva sin fórmulas complejas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre una función lineal y una función exponencial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una función lineal (y = mx + b) crece a una tasa constante: por cada unidad que aumenta x, y sube siempre la misma cantidad. Una función exponencial (y = a·bˣ) crece a una tasa proporcional a su valor actual, lo que produce un crecimiento lento al principio y explosivo después. Por eso la propagación de un virus o el interés compuesto parecen insignificantes al inicio y se vuelven abrumadores más adelante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la escala Richter y los decibelios usan una función logarítmica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La percepción humana del sonido y la energía sísmica abarcan rangos de magnitud enormes (del orden de 10¹² o más). La función logarítmica comprime esos rangos en una escala manejable: cada aumento de 1 en la escala Richter equivale a 10 veces más amplitud y 31,6 veces más energía. Los decibelios funcionan igual: 0 dB es el umbral de audición y 120 dB (concierto de rock) implica una intensidad sonora un billón de veces mayor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué situaciones reales aparece la función cuadrática?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La función cuadrática (y = ax² + bx + c) describe cualquier fenómeno donde una magnitud depende del cuadrado de otra. Los ejemplos más comunes son: la trayectoria de un proyectil (bajo gravedad constante), la distancia de frenado de un vehículo (proporcional al cuadrado de la velocidad), el área de superficies rectangulares en función de uno de sus lados y la energía cinética de un objeto (E = ½mv²).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel de matemáticas es útil este visualizador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El visualizador está diseñado para estudiantes de bachillerato y educación secundaria que estudian álgebra y análisis matemático, aunque no requiere conocimientos previos de cálculo. Los gráficos interactivos permiten entender intuitivamente el comportamiento de cada función antes de abordar las fórmulas formales. También es útil para repaso rápido antes de exámenes de acceso a la universidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el crecimiento exponencial en la propagación de enfermedades infecciosas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En las etapas iniciales de una epidemia, sin inmunidad previa ni medidas de control, cada persona infectada contagia a un número constante de personas (el número básico de reproducción R₀). Si R₀ > 1, el número de infectados sigue una función exponencial: una persona contagia a 3, que contagian a 9, luego 27, 81, etc. Este crecimiento explica por qué una epidemia parece controlada en los primeros días y se desborda repentinamente si no se actúa a tiempo.',
      },
    },
  ],
};
