import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Lo que Cuesta Enfermarse - Sanidad Pública vs Privada | meskeIA',
  description: 'Coste real de consultas, operaciones y urgencias en España vs otros países. Sanidad pública vs privada explicada con datos reales.',
  keywords: 'coste sanidad, sanidad publica, sanidad privada, coste operaciones, urgencias, sistema sanitario españa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Lo que Cuesta Enfermarse',
    description: 'Sanidad pública vs privada: costes reales de enfermarse en España y el mundo.',
    url: 'https://meskeia.com/visualizador-coste-sanidad',
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
    title: 'Lo que Cuesta Enfermarse',
    description: 'Costes reales de la sanidad explicados visualmente.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Coste Sanidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Lo que Cuesta Enfermarse',
  description: 'Explicador visual del coste real de la sanidad: consultas, operaciones, urgencias. España vs otros países, público vs privado.',
  url: 'https://meskeia.com/visualizador-coste-sanidad/',
  features: [
    'Comparación costes médicos entre países',
    'Desglose sanidad pública vs privada',
    'Coste real de operaciones comunes',
    'Cómo se financia la sanidad española',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
