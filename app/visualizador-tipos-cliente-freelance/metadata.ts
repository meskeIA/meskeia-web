import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tipos de Cliente Freelance - Explicador Visual | meskeIA',
  description: 'Conoce los 6 tipos de relación cliente-freelance en España: puntual, recurrente, agencia, subcontratación, marketplace y falso autónomo. Ventajas, riesgos y señales de alerta.',
  keywords: 'cliente freelance, tipos cliente, falso autónomo, agencia, subcontratación, marketplace, relación comercial, autónomo España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tipos de Cliente Freelance - Explicador Visual',
    description: '6 tipos de relación cliente-freelance en España: ventajas, riesgos, facturación y señales de alerta. Incluye falso autónomo.',
    url: 'https://meskeia.com/visualizador-tipos-cliente-freelance',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tipos de Cliente Freelance - Explicador Visual',
    description: 'De cliente puntual a falso autónomo: conoce las 6 relaciones comerciales freelance en España.',
  },
  other: { 'application-name': 'Tipos de Cliente Freelance meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tipos de Cliente Freelance - Explicador Visual',
  description: 'Explicador visual interactivo sobre los 6 tipos de relación cliente-freelance en España: puntual, recurrente, agencia intermediaria, subcontratación, marketplace y empleo encubierto (falso autónomo). Ventajas, riesgos, modelo de facturación y señales de alerta.',
  url: 'https://meskeia.com/visualizador-tipos-cliente-freelance/',
  category: 'EducationalApplication',
  features: [
    'Los 6 tipos de relación cliente-freelance con ventajas y riesgos',
    'Señales de alerta y ejemplos reales para cada tipo',
    'Detección de falso autónomo con base legal (Estatuto de los Trabajadores)',
    'Tabla comparativa de estabilidad, independencia y riesgo legal',
    'Espectro visual de independencia profesional',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
