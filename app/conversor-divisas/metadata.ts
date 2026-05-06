import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conversor de Divisas | meskeIA',
  description: 'Convierte entre más de 30 divisas con tipos de cambio actualizados diariamente por el Banco Central Europeo. Orientativo, no apto para trading.',
  keywords: ['conversor divisas', 'tipo de cambio', 'euro', 'dólar', 'libra', 'yen', 'cambio moneda', 'divisas viaje'],
  openGraph: {
    title: 'Conversor de Divisas - meskeIA',
    description: 'Convierte entre más de 30 divisas. Tipos de cambio del BCE actualizados a diario.',
    url: 'https://meskeia.com/conversor-divisas/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Conversor de Divisas meskeIA',
  description: 'Convierte entre más de 30 divisas con tipos de cambio diarios del Banco Central Europeo',
  url: 'https://meskeia.com/conversor-divisas/',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};
