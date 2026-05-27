import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Catalasa - La Enzima más Rápida del Cuerpo | meskeIA',
  description: 'Cómo funciona la catalasa: destruye el peróxido de hidrógeno a 40 millones de reacciones por segundo, su localización en los peroxisomas, el experimento clásico con hígado y agua oxigenada, y sus usos industriales.',
  keywords: ['catalasa enzima', 'peroxido hidrogeno catalasa', 'enzima mas rapida', 'peroxisoma catalasa', 'catalasa higado', 'agua oxigenada enzima', 'radicales libres catalasa', 'catalasa experimento'],
  openGraph: {
    title: 'Catalasa - La Enzima más Rápida | meskeIA',
    description: 'La enzima que destruye el agua oxigenada a 40 millones de reacciones por segundo.',
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
  name: "Catalasa - La Enzima más Rápida del Cuerpo",
  description: "Cómo funciona la catalasa: destruye el peróxido de hidrógeno a 40 millones de reacciones por segundo, su localización en los peroxisomas, el experimento clásico con hígado y agua oxigenada, y sus usos",
  url: "https://meskeia.com/visualizador-catalasa/",
  category: 'EducationalApplication',
  features: [],
});
