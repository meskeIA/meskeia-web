import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida | meskeIA',
  description: 'Descubre las enzimas del cuerpo humano: modelo llave-cerradura, enzimas digestivas y metabólicas, factores que afectan su actividad y cofactores esenciales.',
  keywords: 'enzimas, catalizadores biológicos, llave-cerradura, pepsina, amilasa, lipasa, catalasa, ATP sintasa, cofactores, coenzimas, cinética enzimática',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
    description: 'Modelo llave-cerradura, enzimas digestivas y metabólicas, factores de actividad y cofactores esenciales.',
    url: 'https://meskeia.com/visualizador-enzimas-cuerpo-humano/',
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
    title: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
    description: 'Modelo llave-cerradura, enzimas digestivas, metabólicas y hepáticas explicadas visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Enzimas del Cuerpo Humano meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Las Enzimas del Cuerpo Humano - Catalizadores de la Vida',
  description: 'Explicador visual interactivo de las enzimas del cuerpo humano: modelo llave-cerradura y ajuste inducido, enzimas digestivas, metabólicas y hepáticas, factores que afectan su actividad (pH, temperatura, inhibidores) y cofactores esenciales.',
  url: 'https://meskeia.com/visualizador-enzimas-cuerpo-humano/',
  category: 'EducationalApplication',
  features: [
    'Modelo llave-cerradura y ajuste inducido con SVG interactivo',
    'Grid de enzimas digestivas, metabólicas y hepáticas con datos detallados',
    'Sliders interactivos de temperatura, pH y concentración de sustrato',
    'Cofactores, coenzimas y enfermedades enzimáticas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son las enzimas y para qué sirven en el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las enzimas son proteínas que actúan como catalizadores biológicos: aceleran las reacciones químicas del organismo sin consumirse en el proceso. Sin ellas, reacciones que tardarían horas o años ocurren en milisegundos. El cuerpo humano produce miles de enzimas distintas que intervienen en la digestión, la respiración celular, la síntesis de ADN, la detoxificación hepática y prácticamente todos los procesos metabólicos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el modelo llave-cerradura de las enzimas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El modelo llave-cerradura, propuesto por Emil Fischer en 1894, explica que cada enzima tiene un sitio activo con una forma tridimensional muy específica que solo encaja con su sustrato concreto (igual que una llave en su cerradura). El modelo de ajuste inducido —más preciso— añade que el sitio activo cambia ligeramente de forma al unirse al sustrato, optimizando el encaje. Este mecanismo explica la alta especificidad de las enzimas: la amilasa salival solo actúa sobre el almidón, no sobre proteínas o grasas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores afectan a la actividad de las enzimas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los principales factores son la temperatura, el pH y la concentración de sustrato. Cada enzima tiene un rango óptimo: la pepsina gástrica trabaja mejor a pH 1,5-2, mientras que las enzimas pancreáticas prefieren un pH de 7-8. Por encima de 40-45 °C, la mayoría de las enzimas humanas se desnaturalizan (pierden su estructura y función). Los inhibidores —competitivos o no competitivos— también reducen la actividad enzimática; este principio es la base de muchos fármacos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las enzimas digestivas más importantes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las principales enzimas digestivas son la amilasa salival y pancreática (degrada almidones en azúcares simples), la pepsina gástrica (rompe proteínas en el estómago a pH ácido), la lipasa pancreática (digiere las grasas en el intestino delgado) y las proteasas pancreáticas como la tripsina y la quimotripsina. La lactasa, producida en el intestino delgado, descompone la lactosa de la leche; su déficit causa intolerancia a la lactosa, una de las alteraciones enzimáticas más frecuentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué enfermedades se asocian a deficiencias enzimáticas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Muchas enfermedades tienen base enzimática. La fenilcetonuria (PKU) se debe al déficit de fenilalanina hidroxilasa, que impide metabolizar la fenilalanina. La galactosemia resulta de la falta de galactosa-1-fosfato uridiltransferasa. La enfermedad de Gaucher es causada por el déficit de glucocerebrosidasa. En el hígado, niveles elevados de las enzimas ALT y AST en analítica indican daño hepático. El diagnóstico enzimático es clave en cribado neonatal y seguimiento de patologías hepáticas y musculares.',
      },
    },
  ],
};
