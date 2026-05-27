import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Menstrual: Fases y Hormonas — meskeIA',
  description: 'Visualizador educativo del ciclo menstrual. Gráfico interactivo de las 4 hormonas (FSH, LH, estrógeno, progesterona) en las 4 fases. SOP y anticonceptivos explicados.',
  keywords: [
    'ciclo menstrual fases',
    'FSH LH estrógeno progesterona',
    'ovulación fisiología',
    'fase folicular lútea',
    'SOP síndrome ovario poliquístico',
    'anticonceptivos hormonales mecanismo',
    'ciclo menstrual 28 días',
    'endometrio hormonal',
  ],
  openGraph: {
    title: 'Ciclo Menstrual: Fases y Hormonas — meskeIA',
    description: 'Las 4 fases del ciclo, las 4 hormonas protagonistas, SOP y anticonceptivos.',
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
  name: "Ciclo Menstrual: Fases y Hormonas",
  description: "Visualizador educativo del ciclo menstrual. Gráfico interactivo de las 4 hormonas (FSH, LH, estrógeno, progesterona) en las 4 fases. SOP y anticonceptivos explicados.",
  url: "https://meskeia.com/visualizador-ciclo-menstrual/",
  category: 'EducationalApplication',
  features: [],
});
