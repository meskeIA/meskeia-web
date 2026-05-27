import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador de Exoplanetas: Detección, Zona Habitable y Diversidad — meskeIA',
  description:
    'Explora cómo detectamos exoplanetas con animaciones del método de tránsito y velocidad radial, la zona habitable de Goldilocks, clasificación de tipos y distribución de los 5.500+ mundos conocidos.',
  keywords: [
    'exoplanetas visualizador',
    'método tránsito exoplanetas',
    'velocidad radial planeta',
    'zona habitable Goldilocks',
    'TRAPPIST-1 exoplaneta',
    'Kepler-452b planeta',
    'Proxima Centauri b',
    'detección exoplanetas animación',
    'júpiter caliente mini neptuno super tierra',
    'James Webb atmósferas exoplanetas',
    'ecuación de Drake Fermi',
    'tipos de exoplanetas clasificación',
  ],
  openGraph: {
    title: 'Visualizador de Exoplanetas: Detección, Zona Habitable y Diversidad — meskeIA',
    description:
      'Animaciones interactivas del método de tránsito, velocidad radial, zona habitable y clasificación de los más de 5.500 exoplanetas confirmados.',
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
  name: "Exoplanetas: Tránsito, Zona Habitable y Kepler",
  description: "Explora cómo detectamos exoplanetas con animaciones del método de tránsito y velocidad radial, la zona habitable de Goldilocks, clasificación de tipos y distribución de los 5.500+ mundos conocidos.",
  url: "https://meskeia.com/visualizador-exoplanetas/",
  category: 'EducationalApplication',
  features: [],
});
