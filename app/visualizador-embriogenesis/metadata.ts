import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-embriogenesis';
const TITLE = 'Embriogénesis: Del Cigoto al Embrión Trilaminar';
const DESCRIPTION =
  'Visualiza la fecundación, segmentación celular, formación de mórula/blástula/gástrula, las 3 capas germinales y la diferenciación de órganos en el desarrollo embrionario humano.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'meskeIA',
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
  name: TITLE,
  description: DESCRIPTION,
  url: URL,
  features: [
    'Animación SVG de la fecundación paso a paso',
    'Segmentación celular del día 1 al día 14',
    'Capas germinales: ectodermo, mesodermo y endodermo',
    'Señalización por morfógenos y organogénesis',
  ],
  category: 'EducationalApplication',
});
