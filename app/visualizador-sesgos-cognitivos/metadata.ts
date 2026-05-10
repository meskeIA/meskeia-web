import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona tu Cerebro al Decidir - Sesgos Cognitivos | meskeIA',
  description: 'Descubre los sesgos cognitivos que distorsionan tus decisiones: anclaje, aversión a la pérdida, efecto dotación, coste hundido. Mini-ejemplos interactivos.',
  keywords: 'sesgos cognitivos, anclaje, aversión pérdida, efecto dotación, coste hundido, decisiones, psicología, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona tu Cerebro al Decidir',
    description: 'Sesgos cognitivos que afectan tus decisiones sin que lo sepas. Mini-ejemplos interactivos.',
    url: 'https://meskeia.com/visualizador-sesgos-cognitivos/',
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
    title: 'Cómo Funciona tu Cerebro al Decidir',
    description: 'Los sesgos cognitivos que distorsionan tus decisiones — sin que lo sepas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sesgos Cognitivos meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona tu Cerebro al Decidir',
  description: 'Explicador visual interactivo sobre sesgos cognitivos. Cada sesgo incluye una explicación clara, un mini-ejemplo interactivo que demuestra el efecto, y consejos para contrarrestarlo.',
  url: 'https://meskeia.com/visualizador-sesgos-cognitivos/',
  features: [
    '8 sesgos cognitivos principales explicados',
    'Mini-ejemplos interactivos para cada sesgo',
    'Categorías: dinero, percepción, social, lógica',
    'Consejos para contrarrestar cada sesgo',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
