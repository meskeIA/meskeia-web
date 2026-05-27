import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Geopolítica Energética: Flujos, Dependencias e Infraestructuras | meskeIA',
  description:
    'Visualiza los flujos de energía global: dependencia de la UE en gas y petróleo, mix energético por región, infraestructuras clave (gasoductos, LNG) y transición renovable. Datos IEA, Eurostat, IRENA.',
  keywords: [
    'geopolitica energetica',
    'dependencia energetica UE',
    'gas natural Europa',
    'gasoductos',
    'LNG',
    'transicion energetica',
    'mix energetico',
    'energias renovables',
    'flujos gas natural',
    'infraestructuras energeticas',
    'IEA',
    'Eurostat',
    'seguridad energetica',
  ],
  openGraph: {
    title: 'Geopolítica Energética | meskeIA',
    description:
      'Flujos, dependencias e infraestructuras del sistema energético global. Datos IEA y Eurostat.',
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
  name: "Geopolítica Energética: Flujos, Dependencias e Infraestructuras",
  description: "Visualiza los flujos de energía global: dependencia de la UE en gas y petróleo, mix energético por región, infraestructuras clave (gasoductos, LNG) y transición renovable. Datos IEA, Eurostat, IRENA.",
  url: "https://meskeia.com/visualizador-geopolitica-energetica/",
  category: 'EducationalApplication',
  features: [],
});
