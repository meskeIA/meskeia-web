import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de Internet | Cronología Visual | meskeIA',
  description: 'Visualiza la evolución de Internet: de ARPANET (1969) a la IA generativa. Cronología interactiva de hitos, protocolos y revoluciones digitales.',
  keywords: ['historia de internet', 'ARPANET', 'World Wide Web', 'redes sociales', 'web 2.0', 'internet móvil', 'cronología tecnología'],
  openGraph: {
    title: 'Historia de Internet | Cronología Visual | meskeIA',
    description: 'Visualiza la evolución de Internet: de ARPANET (1969) a la IA generativa.',
    url: 'https://meskeia.com/visualizador-historia-internet/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-internet/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Historia de Internet — Cronología Visual',
  description: 'Herramienta educativa sobre la evolución de Internet desde ARPANET hasta la IA generativa',
  url: 'https://meskeia.com/visualizador-historia-internet/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
