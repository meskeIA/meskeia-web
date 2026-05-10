import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Rocas - El Ciclo que Nunca se Detiene | meskeIA',
  description: 'Descubre los 3 tipos de rocas (ígneas, sedimentarias, metamórficas), el ciclo de las rocas y sus usos cotidianos. Explicador visual interactivo con ejemplos.',
  keywords: 'tipos de rocas, ígneas, sedimentarias, metamórficas, ciclo de las rocas, granito, mármol, basalto, geología, minerales, escala de Mohs',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tipos de Rocas - El Ciclo que Nunca se Detiene',
    description: 'Ígneas, sedimentarias y metamórficas: las rocas del planeta explicadas visualmente con el ciclo que las transforma.',
    url: 'https://meskeia.com/visualizador-tipos-rocas/',
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
    title: 'Tipos de Rocas - Explicador Visual',
    description: 'Del magma al mármol: los 3 tipos de rocas y el ciclo que nunca se detiene, con visualizaciones interactivas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Tipos Rocas meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de Rocas - El Ciclo que Nunca se Detiene',
  description: 'Explicador visual interactivo sobre los 3 tipos de rocas, el ciclo de las rocas, usos cotidianos y datos fascinantes de geología.',
  url: 'https://meskeia.com/visualizador-tipos-rocas/',
  category: 'EducationalApplication',
  features: [
    '3 tipos de rocas con subtipos y ejemplos clickables',
    'Ciclo de las rocas con diagrama SVG animado',
    'Rocas en la vida cotidiana con usos reales',
    'Escala de Mohs simplificada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
