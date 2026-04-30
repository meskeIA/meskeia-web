import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Medicina | Cronología Visual | meskeIA',
  description: 'Visualiza 2.500 años de historia médica: de Hipócrates a la medicina de precisión e IA. Cronología interactiva de períodos, descubrimientos y hitos históricos.',
  keywords: ['historia de la medicina', 'cronología médica', 'Hipócrates', 'Galeno', 'penicilina', 'ADN', 'genoma', 'medicina'],
  openGraph: {
    title: 'Historia de la Medicina | Cronología Visual | meskeIA',
    description: 'Visualiza 2.500 años de historia médica: de Hipócrates a la medicina de precisión e IA.',
    url: 'https://meskeia.com/visualizador-historia-medicina/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-medicina/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Medicina',
  description: 'Herramienta educativa sobre historia de la medicina y sus períodos históricos',
  url: 'https://meskeia.com/visualizador-historia-medicina/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
