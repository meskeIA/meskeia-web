import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Agujeros Negros: Anatomía y Fenomenología Visual | meskeIA',
  description:
    'Explora la anatomía de los agujeros negros: singularidad, horizonte de sucesos, esfera de fotones, ergosfera, disco de acreción y jets. Calculadora de radio de Schwarzschild, espaguetización animada y radiación de Hawking.',
  keywords: [
    'agujero negro anatomía',
    'horizonte de sucesos',
    'radio de Schwarzschild',
    'singularidad gravitacional',
    'radiación de Hawking',
    'espaguetización agujero negro',
    'Sagitario A estrella',
    'M87 agujero negro fotografía',
    'disco de acreción',
    'agujeros negros supermasivos',
    'paradoja información Hawking',
    'esfera de fotones',
    'ergosfera Kerr',
  ],
  openGraph: {
    title: 'Agujeros Negros: Anatomía y Fenomenología Visual',
    description:
      'Visualizador interactivo de agujeros negros: anatomía SVG clicable, calculadora de Schwarzschild, animación de espaguetización y radiación de Hawking.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Agujeros Negros: Anatomía, Hawking y Espaguetización",
  description: "Explora la anatomía de los agujeros negros: singularidad, horizonte de sucesos, esfera de fotones, ergosfera, disco de acreción y jets. Calculadora de radio de Schwarzschild, espaguetización animada y",
  url: "https://meskeia.com/visualizador-agujeros-negros/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es un agujero negro y cómo se forma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un agujero negro es una región del espacio-tiempo donde la gravedad es tan intensa que nada, ni siquiera la luz, puede escapar una vez superado el horizonte de sucesos. Los agujeros negros estelares se forman cuando una estrella masiva (más de ~20 masas solares) agota su combustible nuclear y colapsa bajo su propio peso en una supernova. Los supermasivos, de millones a miles de millones de masas solares, se encuentran en los centros de casi todas las galaxias y su origen exacto sigue debatiéndose.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué ocurre si algo cae en un agujero negro?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un observador externo vería al objeto ralentizarse y congelarse justo en el horizonte de sucesos por efecto del corrimiento al rojo gravitacional, sin cruzarlo aparentemente nunca. El objeto que cae, sin embargo, cruzaría el horizonte sin notar nada especial en ese instante. A medida que se acerca a la singularidad, las fuerzas de marea se intensifican tanto que estiran y comprimen el objeto —fenómeno llamado espaguetización— hasta que la materia se desintegra.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la radiación de Hawking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La radiación de Hawking es un proceso cuántico predicho por Stephen Hawking en 1974 por el cual los agujeros negros emiten radiación térmica y pierden masa lentamente. Surge de la creación de pares partícula-antipartícula cerca del horizonte de sucesos: una cae al interior y la otra escapa. La temperatura de esta radiación es inversamente proporcional a la masa del agujero negro, por lo que los agujeros muy masivos emiten cantidades inapreciables, mientras los pequeños evaporarían rápidamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el radio de Schwarzschild?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El radio de Schwarzschild (Rₛ) es el tamaño del horizonte de sucesos de un agujero negro no rotante y se calcula con la fórmula Rₛ = 2GM/c², donde G es la constante gravitacional, M la masa y c la velocidad de la luz. Para el Sol equivaldría a comprimirlo en una esfera de unos 3 km de radio. Para la Tierra, el radio de Schwarzschild es solo ~9 mm.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se han fotografiado realmente agujeros negros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En 2019, el proyecto Event Horizon Telescope publicó la primera imagen de la sombra del agujero negro M87*, de 6.500 millones de masas solares, a 55 millones de años luz. En 2022, se obtuvo la imagen de Sagitario A*, el agujero negro supermasivo del centro de la Vía Láctea, de unos 4 millones de masas solares. Ambas imágenes muestran el anillo brillante formado por el gas del disco de acreción alrededor de la sombra central.',
      },
    },
  ],
};
