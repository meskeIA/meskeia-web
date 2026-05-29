import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador del Índice Glucémico y Carga Glucémica | meskeIA',
  description: 'Aprende la diferencia entre índice glucémico (IG) y carga glucémica (CG). Paradoja de la sandía, papel de la fibra y curva de glucosa post-comida explicados.',
  keywords: ['índice glucémico', 'carga glucémica', 'glucosa', 'insulina', 'fibra', 'diabetes', 'nutrición', 'glucemia', 'carbohidratos'],
  openGraph: {
    title: 'Visualizador del Índice Glucémico y Carga Glucémica',
    description: 'Por qué la sandía tiene IG alto pero carga glucémica baja. Entiende la diferencia que cambia cómo interpretar los alimentos.',
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
  '@type': 'EducationalContent',
  name: 'Visualizador del Índice Glucémico y Carga Glucémica',
  description: 'Explicación educativa de índice glucémico, carga glucémica e índice insulínico con ejemplos de alimentos reales.',
  educationalLevel: 'general',
  inLanguage: 'es',
  publisher: {
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
      name: '¿Qué es el índice glucémico y cómo se mide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice glucémico (IG) mide la velocidad a la que un alimento eleva la glucosa en sangre en comparación con la glucosa pura (referencia = 100). Se obtiene midiendo la curva de glucemia en personas voluntarias durante dos horas tras ingerir 50 g de carbohidratos del alimento. Los valores se clasifican en bajo (≤55), medio (56–69) y alto (≥70).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre índice glucémico y carga glucémica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice glucémico mide la velocidad de elevación de glucosa pero ignora la cantidad real de carbohidratos de una ración. La carga glucémica (CG) corrige esto: CG = (IG × gramos de carbohidratos netos) / 100. Por eso la sandía tiene IG alto (72) pero CG baja (4) porque una ración típica contiene muy pocos carbohidratos: 100 g de sandía aportan solo 6 g de carbohidratos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil controlar el índice glucémico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El control del IG y la CG es especialmente relevante para personas con diabetes tipo 2, resistencia a la insulina o síndrome metabólico, ya que permite planificar comidas que eviten picos bruscos de glucemia. También lo usan deportistas para optimizar el tiempo de ingestión de carbohidratos antes y después del ejercicio. Para personas sanas sin patología metabólica, la calidad global de la dieta importa más que el IG aislado de cada alimento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué el mismo alimento puede tener diferente índice glucémico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El IG varía según el grado de madurez (una banana madura tiene IG mayor que una verde), el método de cocción (las patatas hervidas y enfriadas tienen menos IG que las recién cocidas por formación de almidón resistente), el tamaño de partícula (la harina finamente molida eleva el IG), y la combinación con grasas o proteínas en la misma comida, que ralentizan el vaciado gástrico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el índice insulínico y en qué se diferencia del glucémico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El índice insulínico (II) mide la respuesta de insulina que provoca un alimento, no solo la glucosa. Algunos alimentos con IG bajo, como los productos lácteos, generan una respuesta insulínica desproporcionadamente alta. Esto es relevante porque la insulina también regula el almacenamiento de grasa y otros procesos metabólicos más allá del control de la glucemia.',
      },
    },
  ],
};
