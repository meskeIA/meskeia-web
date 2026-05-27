import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diabetes: Mecanismo Biológico de Insulina y Glucagón — meskeIA',
  description: 'Visualizador del mecanismo biológico de la diabetes. Páncreas, insulina y glucagón, mecanismo de resistencia a la insulina, tipos 1/2/gestacional y HbA1c. Biología molecular pura, sin diagnóstico.',
  keywords: [
    'diabetes mecanismo biológico',
    'insulina glucagón páncreas',
    'resistencia insulina tipo 2',
    'autoinmune tipo 1 células beta',
    'HbA1c hemoglobina glicosilada',
    'islas Langerhans glucosa',
    'diabetes gestacional lactógeno placentario',
    'glucotoxicidad AGEs estrés oxidativo',
  ],
  openGraph: {
    title: 'Diabetes: Mecanismo Biológico de Insulina y Glucagón — meskeIA',
    description: 'Cómo funciona el páncreas y qué mecanismos moleculares alteran la regulación de la glucosa.',
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
  name: "Diabetes: Mecanismo Biológico de Insulina y Glucagón",
  description: "Visualizador del mecanismo biológico de la diabetes. Páncreas, insulina y glucagón, mecanismo de resistencia a la insulina, tipos 1/2/gestacional y HbA1c. Biología molecular pura, sin diagnóstico.",
  url: "https://meskeia.com/visualizador-diabetes-mecanismo/",
  category: 'EducationalApplication',
  features: [],
});
