import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Depredador-Presa - Modelo Lotka-Volterra | meskeIA',
  description: 'Simula la dinámica de poblaciones depredador-presa con el modelo Lotka-Volterra. Observa ciclos, extinciones y equilibrios. Biología y ecología matemática Universidad.',
  keywords: 'Lotka-Volterra, depredador presa, dinámica poblaciones, ecología matemática, ecosistema simulador, biología Universidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-lotka-volterra/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Depredador-Presa | meskeIA',
    description: 'Modelo Lotka-Volterra interactivo: oscilaciones, extinciones y equilibrios de ecosistemas',
    url: 'https://meskeia.com/simulador-lotka-volterra/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Depredador-Presa | meskeIA',
    description: 'Aprende ecología matemática con simulaciones interactivas',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Depredador-Presa Lotka-Volterra',
  description: 'Simulador interactivo del modelo Lotka-Volterra para dinámica de poblaciones. Ajusta parámetros (tasa reproducción presa, depredación, conversión, mortalidad) y observa oscilaciones, extinciones y equilibrios.',
  url: 'https://meskeia.com/simulador-lotka-volterra/',
  category: 'EducationalApplication',
  features: [
    'Ecuaciones diferenciales Lotka-Volterra interactivas',
    'Modo clásico vs modo con capacidad de carga (logística)',
    'Gráfico temporal x(t), y(t) y diagrama de fases',
    '4 presets: linces y liebres, sobrepesca, equilibrio, caos',
    'Detección automática de picos, colapsos y extinciones',
    'En español',
  ],
  keywords: ['Lotka-Volterra', 'ecología', 'dinámica poblaciones', 'biología'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el modelo Lotka-Volterra?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo Lotka-Volterra es un sistema de dos ecuaciones diferenciales ordinarias que describe la dinámica de una población de presas y una de depredadores. Fue propuesto de forma independiente por Alfred Lotka (1925) y Vito Volterra (1926). Predice oscilaciones cíclicas donde el aumento de presas favorece a los depredadores, cuya proliferación reduce las presas y provoca a su vez el descenso de los propios depredadores.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué las poblaciones de depredadores y presas oscilan en ciclos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las oscilaciones son consecuencia del retardo entre el crecimiento de las presas y la respuesta de los depredadores. Cuando hay muchas presas, los depredadores se reproducen más; el exceso de depredadores reduce las presas; al escasear el alimento, los depredadores disminuyen; y con menos depredadores, las presas se recuperan. El ciclo se repite indefinidamente en el modelo clásico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa el diagrama de fases en ecología de poblaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El diagrama de fases (o retrato de fase) muestra la trayectoria del sistema en el plano (presas, depredadores) en lugar de en el tiempo. En el modelo Lotka-Volterra clásico, las trayectorias son curvas cerradas alrededor de un punto de equilibrio, lo que visualiza claramente el carácter cíclico de la interacción. Permite identificar si el sistema converge, oscila o diverge hacia la extinción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si la tasa de caza supera la tasa de reproducción de las presas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si la depredación es demasiado intensa respecto a la reproducción de las presas, la población de presas colapsa hacia cero. Al desaparecer las presas, los depredadores también se extinguen por falta de alimento. Este escenario se puede explorar en el simulador aumentando el parámetro de depredación o reduciendo la tasa de crecimiento de la presa hasta cruzar el umbral de extinción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia el modelo Lotka-Volterra clásico del modelo con capacidad de carga?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo clásico asume que las presas crecen de forma ilimitada en ausencia de depredadores (crecimiento exponencial). El modelo con capacidad de carga (variante logística) limita ese crecimiento al tamaño máximo que puede sostener el ecosistema. Con la capacidad de carga, las oscilaciones tienden a amortiguarse y el sistema converge a un equilibrio estable, un comportamiento más realista para ecosistemas reales.',
      },
    },
  ],
};
