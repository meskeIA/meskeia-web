import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

const APP_NAME = 'visualizador-reino-animal';
const TITLE = 'Reino Animal: Vertebrados, Invertebrados y Filogenia - meskeIA';
const DESCRIPTION =
  'Explora el árbol filogenético del reino Animalia: 5 clases de vertebrados, phyla de invertebrados, comparativa de sistemas circulatorio/reproductor/excretor y adaptaciones por entorno.';
const URL = `https://meskeia.com/${APP_NAME}/`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'reino animal',
    'vertebrados',
    'invertebrados',
    'árbol filogenético animalia',
    'clases de vertebrados',
    'phyla invertebrados',
    'peces anfibios reptiles aves mamíferos',
    'artrópodos moluscos',
    'biología animal',
    'taxonomía animal',
    'evolución animal',
    'sistema circulatorio vertebrados',
    'filogenia molecular',
  ],
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
      '5 clases de vertebrados con detalles interactivos',
      '7 phyla de invertebrados',
      'Tabla comparativa de sistemas biológicos',
      'Árbol filogenético interactivo del reino Animalia',
      'SVG del corazón por número de cámaras',
    ],
    category: 'EducationalApplication',
  });
}

export const jsonLd = generateWebAppSchema({
  name: "Reino Animal: Vertebrados, Invertebrados y Árbol Filogenético",
  description: "Visualizador interactivo del reino animal. Árbol filogenético clicable, 5 clases de vertebrados con SVG del corazón por cámaras (pez 2, anfibio 3, reptil 3-4, ave 4, mamífero 4), 7 phyla de invertebra",
  url: "https://meskeia.com/visualizador-reino-animal/",
  category: 'EducationalApplication',
  features: [],
});
