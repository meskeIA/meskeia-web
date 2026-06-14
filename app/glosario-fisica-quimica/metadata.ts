import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Glosario de Física y Química - Definiciones y Conceptos | meskeIA',
  description: 'Glosario de 50 términos de física y química con definición, fórmula y ejemplo. Niveles básico, intermedio y avanzado. Filtrado por categoría y búsqueda en tiempo real.',
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
  description: "Glosario de 50 términos de física y química con definición, fórmula y ejemplo. Niveles básico, intermedio y avanzado. Búsqueda y filtrado por categoría.",
  url: 'https://meskeia.com/glosario-fisica-quimica/',
  category: 'EducationalApplication',
  features: [
      "50 términos de física y química con definición, fórmula y ejemplo",
      "3 niveles de dificultad: básico, intermedio y avanzado",
      "Filtrado por categoría (física / química) y nivel",
      "Búsqueda en tiempo real por término o texto de la definición",
      "Tarjetas expandibles con fórmula y ejemplo al hacer clic",
      "Gratuito, sin registro ni instalación",
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
        text: 'El glosario recoge 50 definiciones de física y química organizadas por categoría y nivel. Física incluye mecánica (fuerza, velocidad, energía), electromagnetismo, termodinámica y física moderna (relatividad, cuántica). Química incluye conceptos básicos (átomo, pH, enlace), intermedios (mol, oxidación, catalizador) y avanzados (hibridación, entalpía, energía de activación). Cada término indica su nivel (básico, intermedio o avanzado).',
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
      name: '¿El glosario incluye fórmulas matemáticas junto a las definiciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Los términos con fórmula matemática asociada la muestran al expandir la tarjeta. Por ejemplo, la Segunda Ley de Newton muestra F = m × a, la Ley de Ohm muestra V = I × R y la energía cinética muestra Ec = ½mv². Los términos sin fórmula exacta (como ondas o conceptos cualitativos) incluyen un ejemplo cotidiano en su lugar, facilitando la comprensión práctica antes de un examen.',
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
