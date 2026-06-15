import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Óptica - El Viaje de la Luz | meskeIA',
  description: 'Descubre cómo se comporta la luz: reflexión, refracción, lentes convergentes y divergentes, y descomposición en colores. Explicador visual interactivo.',
  keywords: 'óptica, reflexión, refracción, lentes, prisma, luz, Snell, convergente, divergente, espectro, física visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Óptica - El Viaje de la Luz',
    description: 'Reflexión, refracción, lentes y colores: cómo se comporta la luz explicado visualmente.',
    url: 'https://meskeia.com/visualizador-optica/',
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
    title: 'Óptica - Explicador Visual Interactivo',
    description: 'Rayos de luz, prismas y lentes: la óptica cobra vida ante tus ojos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Óptica Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Óptica - El Viaje de la Luz',
  description: 'Explicador visual interactivo sobre óptica: reflexión con ángulos, refracción (ley de Snell), lentes convergentes y divergentes, y descomposición de la luz en colores.',
  url: 'https://meskeia.com/visualizador-optica/',
  category: 'EducationalApplication',
  features: [
    'Reflexión con slider de ángulo interactivo',
    'Refracción con ley de Snell y múltiples medios',
    'Lentes convergentes y divergentes con rayos SVG',
    'Prisma y espectro electromagnético',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la reflexión de la luz y cuál es su ley fundamental?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La reflexión ocurre cuando un rayo de luz rebota al chocar con una superficie. La ley de reflexión establece que el ángulo de incidencia (medido respecto a la normal) es igual al ángulo de reflexión. Este principio explica cómo funcionan los espejos planos, los retroreflectores de carretera y los telescopios reflectores como el Hubble.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué dice la ley de Snell sobre la refracción de la luz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La ley de Snell (o Snell-Descartes) describe cómo cambia la dirección de la luz al pasar de un medio a otro con distinto índice de refracción. Se expresa como n₁·sin(θ₁) = n₂·sin(θ₂). Por ejemplo, al pasar del aire (n≈1) al vidrio (n≈1,5), la luz se dobla hacia la normal. Este efecto es la base de las lentes de gafas, microscopios y fibras ópticas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una lente convergente y una divergente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una lente convergente (convexa) es más gruesa en el centro y hace que los rayos paralelos se junten en un punto llamado foco. Se usa en lupas, objetivos de cámara y para corregir la hipermetropía. Una lente divergente (cóncava) es más delgada en el centro y dispersa los rayos, creando imágenes virtuales y reducidas. Se usa para corregir la miopía.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un prisma descompone la luz blanca en colores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La luz blanca es una mezcla de todos los colores del espectro visible (400–700 nm). Al atravesar un prisma de vidrio, cada longitud de onda se refracta con un ángulo ligeramente distinto porque el índice de refracción depende del color: el violeta se dobla más que el rojo. Este fenómeno se llama dispersión cromática y explica los arcoíris, que funcionan como prismas esféricos de agua.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué nivel educativo está pensado este explicador de óptica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Está diseñado para estudiantes de secundaria y bachillerato que se introducen en la óptica geométrica y ondulatoria, así como para curiosos sin formación previa. Los conceptos se presentan con animaciones y diagramas de rayos SVG que hacen visibles fenómenos abstractos. No requiere matemáticas avanzadas para comprender los fundamentos, aunque se incluyen las fórmulas para quienes quieran profundizar.',
      },
    },
  ],
};
