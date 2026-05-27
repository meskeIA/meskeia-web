import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Envejecimiento Celular | Telómeros, Senescencia y Hallmarks | meskeIA',
  description: 'Los mecanismos moleculares del envejecimiento: telómeros (límite de Hayflick), senescencia celular (SASP), disfunción mitocondrial, reloj epigenético de Horvath y los 9 Hallmarks of Aging.',
  keywords: ['envejecimiento celular', 'telomeros', 'senescencia', 'hallmarks aging', 'mitocondrias', 'reloj epigenetico', 'Horvath', 'senoterapia', 'longevidad'],
  openGraph: {
    title: 'Visualizador del Envejecimiento Celular | meskeIA',
    description: 'Telómeros, senescencia, hallmarks of aging y relojes biológicos: los mecanismos moleculares del envejecimiento explicados visualmente.',
    url: 'https://meskeia.com/visualizador-envejecimiento-celular/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Envejecimiento Celular - Telómeros, Senescencia y Hallmarks",
  description: "Los mecanismos moleculares del envejecimiento: telómeros (límite de Hayflick), senescencia celular (SASP), disfunción mitocondrial, reloj epigenético de Horvath y los 9 Hallmarks of Aging.",
  url: "https://meskeia.com/visualizador-envejecimiento-celular/",
  category: 'EducationalApplication',
  features: [],
});
