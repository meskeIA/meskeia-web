import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Biomoléculas - Los 4 Ingredientes de la Vida | meskeIA',
  description: 'Explora las 4 biomoléculas esenciales: carbohidratos, lípidos, proteínas y ácidos nucleicos. Estructuras, funciones y datos fascinantes en un explicador visual interactivo.',
  keywords: 'biomoléculas, carbohidratos, lípidos, proteínas, ácidos nucleicos, ADN, ARN, glucosa, aminoácidos, nucleótidos, bioquímica visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Biomoléculas - Los 4 Ingredientes de la Vida',
    description: 'Carbohidratos, lípidos, proteínas y ácidos nucleicos explicados de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-biomoleculas/',
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
    title: 'Biomoléculas - Explicador Visual Interactivo',
    description: 'Tu cuerpo es una fábrica química con 4 ingredientes principales. Descúbrelos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Biomoléculas Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Biomoléculas - Los 4 Ingredientes de la Vida',
  description: 'Explicador visual interactivo sobre las 4 biomoléculas esenciales: carbohidratos, lípidos, proteínas y ácidos nucleicos. Estructuras simplificadas, composición corporal y datos fascinantes de bioquímica.',
  url: 'https://meskeia.com/visualizador-biomoleculas/',
  category: 'EducationalApplication',
  features: [
    'Las 4 familias de biomoléculas con cards interactivas',
    'Estructuras visuales simplificadas con animación de ensamblaje',
    'Composición del cuerpo humano en biomoléculas',
    'Datos fascinantes sobre ADN, proteínas y más',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
