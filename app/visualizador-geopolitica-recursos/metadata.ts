import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geopolítica de los Recursos - Petróleo, Litio y Tierras Raras | meskeIA',
  description: 'Visualiza la distribución global de recursos estratégicos: petróleo, gas, litio, tierras raras y cobre. Dependencia de Europa, conflictos por recursos y transición energética.',
  keywords: ['geopolitica recursos', 'litio', 'tierras raras', 'petroleo', 'dependencia energetica europa', 'recursos estrategicos', 'conflictos recursos', 'transicion energetica', 'cobre', 'gas natural'],
  openGraph: {
    title: 'Geopolítica de los Recursos | meskeIA',
    description: 'Mapa interactivo de recursos estratégicos globales y la dependencia de Europa.',
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
  name: "Geopolítica de los Recursos - Petróleo, Litio y Tierras Raras",
  description: "Visualiza la distribución global de recursos estratégicos: petróleo, gas, litio, tierras raras y cobre. Dependencia de Europa, conflictos por recursos y transición energética.",
  url: "https://meskeia.com/visualizador-geopolitica-recursos/",
  category: 'EducationalApplication',
  features: [],
});
