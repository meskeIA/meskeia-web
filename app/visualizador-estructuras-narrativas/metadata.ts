import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata = {
  title: 'Visualizador de Estructuras Narrativas — 6 modelos para tu historia | meskeIA',
  description: 'Explora 6 estructuras narrativas: Pirámide de Freytag, 3 Actos, Viaje del Héroe, Kishōtenketsu, Save the Cat y 5 Actos. Diagramas de tensión, etapas detalladas y ejemplos literarios.',
  keywords: ['estructura narrativa', 'pirámide de freytag', 'tres actos', 'viaje del héroe', 'kishotenketsu', 'save the cat', 'arco narrativo', 'escritura creativa', 'modelo narrativo', 'monomito campbell'],
  openGraph: {
    title: 'Visualizador de Estructuras Narrativas | meskeIA',
    description: '6 modelos estructurales con diagramas de tensión y ejemplos: Freytag, 3 Actos, Héroe, Kishōtenketsu, Save the Cat, 5 Actos.',
    url: 'https://meskeia.com/visualizador-estructuras-narrativas/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador de Estructuras Narrativas — 6 modelos para tu historia',
  description: 'Explora y compara 6 modelos de estructura narrativa con diagramas visuales de tensión, etapas detalladas y análisis de obras literarias y cinematográficas.',
  url: 'https://meskeia.com/visualizador-estructuras-narrativas/',
  category: 'EducationalApplication',
  features: [
    'Pirámide de Freytag con 5 etapas y diagrama de tensión',
    'Estructura en 3 Actos con puntos de giro y beats clave',
    'Viaje del Héroe (Campbell) con 10 etapas del monomito',
    'Kishōtenketsu: estructura asiática de 4 partes sin conflicto central',
    'Save the Cat: 11 beats del sistema de Blake Snyder',
    'Estructura en 5 Actos del drama clásico shakespeariano',
    'Diagrama visual del arco de tensión para cada modelo',
    'Ejemplos de obras literarias y cinematográficas en cada estructura',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es una estructura narrativa y para qué sirve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una estructura narrativa es el esqueleto que organiza los eventos de una historia en el tiempo: determina cuándo se introduce el conflicto, cómo crece la tensión y en qué momento se resuelve. Usarla conscientemente ayuda a escritores y guionistas a mantener el ritmo, dosificar la información y generar el impacto emocional deseado en el lector o espectador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre la Pirámide de Freytag y la Estructura en 3 Actos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Pirámide de Freytag, formulada en el siglo XIX para el drama clásico, divide la historia en 5 etapas simétricas con el clímax en el centro geométrico. La Estructura en 3 Actos, popularizada en el cine de Hollywood, concentra el peso en el segundo acto (50% de la obra) y coloca los puntos de giro al 25% y al 75% de la duración total. Freytag es más adecuada para teatro y novela literaria; los 3 Actos dominan el guion cinematográfico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Kishōtenketsu y en qué se diferencia de las estructuras occidentales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Kishōtenketsu es una estructura narrativa de origen japonés y chino que consta de cuatro partes: introducción (ki), desarrollo (shō), giro sorpresivo (ten) y reconciliación (ketsu). Su rasgo distintivo es que no requiere conflicto central: la historia avanza mediante la yuxtaposición de ideas y el giro inesperado en la tercera parte, sin antagonista ni enfrentamiento explícito. Es frecuente en manga, cine de Miyazaki y literatura asiática contemporánea.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el Viaje del Héroe de Joseph Campbell?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El Viaje del Héroe (o monomito) es un patrón narrativo identificado por el mitólogo Joseph Campbell en 1949 que describe la travesía universal del protagonista: parte de su mundo ordinario, recibe una llamada a la aventura, atraviesa pruebas en el mundo especial, obtiene una recompensa y regresa transformado. Campbell encontró este patrón en mitologías de todo el mundo; Christopher Vogler lo adaptó para la industria cinematográfica en los años 80.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de proyectos es útil el sistema Save the Cat?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Save the Cat es un sistema de 11 beats desarrollado por Blake Snyder pensado principalmente para guiones de cine comercial, especialmente de género (acción, comedia, thriller). Asigna a cada beat una posición precisa en páginas del guion y exige que el protagonista realice un acto empático al inicio ("salvar al gato") para ganarse al público. Es menos flexible que otras estructuras, pero muy eficaz para proyectos que necesitan claridad de género y ritmo predecible.',
      },
    },
  ],
};
