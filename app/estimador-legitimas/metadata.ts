import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Legítimas — Herencia forzosa por CCAA | meskeIA',
  description: 'Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y parte de libre disposición.',
  keywords: 'legitima herencia, calculo legitima, tercio legitima estricta mejora, herencia forzosa españa, legitima cataluña aragon galicia, parte libre disposicion herencia, herederos forzosos',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Estima la herencia forzosa y la parte de libre disposición según el régimen civil de tu comunidad autónoma.',
    url: 'https://meskeia.com/estimador-legitimas/',
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
    title: 'Estimador de Legítimas | meskeIA',
    description: 'Calcula legítimas hereditarias por CCAA: Código Civil, Cataluña, Aragón, Galicia…',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Legítimas meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Legítimas",
  description: "Calcula la legítima hereditaria según el derecho civil de tu comunidad autónoma (Código Civil, Cataluña, Aragón, Galicia, Baleares, País Vasco, Navarra). Estimación de cuotas por heredero forzoso y pa",
  url: "https://meskeia.com/estimador-legitimas/",
  category: 'FinanceApplication',
  features: [],
});
