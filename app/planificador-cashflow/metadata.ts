import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Planificador Cash Flow - Flujo de Caja a 12 Meses | meskeIA',
  description: 'Proyecta tu flujo de caja mes a mes. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If. Herramienta gratuita para autónomos y pymes.',
  keywords: 'cash flow, flujo de caja, tesoreria, liquidez, proyeccion financiera, planificacion financiera, pyme, autonomo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Planificador Cash Flow | meskeIA',
    description: 'Proyecta tu flujo de caja a 12 meses. Identifica riesgos de liquidez y planifica mejor tu tesorería.',
    url: 'https://meskeia.com/planificador-cashflow/',
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
    title: 'Planificador Cash Flow | meskeIA',
    description: 'Herramienta gratuita para proyectar tu flujo de caja y prevenir crisis de liquidez.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Planificador Cash Flow",
  description: "Proyecta tu flujo de caja mes a mes. Identifica meses críticos, previene crisis de liquidez y simula escenarios What-If. Herramienta gratuita para autónomos y pymes.",
  url: "https://meskeia.com/planificador-cashflow/",
  category: 'BusinessApplication',
  features: [],
});
