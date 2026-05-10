import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador de Vacaciones para Autónomos | meskeIA',
  description: 'Calcula el impacto económico de tus vacaciones como autónomo. Cuánto dejas de facturar, cuánto compensar y las mejores épocas para descansar.',
  keywords: 'vacaciones autónomo, planificar vacaciones freelance, impacto económico vacaciones, descanso autónomo, facturación, cuota RETA vacaciones',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador de Vacaciones para Autónomos | meskeIA',
    description: 'Calcula el impacto económico real de tomarte vacaciones como autónomo. Facturación perdida, compensación necesaria y mejores épocas.',
    url: 'https://meskeia.com/planificador-vacaciones-autonomo/',
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
    title: 'Planificador de Vacaciones para Autónomos | meskeIA',
    description: 'Calcula el impacto económico real de tomarte vacaciones como autónomo.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Planificador Vacaciones Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Planificador de Vacaciones para Autónomos',
  description: 'Herramienta gratuita para que autónomos y freelancers calculen el impacto económico real de sus vacaciones. Incluye facturación perdida, gastos fijos que siguen corriendo, compensación necesaria y las mejores épocas según sector.',
  url: 'https://meskeia.com/planificador-vacaciones-autonomo/',
  category: 'BusinessApplication',
  features: [
    'Calcula la facturación que dejas de percibir durante las vacaciones',
    'Estima los gastos fijos que siguen corriendo (RETA, alquiler, seguros)',
    'Calcula cuánto necesitas facturar de más para compensar',
    'Sugiere ahorro mensual preventivo para cubrir vacaciones',
    'Tabla de estacionalidad por tipo de freelance',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
