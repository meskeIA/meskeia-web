import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
    url: 'https://meskeia.com/generador-utm/',
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
    title: 'Generador de Enlaces UTM',
    description: 'Crea URLs con parámetros UTM para analytics.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Generador de Enlaces UTM",
  description: "Genera enlaces UTM para Google Analytics. Crea URLs con parámetros utm_source, utm_medium, utm_campaign para medir el ROI de tus campañas de marketing.",
  url: "https://meskeia.com/generador-utm/",
  category: 'UtilityApplication',
  features: [],
});
