import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Curso de Pensamiento Sistémico - Entiende el Mundo como Sistemas Interconectados | meskeIA',
  description: 'Aprende a pensar en sistemas: redes, retroalimentación, emergencia, antifragilidad. Aplica el pensamiento sistémico a organizaciones, economía, tecnología y tu vida. Curso actualizado 2025 con casos reales.',
  keywords: 'pensamiento sistémico, teoría de sistemas, sistemas complejos, retroalimentación, emergencia, antifragilidad, redes, complejidad, Donella Meadows, Peter Senge, Nassim Taleb, toma de decisiones, liderazgo sistémico, curso sistemas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Curso de Pensamiento Sistémico - Entiende el Mundo como Sistemas',
    description: 'Aprende a ver el mundo como sistemas interconectados. Retroalimentación, emergencia, antifragilidad y aplicaciones prácticas.',
    url: 'https://meskeia.com/curso-pensamiento-sistemico/',
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
    title: 'Curso de Pensamiento Sistémico - meskeIA',
    description: 'Aprende a pensar en sistemas: el enfoque que necesitas para entender la complejidad del mundo moderno.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Curso Pensamiento Sistémico meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Curso de Pensamiento Sistémico - Entiende el Mundo como Sistemas Interconectados",
  description: "Aprende a pensar en sistemas: redes, retroalimentación, emergencia, antifragilidad. Aplica el pensamiento sistémico a organizaciones, economía, tecnología y tu vida. Curso actualizado 2025 con casos reales.",
  url: 'https://meskeia.com/curso-pensamiento-sistemico/',
  category: 'EducationalApplication',
  features: [
      "Curso completo en 4 módulos: fundamentos, conceptos clave, sistemas en acción y aplicación práctica",
      "Conceptos de Donella Meadows, Peter Senge y Nassim Taleb explicados en español",
      "Bucles de retroalimentación, emergencia, antifragilidad y puntos de apalancamiento",
      "Ejercicios de reflexión y casos reales en organizaciones, economía y tecnología",
      "Progreso guardado localmente entre sesiones sin registro ni instalación",
      "Gratuito y sin publicidad",
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el pensamiento sistémico y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El pensamiento sistémico es un enfoque para entender la realidad como conjuntos de elementos interconectados cuyas relaciones generan comportamientos que no se pueden deducir estudiando las partes por separado. Es importante porque muchos problemas complejos (organizacionales, sociales, medioambientales) tienen causas sistémicas que no se resuelven con soluciones lineales. Donella Meadows y Peter Senge lo popularizaron en gestión empresarial durante las décadas de 1980-90.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es un bucle de retroalimentación en un sistema?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un bucle de retroalimentación ocurre cuando el resultado de un proceso vuelve a influir en el propio proceso. Los bucles de refuerzo amplifican cambios (como el crecimiento exponencial o la espiral de deuda). Los bucles de equilibrio tienden a estabilizar el sistema hacia un objetivo. Comprender qué tipo de bucles dominan un sistema es clave para predecir su comportamiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un sistema complejo y uno complicado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un sistema complicado (como un avión) tiene muchas piezas pero su comportamiento es predecible si se conocen las partes. Un sistema complejo (como una economía o un ecosistema) tiene componentes que interactúan de forma no lineal y produce comportamientos emergentes imposibles de predecir solo desde las partes individuales. La distinción es clave para elegir el tipo de análisis adecuado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los puntos de apalancamiento en un sistema según Donella Meadows?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los puntos de apalancamiento son lugares del sistema donde un pequeño cambio produce un gran efecto. Meadows identificó una jerarquía de 12 puntos de apalancamiento, siendo los más poderosos cambiar los objetivos del sistema o sus paradigmas subyacentes, no los más obvios como los flujos o los parámetros numéricos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está pensado este curso de pensamiento sistémico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para directivos y líderes que toman decisiones en entornos complejos, analistas y consultores que modelan organizaciones o políticas, educadores que quieran enseñar a pensar en términos de causas y efectos interconectados, y cualquier persona interesada en entender por qué los sistemas (económicos, sociales, tecnológicos) se comportan de formas inesperadas.',
      },
    },
  ],
};
