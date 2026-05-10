import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Cuota de Autónomo 2025 - Orientación RETA | meskeIA',
  description: 'Estima tu cuota de autónomo según tus ingresos reales. Sistema de cotización por tramos 2025, tarifa plana, bonificaciones y orientación sobre pagos mensuales.',
  keywords: 'cuota autonomo, estimador reta, cotizacion autonomos, tarifa plana autonomos, cuota seguridad social, autonomo ingresos reales, tramos cotizacion, base cotizacion, cuota minima autonomo 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Cuota de Autónomo 2025 - Orientación RETA',
    description: 'Estima tu cuota de autónomo según tus ingresos reales. Tramos 2025, tarifa plana y bonificaciones.',
    url: 'https://meskeia.com/estimador-cuota-autonomo/',
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
    title: 'Estimador Cuota de Autónomo 2025',
    description: 'Estima tu cuota de autónomo según el sistema de cotización por ingresos reales',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Cuota Autónomo meskeIA',
  },
};
