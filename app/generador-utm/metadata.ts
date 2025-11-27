import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generador de Enlaces UTM - Trackea tus Campañas | meskeIA',
  description: 'Genera enlaces UTM para Google Analytics. Crea URLs con parámetros utm_source, utm_medium, utm_campaign para medir el ROI de tus campañas de marketing.',
  keywords: 'utm, enlaces utm, google analytics, tracking, utm_source, utm_medium, utm_campaign, marketing digital, roi',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Generador de Enlaces UTM',
    description: 'Genera enlaces UTM para trackear tus campañas de marketing en Google Analytics.',
    url: 'https://meskeia.com/generador-utm',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador de Enlaces UTM',
    description: 'Crea URLs con parámetros UTM para analytics.',
  },
};
