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
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad, ideal para EBAU y Bachillerato',
  ],
  keywords: ['derivada', 'tangente', 'cálculo diferencial', 'EBAU', 'matemáticas', 'Bachillerato'],
});
