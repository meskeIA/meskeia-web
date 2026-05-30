import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Glosario de Física y Química - Definiciones y Conceptos | meskeIA',
  description: 'Glosario completo de términos de física y química. Más de 100 definiciones con niveles básico, intermedio y avanzado. Búsqueda por categorías y modo quiz para aprender.',
  keywords: 'glosario física, glosario química, definiciones física, conceptos química, términos científicos, diccionario ciencias',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Glosario de Física y Química | meskeIA',
    description: 'Consulta definiciones de física y química organizadas por categoría y nivel de dificultad.',
    url: 'https://meskeia.com/glosario-fisica-quimica/',
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
    title: 'Glosario de Física y Química | meskeIA',
    description: 'Consulta definiciones de física y química organizadas por categoría y nivel.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Glosario de Física y Química - Definiciones y Conceptos",
  description: "Glosario completo de términos de física y química. Más de 100 definiciones con niveles básico, intermedio y avanzado. Búsqueda por categorías y modo quiz para aprender.",
  url: 'https://meskeia.com/glosario-fisica-quimica/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos términos incluye este glosario de física y química?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El glosario recoge más de 100 definiciones de física y química organizadas en categorías como mecánica, termodinámica, electromagnetismo, química orgánica, ácidos y bases, y reacciones químicas. Cada término indica su nivel de dificultad (básico, intermedio o avanzado) para que el estudiante pueda orientar su estudio según su nivel educativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo buscar un término concreto en el glosario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dispones de un campo de búsqueda en tiempo real que filtra los términos mientras escribes. También puedes navegar por categorías temáticas (mecánica, termodinámica, química orgánica, etc.) y por nivel de dificultad. Esto permite tanto buscar un concepto puntual como repasar todos los términos de un tema específico antes de un examen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué cursos es útil este glosario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cubre el vocabulario científico de la educación secundaria y bachillerato: ESO, Bachillerato de Ciencias y la asignatura de Física y Química. También sirve como repaso para estudiantes universitarios de primer año de ingenierías o ciencias que necesitan refrescar terminología básica. Los términos avanzados son útiles igualmente para quienes se preparan para pruebas de acceso a la universidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el modo quiz y cómo ayuda a aprender los conceptos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modo quiz presenta definiciones y pide al usuario que identifique el término correcto entre varias opciones, o viceversa. Este sistema de práctica activa mejora la retención frente a la simple lectura pasiva, ya que fuerza al cerebro a recuperar la información. Es especialmente útil los días previos a un examen para consolidar el vocabulario científico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una mezcla homogénea y una heterogénea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En una mezcla homogénea (o disolución), los componentes se distribuyen de forma uniforme y no se distinguen a simple vista, como el agua salada. En una mezcla heterogénea los componentes son visibles y distinguibles, como el agua con arena. La diferencia radica en si la composición es uniforme en todo el volumen de la mezcla o presenta regiones con distinta composición.',
      },
    },
  ],
};
