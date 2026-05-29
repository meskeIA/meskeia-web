import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Calculadora de Profundidad de Campo (DoF) | meskeIA',
  description: 'Calcula la profundidad de campo, distancia hiperfocal y zona de nitidez de tu fotografía. Introduce focal, apertura, distancia y sensor (FF, APS-C, M4/3). Visualización en regla.',
  keywords: 'calculadora profundidad de campo, DoF photography, distancia hiperfocal, círculo de confusión, zona de nitidez fotografía, focal apertura distancia sensor, full frame APS-C Micro 4/3, fórmula hiperfocal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Profundidad de Campo',
    description: 'Calcula DoF e hiperfocal con visualización en regla. Compatible con FF, APS-C y Micro 4/3.',
    url: 'https://meskeia.com/calculadora-profundidad-campo/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Profundidad de Campo',
    description: 'DoF, hiperfocal y zona de nitidez en una sola herramienta.',
  },
  other: {
    'application-name': 'Calculadora de Profundidad de Campo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de Profundidad de Campo (DoF)',
  description: 'Herramienta para calcular la profundidad de campo, distancia hiperfocal, distancia cercana y lejana de nitidez aceptable a partir de la focal, apertura, distancia al sujeto y tamaño del sensor (Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3). Incluye visualización en regla y 5 presets típicos.',
  url: 'https://meskeia.com/calculadora-profundidad-campo/',
  category: 'EducationalApplication',
  features: [
    'Cálculo de DoF, hiperfocal, Dn (cercana) y Df (lejana) en metros',
    '4 tamaños de sensor: Full Frame, APS-C ×1,5, APS-C ×1,6, Micro 4/3',
    'Aperturas estándar de f/1,4 a f/22 con botones rápidos',
    'Visualización en regla SVG con escala logarítmica y zona de nitidez',
    '5 presets típicos: retrato bokeh, paisaje todo nítido, macro, hiperfocal, astrofoto',
    'Guía educativa completa con círculo de confusión y consejos prácticos',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la profundidad de campo en fotografía?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La profundidad de campo (DoF, Depth of Field) es la distancia entre el punto más cercano y el más lejano que aparecen nítidos en una fotografía. Una profundidad de campo reducida (bokeh pronunciado) deja solo el sujeto enfocado y desenfoca el fondo; una profundidad de campo amplia mantiene nítida toda la escena de cerca a lejos. Depende principalmente de tres variables: la apertura del diafragma, la distancia focal del objetivo y la distancia al sujeto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo consigo más desenfoque de fondo (bokeh) en mis fotos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para maximizar el bokeh hay que combinar tres factores: abrir al máximo el diafragma (f/1,4, f/1,8 o f/2,8), usar una focal larga (85 mm, 100 mm o más), y acercarse al sujeto tanto como permita el objetivo. Además, cuanto más lejos esté el fondo del sujeto, más desenfocado aparecerá. Los sensores más grandes (Full Frame) también producen más bokeh que los APS-C o Micro 4/3 con la misma apertura y focal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la distancia hiperfocal y cómo se usa en paisaje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La distancia hiperfocal es la distancia mínima de enfoque a la que todo desde la mitad de esa distancia hasta el infinito aparece nítido. Al enfocar exactamente en la hiperfocal se maximiza la profundidad de campo para una focal y apertura dadas. En fotografía de paisaje es la técnica estándar: por ejemplo, con un 24 mm a f/8 en Full Frame, la hiperfocal ronda los 3,5 m, lo que significa que todo desde 1,75 m hasta el infinito saldrá nítido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el tamaño del sensor afecta a la profundidad de campo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El tamaño del sensor cambia el círculo de confusión máximo aceptable para considerar un punto como "nítido". Un sensor más grande (Full Frame) tiene un círculo de confusión mayor en valor absoluto, por lo que a igual focal y apertura produce menor profundidad de campo que un APS-C o Micro 4/3. En la práctica, para obtener el mismo encuadre en APS-C hay que cerrar más el diafragma o alejarse más del sujeto para conseguir el mismo nivel de desenfoque.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre f/1,8 y f/8 en términos de nitidez?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A f/1,8 la apertura del diafragma es muy grande, entra más luz pero la profundidad de campo es muy reducida: solo un plano estrecho queda nítido y el resto se desenfoca. A f/8 la apertura es más pequeña, la zona nítida se amplía considerablemente y es más fácil tener todo en foco. Para retratos artísticos se prefiere f/1,4-f/2,8; para paisaje y arquitectura, f/8-f/11 suele ser la apertura de mayor resolución y mayor zona nítida.',
      },
    },
  ],
};
