import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Sistema Nervioso - Neuronas, Sinapsis y Neurotransmisores | meskeIA',
  description: 'Neurona con partes clickables, SNC vs SNP, potencial de acción, sinapsis y 6 neurotransmisores principales. Explicador visual interactivo.',
  keywords: 'sistema nervioso, neurona, sinapsis, neurotransmisores, axon, dendrita, dopamina, serotonina, potencial accion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'El Sistema Nervioso - Neuronas, Sinapsis y Neurotransmisores',
    description: 'Neurona con partes clickables, SNC vs SNP, potencial de acción y neurotransmisores explicados visualmente.',
    url: 'https://meskeia.com/visualizador-sistema-nervioso',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Sistema Nervioso - Explicador Visual',
    description: 'De la neurona a los neurotransmisores: el sistema nervioso paso a paso.',
  },
  other: { 'application-name': 'Sistema Nervioso meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'El Sistema Nervioso - Neuronas, Sinapsis y Neurotransmisores',
  description: 'Explicador visual interactivo del sistema nervioso: neurona SVG con partes clickables, SNC vs SNP, potencial de acción, sinapsis y 6 neurotransmisores principales.',
  url: 'https://meskeia.com/visualizador-sistema-nervioso/',
  category: 'EducationalApplication',
  features: [
    'Neurona SVG con partes clickables',
    'SNC vs SNP con diagrama de árbol',
    'Potencial de acción y sinapsis',
    '6 neurotransmisores principales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
