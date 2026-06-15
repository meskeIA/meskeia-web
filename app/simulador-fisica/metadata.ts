import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Simulador de Física - Caída Libre, Péndulo, Ondas, Proyectiles | meskeIA',
  description: 'Simulador interactivo de física con animaciones en tiempo real. Experimenta con caída libre, péndulo simple, tiro parabólico, ondas y movimiento armónico simple.',
  keywords: 'simulador física, caída libre, péndulo, ondas, tiro parabólico, MAS, movimiento armónico simple, física interactiva, animación física, simulación online',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Física Interactivo - meskeIA',
    description: 'Experimenta con física en tiempo real: caída libre, péndulos, ondas y proyectiles con animaciones visuales.',
    url: 'https://meskeia.com/simulador-fisica/',
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
    title: 'Simulador de Física Interactivo',
    description: 'Animaciones de física en tiempo real: caída libre, péndulos, ondas y más.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Simulador de Física meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Simulador de Física - Caída Libre, Péndulo, Ondas, Proyectiles",
  description: "Simulador interactivo de física con animaciones en tiempo real. Experimenta con caída libre, péndulo simple, tiro parabólico, ondas y movimiento armónico simple.",
  url: 'https://meskeia.com/simulador-fisica/',
  category: 'EducationalApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué fenómenos físicos puedo simular con esta herramienta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador incluye cinco experimentos interactivos: caída libre, péndulo simple, tiro parabólico, ondas mecánicas y movimiento armónico simple (MAS). Cada simulación muestra la animación en tiempo real y calcula los valores numéricos correspondientes. Puedes modificar los parámetros como masa, longitud, velocidad inicial o amplitud para observar cómo cambia el comportamiento del sistema.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la simulación de caída libre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La caída libre aplica la ecuación y = ½·g·t², donde g = 9,81 m/s². El simulador anima el objeto cayendo y muestra en tiempo real la altura, la velocidad instantánea y el tiempo transcurrido. Puedes ajustar la altura inicial y observar cómo varía la velocidad al impactar con el suelo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo es adecuado este simulador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está orientado a estudiantes de secundaria y bachillerato que estudian física por primera vez, así como a universitarios de ingeniería o ciencias que quieren reforzar conceptos básicos. Los fenómenos cubiertos corresponden al currículo habitual de Física de 4.º de ESO y 1.º de Bachillerato. También es útil como recurso de repaso para preparar exámenes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre este simulador y un laboratorio virtual completo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Este simulador se centra en visualizar las ecuaciones clásicas de mecánica y ondas con animaciones claras, sin requerir instalación ni registro. Un laboratorio virtual completo como PhET (Universidad de Colorado) ofrece mayor variedad de experimentos y opciones de medición avanzadas, pero es más complejo de usar. Este recurso está pensado para entender la intuición detrás de los conceptos, no para investigación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el movimiento armónico simple y cómo se representa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El movimiento armónico simple (MAS) describe cualquier oscilación periódica donde la fuerza restauradora es proporcional al desplazamiento, como un muelle o un péndulo de pequeña amplitud. Se representa mediante la ecuación x(t) = A·cos(ωt + φ), donde A es la amplitud, ω la frecuencia angular y φ la fase inicial. El simulador muestra la posición del objeto oscilando junto con su gráfica de desplazamiento en función del tiempo.',
      },
    },
  ],
};
