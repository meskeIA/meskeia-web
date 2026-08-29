import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Grandes Géneros de la Novela — Guía para Lectores | meskeIA',
  description: 'Explora 11 géneros narrativos: novela negra, terror, ciencia ficción, fantasía, thriller, distopía, histórica y más. Características, autores fundacionales y obras para empezar.',
  keywords: 'géneros de la novela, novela negra, terror, ciencia ficción, fantasía épica, thriller, distopía, novela histórica, qué leer, recomendaciones literarias, géneros literarios',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Grandes Géneros de la Novela — Guía para Lectores',
    description: 'Explora 11 géneros narrativos con características definitorias, autores fundacionales y obras ideales para empezar.',
    url: 'https://meskeia.com/visualizador-generos-novela',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grandes Géneros de la Novela — Guía para Lectores',
    description: '11 géneros narrativos con características, autores fundacionales y lecturas de entrada.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Géneros de la Novela meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Grandes Géneros de la Novela — Guía para Lectores',
  description: 'Directorio visual de 11 géneros narrativos desde la perspectiva del lector: características definitorias, autores fundacionales, obras de entrada recomendadas y subgéneros. Incluye comparativa de géneros frecuentemente confundidos.',
  url: 'https://meskeia.com/visualizador-generos-novela/',
  category: 'EducationalApplication',
  features: [
    '11 géneros narrativos con características definitorias desde la perspectiva del lector',
    'Autores fundacionales y obras de entrada recomendadas por género',
    'Filtros por lo que buscas: suspense, mundos, personajes, ideas, emoción, historia',
    'Sección de géneros frecuentemente confundidos (negro vs thriller, sci-fi vs fantasía)',
    'Subgéneros destacados para cada familia narrativa',
    'CTA cruzado al test de tipo de lector',
    'Gratuito, sin registro, en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los grandes géneros de la novela?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los géneros narrativos principales incluyen la novela negra, el thriller, el terror, la ciencia ficción, la fantasía épica, la distopía, la novela histórica, el romance, la novela literaria, la aventura y el realismo mágico. Cada uno tiene convenciones propias en cuanto a atmósfera, ritmo y tipo de conflicto central.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia la novela negra del thriller?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La novela negra centra la trama en la investigación de un crimen, habitualmente con un detective o figura análoga, y suele tener un tono sombrío y crítico con la sociedad. El thriller prioriza la tensión y el ritmo acelerado, con el protagonista directamente amenazado. Ambos comparten la suspensión, pero el motor narrativo es distinto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sé qué género me va a gustar si nunca he leído ese tipo de libros?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lo más práctico es identificar qué buscas al leer: emoción y suspense (thriller, novela negra), mundos imaginados (ciencia ficción, fantasía), reflexión sobre el presente (distopía, literaria) o conocer épocas pasadas (histórica). Leer la primera novela más accesible de cada género es la forma más fiable de descubrir afinidades.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es una buena primera novela de ciencia ficción para quien no ha leído el género?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para iniciarse en ciencia ficción suelen recomendarse títulos de ritmo accesible y premisas concretas: "El marciano" de Andy Weir, "Ender\'s Game" de Orson Scott Card o "La mano izquierda de la oscuridad" de Ursula K. Le Guin son puntos de entrada habituales que no exigen conocer la tradición del género.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia a la fantasía épica de la ciencia ficción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fantasía épica construye mundos secundarios con magia, razas o cosmologías propias, y las reglas internas no se justifican científicamente. La ciencia ficción extrapola tecnología, ciencia o sociedad desde el mundo real o conocido, buscando una coherencia interna basada en principios plausibles. La frontera puede ser difusa en obras que mezclan ambas tradiciones.',
      },
    },
  ],
};
