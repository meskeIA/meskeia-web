import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia de la Psicología | Cronología Interactiva | meskeIA',
  description: 'Cronología interactiva de la psicología con 14 períodos desde la filosofía griega hasta la neurociencia e IA clínica. De Platón a ChatGPT terapéutico: 2.400 años de estudio de la mente.',
  keywords: ['historia psicología', 'Freud psicoanálisis', 'conductismo Watson', 'psicología cognitiva', 'neurociencia', 'psicología positiva', 'cronología mente'],
  openGraph: {
    title: 'Historia de la Psicología | meskeIA',
    description: 'De Platón a la IA terapéutica: 2.400 años de psicología en una cronología interactiva.',
    type: 'website',
    url: 'https://meskeia.com/visualizador-historia-psicologia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  alternates: { canonical: 'https://meskeia.com/visualizador-historia-psicologia/' },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de Historia de la Psicología',
  description: 'Herramienta educativa sobre historia de la psicología y sus corrientes principales',
  url: 'https://meskeia.com/visualizador-historia-psicologia/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
};
