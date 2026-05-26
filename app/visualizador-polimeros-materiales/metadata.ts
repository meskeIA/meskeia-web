import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-polimeros-materiales';
const TITLE = 'Polímeros y Materiales: Plásticos, Propiedades y Reciclaje - meskeIA';
const DESCRIPTION = 'Visualiza la polimerización por adición y condensación, propiedades de termoplásticos y termoestables, clasificación de plásticos y su ciclo de vida medioambiental.';
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

export function generateJsonLd() {
  return generateWebAppSchema({
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    features: [
      'Polimerización por adición y condensación con animación interactiva',
      'Comparativa de propiedades de 6 polímeros comunes',
      'Clasificación de termoplásticos, termoestables y elastómeros',
      'Ciclo de vida del plástico y biodegradabilidad',
      'Biopolímeros y economía circular',
      '7 códigos de reciclaje de plásticos',
    ],
  });
}
