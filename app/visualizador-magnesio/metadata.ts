import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'El Magnesio: 300 Reacciones Enzimáticas y Deficiencia Silenciosa | meskeIA',
  description:
    'Cofactor del ATP, equilibrio calcio/magnesio en músculos, bloqueador del receptor NMDA y síntomas de la deficiencia más infradiagnosticada.',
  keywords: [
    'magnesio como funciona',
    'magnesio deficiencia síntomas',
    'magnesio calambres',
    'magnesio ATP',
    'magnesio NMDA',
    'magnesio ansiedad',
    'magnesio migraña',
    'magnesio suplemento cual tomar',
  ],
  openGraph: {
    title: 'El Magnesio: 300 Reacciones Enzimáticas y Deficiencia Silenciosa',
    description: 'ATP, músculo, NMDA y la deficiencia infradiagnosticada',
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
  name: "El Magnesio: 300 Reacciones Enzimáticas y Déficit Silencioso",
  description: "Cofactor del ATP, equilibrio calcio/magnesio en músculos, bloqueador del receptor NMDA y síntomas de la deficiencia más infradiagnosticada.",
  url: "https://meskeia.com/visualizador-magnesio/",
  category: 'EducationalApplication',
  features: [],
});
