import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Funciones de Easing - Curvas de Animación | meskeIA',
  description:
    'Visualiza y compara las funciones de easing (interpolación aplicada a la animación): linear, ease in, ease out, ease in out, back, elastic y bounce. Gráfica de cada curva en el cuadrado unidad y una demo animada con duración ajustable. Para programación de videojuegos, animación de UI y motion graphics.',
  keywords:
    'funciones de easing, interpolación, lerp, ease in out, ease in, ease out, animación, curvas de animación, easing, videojuegos, motion, motion graphics, cubic-bezier, back, elastic, bounce, Robert Penner',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/visualizador-funciones-easing/',
  },
  openGraph: {
    type: 'website',
    title: 'Visualizador de Funciones de Easing - Curvas de Animación | meskeIA',
    description:
      'Compara las curvas de easing (linear, ease in/out, back, elastic, bounce) con su gráfica y una demo animada. Para animación de UI, videojuegos y motion graphics.',
    url: 'https://meskeia.com/visualizador-funciones-easing/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/stemum/og-image.png', width: 1200, height: 630, alt: 'Stemum — el portal de ciencia interactiva de meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visualizador de Funciones de Easing | meskeIA',
    description: 'Curvas de animación (easing) con gráfica y demo animada: ease in/out, back, elastic, bounce',
    images: ['https://meskeia.com/stemum/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Funciones de Easing (Curvas de Animación)',
  description:
    'Herramienta interactiva para visualizar y comparar funciones de easing —la interpolación que da naturalidad a las animaciones—. Incluye 17 funciones puras estilo Robert Penner (linear, quad, cubic, sine, expo, back, elastic, bounce), la gráfica de cada curva en el cuadrado unidad y una demo animada con duración ajustable que mueve una caja sincronizada con un marcador sobre la curva. Pensada para programación de videojuegos, animación de interfaces y motion graphics.',
  url: 'https://meskeia.com/visualizador-funciones-easing/',
  category: 'EducationalApplication',
  features: [
    '17 funciones de easing puras (sin librerías)',
    'Familias quad, cubic, sine, expo, back, elastic y bounce',
    'Gráfica de la curva en el cuadrado unidad con la diagonal linear de referencia',
    'Demo animada con caja que se desplaza usando la easing elegida',
    'Marcador sincronizado recorriendo la curva',
    'Slider de duración en milisegundos',
    'Valor de t y resultado en vivo',
    'Reproducir, pausar y reiniciar con respeto a prefers-reduced-motion',
  ],
  keywords: ['funciones de easing', 'interpolación', 'ease in out', 'animación', 'curvas de animación'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una función de easing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una función de easing transforma el progreso lineal de una animación (un valor t que va de 0 a 1 con el tiempo) en otro valor que cambia de ritmo: empieza lento, acelera, frena al final o incluso se pasa de largo y vuelve. Sirve para que un movimiento parezca natural en lugar de mecánico. La aplicas interpolando: valor = inicio + (fin − inicio) × easing(t). Funciones como easeInQuad, easeOutCubic o easeOutBounce son las más habituales en interfaces, videojuegos y motion graphics.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre ease in, ease out y ease in out?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ease in arranca despacio y acelera al final: útil para elementos que salen de la pantalla. Ease out empieza rápido y frena suavemente al llegar: es el más usado para elementos que aparecen o se detienen en su sitio, porque imita cómo se frena algo real. Ease in out combina ambos: arranque suave, parte central rápida y frenado al final, ideal para transiciones largas entre dos estados. En este visualizador puedes alternar entre las tres variantes de cada familia y ver la curva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué relación tienen las funciones de easing con las curvas de Bézier?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En CSS y en muchos motores el easing se define con una curva de Bézier cúbica mediante cubic-bezier(x1, y1, x2, y2), donde los ejes son tiempo (horizontal) y progreso (vertical). Las funciones clásicas de Robert Penner (quad, cubic, sine…) son fórmulas matemáticas equivalentes a esas curvas. La ventaja de la Bézier es que puedes arrastrar dos manejadores para diseñar tu propia curva; la ventaja de las funciones es que son exactas y fáciles de portar a cualquier lenguaje.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué algunas curvas de easing se salen del rango 0 a 1?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las familias back y elastic devuelven a propósito valores por debajo de 0 o por encima de 1 en parte del recorrido. Eso produce el efecto de anticipación (la caja retrocede un poco antes de avanzar) o de rebote/overshoot (se pasa del destino y vuelve), que da sensación de vida o "juice". Bounce, en cambio, simula varios botes pero se mantiene dentro de 0 a 1. Por eso no debes usar back o elastic sobre propiedades que no admiten salirse de su rango, como una opacidad o un tamaño que no puede ser negativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo elijo la función de easing adecuada para una animación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como regla general: ease out para que algo aparezca o se detenga (lo más común en interfaces), ease in para que algo desaparezca, y ease in out para mover algo de un punto a otro. Reserva back y elastic para acentos puntuales (un botón que confirma, un icono que aparece) porque cansan si se abusa, y bounce para efectos lúdicos. Cuanto más larga la animación, más conviene una curva suave; para microinteracciones de 150-300 ms casi cualquier ease out funciona bien.',
      },
    },
  ],
};
