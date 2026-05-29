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
    url: 'https://meskeia.com/visualizador-cadena-alimentaria/',
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
    title: 'De la Granja a tu Mesa - Explicador Visual',
    description: 'Cadena alimentaria, reparto de precios al agricultor, desperdicio y alternativas locales.',
    images: ['https://meskeia.com/og-image.png']
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

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto recibe realmente el agricultor del precio que pago en el supermercado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En productos frescos convencionales, el agricultor suele recibir entre el 10 % y el 25 % del precio final de venta. El resto se reparte entre intermediarios, procesado, logística y margen del punto de venta. La proporción varía mucho según el producto: en frutas y verduras el margen del agricultor tiende a ser menor que en productos con denominación de origen o canal corto.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cadena alimentaria y cuántas etapas tiene?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cadena alimentaria es el recorrido que sigue un alimento desde que se produce hasta que llega al consumidor. Comprende cinco etapas principales: producción (agricultura, ganadería, pesca), procesado o transformación industrial, distribución y logística, venta al detalle (supermercados, mercados) y consumo final en el hogar o la hostelería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto alimento se desperdicia en España a lo largo de la cadena?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según datos del Ministerio de Agricultura, en España se desperdician alrededor de 1.300 millones de kilos de alimentos al año en los hogares. Si se suma el desperdicio en fase industrial y distribución, la cifra total supera los 7,7 millones de toneladas anuales. El hogar representa aproximadamente el 40 % de ese total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comprar en el supermercado y comprar en un canal corto o km0?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el canal corto (venta directa del productor, cooperativas, mercados locales o grupos de consumo) se eliminan uno o varios intermediarios. Esto puede hacer que el agricultor reciba entre el 50 % y el 80 % del precio final, frente al 10-25 % habitual en el canal largo. Para el consumidor, los precios pueden ser similares o incluso inferiores, con productos más frescos y menor huella de carbono por transporte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve un visualizador interactivo de la cadena alimentaria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un visualizador de la cadena alimentaria permite entender de forma gráfica y sin tecnicismos quién participa en el proceso de llevar un alimento a la mesa, qué porcentaje del precio se queda cada eslabón y dónde se produce el mayor desperdicio. Es útil para consumidores que quieren tomar decisiones de compra más informadas, para estudiantes de economía o medioambiente, y para cualquier persona interesada en la sostenibilidad del sistema alimentario.',
      },
    },
  ],
};
