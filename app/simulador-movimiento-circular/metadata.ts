import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Movimiento Circular - MCU y MCNU | meskeIA',
  description: 'Simula el movimiento circular uniforme (MCU) y no uniforme (MCNU). Visualiza velocidad tangencial, aceleración centrípeta y fuerza centrípeta en tiempo real. Física para Bachillerato y EBAU (España) y para preparatoria, secundaria y educación media (Latinoamérica).',
  keywords: 'movimiento circular, MCU, MCNU, velocidad angular, aceleración centrípeta, período, frecuencia, fuerza centrípeta, EBAU, Bachillerato, preparatoria, secundaria, educación media, física',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-movimiento-circular/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador de Movimiento Circular | meskeIA',
    description: 'Animación interactiva de MCU y MCNU con vectores de velocidad y aceleración centrípeta',
    url: 'https://meskeia.com/simulador-movimiento-circular/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Movimiento Circular | meskeIA',
    description: 'Aprende MCU y MCNU con animaciones interactivas y cálculo de magnitudes físicas',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Movimiento Circular (MCU y MCNU)',
  description: 'Simulador interactivo de movimiento circular uniforme y no uniforme. Ajusta radio, velocidad angular y masa, observa los vectores de velocidad tangencial y aceleración centrípeta, y obtén período, frecuencia y fuerza centrípeta en tiempo real.',
  url: 'https://meskeia.com/simulador-movimiento-circular/',
  category: 'EducationalApplication',
  features: [
    'Animación 2D del movimiento circular en tiempo real',
    'Modo MCU (uniforme) y MCNU (con aceleración angular)',
    'Vector velocidad tangencial y vector aceleración centrípeta visibles',
    'Cálculo de v, a_c, F_c, T y frecuencia en tiempo real',
    'Soporte dark mode completo',
    'Escala Retina/HiDPI para pantallas de alta resolución',
    'En español',
  ],
  keywords: ['movimiento circular', 'MCU', 'MCNU', 'aceleración centrípeta', 'física bachillerato', 'física preparatoria', 'física secundaria'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el movimiento circular uniforme (MCU) y el no uniforme (MCNU)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el MCU la velocidad angular es constante y solo existe aceleración centrípeta (dirigida al centro). En el MCNU la velocidad angular varía con el tiempo, por lo que aparece además una aceleración tangencial que puede acelerar o frenar el giro. La aceleración total es la suma vectorial de ambas componentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la aceleración centrípeta en el movimiento circular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La aceleración centrípeta se calcula como a_c = ω² · r, donde ω es la velocidad angular en rad/s y r es el radio de la trayectoria en metros. Equivalentemente, a_c = v²/r usando la velocidad tangencial v. Su dirección siempre apunta hacia el centro de la circunferencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un simulador de movimiento circular en Bachillerato, preparatoria o secundaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Permite visualizar en tiempo real los vectores de velocidad tangencial y aceleración centrípeta, lo que resulta difícil de intuir solo con fórmulas. El simulador ayuda a entender por qué la velocidad es perpendicular al radio y cómo cambian período y frecuencia al variar la velocidad angular, conceptos habituales en selectividad (EBAU/EVAU) en España y en los exámenes de admisión universitaria de preparatoria, secundaria y educación media en Latinoamérica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el período y la frecuencia en el movimiento circular uniforme?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El período T es el tiempo que tarda la partícula en completar una vuelta completa, medido en segundos. La frecuencia f = 1/T indica cuántas vueltas completas se realizan por segundo (Hz). La relación con la velocidad angular es ω = 2π/T = 2πf.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se necesita una fuerza centrípeta para mantener el movimiento circular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según la segunda ley de Newton, toda aceleración requiere una fuerza neta en su dirección. Como la aceleración centrípeta apunta siempre hacia el centro, debe existir una fuerza F_c = m · a_c = m · ω² · r que provoque ese cambio continuo de dirección. Esta fuerza puede ser la tensión de una cuerda, la gravedad, la fricción u otras según el sistema.',
      },
    },
  ],
};
