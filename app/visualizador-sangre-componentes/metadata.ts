import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Componentes de la Sangre - Tubo de Ensayo Visual | meskeIA',
  description: 'Descubre los componentes de la sangre: glóbulos rojos, blancos, plaquetas y plasma. Grupos sanguíneos ABO/Rh, cascada de coagulación y valores de un análisis.',
  keywords: 'sangre, glóbulos rojos, eritrocitos, leucocitos, plaquetas, plasma, grupos sanguíneos, ABO, Rh, coagulación, hematocrito, hemoglobina, análisis sangre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Componentes de la Sangre - Tubo de Ensayo Visual',
    description: 'Plasma, glóbulos rojos, blancos y plaquetas explicados visualmente. Grupos ABO/Rh y coagulación.',
    url: 'https://meskeia.com/visualizador-sangre-componentes',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Componentes de la Sangre - Tubo de Ensayo Visual',
    description: 'Plasma, eritrocitos, leucocitos, plaquetas, grupos ABO/Rh y cascada de coagulación.',
  },
  other: { 'application-name': 'Sangre Componentes meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Componentes de la Sangre - Tubo de Ensayo Visual',
  description: 'Explicador visual interactivo de los componentes de la sangre humana: tubo de ensayo centrifugado, grupos sanguíneos ABO/Rh, cascada de coagulación y valores normales de un análisis.',
  url: 'https://meskeia.com/visualizador-sangre-componentes/',
  category: 'EducationalApplication',
  features: [
    'Tubo de ensayo centrifugado con las 3 capas visibles',
    'Tabla de compatibilidad donante-receptor ABO/Rh',
    'Cascada de coagulación paso a paso',
    'Valores normales de un análisis de sangre',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
