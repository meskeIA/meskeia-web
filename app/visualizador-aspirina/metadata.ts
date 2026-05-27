import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Aspirina: Cómo Funciona | meskeIA',
  description:
    'Visualiza el mecanismo molecular de la aspirina: inhibición COX-1/COX-2, síntesis de prostaglandinas, 4 efectos y su base bioquímica. Historia de 120 años.',
  keywords: [
    'aspirina como funciona',
    'mecanismo aspirina',
    'COX-1 COX-2',
    'prostaglandinas aspirina',
    'aspirina antiagregante',
    'ácido acetilsalicílico',
    'aspirina farmacología',
  ],
  openGraph: {
    title: 'Aspirina: El Mecanismo del Fármaco más Universal',
    description:
      'Del sauce al laboratorio: cómo la aspirina inhibe irreversiblemente COX y bloquea prostaglandinas.',
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
  name: "Aspirina: Cómo Funciona el Fármaco más Universal",
  description: "Visualiza el mecanismo molecular de la aspirina: inhibición COX-1/COX-2, síntesis de prostaglandinas, 4 efectos y su base bioquímica. Historia de 120 años.",
  url: "https://meskeia.com/visualizador-aspirina/",
  category: 'EducationalApplication',
  features: [],
});
