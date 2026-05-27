import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Aspirina, Paracetamol e Ibuprofeno: Diferencias | meskeIA',
  description:
    'Comparativa de los 3 analgésicos más usados: mecanismos distintos, órganos de riesgo distintos y cuándo es mejor cada uno. Solo el ibuprofeno y la aspirina son antiinflamatorios.',
  keywords: [
    'aspirina paracetamol ibuprofeno diferencias',
    'cual analgesico tomar',
    'paracetamol vs ibuprofeno vs aspirina',
    'analgesicos mecanismo',
    'antiinflamatorio paracetamol',
    'aspirina antiagregante',
    'ibuprofeno estomago',
  ],
  openGraph: {
    title: 'Aspirina vs Paracetamol vs Ibuprofeno: Tres Mecanismos Distintos',
    description:
      'Solo uno es antiagregante. Solo uno actúa en el SNC. Solo uno es seguro con estómago vacío. Conoce la diferencia.',
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
  name: "Aspirina, Paracetamol e Ibuprofeno: Comparativa de los 3 Analgésicos",
  description: "Comparativa de los 3 analgésicos más usados: mecanismos distintos, órganos de riesgo distintos y cuándo es mejor cada uno. Solo el ibuprofeno y la aspirina son antiinflamatorios.",
  url: "https://meskeia.com/visualizador-analgesicos/",
  category: 'EducationalApplication',
  features: [],
});
