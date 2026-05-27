import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Farmacocinética | ADME — Cómo Viaja un Fármaco | meskeIA',
  description: 'Aprende cómo viaja un fármaco por el cuerpo: absorción (biodisponibilidad, primer paso), distribución (Vd), metabolismo (CYP450, vida media) y excreción. Curva concentración-tiempo explicada.',
  keywords: ['farmacocinetica', 'ADME', 'absorcion farmaco', 'distribucion farmaco', 'metabolismo CYP450', 'vida media farmaco', 'biodisponibilidad', 'excrecion renal'],
  openGraph: {
    title: 'Visualizador de Farmacocinética | meskeIA',
    description: 'Cómo viaja un fármaco: ADME, curva concentración-tiempo, vida media y CYP450 explicados de forma visual.',
    url: 'https://meskeia.com/visualizador-farmacocinetica/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Farmacocinética - Cómo Viaja un Fármaco por el Cuerpo",
  description: "Aprende cómo viaja un fármaco por el cuerpo: absorción (biodisponibilidad, primer paso), distribución (Vd), metabolismo (CYP450, vida media) y excreción. Curva concentración-tiempo explicada.",
  url: "https://meskeia.com/visualizador-farmacocinetica/",
  category: 'EducationalApplication',
  features: [],
});
