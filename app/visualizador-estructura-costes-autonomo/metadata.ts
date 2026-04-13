import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estructura de Costes del Autónomo - Explicador Visual | meskeIA',
  description: 'Visualiza cómo se descomponen los ingresos de un autónomo español: cuota RETA, IVA, IRPF, gastos profesionales y neto real. Cascada interactiva con sliders.',
  keywords: 'autónomo, costes autónomo, cuota RETA, IVA, IRPF, gastos profesionales, neto autónomo, freelance España, estructura costes',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estructura de Costes del Autónomo - Explicador Visual',
    description: 'De lo que facturas a lo que te queda: visualiza cada euro como autónomo. IVA, RETA, IRPF, gastos y neto real.',
    url: 'https://meskeia.com/visualizador-estructura-costes-autonomo',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estructura de Costes del Autónomo - Explicador Visual',
    description: 'De lo que facturas a lo que te queda: cascada interactiva con IVA, RETA, IRPF y gastos.',
  },
  other: {
    'application-name': 'Visualizador Estructura Costes Autónomo meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Estructura de Costes del Autónomo',
  description: 'Explicador visual interactivo que muestra cómo se descomponen los ingresos brutos de un autónomo español: IVA repercutido, cuota RETA, IRPF estimado, gastos profesionales y neto real. Cascada con sliders.',
  url: 'https://meskeia.com/visualizador-estructura-costes-autonomo/',
  features: [
    'Cascada waterfall interactiva de ingresos a neto',
    'Sliders para ajustar facturación y gastos en tiempo real',
    'Desglose visual: IVA, RETA, IRPF, gastos profesionales y personales',
    'Bloques expandibles con explicaciones detalladas',
    'Resumen "de cada 100 € facturados, te quedan X €"',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
  ],
});
