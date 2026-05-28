import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Nivel de Burbuja Digital + Inclinómetro - Mide ángulos con tu móvil | meskeIA',
  description: 'Nivel de burbuja digital gratuito con inclinómetro. Mide inclinaciones y ángulos con el sensor de tu móvil. Ideal para bricolaje, colgar cuadros y medir pendientes.',
  keywords: 'nivel burbuja, inclinómetro, nivel digital, medir ángulos, nivel construcción, spirit level, clinómetro, pendiente, bricolaje',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Nivel de Burbuja Digital + Inclinómetro - meskeIA',
    description: 'Mide inclinaciones y ángulos con el sensor de tu móvil. Herramienta gratuita para bricolaje.',
    url: 'https://meskeia.com/nivel-burbuja/',
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
    title: 'Nivel de Burbuja Digital - meskeIA',
    description: 'Nivel digital con inclinómetro. Gratis y sin instalación.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Nivel de Burbuja Digital",
  description: "Nivel de burbuja digital gratuito con inclinómetro. Mide inclinaciones y ángulos con el sensor de tu móvil. Ideal para bricolaje, colgar cuadros y medir pendientes.",
  url: "https://meskeia.com/nivel-burbuja/",
  category: 'UtilityApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funciona un nivel de burbuja digital en el móvil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El nivel digital usa el acelerómetro integrado en el smartphone para detectar la inclinación del dispositivo respecto a la horizontal. La aplicación lee los valores del sensor en tiempo real y los convierte en grados de ángulo y en la posición visual de la burbuja. No requiere calibración previa en la mayoría de teléfonos modernos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué se usa un inclinómetro o nivel digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El inclinómetro digital es útil para colgar cuadros, estanterías y espejos con precisión, nivelar muebles, comprobar la pendiente de suelos o rampas, ajustar paneles solares y realizar trabajos de construcción o bricolaje. Sustituye al nivel de burbuja físico con la ventaja de mostrar el ángulo exacto en grados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué precisión tiene un nivel digital en comparación con uno tradicional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los acelerómetros de smartphones de gama media ofrecen una precisión de ±0,5° a ±1°, similar a un nivel de burbuja de carpintería estándar. Los niveles de precisión profesional llegan a ±0,1°, pero para tareas domésticas la precisión del teléfono es completamente suficiente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito instalar alguna aplicación para usar el nivel de burbuja digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, esta herramienta funciona directamente desde el navegador del móvil sin necesidad de descargar ni instalar nada. Solo debes acceder a la página y conceder permiso al navegador para leer el sensor de movimiento cuando se solicite.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos grados equivalen a una superficie perfectamente horizontal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una superficie perfectamente horizontal mide 0° de inclinación. Una pendiente del 1% equivale aproximadamente a 0,57°. En construcción, una pendiente de desagüe recomendada está entre 1% y 2% (0,57° a 1,15°), y una rampa accesible no debe superar el 8% (unos 4,6°).',
      },
    },
  ],
};
