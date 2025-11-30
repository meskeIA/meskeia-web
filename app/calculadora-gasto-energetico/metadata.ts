import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Gasto Energético - Consumo Eléctrico del Hogar | meskeIA',
  description: 'Calcula el consumo eléctrico de tus electrodomésticos y el coste mensual en tu factura de luz. Precios PVPC actualizados, comparativa de tarifas y consejos de ahorro.',
  keywords: 'gasto energetico, consumo electrico, factura luz, electrodomesticos, kwh, pvpc, ahorro energia, precio electricidad, potencia contratada, calculadora luz',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Gasto Energético - meskeIA',
    description: 'Calcula cuánto consumen tus electrodomésticos y cuánto pagas en la factura de luz. Con precios actualizados.',
    url: 'https://meskeia.com/calculadora-gasto-energetico/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Gasto Energético - meskeIA',
    description: 'Descubre cuánto consumen tus electrodomésticos y ahorra en la factura de luz',
  },
  other: {
    'application-name': 'Calculadora Gasto Energético meskeIA',
  },
};
