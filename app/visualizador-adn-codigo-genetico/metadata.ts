import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'ADN y Código Genético - Del Gen a la Proteína | meskeIA',
  description: 'Explora el dogma central de la biología molecular: ADN → ARN → Proteína. Doble hélice, transcripción, traducción, codones y mutaciones en un explicador visual interactivo.',
  keywords: 'ADN, ARN, código genético, codones, transcripción, traducción, dogma central, biología molecular, aminoácidos, mutaciones, CRISPR, epigenética',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'ADN y Código Genético - Del Gen a la Proteína',
    description: 'El dogma central de la biología: cómo tu ADN se convierte en proteínas. Explicador visual interactivo.',
    url: 'https://meskeia.com/visualizador-adn-codigo-genetico',
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
    title: 'ADN y Código Genético - Explicador Visual Interactivo',
    description: '3.200 millones de letras forman tu libro de instrucciones. Descubre cómo se leen.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'ADN y Código Genético meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'ADN y Código Genético - Del Gen a la Proteína',
  description: 'Explicador visual interactivo sobre el dogma central de la biología molecular: estructura del ADN, transcripción, traducción, tabla de codones, mutaciones y CRISPR. Desde la doble hélice hasta la proteína.',
  url: 'https://meskeia.com/visualizador-adn-codigo-genetico/',
  category: 'EducationalApplication',
  features: [
    'Estructura de la doble hélice con bases complementarias interactivas',
    'Proceso de transcripción ADN → ARN paso a paso',
    'Tabla completa de 64 codones con 20 aminoácidos',
    'Mutaciones, epigenética y CRISPR explicados visualmente',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
