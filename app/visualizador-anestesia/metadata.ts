import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anestesia: Cómo Funciona | meskeIA',
  description: 'Visualiza los 3 tipos de anestesia (local, regional, general), mecanismos moleculares GABA-A y NMDA, los 5 componentes de la anestesia general y la monitorización intraoperatoria.',
  keywords: ['anestesia como funciona', 'anestesia general mecanismo', 'anestesia local mecanismo', 'propofol mecanismo', 'GABA anestesia', 'anestesia epidural', 'consciencia intraoperatoria'],
  openGraph: {
    title: 'Anestesia: Cómo se Apaga y Enciende la Consciencia',
    description: '170 años de cirugía sin dolor: mecanismos moleculares y el misterio que aún no resolvemos.',
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
  name: "Anestesia: Cómo se Apaga y Enciende la Consciencia",
  description: "Visualiza los 3 tipos de anestesia (local, regional, general), mecanismos moleculares GABA-A y NMDA, los 5 componentes de la anestesia general y la monitorización intraoperatoria.",
  url: "https://meskeia.com/visualizador-anestesia/",
  category: 'EducationalApplication',
  features: [],
});
