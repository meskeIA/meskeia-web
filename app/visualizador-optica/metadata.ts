import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Óptica - El Viaje de la Luz | meskeIA',
  description: 'Descubre cómo se comporta la luz: reflexión, refracción, lentes convergentes y divergentes, y descomposición en colores. Explicador visual interactivo.',
  keywords: 'óptica, reflexión, refracción, lentes, prisma, luz, Snell, convergente, divergente, espectro, física visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Óptica - El Viaje de la Luz',
    description: 'Reflexión, refracción, lentes y colores: cómo se comporta la luz explicado visualmente.',
    url: 'https://meskeia.com/visualizador-optica',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Óptica - Explicador Visual Interactivo',
    description: 'Rayos de luz, prismas y lentes: la óptica cobra vida ante tus ojos.',
  },
  other: { 'application-name': 'Óptica Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Óptica - El Viaje de la Luz',
  description: 'Explicador visual interactivo sobre óptica: reflexión con ángulos, refracción (ley de Snell), lentes convergentes y divergentes, y descomposición de la luz en colores.',
  url: 'https://meskeia.com/visualizador-optica/',
  category: 'EducationalApplication',
  features: [
    'Reflexión con slider de ángulo interactivo',
    'Refracción con ley de Snell y múltiples medios',
    'Lentes convergentes y divergentes con rayos SVG',
    'Prisma y espectro electromagnético',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
