import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Melatonina - La Hormona que Regula tu Reloj Interno | meskeIA',
  description: 'Cómo funciona la melatonina: la curva circadiana opuesta al cortisol, el efecto de la luz azul en su producción, los patrones estacionales, el jet lag y lo que dice la ciencia sobre los suplementos.',
  keywords: ['melatonina como funciona', 'melatonina luz azul', 'ritmo circadiano melatonina', 'melatonina suplemento ciencia', 'jet lag melatonina', 'melatonina estaciones', 'pineal melatonina', 'melatonina edad', 'melatonina pantallas'],
  openGraph: {
    title: 'Melatonina - La Hormona del Reloj Interno | meskeIA',
    description: 'Curva circadiana, efecto de la luz, jet lag y suplementos de melatonina.',
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
  name: "Melatonina - La Hormona del Reloj Interno",
  description: "Cómo funciona la melatonina: la curva circadiana opuesta al cortisol, el efecto de la luz azul en su producción, los patrones estacionales, el jet lag y lo que dice la ciencia sobre los suplementos.",
  url: "https://meskeia.com/visualizador-melatonina/",
  category: 'EducationalApplication',
  features: [],
});
