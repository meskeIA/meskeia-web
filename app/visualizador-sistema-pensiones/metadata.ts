import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sistema de Pensiones: Reparto, Demografía y Reformas — meskeIA',
  description: 'Visualizador del sistema de pensiones español. Reparto vs capitalización, ratio trabajadores/pensionistas (1975-2050), gasto en pensiones, timeline de reformas y proyecciones AIREF.',
  keywords: [
    'sistema pensiones España',
    'reparto vs capitalización pensiones',
    'ratio trabajadores pensionistas',
    'reforma pensiones 2023 Escrivá',
    'AIREF proyecciones pensiones',
    'fondo reserva pensiones',
    'pacto de Toledo',
    'sostenibilidad pensiones demografía',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    title: 'Sistema de Pensiones: Reparto, Demografía y Reformas — meskeIA',
    description: 'Cómo funciona el sistema de pensiones español y por qué está bajo presión demográfica.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-sistema-pensiones/',
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
    title: 'Sistema de Pensiones Español — Visualizador',
    description: 'Reparto vs capitalización, ratio trabajadores/pensionistas, reformas y proyecciones AIREF.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sistema de Pensiones meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Sistema de Pensiones: Reparto, Demografía y Reformas',
  description: 'Visualizador educativo del sistema de pensiones español. Muestra cómo funciona el reparto, la presión demográfica (1975-2050), el gasto histórico, el timeline de reformas y las proyecciones AIREF hasta 2050.',
  url: 'https://meskeia.com/visualizador-sistema-pensiones/',
  features: [
    'Comparativa reparto vs capitalización con visualización SVG',
    'Slider interactivo del ratio trabajadores/pensionistas (1975-2050)',
    'Datos clave del gasto en pensiones 2024',
    'Timeline de reformas del sistema (1995-2027)',
    'Proyecciones de gasto AIREF hasta 2050',
    'Evolución del Fondo de Reserva (hucha de las pensiones)',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
