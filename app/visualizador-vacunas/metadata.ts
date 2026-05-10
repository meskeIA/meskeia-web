import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cómo Funciona una Vacuna - Sistema Inmune y Tipos | meskeIA',
  description: 'Entiende cómo funcionan las vacunas: sistema inmune, tipos (ARNm, vector, atenuada), inmunidad de rebaño y la historia de la vacunación.',
  keywords: 'vacunas, sistema inmune, inmunidad rebaño, ARNm, anticuerpos, historia vacunacion, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Cómo Funciona una Vacuna',
    description: 'Vacunas y sistema inmune explicados visualmente.',
    url: 'https://meskeia.com/visualizador-vacunas/',
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
    title: 'Cómo Funciona una Vacuna',
    description: 'Sistema inmune, tipos de vacunas e inmunidad de rebaño.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Vacunas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cómo Funciona una Vacuna',
  description: 'Explicador visual del sistema inmune, tipos de vacunas (ARNm, vector viral, atenuada), inmunidad de rebaño con simulación y la historia de la vacunación.',
  url: 'https://meskeia.com/visualizador-vacunas/',
  category: 'EducationalApplication',
  features: [
    'Sistema inmune explicado paso a paso',
    'Comparación de 5 tipos de vacunas',
    'Simulador visual de inmunidad de rebaño',
    'Timeline histórica de la vacunación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
