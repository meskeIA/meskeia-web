import { Metadata } from 'next';

const title = 'Orientador de Tipo de Oposición — ¿Qué oposición encaja contigo? | meskeIA';
const description = 'Test orientativo de 8 preguntas para descubrir qué tipo de oposición se adapta a tu perfil: nivel de estudios, ámbito preferido, disponibilidad de tiempo y objetivos profesionales.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'que oposicion hacer, orientador oposiciones, test oposicion perfil, elegir oposicion, tipos oposiciones españa, oposiciones por estudios, que opositar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Tipo de Oposición | meskeIA',
    description,
    url: 'https://meskeia.com/orientador-tipo-oposicion/',
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
    title: 'Orientador de Tipo de Oposición | meskeIA',
    description: 'Test: ¿qué tipo de oposición encaja con tu perfil?',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Orientador de Tipo de Oposición',
  description,
  url: 'https://meskeia.com/orientador-tipo-oposicion/',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
