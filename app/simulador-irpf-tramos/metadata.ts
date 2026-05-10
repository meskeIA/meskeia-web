import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Visual IRPF Tramos 2025 - "¿Qué pasa si subo X €?" | meskeIA',
  description: 'Visualiza los 6 tramos del IRPF español de forma interactiva. Mueve el slider y observa cómo cambia tu cuota. Vista por tramos, escalera de tipos y comparativa "qué pasa si subo X €". Datos 2025.',
  keywords: 'simulador IRPF tramos visual, tramos IRPF 2025, escalera IRPF, tipo marginal medio, base liquidable, cuota íntegra, AEAT, qué pasa si subo sueldo IRPF, gráfico IRPF',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-irpf-tramos/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Visual IRPF Tramos 2025 | meskeIA',
    description: 'Visualiza los tramos del IRPF y cómo afectan a tu cuota — interactivo y didáctico',
    url: 'https://meskeia.com/simulador-irpf-tramos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Visual IRPF Tramos | meskeIA',
    description: 'Cómo funcionan los tramos del IRPF español — visual e interactivo',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Visual de Tramos IRPF 2025',
  description: 'Simulador visual e interactivo de los 6 tramos del IRPF español 2025. Visualiza cómo se aplica cada tramo, el tipo marginal vs medio, y qué pasa con tu cuota si tu base liquidable cambia.',
  url: 'https://meskeia.com/simulador-irpf-tramos/',
  category: 'FinanceApplication',
  features: [
    'Vista interactiva de los 6 tramos del IRPF 2025',
    'Slider "qué pasa si subo X €"',
    '3 modos: por tramos, escalera de tipos, comparativa',
    'Cálculo de tipo marginal y tipo medio efectivo',
    'Datos basados en Ley 35/2006 y LPGE 2025',
    'Solo orientativo — verifica con la AEAT',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'En español',
  ],
  keywords: ['IRPF', 'tramos IRPF', 'tipo marginal', 'AEAT', 'fiscal España'],
});
