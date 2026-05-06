import { Metadata } from 'next';

const title = 'Diario Emocional Visual — Registra cómo te sientes cada día | meskeIA';
const description = 'Herramienta de autoconocimiento: registra tu estado de ánimo diario con emojis, añade notas y descubre patrones emocionales a lo largo del tiempo. Privado y sin registro.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'diario emocional, registro emociones, estado de animo diario, autoconocimiento emocional, patrones emocionales, como me siento hoy, diario bienestar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diario Emocional Visual | meskeIA',
    description,
    url: 'https://meskeia.com/diario-emocional/',
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
    title: 'Diario Emocional Visual | meskeIA',
    description: 'Registra tu estado de ánimo diario y descubre patrones emocionales',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Diario Emocional Visual',
  description,
  url: 'https://meskeia.com/diario-emocional/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
