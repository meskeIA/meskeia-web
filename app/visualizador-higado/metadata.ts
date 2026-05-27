import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Hígado | Funciones, Detoxificación y Metabolismo | meskeIA',
  description: 'Explora el hígado como laboratorio del cuerpo: detoxificación (fases 1 y 2), metabolismo de glucosa y lípidos, síntesis de proteínas y producción de bilis.',
  keywords: ['hígado', 'detoxificación', 'metabolismo', 'bilis', 'glucógeno', 'albúmina', 'colesterol', 'CYP450'],
  openGraph: {
    title: 'Visualizador del Hígado | meskeIA',
    description: 'El hígado como laboratorio del cuerpo: 500+ funciones vitales explicadas de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-higado/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "El Hígado - Detoxificación y Metabolismo",
  description: "Explora el hígado como laboratorio del cuerpo: detoxificación (fases 1 y 2), metabolismo de glucosa y lípidos, síntesis de proteínas y producción de bilis.",
  url: "https://meskeia.com/visualizador-higado/",
  category: 'EducationalApplication',
  features: [],
});
