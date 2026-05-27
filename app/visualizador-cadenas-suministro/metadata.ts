import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cadenas de Suministro Globales: Cómo Llega Todo hasta Ti — meskeIA',
  description:
    'Visualizador interactivo de cadenas de suministro globales: el viaje de un smartphone, just-in-time vs just-in-case, grandes disrupciones históricas y reshoring. Logística y economía.',
  keywords: [
    'cadena de suministro global',
    'just-in-time just-in-case',
    'disrupciones suministro semiconductores',
    'reshoring nearshoring friendshoring',
    'logística global smartphone',
    'bullwhip effect cadena suministro',
    'Canal de Suez bloqueo comercio',
    'relocalización producción industrial',
  ],
  openGraph: {
    title: 'Cadenas de Suministro Globales: Cómo Llega Todo hasta Ti — meskeIA',
    description:
      'Just-in-time, disrupciones históricas y relocalización — la logística que mueve la economía global.',
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
  name: "Cadenas de Suministro Globales: JIT, Disrupciones y Reshoring",
  description: "Visualizador interactivo de cadenas de suministro globales: el viaje de un smartphone, just-in-time vs just-in-case, grandes disrupciones históricas y reshoring. Logística y economía.",
  url: "https://meskeia.com/visualizador-cadenas-suministro/",
  category: 'EducationalApplication',
  features: [],
});
