import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora Regla de los 180° para Vídeo | meskeIA',
  description:
    'Calcula la velocidad de obturación correcta para cualquier frame rate con la regla de los 180°. Motion blur natural y fluido en 24, 25, 30, 50, 60 fps y más.',
  keywords:
    'regla 180 grados video, velocidad obturación fps, motion blur natural, obturador cinematográfico, 24fps 25fps 30fps, filtro ND video',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Regla de los 180° para Vídeo',
    description:
      'Encuentra la velocidad de obturación exacta para cualquier frame rate. Motion blur natural garantizado.',
    url: 'https://meskeia.com/calculadora-regla-180-video/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora Regla de los 180° para Vídeo | meskeIA',
    description:
      'Velocidad de obturación correcta para cualquier frame rate. Motion blur cinematográfico garantizado.',
  },
  other: {
    'application-name': 'Calculadora Regla 180° Video meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora Regla de los 180° para Vídeo',
  description:
    'Calcula la velocidad de obturación correcta para cualquier frame rate aplicando la regla de los 180°. Tabla de referencia completa para 24, 25, 30, 48, 50, 60, 90, 120, 180 y 240 fps.',
  url: 'https://meskeia.com/calculadora-regla-180-video/',
  category: 'UtilityApplication',
  features: [
    'Regla de los 180° para cualquier frame rate',
    'Tabla completa de fps comunes y su obturador correcto',
    'Explicación del motion blur natural y por qué funciona',
    'Compatible con 24/25/30/50/60/120 fps y más',
    'Selector rápido de fps comunes y entrada manual',
    'Funciona 100% en el navegador, sin registro ni instalación',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la regla de los 180° en vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regla de los 180° establece que la velocidad de obturación debe ser aproximadamente el doble del frame rate (por ejemplo, 1/50 s para 25 fps). Seguirla produce un motion blur natural similar al que percibe el ojo humano, logrando un aspecto cinematográfico fluido. Si la velocidad es demasiado alta, el movimiento queda "congelado" y el vídeo se ve entrecortado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo calculo la velocidad de obturación correcta para mi frame rate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Multiplica tu frame rate por 2 para obtener el denominador de la fracción de segundo. Para 24 fps el obturador correcto es 1/48 s (en práctica 1/50 s); para 30 fps es 1/60 s; para 60 fps es 1/120 s. La calculadora hace este cálculo automáticamente para cualquier fps que introduzcas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué necesito un filtro ND para seguir la regla de los 180°?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al reducir la velocidad de obturación para cumplir la regla, entra más luz al sensor. En exteriores con buena iluminación esto provoca sobreexposición incluso con el diafragma cerrado al máximo. Los filtros de densidad neutra (ND) reducen la cantidad de luz sin afectar al color, permitiendo usar el obturador correcto en cualquier condición de luz.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se puede romper la regla de los 180° intencionalmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Un obturador más rápido (como 1/1000 s a 24 fps) crea el efecto de movimiento "stroboscópico" típico de las secuencias de acción de ciertos directores. Un obturador más lento aumenta el blur y puede crear un efecto onírico. La regla es una guía para conseguir movimiento natural, no una norma irrompible.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La regla de los 180° aplica igual a 4K, 1080p y otros formatos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, la regla depende exclusivamente del frame rate, no de la resolución. Grabes en 4K, 1080p o cualquier otra resolución, si lo haces a 25 fps la velocidad de obturación correcta es 1/50 s. La resolución afecta al detalle y al tamaño del archivo, pero no al motion blur.',
      },
    },
  ],
};
