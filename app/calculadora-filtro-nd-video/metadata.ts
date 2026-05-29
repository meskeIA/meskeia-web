import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Filtro ND para Vídeo - Regla de los 180° | meskeIA',
  description: 'Descubre qué filtro de densidad neutra necesitas para cumplir la regla de los 180° en vídeo. Introduce tu fps y velocidad de obturación actual y obtén el ND exacto.',
  keywords: 'filtro ND, densidad neutra, regla 180 grados, videografía, obturador vídeo, ND2 ND4 ND8 ND16 ND64 ND1000, motion blur natural',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Filtro ND para Vídeo | meskeIA',
    description: 'Encuentra el filtro ND necesario para cumplir la regla de los 180° en videografía. Tabla comparativa de ND2 a ND1000.',
    url: 'https://meskeia.com/calculadora-filtro-nd-video',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Filtro ND para Vídeo | meskeIA',
    description: 'Encuentra el filtro ND necesario para cumplir la regla de los 180° en videografía.',
  },
  other: {
    'application-name': 'Calculadora Filtro ND Vídeo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Filtro ND para Vídeo',
  description: 'Calculadora de filtro de densidad neutra para videografía. Introduce tu frame rate y velocidad de obturación actual para saber exactamente qué filtro ND necesitas para cumplir la regla de los 180°.',
  url: 'https://meskeia.com/calculadora-filtro-nd-video/',
  category: 'UtilityApplication',
  features: [
    'Cálculo exacto de paradas ND necesarias',
    'Tabla comparativa de opciones ND2 a ND1000',
    'Obturador resultante con cada filtro',
    'Filtro recomendado destacado automáticamente',
    'Basado en la regla de los 180° para motion blur natural',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Para qué sirve un filtro ND en vídeo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un filtro de densidad neutra (ND) reduce la cantidad de luz que entra al sensor sin alterar los colores. En videografía se usa para poder reducir la velocidad de obturación hasta el valor que dicta la regla de los 180° sin sobreexponer la imagen. Esto es especialmente necesario en exteriores con mucha luz, donde sin filtro se necesitaría un obturador tan rápido que produciría un efecto estroboscópico poco natural.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué filtro ND necesito para mi cámara?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Necesitas conocer tu frame rate y la velocidad de obturación que estás usando actualmente (o la que te obliga la exposición). La diferencia en "paradas" entre tu obturador actual y el obturador correcto según la regla de los 180° determina cuántas paradas de ND necesitas. Cada parada equivale a duplicar el número ND: 1 parada = ND2, 2 paradas = ND4, 3 paradas = ND8, etc.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre ND2, ND4, ND8 y ND64?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El número indica cuánta luz deja pasar el filtro. Un ND2 reduce la luz a la mitad (1 parada); un ND4 a un cuarto (2 paradas); un ND8 a un octavo (3 paradas); un ND64 a 1/64 (6 paradas). A mayor número ND, más luz bloquea y más puedes bajar la velocidad de obturación. Los filtros ND64 y ND1000 se usan en situaciones de luz muy intensa como playa o nieve en verano.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un filtro ND variable y cuándo conviene usarlo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un filtro ND variable combina dos polarizadores cruzados y permite ajustar la densidad girando el aro frontal, normalmente entre ND2 y ND400. Son convenientes cuando la luz cambia durante la grabación o cuando quieres un único filtro para distintas condiciones. Su desventaja frente a los filtros fijos es que pueden introducir una mancha en forma de X (efecto "X") si se usan cerca del límite máximo de densidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Afecta el filtro ND a la profundidad de campo o al color?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un filtro ND bien calibrado no altera el color ni la profundidad de campo; solo reduce la luminosidad de forma uniforme en todo el espectro visible. Sin embargo, algunos filtros ND económicos pueden introducir un ligero cast de color (tendencia a tonos cálidos o fríos). Para videografía profesional se recomiendan filtros de calidad óptica verificada, ya que cualquier cast de color afecta a la consistencia de la imagen entre tomas.',
      },
    },
  ],
};
