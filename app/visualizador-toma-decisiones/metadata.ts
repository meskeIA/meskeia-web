import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toma de Decisiones: Sistemas 1 y 2 | meskeIA',
  description: 'Cómo decide realmente el cerebro humano: Sistemas 1 y 2 de Kahneman, fatiga decisional, heurísticos, arquitectura de elección y nudges. Por qué tomamos peores decisiones al final del día y cómo diseñar el entorno para decidir mejor.',
  keywords: ['sistemas 1 2 Kahneman', 'fatiga decisional', 'heurísticos cognitivos', 'arquitectura de elección nudge', 'cómo decidir mejor', 'pensamiento rápido lento', 'sesgos toma de decisiones', 'nudge Thaler Sunstein'],
  openGraph: {
    title: 'Toma de Decisiones: Sistemas 1 y 2 | meskeIA',
    description: 'Por qué tomamos peores decisiones al final del día — y cómo diseñar el entorno para evitarlo.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Toma de Decisiones: Sistemas 1 y 2',
  description: 'Visualizador interactivo del proceso de toma de decisiones humano: fatiga decisional, heurísticos cognitivos, arquitectura de elección y nudges.',
  url: 'https://meskeia.com/visualizador-toma-decisiones/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los Sistemas 1 y 2 de Kahneman?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Sistema 1 es el pensamiento rápido, automático e intuitivo que opera sin esfuerzo consciente, mientras que el Sistema 2 es el pensamiento lento, deliberado y analítico. Daniel Kahneman describió esta dualidad en su libro "Pensar rápido, pensar despacio" para explicar por qué cometemos errores predecibles al decidir. La mayor parte de nuestras decisiones cotidianas las toma el Sistema 1 sin que lo advirtamos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la fatiga decisional y cómo afecta a nuestras elecciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fatiga decisional es el deterioro progresivo de la calidad de las decisiones tras tomar muchas a lo largo del día. Estudios con jueces de libertad condicional mostraron que concedían menos beneficios a medida que avanzaba la jornada. Para reducirla, se recomienda tomar las decisiones más importantes por la mañana, reducir el número de elecciones triviales y crear rutinas automáticas para decisiones repetitivas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un heurístico cognitivo y cuándo se convierte en sesgo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un heurístico es un atajo mental que el cerebro usa para decidir rápido con información incompleta. Son útiles en la mayoría de situaciones cotidianas, pero se convierten en sesgo cuando se aplican fuera del contexto adecuado y producen errores sistemáticos. Ejemplos comunes son la heurística de disponibilidad (sobrestimar la frecuencia de eventos recordados fácilmente) o la heurística de anclaje (influencia excesiva del primer número visto).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la arquitectura de elección y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La arquitectura de elección es el diseño deliberado del entorno en que se toman decisiones para facilitar las opciones más beneficiosas sin eliminar la libertad de elegir. Este concepto, popularizado por Thaler y Sunstein con el término nudge (empujón), se aplica en políticas públicas, diseño de aplicaciones y entornos corporativos. Un ejemplo clásico es colocar la fruta saludable al inicio de una cafetería para que sea lo primero que se elige.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo entrenar mi cerebro para tomar mejores decisiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Tomar mejores decisiones implica reducir la carga del Sistema 2 automatizando lo rutinario, identificar en qué situaciones los heurísticos personales fallan con más frecuencia, dormir bien antes de decisiones importantes y crear listas de verificación para contextos de alta presión. También ayuda aplicar la técnica del premortem: imaginar que la decisión ya salió mal y razonar hacia atrás para detectar riesgos antes de actuar.',
      },
    },
  ],
};
