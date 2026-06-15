import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructura del Átomo - Protones, Neutrones, Electrones | meskeIA',
  description: 'Explora el átomo de forma visual: modelo de Bohr, orbitales, isótopos e iones. Descubre que el átomo es 99,9999% vacío. Explicador interactivo con SVG animado.',
  keywords: 'átomo, protones, neutrones, electrones, modelo de Bohr, orbitales, isótopos, iones, estructura atómica, quarks, modelo estándar, configuración electrónica',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructura del Átomo - Protones, Neutrones, Electrones',
    description: 'Visualiza protones, neutrones y electrones. Modelo de Bohr vs orbitales. Isótopos, iones y la escala atómica.',
    url: 'https://meskeia.com/visualizador-estructura-atomo/',
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
    title: 'Estructura del Átomo - Explicador Visual Interactivo',
    description: 'El átomo es 99,9999% vacío. Explora sus partículas, modelos y escalas de forma visual.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Estructura Átomo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructura del Átomo - Protones, Neutrones, Electrones',
  description: 'Explicador visual interactivo sobre la estructura atómica: las 3 partículas subatómicas, modelo de Bohr vs orbitales cuánticos, isótopos e iones, y la asombrosa escala del vacío atómico.',
  url: 'https://meskeia.com/visualizador-estructura-atomo/',
  category: 'EducationalApplication',
  features: [
    'SVG animado del átomo con protones, neutrones y electrones para 5 elementos',
    'Comparación visual modelo de Bohr vs orbitales cuánticos (s, p, d)',
    'Explorador de isótopos e iones con ejemplos reales (C-14, deuterio, NaCl)',
    'Escala atómica: analogías visuales del vacío y línea temporal de descubrimientos',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿De qué está hecho un átomo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un átomo se compone de un núcleo central formado por protones (carga positiva) y neutrones (sin carga), rodeado por una nube de electrones (carga negativa). Los protones y neutrones están formados a su vez por quarks, las partículas elementales del modelo estándar. La masa del átomo se concentra casi por completo en el núcleo, que ocupa tan solo una fracción ínfima del volumen total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué se dice que el átomo es casi todo vacío?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el núcleo de un átomo de hidrógeno tuviera el tamaño de una canica (1 cm), el electrón orbitaría a unos 500 metros de distancia. Esto significa que más del 99,9999% del volumen atómico es espacio vacío. Toda la materia sólida que percibimos como compacta está formada por átomos con esta inmensa proporción de vacío.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el modelo de Bohr y el modelo de orbitales cuánticos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo de Bohr (1913) describe los electrones como partículas en órbitas circulares fijas alrededor del núcleo, útil para explicar el espectro del hidrógeno pero impreciso para átomos más complejos. El modelo cuántico moderno reemplaza las órbitas por orbitales: nubes de probabilidad (s, p, d, f) que indican dónde es más probable encontrar al electrón. Este último es el modelo aceptado actualmente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un isótopo y en qué se diferencia de un ion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los isótopos son átomos del mismo elemento (mismo número de protones) que difieren en el número de neutrones; por ejemplo, el carbono-12 y el carbono-14. Los iones son átomos que han ganado o perdido electrones, adquiriendo carga eléctrica; por ejemplo, el Na⁺ (sodio que perdió un electrón) o el Cl⁻ (cloro que ganó uno). Los isótopos cambian la masa; los iones cambian la carga.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se usa la estructura atómica en tecnología y medicina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La comprensión de la estructura atómica tiene aplicaciones directas: los semiconductores (chips, transistores) explotan los niveles energéticos de electrones; la resonancia magnética (RM) se basa en los espines nucleares de átomos de hidrógeno; la datación con C-14 usa isótopos radiactivos para determinar la edad de materiales orgánicos; y la radioterapia emplea núcleos inestables para destruir células tumorales.',
      },
    },
  ],
};
