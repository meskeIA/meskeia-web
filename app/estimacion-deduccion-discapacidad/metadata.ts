import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimación de Deducción IRPF por Discapacidad - Mínimos Personales | meskeIA',
  description: 'Estima el ahorro fiscal en IRPF por mínimos de discapacidad del contribuyente, ascendientes o descendientes. Incluye gastos de asistencia y requisitos 2025.',
  keywords: 'deduccion IRPF discapacidad, minimo discapacidad IRPF, ahorro fiscal discapacidad, IRPF dependencia, minimo ascendiente discapacidad, gastos asistencia IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Calcula el ahorro fiscal por los mínimos de discapacidad en la declaración de la renta.',
    url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estimación de Deducción IRPF por Discapacidad | meskeIA',
    description: 'Ahorro fiscal por discapacidad: mínimos personales y familiares en IRPF',
  },
  other: { 'application-name': 'Estimación Deducción Discapacidad meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estimación de Deducción IRPF por Discapacidad',
  description: 'Herramienta orientativa para estimar el ahorro fiscal en IRPF por los mínimos de discapacidad. Contribuyente, ascendientes y descendientes con discapacidad reconocida.',
  url: 'https://meskeia.com/estimacion-deduccion-discapacidad/',
  features: [
    'Mínimos por discapacidad del contribuyente',
    'Mínimos por discapacidad de ascendientes y descendientes',
    'Gastos de asistencia adicionales',
    'Estimación del ahorro fiscal según tipo marginal',
    'Datos actualizados IRPF 2025',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
