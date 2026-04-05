import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'La Historia de la Humanidad en un Reloj - Explicador Visual | meskeIA',
  description: '300.000 años de historia humana comprimidos en 24 horas: agricultura a las 23:52, escritura a las 23:56, Imperio Romano a las 23:58, internet a las 23:59:59. 15 hitos clickables.',
  keywords: 'historia humanidad reloj, perspectiva histórica, homo sapiens, agricultura neolítico, escritura cuneiforme, Imperio Romano, revolución industrial, internet, bachillerato historia, escala temporal',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'La Historia de la Humanidad en un Reloj',
    description: 'Si los 300.000 años del Homo sapiens fueran un día de 24 horas, internet llegó en el último segundo.',
    url: 'https://meskeia.com/visualizador-historia-reloj',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Historia de la Humanidad en un Reloj',
    description: 'Toda la historia humana en 24 horas. Los últimos 200 años: solo el último minuto.',
  },
  other: { 'application-name': 'Historia Reloj meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'La Historia de la Humanidad en un Reloj',
  description: 'Visualizador interactivo que comprime 300.000 años de historia del Homo sapiens en un reloj de 24 horas. 15 hitos históricos clickables con su hora exacta, año real, explicación y dato sorprendente. Ideal para Bachillerato e Historia Universal.',
  url: 'https://meskeia.com/visualizador-historia-reloj/',
  features: [
    '15 hitos históricos desde el Homo sapiens hasta internet',
    'Reloj visual con marcas de posición de cada evento',
    'Hora exacta en el reloj de 24 horas para cada hito',
    'Año real + explicación + dato sorprendente para cada evento',
    'Perspectiva temporal de la brevedad de la civilización moderna',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, en español, ideal para Bachillerato e Historia',
  ],
  category: 'EducationalApplication',
});
