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
