import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Antibióticos: Cómo Funcionan y la Resistencia | meskeIA',
  description:
    'Visualiza los 5 mecanismos de acción de los antibióticos, bacteriostático vs bactericida, y la crisis de la resistencia. Por qué no funcionan en virus.',
  keywords: [
    'antibioticos como funcionan',
    'resistencia antibiotica',
    'mecanismo antibioticos',
    'bacteriostático bactericida',
    'beta-lactámicos',
    'antibioticos y virus',
    'SARM resistencia',
  ],
  openGraph: {
    title: 'Antibióticos: 5 Mecanismos y la Crisis de la Resistencia',
    description:
      'Por qué atacan bacterias pero no virus, y por qué las bacterias aprenden a sobrevivir.',
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
  name: "Antibióticos: Cómo Matan Bacterias y la Resistencia",
  description: "Visualiza los 5 mecanismos de acción de los antibióticos, bacteriostático vs bactericida, y la crisis de la resistencia. Por qué no funcionan en virus.",
  url: "https://meskeia.com/visualizador-antibioticos/",
  category: 'EducationalApplication',
  features: [],
});
