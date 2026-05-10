import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador Trimestral para Autónomos | meskeIA',
  description:
    'Planifica tus 4 trimestres: ingresos, gastos, fechas de modelos fiscales y meses críticos. Vista anual con semáforo de cumplimiento.',
  keywords:
    'planificador trimestral, autónomo, modelo 303, modelo 130, trimestres fiscales, freelance España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Trimestral para Autónomos | meskeIA',
    description:
      'Planifica tus 4 trimestres fiscales como autónomo en España. Ingresos, gastos, modelos 303/130 y alertas de meses críticos.',
    url: 'https://meskeia.com/planificador-trimestres-freelance/',
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
    title: 'Planificador Trimestral para Autónomos | meskeIA',
    description:
      'Planifica tus 4 trimestres fiscales: ingresos, gastos, fechas de modelos y meses críticos.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Trimestral meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador Trimestral para Autónomos',
  description:
    'Planificador visual de los 4 trimestres del año para autónomos españoles. Muestra ingresos, gastos, fechas de presentación de modelos fiscales (303, 130, 390, 190) y alertas de meses críticos como agosto y diciembre.',
  url: 'https://meskeia.com/planificador-trimestres-freelance/',
  category: 'BusinessApplication',
  features: [
    'Vista anual con 12 meses y semáforo de cumplimiento por trimestre',
    'Fechas de presentación de modelos fiscales (303, 130, 390, 190)',
    'Alertas de meses críticos: agosto y diciembre',
    'Reparto equitativo de objetivos con un clic',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
