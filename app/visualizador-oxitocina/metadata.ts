import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Oxitocina - La Hormona del Vínculo Social | meskeIA',
  description: 'Descubre cómo funciona la oxitocina: cuándo se libera, su papel en los vínculos sociales, la confianza, el parto y la lactancia. Comparativa con vasopresina y datos de neurociencia social.',
  keywords: ['oxitocina', 'hormona del amor', 'hormona vinculo social', 'oxitocina confianza', 'oxitocina parto', 'oxitocina lactancia', 'vasopresina', 'neurociencia social', 'hormonas sociales'],
  openGraph: {
    title: 'Oxitocina - La Hormona del Vínculo | meskeIA',
    description: 'Cómo la oxitocina crea vínculos, genera confianza y conecta a las personas.',
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
  name: "Oxitocina - La Hormona del Vínculo Social",
  description: "Descubre cómo funciona la oxitocina: cuándo se libera, su papel en los vínculos sociales, la confianza, el parto y la lactancia. Comparativa con vasopresina y datos de neurociencia social.",
  url: "https://meskeia.com/visualizador-oxitocina/",
  category: 'EducationalApplication',
  features: [],
});
