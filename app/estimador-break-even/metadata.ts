import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Break-Even - Punto de Equilibrio de Productos | meskeIA',
  description: 'Calcula el punto de equilibrio de tus productos. Analiza cuántas unidades necesitas vender para cubrir costes. Margen de contribución, rentabilidad y escenarios.',
  keywords: 'break even, punto de equilibrio, costos fijos, costos variables, margen contribucion, rentabilidad, precio venta, umbral rentabilidad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Break-Even - Punto de Equilibrio | meskeIA',
    description: 'Descubre cuántas unidades necesitas vender para empezar a ganar dinero. Calculadora gratuita de punto de equilibrio.',
    url: 'https://meskeia.com/estimador-break-even/',
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
    title: 'Estimador Break-Even | meskeIA',
    description: 'Herramienta gratuita para calcular el punto de equilibrio de tu negocio.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Break-Even",
  description: "Calcula el punto de equilibrio de tus productos. Analiza cuántas unidades necesitas vender para cubrir costes. Margen de contribución, rentabilidad y escenarios.",
  url: "https://meskeia.com/estimador-break-even/",
  category: 'BusinessApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el punto de equilibrio o break-even de un negocio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El punto de equilibrio (break-even) es el nivel de ventas en el que los ingresos igualan exactamente a todos los costes, tanto fijos como variables. Por encima de ese punto se generan beneficios; por debajo, pérdidas. Es un indicador clave para evaluar la viabilidad de un producto o negocio antes de lanzarlo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el break-even en unidades?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fórmula básica es: Punto de equilibrio (unidades) = Costes fijos totales ÷ Margen de contribución por unidad. El margen de contribución es la diferencia entre el precio de venta unitario y el coste variable por unidad. El estimador calcula este resultado automáticamente en cuanto introduces los tres datos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué tipo de negocios es útil calcular el break-even?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es especialmente útil para autónomos, microempresas y emprendedores que lanzan un nuevo producto o servicio. También resulta valioso en hostelería (precio de carta), e-commerce (precio mínimo de venta) y cualquier actividad con costes fijos reconocibles como alquiler, software o nóminas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre costes fijos y costes variables en el cálculo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los costes fijos no cambian con el volumen de producción: alquiler, seguros, suscripciones. Los costes variables aumentan proporcionalmente con cada unidad producida o vendida: materias primas, embalaje, comisiones de venta. Separar ambas categorías correctamente es esencial para que el cálculo del break-even sea fiable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si bajo el precio de venta: cuántas unidades más tendré que vender?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al bajar el precio de venta se reduce el margen de contribución por unidad, lo que eleva el punto de equilibrio: necesitas vender más unidades para cubrir los mismos costes fijos. El estimador incluye un análisis de escenarios que muestra cómo varía el break-even al modificar el precio, los costes fijos o los costes variables.',
      },
    },
  ],
};
