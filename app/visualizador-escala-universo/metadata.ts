import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Escala del Universo - Del Quark a la Galaxia | meskeIA',
  description: 'Explora los 12 niveles de escala del universo: desde un quark hasta una galaxia. Zoom interactivo con tamaños, comparaciones y datos fascinantes para Bachillerato.',
  keywords: 'escala universo, tamaño universo, física bachillerato, quark átomo molécula célula, escala espacial, astronomía educativa, ciencias bachillerato',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Escala del Universo',
    description: 'Del quark a la galaxia: 12 niveles de zoom interactivo con tamaños y comparaciones.',
    url: 'https://meskeia.com/visualizador-escala-universo',
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
    title: 'La Escala del Universo',
    description: 'Explora 12 niveles de escala del universo, del quark a la galaxia.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Escala Universo meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Escala del Universo',
  description: 'Explicador visual interactivo de las escalas de tamaño del universo: desde un quark (10⁻¹⁸ m) hasta una galaxia (10²¹ m). 12 niveles con iconos, tamaños, objetos representativos y comparaciones sorprendentes.',
  url: 'https://meskeia.com/visualizador-escala-universo/',
  features: [
    '12 niveles de escala: quark, átomo, molécula ADN, célula, hormiga, humano, edificio, montaña, Tierra, Sol, sistema solar, galaxia',
    'Slider de zoom interactivo entre niveles',
    'Tamaño en metros con notación científica',
    'Comparación entre niveles adyacentes',
    'Objeto representativo y dato fascinante por nivel',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
