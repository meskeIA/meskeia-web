import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador de Subvenciones Rehabilitación Energética - Next Generation España | meskeIA',
  description: 'Estima qué subvenciones y deducciones IRPF puedes obtener para la rehabilitación energética de tu vivienda. Programas Next Generation EU, PRTR y deducciones fiscales.',
  keywords: 'subvenciones rehabilitacion energetica, ayudas Next Generation, reforma energetica vivienda, PRTR rehabilitacion, deducciones IRPF reforma, rehabilitacion edificios España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Simulador de Subvenciones Rehabilitación Energética | meskeIA',
    description: 'Calcula las ayudas Next Generation EU y deducciones IRPF disponibles para la reforma energética de tu vivienda en España.',
    url: 'https://meskeia.com/simulador-subvenciones-rehabilitacion',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador de Subvenciones Rehabilitación Energética | meskeIA',
    description: 'Estima las ayudas y deducciones disponibles para la rehabilitación energética de tu vivienda en España.',
  },
  other: {
    'application-name': 'Simulador Subvenciones Rehabilitación meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Simulador de Subvenciones para Rehabilitación Energética',
  description: 'Herramienta orientativa que estima las subvenciones Next Generation EU (programas 3, 4 y 5 del PRTR), deducciones IRPF y ventajas fiscales disponibles para la rehabilitación energética de viviendas y edificios en España.',
  url: 'https://meskeia.com/simulador-subvenciones-rehabilitacion/',
  features: [
    'Estimación de subvenciones por programas Next Generation EU (PRTR)',
    'Cálculo de deducciones IRPF por mejora energética',
    'Comparativa entre programas 3, 4 y 5 de rehabilitación',
    'IVA reducido del 10% en obras de rehabilitación',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
