import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lactasa - La Enzima que Digiere la Leche | meskeIA',
  description: 'Cómo funciona la lactasa: rompe la lactosa en glucosa y galactosa, por qué el 65% de los humanos la pierde en la edad adulta, la evolución de la persistencia de lactasa y el mecanismo de la intolerancia.',
  keywords: ['lactasa enzima', 'intolerancia lactosa mecanismo', 'lactasa persistencia evolucion', 'lactosa glucosa galactosa', 'intestino delgado lactasa', 'deficiencia lactasa', 'lactasa adultos'],
  openGraph: {
    title: 'Lactasa - La Enzima de la Leche | meskeIA',
    description: 'Cómo funciona la lactasa y por qué muchos adultos la pierden.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Lactasa - La Enzima que Revolucionó la Historia Humana",
  description: "Cómo funciona la lactasa: rompe la lactosa en glucosa y galactosa, por qué el 65% de los humanos la pierde en la edad adulta, la evolución de la persistencia de lactasa y el mecanismo de la intoleranc",
  url: "https://meskeia.com/visualizador-lactasa/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la lactasa y dónde se produce?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La lactasa (lactasa-florizin hidrolasa, LPH) es una enzima digestiva producida por las células del intestino delgado, concretamente en el borde en cepillo del yeyuno. Su función es hidrolizar la lactosa —el azúcar de la leche— en dos monosacáridos simples: glucosa y galactosa, que el intestino puede absorber directamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué tantos adultos son intolerantes a la lactosa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Aproximadamente el 65-70% de los humanos adultos reduce la producción de lactasa tras el destete, un proceso llamado no-persistencia de lactasa. Esto es la condición ancestral en nuestra especie. La capacidad de seguir produciendo lactasa en la edad adulta (persistencia) es una mutación genética que surgió hace unos 7.500 años en poblaciones de Europa y África subsahariana que domesticaron el ganado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa exactamente cuando alguien intolerante consume lactosa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sin lactasa suficiente, la lactosa no digerida llega al intestino grueso, donde las bacterias colónicas la fermentan. Este proceso produce gases (hidrógeno, metano, dióxido de carbono) y ácidos grasos de cadena corta que generan hinchazón, flatulencia, dolor abdominal y diarrea osmótica. La intensidad varía según la cantidad consumida y la microbiota de cada persona.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre intolerancia a la lactosa y alergia a la leche?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son condiciones distintas. La intolerancia a la lactosa es un problema digestivo causado por déficit enzimático, sin implicación del sistema inmunológico. La alergia a la leche es una respuesta inmune mediada por IgE contra proteínas de la leche (principalmente caseínas y lactoalbúmina), puede causar reacciones sistémicas graves y es más frecuente en niños.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las personas intolerantes pueden tomar suplementos de lactasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Existen suplementos de lactasa oral (gotas o cápsulas) que se toman justo antes de consumir lácteos para suplir la enzima que el intestino no produce. Su efectividad varía según la dosis de lactosa ingerida y el grado de déficit. Además, algunos lácteos fermentados como el yogur o los quesos curados contienen poca lactosa porque las bacterias ya la han predigerido.',
      },
    },
  ],
};
