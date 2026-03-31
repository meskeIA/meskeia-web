import { Metadata } from 'next';

const title = 'Selector de Actividades según Movilidad — Envejecimiento Activo | meskeIA';
const description = 'Descubre actividades físicas, sociales y cognitivas adaptadas a tu nivel de movilidad. Test de 8 preguntas con recomendaciones personalizadas para un envejecimiento activo y saludable.';

export const metadata: Metadata = {
  title,
  description,
  keywords: 'actividades personas mayores, envejecimiento activo, ejercicio mayores movilidad reducida, actividades tercera edad, gimnasia mayores, actividades cognitivas mayores, actividades sociales jubilados',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Selector de Actividades según Movilidad | meskeIA',
    description,
    url: 'https://meskeia.com/selector-actividades-movilidad/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selector de Actividades según Movilidad | meskeIA',
    description: 'Actividades adaptadas a tu movilidad: físicas, sociales y cognitivas para un envejecimiento activo',
  },
  other: {
    'application-name': 'Selector Actividades Movilidad meskeIA',
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Selector de Actividades según Movilidad',
  description,
  url: 'https://meskeia.com/selector-actividades-movilidad/',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  author: { '@type': 'Organization', name: 'meskeIA', url: 'https://meskeia.com' },
  inLanguage: 'es',
};
