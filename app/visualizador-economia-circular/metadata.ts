import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Economía Circular - De lo Lineal a los Ciclos Cerrados | meskeIA',
  description: 'Visualiza la economía circular: diferencias con el modelo lineal, las 7 estrategias (reducir, reutilizar, reparar, reciclar), flujos de residuos en España y casos de éxito.',
  keywords: ['economia circular', 'reciclaje', 'residuos', 'sostenibilidad', 'derecho a reparar', 'reutilizar', 'reducir', 'tasa reciclaje españa', 'modelo circular', 'ecodiseno'],
  openGraph: {
    title: 'Economía Circular | meskeIA',
    description: 'Del modelo lineal a los ciclos cerrados: estrategias, datos de España y casos reales',
    url: 'https://meskeia.com/visualizador-economia-circular/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Economía Circular - De Lineal a Circular",
  description: "Visualiza la economía circular: diferencias con el modelo lineal, las 7 estrategias (reducir, reutilizar, reparar, reciclar), flujos de residuos en España y casos de éxito.",
  url: "https://meskeia.com/visualizador-economia-circular/",
  category: 'EducationalApplication',
  features: [],
});
