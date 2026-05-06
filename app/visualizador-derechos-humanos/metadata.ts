import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de los Derechos Humanos | Cronología Visual | meskeIA',
  description: 'Visualiza la evolución de los derechos humanos: de la Magna Carta a los derechos digitales. Cronología interactiva de hitos, tratados y movimientos históricos.',
  keywords: ['derechos humanos', 'historia', 'Magna Carta', 'Declaración Universal', 'sufragismo', 'abolicionismo', 'derechos civiles', 'GDPR'],
  openGraph: {
    title: 'Historia de los Derechos Humanos | Cronología Visual | meskeIA',
    description: 'Visualiza la evolución de los derechos humanos: de la Magna Carta a los derechos digitales.',
    url: 'https://meskeia.com/visualizador-derechos-humanos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-derechos-humanos/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Historia de los Derechos Humanos — Cronología Visual',
  description: 'Herramienta educativa sobre la evolución histórica de los derechos humanos desde la Magna Carta hasta los derechos digitales.',
  url: 'https://meskeia.com/visualizador-derechos-humanos/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
