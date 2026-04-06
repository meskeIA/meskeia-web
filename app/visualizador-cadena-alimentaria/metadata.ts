import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'De la Granja a tu Mesa - Cadena Alimentaria Visual | meskeIA',
  description: 'Entiende el viaje de los alimentos: producción, procesado, distribución, venta y consumo. Reparto de precios, desperdicio alimentario y alternativas locales. Explicador visual.',
  keywords: 'cadena alimentaria, producción alimentos, precio agricultor, desperdicio alimentario, km0, comercio justo, supermercado, granja, distribución alimentos, España',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'De la Granja a tu Mesa - Cadena Alimentaria Visual',
    description: 'El viaje de los alimentos desde el campo hasta tu plato: precios, desperdicio y alternativas explicados visualmente.',
    url: 'https://meskeia.com/visualizador-cadena-alimentaria',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'De la Granja a tu Mesa - Explicador Visual',
    description: 'Cadena alimentaria, reparto de precios al agricultor, desperdicio y alternativas locales.',
  },
  other: { 'application-name': 'Cadena Alimentaria meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'De la Granja a tu Mesa - Cadena Alimentaria Visual',
  description: 'Explicador visual interactivo sobre la cadena alimentaria: cómo viajan los alimentos de la granja a tu mesa, quién se lleva qué del precio final, cifras de desperdicio en España y alternativas como producción local, ecológica y cooperativas.',
  url: 'https://meskeia.com/visualizador-cadena-alimentaria/',
  category: 'EducationalApplication',
  features: [
    'Recorrido visual de 5 etapas: producción, procesado, distribución, venta y consumo',
    'Desglose de precios por producto: quién se lleva qué del precio final',
    'Cifras de desperdicio alimentario y gasto familiar en España',
    'Comparativa entre modelo convencional y alternativas locales/km0',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
