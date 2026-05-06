import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Anatomía del Ojo Humano y la Visión | meskeIA',
  description: 'Explora cómo funciona el ojo humano: anatomía interactiva con SVG, conos y bastones, defectos visuales (miopía, hipermetropía, astigmatismo, daltonismo) y datos curiosos.',
  keywords: 'ojo humano, visión, retina, córnea, cristalino, conos, bastones, miopía, hipermetropía, astigmatismo, daltonismo, anatomía ojo, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Anatomía del Ojo Humano y la Visión',
    description: 'Córnea, cristalino, retina, conos y bastones: descubre cómo funciona la visión humana con diagramas interactivos.',
    url: 'https://meskeia.com/visualizador-ojo-humano-vision',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ojo Humano y Visión - Explicador Visual Interactivo',
    description: 'Anatomía del ojo, fotorreceptores, defectos visuales y curiosidades: la visión humana explicada visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Ojo Humano Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Anatomía del Ojo Humano y la Visión',
  description: 'Explicador visual interactivo sobre el ojo humano: anatomía con SVG clickable, conos y bastones, defectos visuales (miopía, hipermetropía, astigmatismo, daltonismo) y datos curiosos sobre la visión.',
  url: 'https://meskeia.com/visualizador-ojo-humano-vision/',
  category: 'EducationalApplication',
  features: [
    'SVG interactivo del corte transversal del ojo con partes clickables',
    'Comparativa conos vs bastones con datos cuantitativos',
    'Defectos visuales con diagramas SVG simplificados',
    'Datos y curiosidades sobre la visión humana',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
