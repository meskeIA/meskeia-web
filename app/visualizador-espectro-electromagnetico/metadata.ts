import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Espectro Electromagnético - De Radio a Rayos Gamma | meskeIA',
  description: 'Explora el espectro electromagnético completo: radio, microondas, infrarrojo, luz visible, ultravioleta, rayos X y gamma. Descubre que tu móvil, un horno y una radiografía usan el mismo fenómeno.',
  keywords: 'espectro electromagnético, ondas electromagnéticas, luz visible, radio, microondas, infrarrojo, ultravioleta, rayos X, gamma, frecuencia, longitud de onda, radiación',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Espectro Electromagnético - De Radio a Rayos Gamma',
    description: 'Explora las 7 bandas del espectro EM: radio, microondas, infrarrojo, visible, UV, rayos X y gamma. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-espectro-electromagnetico/',
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
    title: 'Espectro Electromagnético - Explicador Visual Interactivo',
    description: 'Radio, microondas, infrarrojo, visible, UV, rayos X y gamma: el mismo fenómeno a distinta frecuencia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Espectro Electromagnético meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Espectro Electromagnético - De Radio a Rayos Gamma',
  description: 'Explicador visual interactivo del espectro electromagnético: barra logarítmica con las 7 bandas, detalle de cada tipo de radiación con aplicaciones reales, escala de energía y peligro, y curiosidades históricas desde Maxwell hasta el fondo cósmico de microondas.',
  url: 'https://meskeia.com/visualizador-espectro-electromagnetico/',
  category: 'EducationalApplication',
  features: [
    'Barra logarítmica del espectro EM completo con 7 bandas clickables',
    'Detalle de cada banda: radio, microondas, infrarrojo, visible, UV, rayos X, gamma',
    'Escala de energía y peligro: radiación ionizante vs no ionizante',
    'Relación c = λ × f y E = h × f explicada visualmente',
    'Curiosidades: Maxwell, Hertz, fondo cósmico de microondas',
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
      name: '¿Qué es el espectro electromagnético?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El espectro electromagnético es el conjunto de todas las ondas electromagnéticas ordenadas por frecuencia y longitud de onda. Abarca desde las ondas de radio (frecuencias de kilohercios) hasta los rayos gamma (frecuencias de exahercios), incluyendo la luz visible, los rayos X y los microondas. Todas comparten la misma naturaleza física pero difieren en energía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre radiación ionizante y no ionizante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La radiación ionizante (rayos gamma, rayos X y UV de onda corta) tiene suficiente energía para arrancar electrones de los átomos, lo que puede dañar el ADN y los tejidos. La radiación no ionizante (infrarrojo, luz visible, microondas, radio) carece de esa energía y en condiciones normales no provoca ese daño molecular. El límite se sitúa aproximadamente en los 10 eV de energía fotónica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se relacionan la frecuencia, la longitud de onda y la velocidad de la luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La relación es c = λ × f, donde c es la velocidad de la luz (≈ 3 × 10⁸ m/s), λ es la longitud de onda y f es la frecuencia. Esto significa que frecuencia y longitud de onda son inversamente proporcionales: a mayor frecuencia, menor longitud de onda, y mayor energía del fotón (E = h × f, donde h es la constante de Planck).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirven los distintos tipos de ondas electromagnéticas en la vida cotidiana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada banda tiene aplicaciones concretas: las ondas de radio se usan en comunicaciones y GPS; los microondas en hornos y wifi; el infrarrojo en mandos a distancia y termografía; la luz visible en iluminación y fotografía; el UV en esterilización; los rayos X en diagnóstico médico; y los rayos gamma en radioterapia oncológica y esterilización industrial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el fondo cósmico de microondas y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El fondo cósmico de microondas (CMB) es la radiación electromagnética residual del Big Bang, emitida unos 380.000 años después del origen del universo cuando los fotones pudieron viajar libremente. Su temperatura actual es de aproximadamente 2,7 K. Es la evidencia observacional más directa del modelo cosmológico estándar y fue descubierto accidentalmente por Penzias y Wilson en 1965.',
      },
    },
  ],
};
