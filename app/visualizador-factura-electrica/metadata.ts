import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Electricidad al Desnudo - Anatomía de la Factura de la Luz | meskeIA',
  description: 'Entiende cada línea de tu factura eléctrica: energía, potencia, peajes, cargos e impuestos. Factura ficticia interactiva con explicaciones.',
  keywords: 'factura luz, electricidad españa, peaje acceso, potencia contratada, impuesto eléctrico, PVPC, mercado libre, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Electricidad al Desnudo',
    description: 'Anatomía de la factura de la luz: cada concepto explicado de forma visual.',
    url: 'https://meskeia.com/visualizador-factura-electrica/',
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
    title: 'Tu Electricidad al Desnudo',
    description: 'Entiende por qué pagas lo que pagas de luz.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Factura Eléctrica meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Electricidad al Desnudo',
  description: 'Explicador visual de la factura de electricidad española. Factura ficticia interactiva donde cada concepto es clickable: energía consumida, potencia contratada, peajes, cargos del sistema, impuesto eléctrico e IVA.',
  url: 'https://meskeia.com/visualizador-factura-electrica/',
  features: [
    'Factura eléctrica ficticia interactiva',
    'Cada concepto clickable con explicación detallada',
    'Desglose visual: energía, potencia, impuestos',
    'Gráfico doughnut de composición de la factura',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});
