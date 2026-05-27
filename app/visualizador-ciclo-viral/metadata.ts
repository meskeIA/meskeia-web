import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo de Replicación Viral: Cómo se Reproducen los Virus — meskeIA',
  description:
    'Visualizador del ciclo viral completo: 6 etapas de replicación, virus ADN vs ARN, retrovirus, latencia y mecanismos de evasión inmune. Biología molecular pura.',
  keywords: [
    'ciclo replicación viral',
    'cómo se reproducen los virus',
    'virus ADN ARN retrovirus',
    'VIH replicación ciclo',
    'latencia viral herpes',
    'variación antigénica influenza',
    'tropismo viral receptor celular',
    'ensamblaje virión gemación lisis',
  ],
  openGraph: {
    title: 'Ciclo de Replicación Viral: Cómo se Reproducen los Virus — meskeIA',
    description:
      'Las 6 etapas del ciclo viral, estrategias ADN vs ARN y mecanismos de evasión inmune.',
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
  name: "Ciclo de Replicación Viral: Cómo se Reproducen los Virus",
  description: "Visualizador del ciclo viral completo: 6 etapas de replicación, virus ADN vs ARN, retrovirus, latencia y mecanismos de evasión inmune. Biología molecular pura.",
  url: "https://meskeia.com/visualizador-ciclo-viral/",
  category: 'EducationalApplication',
  features: [],
});
