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
