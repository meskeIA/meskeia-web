import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Célula por Dentro - Animal vs Vegetal | meskeIA',
  description: 'Explora la célula animal y vegetal por dentro: orgánulos clickables, comparativa visual y datos fascinantes. Explicador visual interactivo de biología.',
  keywords: 'célula animal, célula vegetal, orgánulos, mitocondria, núcleo, cloroplasto, biología visual, anatomía celular, membrana, ribosomas',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Célula por Dentro - Animal vs Vegetal',
    description: 'Orgánulos clickables, comparativa visual y datos fascinantes sobre las células.',
    url: 'https://meskeia.com/visualizador-celula',
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
    title: 'La Célula por Dentro - Explicador Visual',
    description: '37,2 billones de células en tu cuerpo. ¿Sabes qué hay dentro de cada una?',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Célula Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Célula por Dentro - Animal vs Vegetal',
  description: 'Explicador visual interactivo sobre la célula: anatomía de célula animal y vegetal con orgánulos clickables, comparativa lado a lado y datos fascinantes de biología celular.',
  url: 'https://meskeia.com/visualizador-celula/',
  category: 'EducationalApplication',
  features: [
    'Célula animal con orgánulos clickables',
    'Célula vegetal con diferencias resaltadas',
    'Comparativa visual animal vs vegetal',
    'Datos fascinantes: billones de células, ADN de 2 metros',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
