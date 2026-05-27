import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estadística en la Vida Cotidiana - Probabilidad y Sesgos | meskeIA',
  description: 'Entiende la estadística sin matemáticas: probabilidad condicional, regresión a la media, paradoja de Simpson, sesgo de supervivencia y la ley de los grandes números con ejemplos cotidianos.',
  keywords: ['estadistica cotidiana', 'probabilidad condicional', 'teorema bayes', 'regresion media', 'paradoja simpson', 'sesgo supervivencia', 'ley grandes numeros', 'estadistica ejemplos vida real', 'pensamiento estadistico'],
  openGraph: {
    title: 'Estadística en la Vida Cotidiana | meskeIA',
    description: 'Probabilidad, sesgos estadísticos y paradojas con ejemplos de la vida real.',
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
  name: "Estadística en la Vida Cotidiana - Probabilidad y Sesgos",
  description: "Entiende la estadística sin matemáticas: probabilidad condicional, regresión a la media, paradoja de Simpson, sesgo de supervivencia y la ley de los grandes números con ejemplos cotidianos.",
  url: "https://meskeia.com/visualizador-estadistica-cotidiana/",
  category: 'EducationalApplication',
  features: [],
});
