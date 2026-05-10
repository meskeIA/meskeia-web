import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Reacciones Químicas - Cuando los Átomos Cambian de Pareja | meskeIA',
  description: 'Descubre los tipos de reacciones químicas, cómo balancear ecuaciones y reacciones del día a día. Explicador visual interactivo con átomos animados.',
  keywords: 'reacciones químicas, balanceo ecuaciones, tipos reacción, síntesis, combustión, átomos, química visual, conservación masa',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Reacciones Químicas - Cuando los Átomos Cambian de Pareja',
    description: 'Tipos de reacciones, balanceo de ecuaciones y química del día a día explicados visualmente.',
    url: 'https://meskeia.com/visualizador-reacciones-quimicas/',
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
    title: 'Reacciones Químicas - Explicador Visual',
    description: 'Los átomos no se crean ni destruyen, solo cambian de pareja. Química visual e interactiva.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Reacciones Químicas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Reacciones Químicas - Cuando los Átomos Cambian de Pareja',
  description: 'Explicador visual interactivo sobre reacciones químicas: tipos (síntesis, descomposición, combustión), balanceo de ecuaciones con conteo atómico y reacciones cotidianas.',
  url: 'https://meskeia.com/visualizador-reacciones-quimicas/',
  category: 'EducationalApplication',
  features: [
    '5 tipos de reacciones con animación de átomos',
    'Balanceo interactivo de ecuaciones químicas',
    'Conteo atómico visual en tiempo real',
    'Reacciones cotidianas: cocina, motor, batería',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
