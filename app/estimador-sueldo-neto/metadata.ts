import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador Sueldo Neto a Bruto y Bruto a Neto 2025 | meskeIA',
  description: 'Calcula tu sueldo neto desde el bruto o al revés. Estimación de IRPF, cotizaciones a la Seguridad Social y deducciones aplicables en España 2025. Orientativo.',
  keywords: 'estimador sueldo neto, sueldo bruto a neto, calcular neto, calcular bruto, IRPF, seguridad social, nómina, salario neto, salario bruto, España 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Sueldo Neto ↔ Bruto 2025 | meskeIA',
    description: 'Oriéntate sobre tu sueldo bruto a neto o neto a bruto. Incluye IRPF y Seguridad Social actualizados.',
    url: 'https://meskeia.com/estimador-sueldo-neto/',
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
    title: 'Estimador Sueldo Neto ↔ Bruto 2025',
    description: 'Oriéntate sobre tu sueldo bruto a neto o neto a bruto. IRPF y SS actualizados.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Sueldo Neto meskeIA',
  },
};
